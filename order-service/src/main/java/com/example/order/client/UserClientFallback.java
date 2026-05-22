package com.example.order;

import org.springframework.stereotype.Component;

import java.util.Map;

// @Component: Spring Bean으로 등록하여 Feign이 이 클래스를 주입받아 사용할 수 있도록 합니다.
@Component
public class UserClientFallback implements UserClient {

    // getUserById: user-service 호출 도중 장애 발생(서킷 브레이커 작동) 시 대신 실행되는 메서드입니다.
    @Override
    public Map<String, Object> getUserById(Long userId) {
        // 호출 실패 시 사용자에게 보여줄 대체(임시) 데이터를 정의합니다.
        return Map.of(
            "id", userId,
            "name", "🚨 서비스 일시 불가 (Temporarily Unavailable User)"
        );
    }
}
