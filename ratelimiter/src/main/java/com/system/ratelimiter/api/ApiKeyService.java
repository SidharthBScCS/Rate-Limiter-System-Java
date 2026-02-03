package com.system.ratelimiter.api;

import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;

    public ApiKeyService(ApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    public ApiKey create(ApiKeyRequest request) {
        ApiKey apiKey = new ApiKey();
        apiKey.setOwnerName(request.getOwnerName());
        apiKey.setRateLimit(request.getRateLimit());
        apiKey.setWindowSeconds(request.getWindowSeconds());
        apiKey.setApiKey(UUID.randomUUID().toString());
        return apiKeyRepository.save(apiKey);
    }
}
