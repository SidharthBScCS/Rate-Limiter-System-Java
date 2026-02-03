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
            requestStatsService.incrementBlocked(1);
            return apiKeyRepository.save(blocked);
        }

        ApiKey apiKey = new ApiKey();
        apiKey.setOwnerName(request.getOwnerName());
        apiKey.setRateLimit(request.getRateLimit());
        apiKey.setWindowSeconds(request.getWindowSeconds());
        apiKey.setApiKey(UUID.randomUUID().toString());
        apiKey.setStatus("Normal");
        ApiKey saved = apiKeyRepository.save(apiKey);
        requestStatsService.incrementAllowed(1);
        return saved;
    }

    public java.util.List<ApiKey> getAll() {
        return apiKeyRepository.findAll();
    }
}
