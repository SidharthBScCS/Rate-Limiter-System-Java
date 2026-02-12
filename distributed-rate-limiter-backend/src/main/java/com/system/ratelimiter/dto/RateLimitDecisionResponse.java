package com.system.ratelimiter.dto;

public record RateLimitDecisionResponse(
        boolean allowed,
        int retryAfterSeconds,
        String reason,
        String algorithm,
        String apiKey
) {}
