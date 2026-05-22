package com.example.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public Map<String, Object> getUsers() {
        return Map.of(
            "service", "User Service",
            "message", "회원 서비스 응답입니다.",
            "users", userRepository.findAll()
        );
    }

    @GetMapping("/users/{userId}")
    public Map<String, Object> getUserById(@PathVariable("userId") Long userId) {
        return userRepository.findById(userId)
            .map(user -> Map.<String, Object>of("id", user.getId(), "name", user.getName()))
            .orElse(Map.of("id", userId, "name", "Unknown User"));
    }
}
