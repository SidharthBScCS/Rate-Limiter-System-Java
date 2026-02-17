package com.system.ratelimiter.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class ApiKeyRequest {

    @NotBlank
    private String userName;

    @NotNull
    @Min(1)
    @Max(10)
    private Integer rateLimit;

    @NotNull
    @Min(1)
    private Integer windowSeconds;

    @Pattern(
            regexp = "TOKEN_BUCKET|FIXED_WINDOW|SLIDING_WINDOW",
            message = "Algorithm must be one of TOKEN_BUCKET, FIXED_WINDOW, SLIDING_WINDOW"
    )
    private String algorithm;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Integer getRateLimit() {
        return rateLimit;
    }

    public void setRateLimit(Integer rateLimit) {
        this.rateLimit = rateLimit;
    }

    public Integer getWindowSeconds() {
        return windowSeconds;
    }

    public void setWindowSeconds(Integer windowSeconds) {
        this.windowSeconds = windowSeconds;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }
}
