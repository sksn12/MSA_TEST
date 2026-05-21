package com.example.order;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

// @FeignClient: Eureka에 등록된 서비스 이름(name)을 가지고 호출을 매핑합니다.
// fallback: 호출 대상(user-service) 장애 시 대체 작동할 Fallback 클래스를 지정합니다.
@FeignClient(name = "user-service", fallback = UserClientFallback.class)
public interface UserClient {

    // user-service의 특정 API Endpoint와 HTTP Method를 매핑합니다.
    @GetMapping("/users/{userId}")
    Map<String, Object> getUserById(@PathVariable("userId") Long userId);
}
