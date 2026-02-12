package com.netflixclone.netflix_clone_backend.controller;

import com.netflixclone.netflix_clone_backend.dto.NetflixLoginRequest;
import com.netflixclone.netflix_clone_backend.dto.NetflixRegisterRequest;
import com.netflixclone.netflix_clone_backend.entity.NetflixUser;
import com.netflixclone.netflix_clone_backend.service.NetflixAuthService;
import com.netflixclone.netflix_clone_backend.service.NetflixRateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class NetflixAuthController {

    private static final String AUTH_SESSION_KEY = "netflixUserEmail";
    private static final Logger LOG = LoggerFactory.getLogger(NetflixAuthController.class);

    private final NetflixAuthService netflixAuthService;
    private final NetflixRateLimiterService netflixRateLimiterService;

    public NetflixAuthController(
            NetflixAuthService netflixAuthService,
            NetflixRateLimiterService netflixRateLimiterService
    ) {
        this.netflixAuthService = netflixAuthService;
        this.netflixRateLimiterService = netflixRateLimiterService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @Valid @RequestBody NetflixRegisterRequest request,
            HttpSession session,
            HttpServletRequest httpRequest
    ) {
        NetflixRateLimiterService.Decision decision = netflixRateLimiterService.checkAuthAndRecord(
                buildRateLimitKey(httpRequest, request.getEmail()),
                request.getEmail()
        );
        logDecision("/api/auth/register", request.getEmail(), decision);
        if (!decision.allowed()) {
            return tooManyRequests(decision);
        }

        NetflixUser user = netflixAuthService.register(request);
        session.setAttribute(AUTH_SESSION_KEY, user.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Registration successful",
                "user", toUserPayload(user)
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @Valid @RequestBody NetflixLoginRequest request,
            HttpSession session,
            HttpServletRequest httpRequest
    ) {
        NetflixRateLimiterService.Decision decision = netflixRateLimiterService.checkAuthAndRecord(
                buildRateLimitKey(httpRequest, request.getEmail()),
                request.getEmail()
        );
        logDecision("/api/auth/login", request.getEmail(), decision);
        if (!decision.allowed()) {
            return tooManyRequests(decision);
        }

        NetflixUser user = netflixAuthService.login(request);
        session.setAttribute(AUTH_SESSION_KEY, user.getEmail());
        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "user", toUserPayload(user)
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(HttpSession session, HttpServletRequest httpRequest) {
        Object email = session.getAttribute(AUTH_SESSION_KEY);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not authenticated"));
        }

        return netflixAuthService.findByEmail(String.valueOf(email))
                .map(user -> ResponseEntity.ok(Map.of(
                        "message", "Authenticated",
                        "user", toUserPayload(user)
                )))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not authenticated")));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session, HttpServletRequest httpRequest) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = "Invalid request";
        FieldError error = ex.getBindingResult().getFieldError();
        if (error != null && error.getDefaultMessage() != null) {
            message = error.getDefaultMessage();
        }
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        String message = ex.getMessage() == null ? "Invalid request" : ex.getMessage();
        HttpStatus status;
        if ("Email already registered".equalsIgnoreCase(message)) {
            status = HttpStatus.CONFLICT;
        } else if ("Invalid credentials".equalsIgnoreCase(message)) {
            status = HttpStatus.UNAUTHORIZED;
        } else {
            status = HttpStatus.BAD_REQUEST;
        }
        return ResponseEntity.status(status).body(Map.of("message", message));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        String message = ex.getMessage() == null ? "Service unavailable" : ex.getMessage();
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("message", message));
    }

    private Map<String, Object> toUserPayload(NetflixUser user) {
        return Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "createdAt", user.getCreatedAt()
        );
    }

    private ResponseEntity<Map<String, Object>> tooManyRequests(NetflixRateLimiterService.Decision decision) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", String.valueOf(decision.retryAfterSeconds()))
                .body(Map.of(
                        "message", "Too Many Requests",
                        "reason", decision.reason()
                ));
    }

    private String buildRateLimitKey(HttpServletRequest request, String identityHint) {
        String ip = extractClientIp(request);
        String normalizedIdentity = identityHint == null ? "" : identityHint.trim().toLowerCase(Locale.ROOT);
        if (normalizedIdentity.isEmpty()) {
            normalizedIdentity = "anonymous";
        }
        return "ip:" + ip + "|id:" + normalizedIdentity;
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        String remoteAddr = request.getRemoteAddr();
        return remoteAddr == null || remoteAddr.isBlank() ? "unknown" : remoteAddr.trim();
    }

    private void logDecision(String endpoint, String identity, NetflixRateLimiterService.Decision decision) {
        LOG.info(
                "rate-limit endpoint={} identity={} allowed={} reason={} retryAfter={}",
                endpoint,
                identity == null ? "" : identity,
                decision.allowed(),
                decision.reason(),
                decision.retryAfterSeconds()
        );
    }
}
