package com.system.ratelimiter.service;

import com.system.ratelimiter.entity.AdminUser;
import com.system.ratelimiter.repository.AdminUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminUserSeeder implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;

    public AdminUserSeeder(AdminUserRepository adminUserRepository) {
        this.adminUserRepository = adminUserRepository;
    }

    @Override
    public void run(String... args) {
        adminUserRepository.findByUserId("admin").ifPresentOrElse(existing -> {
            boolean changed = false;
            if (!"admin123".equals(existing.getPassword())) {
                existing.setPassword("admin123");
                changed = true;
            }
            if (existing.getFullName() == null || existing.getFullName().isBlank()) {
                existing.setFullName("Admin User");
                changed = true;
            }
            if (existing.getEmail() == null || existing.getEmail().isBlank()) {
                existing.setEmail("admin@ratelimit.local");
                changed = true;
            }
            if (changed) {
                adminUserRepository.save(existing);
            }
        }, () -> {
            AdminUser admin = new AdminUser();
            admin.setUserId("admin");
            admin.setPassword("admin123");
            admin.setFullName("Admin User");
            admin.setEmail("admin@ratelimit.local");
            adminUserRepository.save(admin);
        });
    }
}
