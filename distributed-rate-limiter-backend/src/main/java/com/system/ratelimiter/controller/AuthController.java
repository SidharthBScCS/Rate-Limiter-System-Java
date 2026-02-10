package com.system.ratelimiter.controller;

import com.system.ratelimiter.dto.LoginRequest;
import com.system.ratelimiter.entity.AdminUser;
import com.system.ratelimiter.repository.AdminUserRepository;
import com.system.ratelimiter.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.Optional;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
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
        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "userId", user.getUserId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "createdAt", user.getCreatedAt(),
                "initials", initials(user.getFullName(), user.getUserId())
        ));
    }

    @GetMapping("/admin/{userId}")
    public ResponseEntity<Map<String, Object>> getAdmin(@PathVariable("userId") String userId) {
        Optional<AdminUser> admin = adminUserRepository.findByUserId(userId);
        if (admin.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Admin not found"));
        }
        AdminUser user = admin.get();
        return ResponseEntity.ok(Map.of(
                "userId", user.getUserId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "createdAt", user.getCreatedAt(),
                "initials", initials(user.getFullName(), user.getUserId())
        ));
    }

    @GetMapping("/admins")
    public ResponseEntity<Map<String, Object>> listAdmins() {
        var admins = adminUserRepository.findAll()
                .stream()
                .map(user -> Map.of(
                        "userId", user.getUserId(),
                        "fullName", user.getFullName(),
                        "email", user.getEmail(),
                        "createdAt", user.getCreatedAt()
                ))
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
        return ResponseEntity.ok(Map.of(
                "userId", user.getUserId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "createdAt", user.getCreatedAt(),
                "initials", initials(user.getFullName(), user.getUserId())
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logged out"));
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
}
