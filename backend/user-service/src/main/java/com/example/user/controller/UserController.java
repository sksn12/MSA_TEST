package com.example.user.controller;

import com.example.user.entity.User;
import com.example.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class UserController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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

    @GetMapping("/users/by-email")
    public ResponseEntity<Map<String, Object>> getUserByEmail(@RequestParam("email") String email) {
        return userRepository.findByEmail(email)
            .map(user -> ResponseEntity.ok(Map.<String, Object>of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "password", user.getPassword(),
                "role", user.getRole()
            )))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");
        String password = request.get("password");

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "이미 존재하는 이메일입니다."));
        }

        User user = new User(name, email, passwordEncoder.encode(password), "ROLE_USER");
        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "id", savedUser.getId(),
            "name", savedUser.getName(),
            "email", savedUser.getEmail(),
            "role", savedUser.getRole()
        ));
    }
}
