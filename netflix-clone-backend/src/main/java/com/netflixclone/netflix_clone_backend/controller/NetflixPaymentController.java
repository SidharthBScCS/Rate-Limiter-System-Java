package com.netflixclone.netflix_clone_backend.controller;

import com.netflixclone.netflix_clone_backend.dto.NetflixPremiumPaymentRequest;
import com.netflixclone.netflix_clone_backend.service.NetflixPaymentService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class NetflixPaymentController {

    private static final String AUTH_SESSION_KEY = "netflixUserEmail";
    private final NetflixPaymentService netflixPaymentService;

    public NetflixPaymentController(NetflixPaymentService netflixPaymentService) {
        this.netflixPaymentService = netflixPaymentService;
    }

    @PostMapping("/premium/subscribe")
    public ResponseEntity<Map<String, Object>> subscribePremium(
            @Valid @RequestBody NetflixPremiumPaymentRequest request,
            HttpSession session
    ) {
        Object email = session.getAttribute(AUTH_SESSION_KEY);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not authenticated"));
        }
        Map<String, Object> body = netflixPaymentService.subscribePremium(String.valueOf(email), request);
        return ResponseEntity.ok(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = "Invalid payment request";
        FieldError error = ex.getBindingResult().getFieldError();
        if (error != null && error.getDefaultMessage() != null) {
            message = error.getDefaultMessage();
        }
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        String message = ex.getMessage() == null ? "Invalid payment request" : ex.getMessage();
        HttpStatus status = "Not authenticated".equalsIgnoreCase(message)
                ? HttpStatus.UNAUTHORIZED
                : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(Map.of("message", message));
    }
}
