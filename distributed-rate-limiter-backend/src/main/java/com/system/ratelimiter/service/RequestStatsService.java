package com.system.ratelimiter.service;

import com.system.ratelimiter.entity.RequestStats;
import com.system.ratelimiter.repository.RequestStatsRepository;
import org.springframework.stereotype.Service;

@Service
public class RequestStatsService {

    private final RequestStatsRepository requestStatsRepository;

    public RequestStatsService(RequestStatsRepository requestStatsRepository) {
        this.requestStatsRepository = requestStatsRepository;
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
}
