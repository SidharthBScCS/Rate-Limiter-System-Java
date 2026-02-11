package com.system.ratelimiter.service;

import com.system.ratelimiter.dto.ApiKeyRequest;
import com.system.ratelimiter.entity.ApiKey;
import com.system.ratelimiter.repository.ApiKeyRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final RequestStatsService requestStatsService;

    public ApiKeyService(ApiKeyRepository apiKeyRepository, RequestStatsService requestStatsService) {
        this.apiKeyRepository = apiKeyRepository;
        this.requestStatsService = requestStatsService;
    }

    public ApiKey create(ApiKeyRequest request) {
        if (request.getRateLimit() != null && request.getRateLimit() > 100) {
            ApiKey blocked = new ApiKey();
            blocked.setOwnerName(request.getOwnerName());
            blocked.setRateLimit(request.getRateLimit());
            blocked.setWindowSeconds(request.getWindowSeconds());
            blocked.setApiKey(UUID.randomUUID().toString());
            blocked.setStatus("Blocked");
            blocked.setTotalRequests(0L);
            blocked.setAllowedRequests(0L);
            blocked.setBlockedRequests(0L);
            return apiKeyRepository.save(blocked);
        }

        ApiKey apiKey = new ApiKey();
        apiKey.setOwnerName(request.getOwnerName());
        apiKey.setRateLimit(request.getRateLimit());
        apiKey.setWindowSeconds(request.getWindowSeconds());
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
                        "ownerName", apiKey.getOwnerName(),
                        "totalRequests", apiKey.getTotalRequests() == null ? 0L : apiKey.getTotalRequests(),
                        "allowedRequests", apiKey.getAllowedRequests() == null ? 0L : apiKey.getAllowedRequests(),
                        "blockedRequests", apiKey.getBlockedRequests() == null ? 0L : apiKey.getBlockedRequests()
                ))
                .toList();
    }
}
