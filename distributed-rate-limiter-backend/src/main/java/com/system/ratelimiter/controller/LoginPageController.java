package com.system.ratelimiter.controller;

import com.system.ratelimiter.dto.LoginRequest;
import com.system.ratelimiter.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class LoginPageController {

    private final AuthService authService;
    private final String adminUsername;
    private final String frontendBaseUrl;

    public LoginPageController(
            AuthService authService,
            @Value("${auth.admin.username:admin}") String adminUsername,
            @Value("${frontend.base-url:http://localhost:5173}") String frontendBaseUrl
    ) {
        this.authService = authService;
        this.adminUsername = adminUsername;
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

        session.setAttribute("userId", adminUsername);
        return "redirect:" + frontendBaseUrl + "/dashboard";
    }

    private String currentIstTime() {
        return ZonedDateTime.now(ZoneId.of("Asia/Kolkata"))
                .format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    }
}
