package com.netflixclone.netflix_clone_backend.service;

import com.netflixclone.netflix_clone_backend.dto.NetflixPremiumPaymentRequest;
import com.netflixclone.netflix_clone_backend.entity.NetflixUser;
import com.netflixclone.netflix_clone_backend.repository.NetflixUserRepository;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NetflixPaymentService {

    private final NetflixUserRepository netflixUserRepository;

    public NetflixPaymentService(NetflixUserRepository netflixUserRepository) {
        this.netflixUserRepository = netflixUserRepository;
    }

    @Transactional
    public Map<String, Object> subscribePremium(String email, NetflixPremiumPaymentRequest request) {
        String normalizedEmail = normalizeEmail(email);
        NetflixUser user = netflixUserRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Not authenticated"));

        String planCode = request.getPlanCode() == null ? "" : request.getPlanCode().trim().toUpperCase(Locale.ROOT);
        if (!"PREMIUM_MONTHLY".equals(planCode) && !"PREMIUM_YEARLY".equals(planCode)) {
            throw new IllegalArgumentException("Unsupported premium plan");
        }

        if (user.isPremium()) {
            return Map.of(
                    "message", "Premium already active",
                    "premium", true,
                    "planCode", planCode,
                    "transactionId", "PMT-ALREADY-ACTIVE"
            );
        }

        user.setPremium(true);
        user.setPremiumActivatedAt(Instant.now());
        netflixUserRepository.save(user);

        String cardNumber = request.getCardNumber();
        String masked = "************" + cardNumber.substring(cardNumber.length() - 4);
        String transactionId = "PMT-" + System.currentTimeMillis();

        return Map.of(
                "message", "Payment successful. Premium activated.",
                "premium", true,
                "planCode", planCode,
                "maskedCard", masked,
                "transactionId", transactionId
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
