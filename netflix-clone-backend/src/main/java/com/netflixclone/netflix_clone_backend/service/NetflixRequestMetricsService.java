package com.netflixclone.netflix_clone_backend.service;

import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class NetflixRequestMetricsService {

    private final JdbcTemplate jdbcTemplate;
    private final int defaultRateLimit;
    private final int defaultWindowSeconds;

    public NetflixRequestMetricsService(
            JdbcTemplate jdbcTemplate,
            @Value("${ratelimiter.default-rate-limit:10}") int defaultRateLimit,
            @Value("${ratelimiter.default-window-seconds:60}") int defaultWindowSeconds
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.defaultRateLimit = defaultRateLimit;
        this.defaultWindowSeconds = defaultWindowSeconds;
    }

    public void record(String userName, boolean allowed) {
        String normalized = userName == null ? "" : userName.trim();
        if (normalized.isEmpty()) {
            return;
        }

        try {
            ApiKeyCounters counters = jdbcTemplate.query(
                    "SELECT id, total_request, allowed_requests, blocked_requests "
                            + "FROM api_keys WHERE user_name = ? ORDER BY id DESC LIMIT 1",
                    ps -> ps.setString(1, normalized),
                    rs -> rs.next()
                            ? new ApiKeyCounters(
                                    rs.getLong("id"),
                                    rs.getLong("total_request"),
                                    rs.getLong("allowed_requests"),
                                    rs.getLong("blocked_requests"))
                            : null
            );

            long nextTotal;
            long nextAllowed;
            long nextBlocked;

            if (counters == null) {
                nextTotal = 1L;
                nextAllowed = allowed ? 1L : 0L;
                nextBlocked = allowed ? 0L : 1L;
                jdbcTemplate.update(
                        "INSERT INTO api_keys (user_name, rate_limit, window_seconds, api_key, status, total_request, allowed_requests, blocked_requests, created_at) "
                                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
                        normalized,
                        defaultRateLimit,
                        defaultWindowSeconds,
                        UUID.randomUUID().toString(),
                        allowed ? "Normal" : "Blocked",
                        nextTotal,
                        nextAllowed,
                        nextBlocked
                );
            } else {
                nextTotal = counters.totalRequests + 1L;
                nextAllowed = counters.allowedRequests + (allowed ? 1L : 0L);
                nextBlocked = counters.blockedRequests + (allowed ? 0L : 1L);
                jdbcTemplate.update(
                        "UPDATE api_keys SET total_request = ?, allowed_requests = ?, blocked_requests = ?, status = ? WHERE id = ?",
                        nextTotal,
                        nextAllowed,
                        nextBlocked,
                        allowed ? "Normal" : "Blocked",
                        counters.id
                );
            }

            RequestStatsCounters stats = jdbcTemplate.query(
                    "SELECT id, total_requests, allowed_requests, blocked_requests FROM request_stats ORDER BY id ASC LIMIT 1",
                    rs -> rs.next()
                            ? new RequestStatsCounters(
                                    rs.getLong("id"),
                                    rs.getLong("total_requests"),
                                    rs.getLong("allowed_requests"),
                                    rs.getLong("blocked_requests"))
                            : null
            );

            if (stats == null) {
                jdbcTemplate.update(
                        "INSERT INTO request_stats (total_requests, allowed_requests, blocked_requests) VALUES (?, ?, ?)",
                        1L,
                        allowed ? 1L : 0L,
                        allowed ? 0L : 1L
                );
            } else {
                jdbcTemplate.update(
                        "UPDATE request_stats SET total_requests = ?, allowed_requests = ?, blocked_requests = ? WHERE id = ?",
                        stats.totalRequests + 1L,
                        stats.allowedRequests + (allowed ? 1L : 0L),
                        stats.blockedRequests + (allowed ? 0L : 1L),
                        stats.id
                );
            }
        } catch (DataAccessException ex) {
            // Metrics updates should not block response flow.
        }
    }

    private record ApiKeyCounters(Long id, Long totalRequests, Long allowedRequests, Long blockedRequests) {}

    private record RequestStatsCounters(Long id, Long totalRequests, Long allowedRequests, Long blockedRequests) {}
}
