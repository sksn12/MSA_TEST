package com.example.auth.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping("/users/by-email")
    Map<String, Object> getUserByEmail(@RequestParam("email") String email);

    @PostMapping("/users/signup")
    Map<String, Object> signup(@RequestBody Map<String, String> request);
}
