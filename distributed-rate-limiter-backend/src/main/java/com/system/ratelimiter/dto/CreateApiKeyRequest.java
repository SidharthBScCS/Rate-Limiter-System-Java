package com.system.ratelimiter.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateApiKeyRequest {

    @NotBlank(message = "userName is required")
    private String userName;

    @NotBlank(message = "rateLimit is required")
    private String rateLimit;

    @NotBlank(message = "windowSeconds is required")
    private String windowSeconds;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getRateLimit() {
        return rateLimit;
    }

    public void setRateLimit(String rateLimit) {
        this.rateLimit = rateLimit;
    }

    public String getWindowSeconds() {
        return windowSeconds;
    }

    public void setWindowSeconds(String windowSeconds) {
        this.windowSeconds = windowSeconds;
    }

}
