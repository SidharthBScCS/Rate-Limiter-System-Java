package com.system.ratelimiter.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping(value = {
            "/",
            "/dashboard",
            "/analytics",
            "/login"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}

