package com.system.ratelimiter.service;

import com.system.ratelimiter.entity.AdminUser;
import com.system.ratelimiter.repository.AdminUserRepository;
import java.util.Objects;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AdminUserRepository adminUserRepository;
    private final String singleUserId;
    private final String singleUserPassword;

    public AuthService(
            AdminUserRepository adminUserRepository,
            @Value("${auth.admin.username:admin}") String singleUserId,
            @Value("${auth.admin.password:admin*123*123}") String singleUserPassword
    ) {
        this.adminUserRepository = adminUserRepository;
        this.singleUserId = singleUserId;
        this.singleUserPassword = singleUserPassword;
    }

    public boolean authenticate(String username, String password) {
        if (username == null || username.isBlank() || password == null) {
            return false;
        }

        // Deterministic single-user auth path for production stability.
        if (Objects.equals(singleUserId, username) && Objects.equals(singleUserPassword, password)) {
            return true;
        }

        Optional<AdminUser> user = adminUserRepository.findByUserId(username);
        return user.filter(admin -> Objects.equals(admin.getPassword(), password)).isPresent();
    }
}
