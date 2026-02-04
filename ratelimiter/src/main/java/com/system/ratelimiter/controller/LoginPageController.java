package com.system.ratelimiter.controller;

import com.system.ratelimiter.dto.LoginRequest;
import com.system.ratelimiter.entity.AdminUser;
import com.system.ratelimiter.repository.AdminUserRepository;
import com.system.ratelimiter.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class LoginPageController {

    private final AuthService authService;
    private final AdminUserRepository adminUserRepository;
    private final String frontendBaseUrl;

    public LoginPageController(
            AuthService authService,
            AdminUserRepository adminUserRepository,
            @Value("${frontend.base-url:http://localhost:5173}") String frontendBaseUrl
    ) {
        this.authService = authService;
        this.adminUserRepository = adminUserRepository;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @GetMapping("/login")
    public String login(Model model) {
        model.addAttribute("loginRequest", new LoginRequest());
        model.addAttribute("serverTime", currentIstTime());
        return "login";
    }

    @PostMapping("/login")
    public String doLogin(@Valid @ModelAttribute("loginRequest") LoginRequest request,
                          HttpSession session,
                          Model model) {
        boolean ok = authService.authenticate(request.getUsername(), request.getPassword());
        if (!ok) {
            model.addAttribute("error", "Invalid credentials.");
            model.addAttribute("serverTime", currentIstTime());
            return "login";
        }

        Optional<AdminUser> admin = adminUserRepository.findByUserId(request.getUsername());
        if (admin.isEmpty()) {
            model.addAttribute("error", "Invalid credentials.");
            model.addAttribute("serverTime", currentIstTime());
            return "login";
        }

        session.setAttribute("userId", admin.get().getUserId());
        return "redirect:" + frontendBaseUrl + "/dashboard";
    }

    private String currentIstTime() {
        return ZonedDateTime.now(ZoneId.of("Asia/Kolkata"))
                .format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    }
}
