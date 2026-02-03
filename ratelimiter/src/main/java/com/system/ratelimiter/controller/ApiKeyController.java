package com.system.ratelimiter.controller;

import com.system.ratelimiter.dto.ApiKeyRequest;
import com.system.ratelimiter.entity.ApiKey;
import com.system.ratelimiter.entity.RequestStats;
import com.system.ratelimiter.service.ApiKeyService;
import com.system.ratelimiter.service.RequestStatsService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;
    private final RequestStatsService requestStatsService;

    public ApiKeyController(ApiKeyService apiKeyService, RequestStatsService requestStatsService) {
        this.apiKeyService = apiKeyService;
        this.requestStatsService = requestStatsService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createApiKey(@Valid @RequestBody ApiKeyRequest request) {
        ApiKey created = apiKeyService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "API Key created successfully",
                        "id", created.getId(),
                        "ownerName", created.getOwnerName()
                ));
    }

    @GetMapping
    public ResponseEntity<List<ApiKey>> listApiKeys() {
        return ResponseEntity.ok(apiKeyService.getAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<RequestStats> getStats() {
        return ResponseEntity.ok(requestStatsService.getOrCreate());
    }

    @GetMapping("/analytics/keys")
    public ResponseEntity<List<Map<String, Object>>> getApiKeyStats() {
        return ResponseEntity.ok(apiKeyService.getApiKeyStats());
    }

    @PostMapping("/{id}/request")
    public ResponseEntity<Map<String, Object>> recordRequest(@PathVariable("id") Long id) {
        ApiKey updated = apiKeyService.incrementRequest(id);
        return ResponseEntity.ok(Map.of(
                "id", updated.getId(),
                "totalRequests", updated.getTotalRequests(),
                "status", updated.getStatus()
        ));
    }
}
