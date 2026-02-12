package com.netflixclone.netflix_clone_backend.controller;

import com.netflixclone.netflix_clone_backend.entity.NetflixUser;
import com.netflixclone.netflix_clone_backend.service.MockMovieCatalogService;
import com.netflixclone.netflix_clone_backend.service.NetflixAuthService;
import com.netflixclone.netflix_clone_backend.service.NetflixRateLimiterService;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/movies")
public class NetflixMoviesController {

    private static final String AUTH_SESSION_KEY = "netflixUserEmail";

    private final NetflixAuthService netflixAuthService;
    private final NetflixRateLimiterService netflixRateLimiterService;
    private final MockMovieCatalogService mockMovieCatalogService;

    public NetflixMoviesController(
            NetflixAuthService netflixAuthService,
            NetflixRateLimiterService netflixRateLimiterService,
            MockMovieCatalogService mockMovieCatalogService
    ) {
        this.netflixAuthService = netflixAuthService;
        this.netflixRateLimiterService = netflixRateLimiterService;
        this.mockMovieCatalogService = mockMovieCatalogService;
    }

    @GetMapping("/trending")
    public ResponseEntity<?> trending(HttpSession session) {
        return fetchWithRateLimit(session, "trending");
    }

    @GetMapping("/top-rated")
    public ResponseEntity<?> topRated(HttpSession session) {
        return fetchWithRateLimit(session, "topRated");
    }

    @GetMapping("/netflix-originals")
    public ResponseEntity<?> netflixOriginals(HttpSession session) {
        return fetchWithRateLimit(session, "netflixOriginals");
    }

    @GetMapping("/action")
    public ResponseEntity<?> action(HttpSession session) {
        return fetchWithRateLimit(session, "action");
    }

    private ResponseEntity<?> fetchWithRateLimit(HttpSession session, String category) {
        Object emailObj = session.getAttribute(AUTH_SESSION_KEY);
        if (emailObj == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"message\":\"Not authenticated\"}");
        }

        String email = String.valueOf(emailObj);
        Optional<NetflixUser> userOpt = netflixAuthService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"message\":\"Not authenticated\"}");
        }

        NetflixUser user = userOpt.get();
        NetflixRateLimiterService.Decision decision =
                netflixRateLimiterService.checkAndRecord(user.getEmail(), user.getFullName());
        if (!decision.allowed()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header(HttpHeaders.RETRY_AFTER, String.valueOf(decision.retryAfterSeconds()))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"message\":\"Too Many Requests\"}");
        }

        return switch (category) {
            case "topRated" -> ResponseEntity.ok(Map.of("results", mockMovieCatalogService.topRated()));
            case "netflixOriginals" -> ResponseEntity.ok(Map.of("results", mockMovieCatalogService.netflixOriginals()));
            case "action" -> ResponseEntity.ok(Map.of("results", mockMovieCatalogService.action()));
            default -> ResponseEntity.ok(Map.of("results", mockMovieCatalogService.trending()));
        };
    }
}
