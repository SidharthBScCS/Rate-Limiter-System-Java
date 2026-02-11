package com.netflixclone.netflix_clone_backend.controller;

import com.netflixclone.netflix_clone_backend.entity.NetflixUser;
import com.netflixclone.netflix_clone_backend.service.NetflixAuthService;
import com.netflixclone.netflix_clone_backend.service.NetflixRateLimiterService;
import com.netflixclone.netflix_clone_backend.service.TmdbProxyService;
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
    private final TmdbProxyService tmdbProxyService;

    public NetflixMoviesController(
            NetflixAuthService netflixAuthService,
            NetflixRateLimiterService netflixRateLimiterService,
            TmdbProxyService tmdbProxyService
    ) {
        this.netflixAuthService = netflixAuthService;
        this.netflixRateLimiterService = netflixRateLimiterService;
        this.tmdbProxyService = tmdbProxyService;
    }

    @GetMapping("/trending")
    public ResponseEntity<String> trending(HttpSession session) {
        return fetchWithRateLimit(session, "/trending/movie/week", Map.of());
    }

    @GetMapping("/top-rated")
    public ResponseEntity<String> topRated(HttpSession session) {
        return fetchWithRateLimit(session, "/movie/top_rated", Map.of());
    }

    @GetMapping("/netflix-originals")
    public ResponseEntity<String> netflixOriginals(HttpSession session) {
        return fetchWithRateLimit(session, "/discover/tv", Map.of(
                "with_networks", "213",
                "sort_by", "popularity.desc"
        ));
    }

    @GetMapping("/action")
    public ResponseEntity<String> action(HttpSession session) {
        return fetchWithRateLimit(session, "/discover/movie", Map.of(
                "with_genres", "28",
                "sort_by", "popularity.desc"
        ));
    }

    private ResponseEntity<String> fetchWithRateLimit(HttpSession session, String path, Map<String, String> params) {
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

        return tmdbProxyService.fetch(path, params);
    }
}
