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

    public void provisionUser(String userName) {
        String normalizedUser = userName == null ? "" : userName.trim();
        if (normalizedUser.isEmpty()) {
            throw new IllegalArgumentException("User name is required");
        }

        try {
            Integer existing = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM api_keys WHERE user_name = ?",
                    Integer.class,
                    normalizedUser
            );
            if (existing != null && existing > 0) {
                return;
            }
            jdbcTemplate.update(
                    "INSERT INTO api_keys (user_name, rate_limit, window_seconds, api_key, status, total_request, allowed_requests, blocked_requests, created_at) "
                            + "VALUES (?, ?, ?, ?, 'Normal', 0, 0, 0, NOW())",
                    normalizedUser,
                    defaultRateLimit,
                    defaultWindowSeconds,
                    UUID.randomUUID().toString()
            );
        } catch (DataAccessException ex) {
            throw new IllegalStateException("Failed to create rate limiter owner entry", ex);
        }
    }
}
