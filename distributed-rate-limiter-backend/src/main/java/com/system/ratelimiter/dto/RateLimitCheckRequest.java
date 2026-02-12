package com.system.ratelimiter.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class RateLimitCheckRequest {

    @NotBlank(message = "apiKey is required")
    private String apiKey;

    @NotBlank(message = "route is required")
    private String route;

    @Min(value = 1, message = "tokens must be >= 1")
    private Integer tokens = 1;

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getRoute() {
        return route;
    }

    public void setRoute(String route) {
        this.route = route;
    }

    public Integer getTokens() {
        return tokens;
    }

    public void setTokens(Integer tokens) {
        this.tokens = tokens;
    }
}
