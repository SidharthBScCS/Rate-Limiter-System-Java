package com.netflixclone.netflix_clone_backend.service;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class NetflixRateLimiterService {

    private final Map<String, Deque<Long>> requestWindows = new ConcurrentHashMap<>();
    private final int limit;
    private final long windowMs;
    private final NetflixRequestMetricsService metricsService;

    public NetflixRateLimiterService(
            @Value("${netflix.rate-limit.max-requests:10}") int limit,
            @Value("${netflix.rate-limit.window-seconds:60}") int windowSeconds,
            NetflixRequestMetricsService metricsService
    ) {
        this.limit = limit;
        this.windowMs = windowSeconds * 1000L;
        this.metricsService = metricsService;
    }

    public Decision checkAndRecord(String userKey, String userName) {
        String key = userKey == null ? "" : userKey.trim().toLowerCase();
        if (key.isEmpty()) {
            metricsService.record(userName, false);
            return new Decision(false, (int) Math.ceil(windowMs / 1000.0));
        }

        long now = System.currentTimeMillis();
        Deque<Long> window = requestWindows.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        synchronized (window) {
            long threshold = now - windowMs;
            while (!window.isEmpty() && window.peekFirst() < threshold) {
                window.pollFirst();
            }

            if (window.size() >= limit) {
                long oldest = window.peekFirst() == null ? now : window.peekFirst();
                int retryAfter = (int) Math.max(1L, ((oldest + windowMs - now) + 999L) / 1000L);
                metricsService.record(userName, false);
                return new Decision(false, retryAfter);
            }

            window.addLast(now);
            metricsService.record(userName, true);
            return new Decision(true, 0);
        }
    }

    public record Decision(boolean allowed, int retryAfterSeconds) {}
}
