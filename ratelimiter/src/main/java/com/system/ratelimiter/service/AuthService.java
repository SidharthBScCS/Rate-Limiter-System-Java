package com.system.ratelimiter.service;

import com.system.ratelimiter.entity.AdminUser;
import com.system.ratelimiter.repository.AdminUserRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AdminUserRepository adminUserRepository;

    public AuthService(AdminUserRepository adminUserRepository) {
        this.adminUserRepository = adminUserRepository;
    }

    public boolean authenticate(String username, String password) {
        Optional<AdminUser> user = adminUserRepository.findByUserId(username);
        return user.filter(admin -> admin.getPassword().equals(password)).isPresent();
    }
}
