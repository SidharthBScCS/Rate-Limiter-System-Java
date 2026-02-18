package com.netflixclone.netflix_clone_backend.service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

@Service
public class NetflixRateLimiterService {

    private static final String LUA_COMBINED_LIMIT_SCRIPT = """
            local now = tonumber(ARGV[1])
            local requestId = ARGV[2]
            local capacity = tonumber(ARGV[3])
            local refillPerSecond = tonumber(ARGV[4])
            local windowLimit = tonumber(ARGV[5])
            local windowMs = tonumber(ARGV[6])
            local bucketTtlMs = tonumber(ARGV[7])

            if refillPerSecond <= 0 then
                refillPerSecond = 0.000001
            end

            local tokenState = redis.call('HMGET', KEYS[1], 'tokens', 'last_refill')
            local tokens = tonumber(tokenState[1])
            local lastRefill = tonumber(tokenState[2])

            if tokens == nil then
                tokens = capacity
            end
            if lastRefill == nil then
                lastRefill = now
            end

            if now < lastRefill then
                lastRefill = now
            end

            local elapsedSeconds = (now - lastRefill) / 1000.0
            tokens = math.min(capacity, tokens + (elapsedSeconds * refillPerSecond))

            redis.call('ZREMRANGEBYSCORE', KEYS[2], 0, now - windowMs)
            local currentWindowCount = tonumber(redis.call('ZCARD', KEYS[2]))

            if tokens < 1.0 then
                local deficit = 1.0 - tokens
                local retrySeconds = math.ceil(deficit / refillPerSecond)
                redis.call('HSET', KEYS[1], 'tokens', tostring(tokens), 'last_refill', tostring(now))
                redis.call('PEXPIRE', KEYS[1], bucketTtlMs)
                redis.call('PEXPIRE', KEYS[2], windowMs)
                return {0, retrySeconds, 1, math.floor(tokens * 1000), currentWindowCount}
            end

            if currentWindowCount >= windowLimit then
                local oldest = redis.call('ZRANGE', KEYS[2], 0, 0, 'WITHSCORES')
                local oldestTs = now
                if oldest[2] ~= nil then
                    oldestTs = tonumber(oldest[2])
                end
                local retryMs = (oldestTs + windowMs) - now
                if retryMs < 1 then
                    retryMs = 1
                end
                local retrySeconds = math.ceil(retryMs / 1000.0)
                redis.call('HSET', KEYS[1], 'tokens', tostring(tokens), 'last_refill', tostring(now))
                redis.call('PEXPIRE', KEYS[1], bucketTtlMs)
                redis.call('PEXPIRE', KEYS[2], windowMs)
                return {0, retrySeconds, 2, math.floor(tokens * 1000), currentWindowCount}
            end

            local tokensAfter = tokens - 1.0
            redis.call('HSET', KEYS[1], 'tokens', tostring(tokensAfter), 'last_refill', tostring(now))
            redis.call('PEXPIRE', KEYS[1], bucketTtlMs)
            redis.call('ZADD', KEYS[2], now, requestId)
            redis.call('PEXPIRE', KEYS[2], windowMs)
            return {1, 0, 0, math.floor(tokensAfter * 1000), currentWindowCount + 1}
            """;

    private final StringRedisTemplate redisTemplate;
    private final DefaultRedisScript<List> combinedLimitScript;
    private final String redisPrefix;
    private final RateLimitPolicy moviesPolicy;
    private final RateLimitPolicy authPolicy;
    private final boolean failOpenWhenRedisUnavailable;
    private final NetflixRequestMetricsService metricsService;

    public NetflixRateLimiterService(
            StringRedisTemplate redisTemplate,
            @Value("${netflix.rate-limit.redis-prefix:netflix:rate-limit}") String redisPrefix,
            @Value("${netflix.rate-limit.movies.token-bucket.capacity:${netflix.rate-limit.max-requests:10}}") int movieBucketCapacity,
            @Value("${netflix.rate-limit.movies.token-bucket.refill-per-second:1.0}") double movieBucketRefillPerSecond,
            @Value("${netflix.rate-limit.movies.sliding-window.max-requests:${netflix.rate-limit.max-requests:10}}") int movieWindowLimit,
            @Value("${netflix.rate-limit.movies.sliding-window.window-seconds:${netflix.rate-limit.window-seconds:60}}") int movieWindowSeconds,
            @Value("${netflix.rate-limit.auth.token-bucket.capacity:5}") int authBucketCapacity,
            @Value("${netflix.rate-limit.auth.token-bucket.refill-per-second:0.5}") double authBucketRefillPerSecond,
            @Value("${netflix.rate-limit.auth.sliding-window.max-requests:5}") int authWindowLimit,
            @Value("${netflix.rate-limit.auth.sliding-window.window-seconds:60}") int authWindowSeconds,
            @Value("${netflix.rate-limit.fail-open-on-redis-error:true}") boolean failOpenWhenRedisUnavailable,
            NetflixRequestMetricsService metricsService
    ) {
        this.redisTemplate = redisTemplate;
        this.redisPrefix = normalizePrefix(redisPrefix);
        this.moviesPolicy = new RateLimitPolicy(movieBucketCapacity, movieBucketRefillPerSecond, movieWindowLimit, movieWindowSeconds);
        this.authPolicy = new RateLimitPolicy(authBucketCapacity, authBucketRefillPerSecond, authWindowLimit, authWindowSeconds);
        this.failOpenWhenRedisUnavailable = failOpenWhenRedisUnavailable;
        this.metricsService = metricsService;
        this.combinedLimitScript = new DefaultRedisScript<>();
        this.combinedLimitScript.setScriptText(LUA_COMBINED_LIMIT_SCRIPT);
        this.combinedLimitScript.setResultType(List.class);
    }

    public Decision checkAndRecord(String userKey, String userName) {
        return evaluate("movies", userKey, userName, moviesPolicy);
    }

    public Decision checkAuthAndRecord(String userKey, String userName) {
        return evaluate("auth", userKey, userName, authPolicy);
    }

    private Decision evaluate(String scope, String userKey, String userName, RateLimitPolicy policy) {
        String normalizedKey = normalizeUserKey(userKey);
        if (normalizedKey.isEmpty()) {
            metricsService.record(userName, false);
            return new Decision(false, 60, "INVALID_KEY");
        }

        long now = System.currentTimeMillis();
        String bucketKey = redisPrefix + ":" + scope + ":" + normalizedKey + ":bucket";
        String windowKey = redisPrefix + ":" + scope + ":" + normalizedKey + ":window";

        long bucketTtlMs = policy.bucketTtlMillis();
        List<String> args = List.of(
                Long.toString(now),
                UUID.randomUUID().toString(),
                Integer.toString(policy.bucketCapacity),
                Double.toString(policy.bucketRefillPerSecond),
                Integer.toString(policy.windowLimit),
                Long.toString(policy.windowMillis()),
                Long.toString(bucketTtlMs)
        );

        try {
            List<Long> values = redisTemplate.execute(
                    combinedLimitScript,
                    List.of(bucketKey, windowKey),
                    args.toArray(String[]::new)
            );

            if (values == null || values.size() < 3) {
                metricsService.record(userName, false);
                return new Decision(false, 1, "LIMITER_ERROR");
            }

            boolean allowed = values.get(0) != null && values.get(0) == 1L;
            int retryAfterSeconds = values.get(1) == null ? 1 : Math.max(1, values.get(1).intValue());
            long reasonCode = values.get(2) == null ? 3L : values.get(2);
            String reason = switch ((int) reasonCode) {
                case 0 -> "ALLOWED";
                case 1 -> "TOKEN_BUCKET_EXCEEDED";
                case 2 -> "SLIDING_WINDOW_EXCEEDED";
                default -> "LIMITER_ERROR";
            };

            metricsService.record(userName, allowed);
            return allowed
                    ? new Decision(true, 0, reason)
                    : new Decision(false, retryAfterSeconds, reason);
        } catch (Exception ex) {
            if (failOpenWhenRedisUnavailable) {
                metricsService.record(userName, true);
                return new Decision(true, 0, "FAIL_OPEN_REDIS_UNAVAILABLE");
            }
            throw new IllegalStateException("Rate limiter unavailable", ex);
        }
    }

    private String normalizePrefix(String prefix) {
        String value = prefix == null ? "" : prefix.trim();
        return value.isEmpty() ? "netflix:rate-limit" : value;
    }

    private String normalizeUserKey(String userKey) {
        String key = userKey == null ? "" : userKey.trim().toLowerCase(Locale.ROOT);
        return key.replace(' ', '_');
    }

    private record RateLimitPolicy(
            int bucketCapacity,
            double bucketRefillPerSecond,
            int windowLimit,
            int windowSeconds
    ) {
        long windowMillis() {
            return Math.max(1, windowSeconds) * 1000L;
        }

        long bucketTtlMillis() {
            // Force bucket reset on the same cadence as the sliding window.
            return windowMillis();
        }
    }

    public record Decision(boolean allowed, int retryAfterSeconds, String reason) {}
}
