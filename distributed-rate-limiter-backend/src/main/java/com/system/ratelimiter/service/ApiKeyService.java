package com.system.ratelimiter.service;

import com.system.ratelimiter.entity.ApiKey;
import com.system.ratelimiter.repository.ApiKeyRepository;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final RequestStatsService requestStatsService;
    private final String defaultAlgorithm;
    private final long blockThreshold;

    public ApiKeyService(
            ApiKeyRepository apiKeyRepository,
            RequestStatsService requestStatsService,
            @Value("${ratelimiter.default-algorithm:SLIDING_WINDOW}") String defaultAlgorithm,
            @Value("${ratelimiter.block-threshold:10}") long blockThreshold
    ) {
        this.apiKeyRepository = apiKeyRepository;
        this.requestStatsService = requestStatsService;
        this.defaultAlgorithm = normalizeOrDefault(defaultAlgorithm, "SLIDING_WINDOW");
        this.blockThreshold = Math.max(0L, blockThreshold);
    }

    public java.util.List<ApiKey> getAll() {
        java.util.List<ApiKey> apiKeys = apiKeyRepository.findAll();
        boolean updated = false;

        for (ApiKey apiKey : apiKeys) {
            long total = apiKey.getTotalRequests() == null ? 0L : apiKey.getTotalRequests();
            long allowed = apiKey.getAllowedRequests() == null ? 0L : apiKey.getAllowedRequests();
            long blocked = apiKey.getBlockedRequests() == null ? 0L : apiKey.getBlockedRequests();

            // Repair older rows where all over-threshold traffic was counted as allowed.
            if (total > blockThreshold && blocked == 0L && allowed == total) {
                long repairedBlocked = total - blockThreshold;
                long repairedAllowed = total - repairedBlocked;
                apiKey.setAllowedRequests(Math.max(0L, repairedAllowed));
                apiKey.setBlockedRequests(Math.max(0L, repairedBlocked));
                allowed = apiKey.getAllowedRequests();
                blocked = apiKey.getBlockedRequests();
                updated = true;
            }

            // Ensure historical counters reflect at least the configured hard-block threshold.
            if (total > blockThreshold) {
                long minimumBlocked = total - blockThreshold;
                if (blocked < minimumBlocked) {
                    blocked = minimumBlocked;
                    allowed = Math.max(0L, total - blocked);
                    apiKey.setBlockedRequests(blocked);
                    apiKey.setAllowedRequests(allowed);
                    updated = true;
                }
            }

            // Keep counters internally consistent.
            if (allowed + blocked != total) {
                long normalizedBlocked = Math.max(0L, total - allowed);
                apiKey.setBlockedRequests(normalizedBlocked);
                blocked = normalizedBlocked;
                updated = true;
            }

            String expectedStatus = total > blockThreshold ? "Blocked" : "Normal";
            if (!expectedStatus.equalsIgnoreCase(apiKey.getStatus())) {
                apiKey.setStatus(expectedStatus);
                updated = true;
            }
        }

        if (updated) {
            apiKeyRepository.saveAll(apiKeys);
        }

        requestStatsService.syncWithApiKeys();
        return apiKeys;
    }

    public java.util.List<ApiKey> getAllRealKeys() {
        return getAll().stream()
                .filter(this::isRealKey)
                .toList();
    }

    public java.util.List<java.util.Map<String, Object>> getApiKeyStats() {
        java.util.List<ApiKey> apiKeys = getAllRealKeys();

        return apiKeys.stream()
                .map(apiKey -> java.util.Map.<String, Object>of(
                        "userName", apiKey.getUserName(),
                        "totalRequests", apiKey.getTotalRequests() == null ? 0L : apiKey.getTotalRequests(),
                        "allowedRequests", apiKey.getAllowedRequests() == null ? 0L : apiKey.getAllowedRequests(),
                        "blockedRequests", apiKey.getBlockedRequests() == null ? 0L : apiKey.getBlockedRequests(),
                        "algorithm", apiKey.getAlgorithm() == null ? resolveAlgorithm(null) : apiKey.getAlgorithm()
                ))
                .toList();
    }

    private boolean isRealKey(ApiKey apiKey) {
        if (apiKey == null) {
            return false;
        }
        String user = apiKey.getUserName() == null ? "" : apiKey.getUserName().trim().toLowerCase(Locale.ROOT);
        String key = apiKey.getApiKey() == null ? "" : apiKey.getApiKey().trim().toLowerCase(Locale.ROOT);
        return !(user.startsWith("demo")
                || user.startsWith("sample")
                || user.startsWith("test")
                || key.startsWith("demo")
                || key.startsWith("sample")
                || key.startsWith("test"));
    }

    private String resolveAlgorithm(String algorithm) {
        String value = algorithm == null ? "" : algorithm.trim().toUpperCase(Locale.ROOT);
        if (value.isEmpty()) {
            return defaultAlgorithm;
        }
        if (isSupportedAlgorithm(value)) {
            return value;
        }
        throw new IllegalArgumentException("Algorithm must be one of TOKEN_BUCKET, FIXED_WINDOW, SLIDING_WINDOW");
    }

    private String normalizeOrDefault(String algorithm, String fallback) {
        String value = algorithm == null ? "" : algorithm.trim().toUpperCase(Locale.ROOT);
        if (value.isEmpty()) {
            return fallback;
        }
        return isSupportedAlgorithm(value) ? value : fallback;
    }

    private boolean isSupportedAlgorithm(String algorithm) {
        return "TOKEN_BUCKET".equals(algorithm)
                || "FIXED_WINDOW".equals(algorithm)
                || "SLIDING_WINDOW".equals(algorithm);
    }
}
