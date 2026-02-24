package com.system.ratelimiter.controller;

import com.system.ratelimiter.dto.LoginRequest;
import com.system.ratelimiter.entity.AdminUser;
import com.system.ratelimiter.repository.AdminUserRepository;
import com.system.ratelimiter.service.AuthService;
import jakarta.validation.Valid;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import jakarta.servlet.http.HttpSession;
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

    public AuthController(AuthService authService, AdminUserRepository adminUserRepository) {
        this.authService = authService;
        this.adminUserRepository = adminUserRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        boolean ok = authService.authenticate(request.getUsername(), request.getPassword());
        if (!ok) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials"));
        }
        Optional<AdminUser> admin = adminUserRepository.findByUserId(request.getUsername());
        if (admin.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials"));
        }
        session.setAttribute("userId", admin.get().getUserId());
        AdminUser user = admin.get();
        Map<String, Object> body = adminPayload(user);
        body.put("message", "Login successful");
        return ResponseEntity.ok(body);
    }

    @GetMapping("/admin/{userId}")
    public ResponseEntity<Map<String, Object>> getAdmin(@PathVariable("userId") String userId) {
        Optional<AdminUser> admin = adminUserRepository.findByUserId(userId);
        if (admin.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Admin not found"));
        }
        AdminUser user = admin.get();
        return ResponseEntity.ok(adminPayload(user));
    }

    @GetMapping("/admins")
    public ResponseEntity<Map<String, Object>> listAdmins() {
        var admins = adminUserRepository.findAll()
                .stream()
                .map(this::adminListItemPayload)
                .toList();
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
        Optional<AdminUser> admin = adminUserRepository.findByUserId(String.valueOf(userId));
        if (admin.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not authenticated"));
        }
        AdminUser user = admin.get();
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

    private Map<String, Object> adminListItemPayload(AdminUser user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("userId", user.getUserId());
        payload.put("fullName", user.getFullName());
        payload.put("email", user.getEmail());
        payload.put("createdAt", user.getCreatedAt());
        return payload;
    }
}
