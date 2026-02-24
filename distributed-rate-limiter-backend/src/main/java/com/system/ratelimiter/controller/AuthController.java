package com.system.ratelimiter.controller;

import com.system.ratelimiter.dto.LoginRequest;
import com.system.ratelimiter.entity.AdminUser;
import com.system.ratelimiter.repository.AdminUserRepository;
import com.system.ratelimiter.service.AuthService;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*", "https://*.onrender.com"}, allowCredentials = "true")
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AdminUserRepository adminUserRepository;
    private final String singleUserId;
    private final String singleUserFullName;
    private final String singleUserEmail;

    public AuthController(
            AuthService authService,
            AdminUserRepository adminUserRepository,
            @Value("${auth.admin.username:admin}") String singleUserId,
            @Value("${auth.admin.full-name:System Admin}") String singleUserFullName,
            @Value("${auth.admin.email:admin@ratelimiter.local}") String singleUserEmail
    ) {
        this.authService = authService;
        this.adminUserRepository = adminUserRepository;
        this.singleUserId = singleUserId;
        this.singleUserFullName = singleUserFullName;
        this.singleUserEmail = singleUserEmail;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        boolean ok = authService.authenticate(request.getUsername(), request.getPassword());
        if (!ok) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials"));
        }

        Map<String, Object> body = adminPayload(resolveUserProfile(request.getUsername()));
        session.setAttribute("userId", body.get("userId"));
        body.put("message", "Login successful");
        return ResponseEntity.ok(body);
    }

    @GetMapping("/admin/{userId}")
    public ResponseEntity<Map<String, Object>> getAdmin(@PathVariable("userId") String userId) {
        Map<String, Object> user = resolveUserProfile(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Admin not found"));
        }
        return ResponseEntity.ok(adminPayload(user));
    }

    @GetMapping("/admins")
    public ResponseEntity<Map<String, Object>> listAdmins() {
        List<Map<String, Object>> admins;
        try {
            admins = adminUserRepository.findAll()
                    .stream()
                    .map(this::adminListItemPayload)
                    .toList();
        } catch (DataAccessException ex) {
            admins = List.of(adminListItemPayload(resolveUserProfile(singleUserId)));
        }
        if (admins.isEmpty()) {
            admins = List.of(adminListItemPayload(resolveUserProfile(singleUserId)));
        }
        return ResponseEntity.ok(Map.of(
                "count", admins.size(),
                "items", admins
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentAdmin(HttpSession session) {
        Object userId = session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not authenticated"));
        }

        Map<String, Object> user = resolveUserProfile(String.valueOf(userId));
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not authenticated"));
        }
        return ResponseEntity.ok(adminPayload(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleDataAccess(DataAccessException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", "Authentication database unavailable"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Authentication failed unexpectedly"));
    }

    private String initials(String fullName, String fallback) {
        String base = (fullName == null || fullName.isBlank()) ? fallback : fullName;
        if (base == null || base.isBlank()) {
            return "AD";
        }
        String[] parts = base.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        }
        return ("" + parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }

    private Map<String, Object> adminPayload(AdminUser user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("userId", user.getUserId());
        payload.put("fullName", user.getFullName());
        payload.put("email", user.getEmail());
        payload.put("createdAt", user.getCreatedAt());
        payload.put("initials", initials(user.getFullName(), user.getUserId()));
        return payload;
    }

    private Map<String, Object> adminPayload(Map<String, Object> user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("userId", user.get("userId"));
        payload.put("fullName", user.get("fullName"));
        payload.put("email", user.get("email"));
        payload.put("createdAt", user.get("createdAt"));
        payload.put("initials", initials((String) user.get("fullName"), (String) user.get("userId")));
        return payload;
    }

    private Map<String, Object> adminListItemPayload(AdminUser user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("userId", user.getUserId());
        payload.put("fullName", user.getFullName());
        payload.put("email", user.getEmail());
        payload.put("createdAt", user.getCreatedAt());
        return payload;
    }

    private Map<String, Object> adminListItemPayload(Map<String, Object> user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("userId", user.get("userId"));
        payload.put("fullName", user.get("fullName"));
        payload.put("email", user.get("email"));
        payload.put("createdAt", user.get("createdAt"));
        return payload;
    }

    private Map<String, Object> resolveUserProfile(String userId) {
        if (userId == null || userId.isBlank()) {
            return null;
        }
        try {
            Optional<AdminUser> admin = adminUserRepository.findByUserId(userId);
            if (admin.isPresent()) {
                return adminPayload(admin.get());
            }
        } catch (DataAccessException ignored) {
            // Fall back to configured single user profile below.
        }

        if (!singleUserId.equals(userId)) {
            return null;
        }

        Map<String, Object> fallback = new LinkedHashMap<>();
        fallback.put("userId", singleUserId);
        fallback.put("fullName", singleUserFullName);
        fallback.put("email", singleUserEmail);
        fallback.put("createdAt", Instant.now());
        return fallback;
    }
}
