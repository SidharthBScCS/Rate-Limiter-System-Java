package com.system.ratelimiter.config;

import com.system.ratelimiter.entity.AdminUser;
import com.system.ratelimiter.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminBootstrapConfig {

    @Bean
    CommandLineRunner ensureDefaultAdmin(
            AdminUserRepository adminUserRepository,
            @Value("${auth.admin.username:admin}") String userId,
            @Value("${auth.admin.password:admin@123}") String password,
            @Value("${auth.admin.full-name:System Admin}") String fullName,
            @Value("${auth.admin.email:admin@ratelimiter.local}") String email
    ) {
        return args -> {
            AdminUser admin = adminUserRepository.findByUserId(userId).orElseGet(AdminUser::new);
            admin.setUserId(userId);
            admin.setPassword(password);
            admin.setFullName(fullName);
            admin.setEmail(email);
            adminUserRepository.save(admin);
        };
    }
}
