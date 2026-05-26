package com.example.auth.controller;

import com.example.auth.client.UserClient;
import com.example.auth.util.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserClient userClient;
    private final JwtTokenProvider jwtTokenProvider;
    private final BCryptPasswordEncoder passwordEncoder;
    private final Map<String, String> refreshTokens = new ConcurrentHashMap<>();

    public AuthController(UserClient userClient, JwtTokenProvider jwtTokenProvider, BCryptPasswordEncoder passwordEncoder) {
        this.userClient = userClient;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        try {
            Map<String, Object> user = userClient.getUserByEmail(email);
            if (user == null || user.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "이메일 또는 비밀번호가 잘못되었습니다."));
            }

            String hashedPassword = (String) user.get("password");
            if (!passwordEncoder.matches(password, hashedPassword)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "이메일 또는 비밀번호가 잘못되었습니다."));
            }

            Long id = Long.valueOf(user.get("id").toString());
            String name = (String) user.get("name");
            String role = (String) user.get("role");

            String accessToken = jwtTokenProvider.generateAccessToken(id, email, role, name);
            String refreshToken = jwtTokenProvider.generateRefreshToken(email);

            // Store refresh token
            refreshTokens.put(email, refreshToken);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "token", accessToken, // Backward compatibility
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "user", Map.of(
                    "id", id,
                    "name", name,
                    "email", email,
                    "role", role
                )
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "로그인 실패: 유저를 찾을 수 없거나 비밀번호가 틀렸습니다. 상세: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "유효하지 않거나 만료된 Refresh Token입니다."));
        }

        try {
            String email = jwtTokenProvider.getClaimsFromToken(refreshToken).getSubject();
            String storedToken = refreshTokens.get(email);
            if (storedToken == null || !storedToken.equals(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "인증 정보가 일치하지 않는 Refresh Token입니다."));
            }

            Map<String, Object> user = userClient.getUserByEmail(email);
            if (user == null || user.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "사용자 정보를 찾을 수 없습니다."));
            }

            Long id = Long.valueOf(user.get("id").toString());
            String name = (String) user.get("name");
            String role = (String) user.get("role");

            String newAccessToken = jwtTokenProvider.generateAccessToken(id, email, role, name);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "token", newAccessToken, // Backward compatibility
                "accessToken", newAccessToken,
                "refreshToken", refreshToken,
                "user", Map.of(
                    "id", id,
                    "name", name,
                    "email", email,
                    "role", role
                )
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "토큰 재발급에 실패했습니다. 상세: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            Map<String, Object> response = userClient.signup(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "회원가입 실패: " + e.getMessage()));
        }
    }
}
