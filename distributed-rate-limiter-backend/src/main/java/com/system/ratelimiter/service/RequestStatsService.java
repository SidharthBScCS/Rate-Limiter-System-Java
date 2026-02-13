package com.system.ratelimiter.service;

import com.system.ratelimiter.entity.ApiKey;
import com.system.ratelimiter.entity.RequestStats;
import com.system.ratelimiter.repository.ApiKeyRepository;
import com.system.ratelimiter.repository.RequestStatsRepository;
import jakarta.annotation.PostConstruct;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RequestStatsService {

    private final RequestStatsRepository requestStatsRepository;
    private final ApiKeyRepository apiKeyRepository;

    public RequestStatsService(RequestStatsRepository requestStatsRepository, ApiKeyRepository apiKeyRepository) {
        this.requestStatsRepository = requestStatsRepository;
        this.apiKeyRepository = apiKeyRepository;
    }

    public RequestStats getOrCreate() {
        return requestStatsRepository.findTopByOrderByIdAsc()
                .orElseGet(() -> {
                    RequestStats stats = new RequestStats();
                    stats.setTotalRequests(0L);
                    stats.setAllowedRequests(0L);
                    stats.setBlockedRequests(0L);
                    return requestStatsRepository.save(stats);
                });
    }

    public RequestStats incrementAllowed(long delta) {
        RequestStats stats = getOrCreate();
        stats.setTotalRequests(stats.getTotalRequests() + delta);
        stats.setAllowedRequests(stats.getAllowedRequests() + delta);
        return requestStatsRepository.save(stats);
    }

    public RequestStats incrementBlocked(long delta) {
        RequestStats stats = getOrCreate();
        stats.setTotalRequests(stats.getTotalRequests() + delta);
        stats.setBlockedRequests(stats.getBlockedRequests() + delta);
        return requestStatsRepository.save(stats);
    }

    @PostConstruct
    @Transactional
    public void syncOnStartup() {
        syncWithApiKeys();
    }

    @Transactional
    public RequestStats syncWithApiKeys() {
        List<ApiKey> apiKeys = apiKeyRepository.findAll();
        long total = apiKeys.stream().mapToLong(key -> key.getTotalRequests() == null ? 0L : key.getTotalRequests()).sum();
        long allowed = apiKeys.stream().mapToLong(key -> key.getAllowedRequests() == null ? 0L : key.getAllowedRequests()).sum();
        long blocked = apiKeys.stream().mapToLong(key -> key.getBlockedRequests() == null ? 0L : key.getBlockedRequests()).sum();

        RequestStats stats = getOrCreate();
        stats.setTotalRequests(total);
        stats.setAllowedRequests(allowed);
        stats.setBlockedRequests(blocked);
        return requestStatsRepository.save(stats);
    }
}
