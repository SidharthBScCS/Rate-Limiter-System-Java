package com.system.ratelimiter.service;

import com.system.ratelimiter.entity.ApiKey;
import com.system.ratelimiter.repository.ApiKeyRepository;
import io.micrometer.core.instrument.MeterRegistry;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.RedisSystemException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DistributedRateLimiterService {

    private static final String TOKEN_BUCKET_SCRIPT = """
            local now = tonumber(ARGV[1])
            local capacity = tonumber(ARGV[2])
            local refillPerSecond = tonumber(ARGV[3])
            local cost = tonumber(ARGV[4])
            local ttlMs = tonumber(ARGV[5])

            if refillPerSecond <= 0 then refillPerSecond = 0.000001 end

            local state = redis.call('HMGET', KEYS[1], 'tokens', 'last_refill')
            local tokens = tonumber(state[1])
            local lastRefill = tonumber(state[2])

            if tokens == nil then tokens = capacity end
            if lastRefill == nil then lastRefill = now end
            if now < lastRefill then lastRefill = now end

            local elapsed = (now - lastRefill) / 1000.0
            tokens = math.min(capacity, tokens + elapsed * refillPerSecond)

            if tokens < cost then
                local deficit = cost - tokens
                local retrySeconds = math.ceil(deficit / refillPerSecond)
                redis.call('HSET', KEYS[1], 'tokens', tostring(tokens), 'last_refill', tostring(now))
                redis.call('PEXPIRE', KEYS[1], ttlMs)
                return {0, retrySeconds, 1}
            end

            tokens = tokens - cost
            redis.call('HSET', KEYS[1], 'tokens', tostring(tokens), 'last_refill', tostring(now))
            redis.call('PEXPIRE', KEYS[1], ttlMs)
            return {1, 0, 0}
            """;

    private static final String SLIDING_WINDOW_SCRIPT = """
            local now = tonumber(ARGV[1])
            local windowMs = tonumber(ARGV[2])
            local limit = tonumber(ARGV[3])
            local cost = tonumber(ARGV[4])
            local requestId = ARGV[5]

            redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, now - windowMs)
            local count = tonumber(redis.call('ZCARD', KEYS[1]))

            if count + cost > limit then
                local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
                local oldestTs = now
                if oldest[2] ~= nil then oldestTs = tonumber(oldest[2]) end
                local retryMs = (oldestTs + windowMs) - now
                if retryMs < 1 then retryMs = 1 end
                local retrySeconds = math.ceil(retryMs / 1000.0)
                redis.call('PEXPIRE', KEYS[1], windowMs)
                return {0, retrySeconds, 2}
            end

            for i = 1, cost do
                redis.call('ZADD', KEYS[1], now, requestId .. ':' .. i)
            end
            redis.call('PEXPIRE', KEYS[1], windowMs)
            return {1, 0, 0}
            """;

    private static final String FIXED_WINDOW_SCRIPT = """
            local current = tonumber(redis.call('GET', KEYS[1]) or '0')
            local limit = tonumber(ARGV[1])
            local cost = tonumber(ARGV[2])
            local ttlMs = tonumber(ARGV[3])

            if current + cost > limit then
                local remainTtl = redis.call('PTTL', KEYS[1])
                if remainTtl < 1 then remainTtl = ttlMs end
                local retrySeconds = math.ceil(remainTtl / 1000.0)
                return {0, retrySeconds, 3}
            end

            local updated = redis.call('INCRBY', KEYS[1], cost)
            if updated == cost then
                redis.call('PEXPIRE', KEYS[1], ttlMs)
            end
            return {1, 0, 0}
            """;

    private static final String LEAKY_BUCKET_SCRIPT = """
            local now = tonumber(ARGV[1])
            local capacity = tonumber(ARGV[2])
            local leakPerSecond = tonumber(ARGV[3])
            local cost = tonumber(ARGV[4])
            local ttlMs = tonumber(ARGV[5])

            if leakPerSecond <= 0 then leakPerSecond = 0.000001 end

            local state = redis.call('HMGET', KEYS[1], 'level', 'last_leak')
            local level = tonumber(state[1])
            local lastLeak = tonumber(state[2])

            if level == nil then level = 0 end
            if lastLeak == nil then lastLeak = now end
            if now < lastLeak then lastLeak = now end

            local elapsed = (now - lastLeak) / 1000.0
            local leaked = elapsed * leakPerSecond
            level = math.max(0, level - leaked)

            if level + cost > capacity then
                local overflow = (level + cost) - capacity
                local retrySeconds = math.ceil(overflow / leakPerSecond)
                redis.call('HSET', KEYS[1], 'level', tostring(level), 'last_leak', tostring(now))
                redis.call('PEXPIRE', KEYS[1], ttlMs)
                return {0, retrySeconds, 5}
            end

            level = level + cost
            redis.call('HSET', KEYS[1], 'level', tostring(level), 'last_leak', tostring(now))
            redis.call('PEXPIRE', KEYS[1], ttlMs)
            return {1, 0, 0}
            """;

    private final StringRedisTemplate redisTemplate;
    private final ApiKeyRepository apiKeyRepository;
    private final RequestStatsService requestStatsService;
    private final MeterRegistry meterRegistry;
    private final String redisPrefix;
    private final String defaultAlgorithm;
    private final double refillPerSecond;
    private final double capacityMultiplier;
    private final long blockThreshold;
    private final DefaultRedisScript<List> tokenBucketScript;
    private final DefaultRedisScript<List> slidingWindowScript;
    private final DefaultRedisScript<List> fixedWindowScript;
    private final DefaultRedisScript<List> leakyBucketScript;

    public DistributedRateLimiterService(
            StringRedisTemplate redisTemplate,
            ApiKeyRepository apiKeyRepository,
            RequestStatsService requestStatsService,
            MeterRegistry meterRegistry,
            @Value("${ratelimiter.redis-prefix:ratelimiter}") String redisPrefix,
            @Value("${ratelimiter.default-algorithm:SLIDING_WINDOW}") String defaultAlgorithm,
            @Value("${ratelimiter.token-bucket.refill-per-second:1.0}") double refillPerSecond,
            @Value("${ratelimiter.token-bucket.capacity-multiplier:1.0}") double capacityMultiplier,
            @Value("${ratelimiter.block-threshold:10}") long blockThreshold
    ) {
        this.redisTemplate = redisTemplate;
        this.apiKeyRepository = apiKeyRepository;
        this.requestStatsService = requestStatsService;
        this.meterRegistry = meterRegistry;
        this.redisPrefix = redisPrefix == null || redisPrefix.isBlank() ? "ratelimiter" : redisPrefix.trim();
        this.defaultAlgorithm = normalizeAlgorithm(defaultAlgorithm);
        this.refillPerSecond = refillPerSecond;
        this.capacityMultiplier = capacityMultiplier;
        this.blockThreshold = Math.max(0L, blockThreshold);

        this.tokenBucketScript = new DefaultRedisScript<>();
        this.tokenBucketScript.setScriptText(TOKEN_BUCKET_SCRIPT);
        this.tokenBucketScript.setResultType(List.class);

        this.slidingWindowScript = new DefaultRedisScript<>();
        this.slidingWindowScript.setScriptText(SLIDING_WINDOW_SCRIPT);
        this.slidingWindowScript.setResultType(List.class);

        this.fixedWindowScript = new DefaultRedisScript<>();
        this.fixedWindowScript.setScriptText(FIXED_WINDOW_SCRIPT);
        this.fixedWindowScript.setResultType(List.class);

        this.leakyBucketScript = new DefaultRedisScript<>();
        this.leakyBucketScript.setScriptText(LEAKY_BUCKET_SCRIPT);
        this.leakyBucketScript.setResultType(List.class);
    }

    @Transactional
    public Decision evaluate(String rawApiKey, String route, int tokens) {
        return evaluate(rawApiKey, route, tokens, null);
    }

    @Transactional
    public Decision evaluate(String rawApiKey, String route, int tokens, String requestedAlgorithm) {
        String apiKeyValue = rawApiKey == null ? "" : rawApiKey.trim();
        if (apiKeyValue.isEmpty()) {
            throw new IllegalArgumentException("apiKey is required");
        }

        ApiKey apiKey = apiKeyRepository.findByApiKey(apiKeyValue)
                .orElseThrow(() -> new IllegalArgumentException("API key not found"));

        long currentTotal = apiKey.getTotalRequests() == null ? 0L : apiKey.getTotalRequests();
        if (currentTotal >= blockThreshold) {
            Decision decision = new Decision(false, 60, "HARD_BLOCK_THRESHOLD_EXCEEDED", normalizeAlgorithm(apiKey.getAlgorithm()));
            updateStats(apiKey, false);
            meterRegistry.counter(
                    "ratelimiter_requests_total",
                    "algorithm",
                    decision.algorithm(),
                    "result",
                    "blocked"
            ).increment();
            return decision;
        }

        int cost = Math.max(1, tokens);
        String routeKey = normalizeRoute(route);
        String storedAlgorithm = normalizeAlgorithm(apiKey.getAlgorithm());
        if (storedAlgorithm.isBlank()) {
            storedAlgorithm = defaultAlgorithm;
            apiKey.setAlgorithm(storedAlgorithm);
        }

        String requestAlgorithm = normalizeAlgorithm(requestedAlgorithm);
        String algorithm = requestAlgorithm.isBlank() ? storedAlgorithm : requestAlgorithm;

        if (!requestAlgorithm.isBlank() && !storedAlgorithm.equals(requestAlgorithm)) {
            throw new IllegalArgumentException(
                    "Requested algorithm does not match API key algorithm. expected="
                            + storedAlgorithm
                            + ", received="
                            + requestAlgorithm
            );
        }

        Decision decision;
        try {
            decision = switch (algorithm) {
                case "TOKEN_BUCKET" -> tokenBucketDecision(apiKey, routeKey, cost);
                case "FIXED_WINDOW" -> fixedWindowDecision(apiKey, routeKey, cost);
                case "LEAKY_BUCKET" -> leakyBucketDecision(apiKey, routeKey, cost);
                case "COMBINED" -> combinedDecision(apiKey, routeKey, cost);
                default -> slidingWindowDecision(apiKey, routeKey, cost);
            };
        } catch (RedisSystemException ex) {
            throw new IllegalStateException("Rate limiter unavailable", ex);
        }

        updateStats(apiKey, decision.allowed());
        meterRegistry.counter(
                "ratelimiter_requests_total",
                "algorithm",
                algorithm,
                "result",
                decision.allowed() ? "allowed" : "blocked"
        ).increment();
        return new Decision(decision.allowed(), decision.retryAfterSeconds(), decision.reason(), algorithm);
    }

    private Decision combinedDecision(ApiKey apiKey, String route, int cost) {
        Decision token = tokenBucketDecision(apiKey, route, cost);
        if (!token.allowed()) {
            return token;
        }
        return slidingWindowDecision(apiKey, route, cost);
    }

    private Decision tokenBucketDecision(ApiKey apiKey, String route, int cost) {
        int capacity = Math.max(1, (int) Math.round(apiKey.getRateLimit() * Math.max(0.1, capacityMultiplier)));
        double windowSeconds = Math.max(1.0, apiKey.getWindowSeconds() == null ? 60.0 : apiKey.getWindowSeconds().doubleValue());
        double dynamicRefillPerSecond = Math.max(1.0, apiKey.getRateLimit()) / windowSeconds;
        double refill = Math.max(0.000001, dynamicRefillPerSecond * Math.max(0.1, refillPerSecond));
        long ttlMs = Math.max(windowMs(apiKey), Duration.ofMinutes(2).toMillis());
        String bucketKey = redisPrefix + ":bucket:" + apiKey.getApiKey() + ":" + route;
        List<Long> result = redisTemplate.execute(
                tokenBucketScript,
                List.of(bucketKey),
                Long.toString(System.currentTimeMillis()),
                Integer.toString(capacity),
                Double.toString(refill),
                Integer.toString(cost),
                Long.toString(ttlMs)
        );
        return toDecision(result, "TOKEN_BUCKET_EXCEEDED", "TOKEN_BUCKET");
    }

    private Decision slidingWindowDecision(ApiKey apiKey, String route, int cost) {
        String windowKey = redisPrefix + ":sliding:" + apiKey.getApiKey() + ":" + route;
        List<Long> result = redisTemplate.execute(
                slidingWindowScript,
                List.of(windowKey),
                Long.toString(System.currentTimeMillis()),
                Long.toString(windowMs(apiKey)),
                Integer.toString(Math.max(1, apiKey.getRateLimit())),
                Integer.toString(cost),
                UUID.randomUUID().toString()
        );
        return toDecision(result, "SLIDING_WINDOW_EXCEEDED", "SLIDING_WINDOW");
    }

    private Decision fixedWindowDecision(ApiKey apiKey, String route, int cost) {
        long now = System.currentTimeMillis();
        long windowMs = windowMs(apiKey);
        long bucket = now / windowMs;
        String fixedKey = redisPrefix + ":fixed:" + apiKey.getApiKey() + ":" + route + ":" + bucket;
        List<Long> result = redisTemplate.execute(
                fixedWindowScript,
                List.of(fixedKey),
                Integer.toString(Math.max(1, apiKey.getRateLimit())),
                Integer.toString(cost),
                Long.toString(windowMs)
        );
        return toDecision(result, "FIXED_WINDOW_EXCEEDED", "FIXED_WINDOW");
    }

    private Decision leakyBucketDecision(ApiKey apiKey, String route, int cost) {
        int capacity = Math.max(1, apiKey.getRateLimit());
        double windowSeconds = Math.max(1.0, apiKey.getWindowSeconds() == null ? 60.0 : apiKey.getWindowSeconds().doubleValue());
        double leakPerSecond = Math.max(0.000001, Math.max(1.0, apiKey.getRateLimit()) / windowSeconds);
        long ttlMs = Math.max(windowMs(apiKey), Duration.ofMinutes(2).toMillis());
        String bucketKey = redisPrefix + ":leaky:" + apiKey.getApiKey() + ":" + route;
        List<Long> result = redisTemplate.execute(
                leakyBucketScript,
                List.of(bucketKey),
                Long.toString(System.currentTimeMillis()),
                Integer.toString(capacity),
                Double.toString(leakPerSecond),
                Integer.toString(cost),
                Long.toString(ttlMs)
        );
        return toDecision(result, "LEAKY_BUCKET_EXCEEDED", "LEAKY_BUCKET");
    }

    private Decision toDecision(List<Long> result, String defaultReason, String algorithm) {
        if (result == null || result.size() < 3) {
            return new Decision(false, 1, "LIMITER_ERROR", algorithm);
        }
        boolean allowed = result.get(0) != null && result.get(0) == 1L;
        int retryAfter = result.get(1) == null ? 1 : Math.max(1, result.get(1).intValue());
        long code = result.get(2) == null ? 4L : result.get(2);
        String reason = switch ((int) code) {
            case 0 -> "ALLOWED";
            case 1 -> "TOKEN_BUCKET_EXCEEDED";
            case 2 -> "SLIDING_WINDOW_EXCEEDED";
            case 3 -> "FIXED_WINDOW_EXCEEDED";
            case 5 -> "LEAKY_BUCKET_EXCEEDED";
            default -> defaultReason;
        };
        return allowed
                ? new Decision(true, 0, reason, algorithm)
                : new Decision(false, retryAfter, reason, algorithm);
    }

    private void updateStats(ApiKey apiKey, boolean allowed) {
        long total = apiKey.getTotalRequests() == null ? 0L : apiKey.getTotalRequests();
        long allowedCount = apiKey.getAllowedRequests() == null ? 0L : apiKey.getAllowedRequests();
        long blockedCount = apiKey.getBlockedRequests() == null ? 0L : apiKey.getBlockedRequests();
        long nextTotal = total + 1L;

        apiKey.setTotalRequests(nextTotal);
        if (allowed) {
            apiKey.setAllowedRequests(allowedCount + 1L);
        } else {
            apiKey.setBlockedRequests(blockedCount + 1L);
        }

        boolean exceedsThreshold = nextTotal > blockThreshold;
        apiKey.setStatus((!allowed || exceedsThreshold) ? "Blocked" : "Normal");
        apiKeyRepository.save(apiKey);

        if (allowed) {
            requestStatsService.incrementAllowed(1L);
        } else {
            requestStatsService.incrementBlocked(1L);
        }
    }

    private long windowMs(ApiKey apiKey) {
        return Math.max(1, apiKey.getWindowSeconds() == null ? 60 : apiKey.getWindowSeconds()) * 1000L;
    }

    private String normalizeRoute(String route) {
        String value = route == null ? "global" : route.trim().toLowerCase(Locale.ROOT);
        if (value.isEmpty()) {
            return "global";
        }
        return value.replace(' ', '_');
    }

    private String normalizeAlgorithm(String algorithm) {
        if (algorithm == null) {
            return "";
        }
        String value = algorithm.trim().toUpperCase(Locale.ROOT);
        if (value.isEmpty()) {
            return "";
        }
        return switch (value) {
            case "TOKEN_BUCKET", "SLIDING_WINDOW", "FIXED_WINDOW", "LEAKY_BUCKET", "COMBINED" -> value;
            default -> (defaultAlgorithm == null || defaultAlgorithm.isBlank()) ? "SLIDING_WINDOW" : defaultAlgorithm;
        };
    }

    public record Decision(boolean allowed, int retryAfterSeconds, String reason, String algorithm) {}
}
