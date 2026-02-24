package com.system.ratelimiter.config;

import com.system.ratelimiter.entity.AdminUser;
import com.system.ratelimiter.repository.AdminUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminBootstrapConfig {

    @Bean
    CommandLineRunner ensureDefaultAdmin(AdminUserRepository adminUserRepository) {
        return args -> {
            final String userId = "admin";
            final String password = "admin*123*123";
            final String fullName = "System Admin";
            final String email = "admin@ratelimiter.local";

            AdminUser admin = adminUserRepository.findByUserId(userId).orElseGet(AdminUser::new);
            admin.setUserId(userId);
            admin.setPassword(password);
            admin.setFullName(fullName);
            admin.setEmail(email);
            adminUserRepository.save(admin);
        };
    }
}
