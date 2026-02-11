package com.system.ratelimiter.service;

import com.system.ratelimiter.dto.ApiKeyRequest;
import com.system.ratelimiter.entity.ApiKey;
import com.system.ratelimiter.repository.ApiKeyRepository;
import java.util.Map;
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

    public ApiKey incrementRequest(Long apiKeyId) {
        ApiKey apiKey = apiKeyRepository.findById(apiKeyId)
                .orElseThrow(() -> new IllegalArgumentException("API key not found"));
        return incrementRequestInternal(apiKey);
    }

    public Map<String, Object> checkAndRecordByApiKey(String rawApiKey) {
        String normalized = rawApiKey == null ? "" : rawApiKey.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("API key is required");
        }

        ApiKey apiKey = apiKeyRepository.findByApiKey(normalized)
                .orElseThrow(() -> new IllegalArgumentException("API key not found"));

        ApiKey updated = incrementRequestInternal(apiKey);
        boolean allowed = !"Blocked".equalsIgnoreCase(updated.getStatus());

        return Map.of(
                "id", updated.getId(),
                "ownerName", updated.getOwnerName(),
                "allowed", allowed,
                "status", updated.getStatus(),
                "totalRequests", updated.getTotalRequests() == null ? 0L : updated.getTotalRequests(),
                "allowedRequests", updated.getAllowedRequests() == null ? 0L : updated.getAllowedRequests(),
                "blockedRequests", updated.getBlockedRequests() == null ? 0L : updated.getBlockedRequests()
        );
    }

    private ApiKey incrementRequestInternal(ApiKey apiKey) {
        long currentCount = apiKey.getTotalRequests() == null ? 0L : apiKey.getTotalRequests();
        long nextCount = currentCount + 1;
        apiKey.setTotalRequests(nextCount);

        boolean blocked = apiKey.getRateLimit() != null && nextCount > apiKey.getRateLimit();
        apiKey.setStatus(blocked ? "Blocked" : "Normal");

        long currentAllowed = apiKey.getAllowedRequests() == null ? 0L : apiKey.getAllowedRequests();
        long currentBlocked = apiKey.getBlockedRequests() == null ? 0L : apiKey.getBlockedRequests();
        if (blocked) {
            apiKey.setBlockedRequests(currentBlocked + 1);
        } else {
            apiKey.setAllowedRequests(currentAllowed + 1);
        }

        ApiKey saved = apiKeyRepository.save(apiKey);
        if (blocked) {
            requestStatsService.incrementBlocked(1);
        } else {
            requestStatsService.incrementAllowed(1);
        }
        return saved;
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
