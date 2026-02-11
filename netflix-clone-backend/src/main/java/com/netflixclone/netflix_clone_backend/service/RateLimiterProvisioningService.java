package com.netflixclone.netflix_clone_backend.service;

import java.util.UUID;
import org.springframework.dao.DataAccessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class RateLimiterProvisioningService {

    private final JdbcTemplate jdbcTemplate;
    private final int defaultRateLimit;
    private final int defaultWindowSeconds;

    public RateLimiterProvisioningService(
            JdbcTemplate jdbcTemplate,
            @Value("${ratelimiter.default-rate-limit:10}") int defaultRateLimit,
            @Value("${ratelimiter.default-window-seconds:60}") int defaultWindowSeconds
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.defaultRateLimit = defaultRateLimit;
        this.defaultWindowSeconds = defaultWindowSeconds;
    }

    public void provisionOwner(String ownerName) {
        String normalizedOwner = ownerName == null ? "" : ownerName.trim();
        if (normalizedOwner.isEmpty()) {
            throw new IllegalArgumentException("Owner name is required");
        }

        try {
            jdbcTemplate.update(
                    "INSERT INTO api_keys (owner_name, rate_limit, window_seconds, api_key, status, total_request, allowed_requests, blocked_requests, created_at) "
                            + "VALUES (?, ?, ?, ?, 'Normal', 0, 0, 0, NOW())",
                    normalizedOwner,
                    defaultRateLimit,
                    defaultWindowSeconds,
                    UUID.randomUUID().toString()
            );
        } catch (DataAccessException ex) {
            throw new IllegalStateException("Failed to create rate limiter owner entry", ex);
        }
    }
}
