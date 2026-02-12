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
            ensureMetricsSchema();
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

    private void ensureMetricsSchema() {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS api_keys (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    user_name VARCHAR(255) NOT NULL,
                    rate_limit INT NOT NULL,
                    window_seconds INT NOT NULL,
                    algorithm VARCHAR(30) NOT NULL DEFAULT 'SLIDING_WINDOW',
                    api_key VARCHAR(255) NOT NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'Normal',
                    total_request BIGINT NOT NULL DEFAULT 0,
                    allowed_requests BIGINT NOT NULL DEFAULT 0,
                    blocked_requests BIGINT NOT NULL DEFAULT 0,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """);

        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS request_stats (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    total_requests BIGINT NOT NULL DEFAULT 0,
                    allowed_requests BIGINT NOT NULL DEFAULT 0,
                    blocked_requests BIGINT NOT NULL DEFAULT 0
                )
                """);
    }
}
