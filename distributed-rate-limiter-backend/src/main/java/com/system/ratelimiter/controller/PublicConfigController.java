package com.system.ratelimiter.controller;

import java.util.Map;
import java.util.List;
import java.util.Locale;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PublicConfigController {

    private final String grafanaDashboardUrl;
    private final int refreshIntervalMs;
    private final int defaultRateLimit;
    private final int defaultWindowSeconds;
    private final String defaultAlgorithm;
    private final List<String> allowedAlgorithms;

    public PublicConfigController(
            @Value("${ui.grafana.dashboard-url:}") String grafanaDashboardUrl,
            @Value("${ui.refresh-interval-ms:30000}") int refreshIntervalMs,
            @Value("${ui.defaults.rate-limit:10}") int defaultRateLimit,
            @Value("${ui.defaults.window-seconds:60}") int defaultWindowSeconds,
            @Value("${ui.defaults.algorithm:SLIDING_WINDOW}") String defaultAlgorithm,
            @Value("${ui.allowed-algorithms:SLIDING_WINDOW,TOKEN_BUCKET,FIXED_WINDOW}") String allowedAlgorithmsCsv
    ) {
        this.grafanaDashboardUrl = grafanaDashboardUrl;
        this.refreshIntervalMs = Math.max(5000, refreshIntervalMs);
        this.defaultRateLimit = Math.max(1, defaultRateLimit);
        this.defaultWindowSeconds = Math.max(1, defaultWindowSeconds);
        this.defaultAlgorithm = defaultAlgorithm == null || defaultAlgorithm.isBlank()
                ? "SLIDING_WINDOW"
                : defaultAlgorithm.trim().toUpperCase();
        this.allowedAlgorithms = Arrays.stream((allowedAlgorithmsCsv == null ? "" : allowedAlgorithmsCsv).split(","))
                .map(String::trim)
                .map(value -> value.toUpperCase(Locale.ROOT))
                .filter(value -> "SLIDING_WINDOW".equals(value) || "TOKEN_BUCKET".equals(value) || "FIXED_WINDOW".equals(value))
                .distinct()
                .toList();
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getFrontendConfig() {
        return ResponseEntity.ok(Map.of(
                "grafanaDashboardUrl", grafanaDashboardUrl,
                "refreshIntervalMs", refreshIntervalMs,
                "allowedAlgorithms", allowedAlgorithms.isEmpty() ? List.of("SLIDING_WINDOW") : allowedAlgorithms,
                "defaults", Map.of(
                        "rateLimit", defaultRateLimit,
                        "windowSeconds", defaultWindowSeconds,
                        "algorithm", defaultAlgorithm
                )
        ));
    }
}
