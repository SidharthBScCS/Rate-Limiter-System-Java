package com.system.ratelimiter.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping("/")
    public String forwardToIndex() {
        return "forward:/index.html";
    }

    @GetMapping("/dashboard")
    public String dashboard(HttpSession session) {
        return isAuthenticated(session) ? "forward:/index.html" : "redirect:/login";
    }

    @GetMapping("/analytics")
    public String analytics(HttpSession session) {
        return isAuthenticated(session) ? "forward:/index.html" : "redirect:/login";
    }

    @GetMapping("/login")
    public String login(HttpSession session) {
        return isAuthenticated(session) ? "redirect:/dashboard" : "forward:/index.html";
    }

    private boolean isAuthenticated(HttpSession session) {
        Object userId = session == null ? null : session.getAttribute("userId");
        return userId != null && !String.valueOf(userId).isBlank();
    }
}
