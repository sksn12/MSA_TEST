package com.example.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class UserController {

    @GetMapping("/users")
    public Map<String, Object> getUsers() {
        return Map.of(
            "service", "User Service",
            "message", "회원 서비스 응답입니다.",
            "users", List.of(
                Map.of("id", 1L, "name", "Alice"),
                Map.of("id", 2L, "name", "Bob")
            )
        );
    }

    @GetMapping("/users/{userId}")
    public Map<String, Object> getUserById(@PathVariable("userId") Long userId) {
        List<Map<String, Object>> mockUsers = List.of(
            Map.of("id", 1L, "name", "Alice"),
            Map.of("id", 2L, "name", "Bob")
        );
        return mockUsers.stream()
            .filter(u -> u.get("id").equals(userId))
            .findFirst()
            .orElse(Map.of("id", userId, "name", "Unknown User"));
    }
}
