package com.system.ratelimiter.service;

import com.system.ratelimiter.dto.ApiKeyRequest;
import com.system.ratelimiter.entity.ApiKey;
import com.system.ratelimiter.repository.ApiKeyRepository;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final RequestStatsService requestStatsService;
    private final String defaultAlgorithm;

    public ApiKeyService(
            ApiKeyRepository apiKeyRepository,
            RequestStatsService requestStatsService,
            @Value("${ratelimiter.default-algorithm:SLIDING_WINDOW}") String defaultAlgorithm
    ) {
        this.apiKeyRepository = apiKeyRepository;
        this.requestStatsService = requestStatsService;
        this.defaultAlgorithm = defaultAlgorithm;
    }

    public ApiKey create(ApiKeyRequest request) {
        String algorithm = resolveAlgorithm(request.getAlgorithm());
        if (request.getRateLimit() != null && request.getRateLimit() > 100) {
            ApiKey blocked = new ApiKey();
            blocked.setUserName(request.getUserName());
            blocked.setRateLimit(request.getRateLimit());
            blocked.setWindowSeconds(request.getWindowSeconds());
            blocked.setAlgorithm(algorithm);
            blocked.setApiKey(UUID.randomUUID().toString());
            blocked.setStatus("Blocked");
            blocked.setTotalRequests(0L);
            blocked.setAllowedRequests(0L);
            blocked.setBlockedRequests(0L);
            return apiKeyRepository.save(blocked);
        }

        ApiKey apiKey = new ApiKey();
        apiKey.setUserName(request.getUserName());
        apiKey.setRateLimit(request.getRateLimit());
        apiKey.setWindowSeconds(request.getWindowSeconds());
        apiKey.setAlgorithm(algorithm);
        apiKey.setApiKey(UUID.randomUUID().toString());
        apiKey.setStatus("Normal");
        apiKey.setTotalRequests(0L);
        apiKey.setAllowedRequests(0L);
        apiKey.setBlockedRequests(0L);
        ApiKey saved = apiKeyRepository.save(apiKey);
        return saved;
    }

    public java.util.List<ApiKey> getAll() {
        return apiKeyRepository.findAll();
    }

    public java.util.List<java.util.Map<String, Object>> getApiKeyStats() {
        java.util.List<ApiKey> apiKeys = apiKeyRepository.findAll();
        boolean updated = false;

        for (ApiKey apiKey : apiKeys) {
            long total = apiKey.getTotalRequests() == null ? 0L : apiKey.getTotalRequests();
            long allowed = apiKey.getAllowedRequests() == null ? 0L : apiKey.getAllowedRequests();
            long blocked = apiKey.getBlockedRequests() == null ? 0L : apiKey.getBlockedRequests();

            if (total > 0 && allowed + blocked == 0) {
                if ("Blocked".equalsIgnoreCase(apiKey.getStatus())) {
                    apiKey.setBlockedRequests(total);
                } else {
                    apiKey.setAllowedRequests(total);
                }
                updated = true;
            }
        }

        if (updated) {
            apiKeyRepository.saveAll(apiKeys);
        }

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

    private String resolveAlgorithm(String algorithm) {
        String value = algorithm == null ? "" : algorithm.trim().toUpperCase();
        if (value.isEmpty()) {
            value = defaultAlgorithm == null ? "" : defaultAlgorithm.trim().toUpperCase();
        }
        return switch (value) {
            case "TOKEN_BUCKET", "SLIDING_WINDOW", "FIXED_WINDOW", "COMBINED" -> value;
            default -> "SLIDING_WINDOW";
        };
    }
}
