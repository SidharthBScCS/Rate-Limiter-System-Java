package com.netflixclone.netflix_clone_backend.service;

import com.netflixclone.netflix_clone_backend.dto.NetflixLoginRequest;
import com.netflixclone.netflix_clone_backend.dto.NetflixRegisterRequest;
import com.netflixclone.netflix_clone_backend.entity.NetflixUser;
import com.netflixclone.netflix_clone_backend.repository.NetflixUserRepository;
import java.util.Locale;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class NetflixAuthService {

    private final NetflixUserRepository netflixUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final RateLimiterProvisioningService rateLimiterProvisioningService;

    public NetflixAuthService(
            NetflixUserRepository netflixUserRepository,
            PasswordEncoder passwordEncoder,
            RateLimiterProvisioningService rateLimiterProvisioningService
    ) {
        this.netflixUserRepository = netflixUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.rateLimiterProvisioningService = rateLimiterProvisioningService;
    }

    @Transactional
    public NetflixUser register(NetflixRegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        if (netflixUserRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already registered");
        }

        NetflixUser user = new NetflixUser();
        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        NetflixUser saved = netflixUserRepository.save(user);
        rateLimiterProvisioningService.provisionUser(saved.getEmail());
        return saved;
    }

    public NetflixUser login(NetflixLoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        Optional<NetflixUser> user = netflixUserRepository.findByEmail(normalizedEmail);
        if (user.isEmpty()) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.get().getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        return user.get();
    }

    public Optional<NetflixUser> findByEmail(String email) {
        return netflixUserRepository.findByEmail(normalizeEmail(email));
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
