package com.example.order;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class UserClientFallback implements UserClient {

    @Override
    public Map<String, Object> getUserById(Long userId) {
        // user-service 가 다운되었을 때 반환하는 Fallback 데이터
        return Map.of(
            "id", userId,
            "name", "🚨 서비스 일시 불가 (Temporarily Unavailable User)"
        );
    }
}
