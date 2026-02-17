package com.system.ratelimiter.controller;

import java.util.Map;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"}, allowCredentials = "true")
@RequestMapping("/api/health")
public class RedisHealthController {

    private final StringRedisTemplate redisTemplate;

    public RedisHealthController(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @GetMapping("/redis")
    public ResponseEntity<Map<String, Object>> redisHealth() {
        try {
            String pong = redisTemplate.execute((RedisConnection connection) -> connection.ping());
            boolean up = "PONG".equalsIgnoreCase(pong);
            HttpStatus status = up ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
            return ResponseEntity.status(status).body(Map.of(
                    "service", "redis",
                    "status", up ? "UP" : "DOWN",
                    "ping", pong == null ? "" : pong
            ));
        } catch (DataAccessException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "service", "redis",
                    "status", "DOWN",
                    "error", ex.getMostSpecificCause() == null ? ex.getMessage() : ex.getMostSpecificCause().getMessage()
            ));
        }
    }
}
