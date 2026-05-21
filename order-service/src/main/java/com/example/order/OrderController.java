package com.example.order;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class OrderController {

    private final UserClient userClient;

    public OrderController(UserClient userClient) {
        this.userClient = userClient;
    }

    @GetMapping("/orders")
    public Map<String, Object> getOrders() {
        List<Map<String, Object>> rawOrders = List.of(
            Map.of("orderId", 101, "item", "Laptop", "userId", 1L),
            Map.of("orderId", 102, "item", "Mouse", "userId", 2L)
        );

        List<Map<String, Object>> enrichedOrders = rawOrders.stream().map(order -> {
            Map<String, Object> enriched = new HashMap<>(order);
            Long userId = (Long) order.get("userId");
            // user-service 호출: user-service 가 정상 작동 중일 때는 실제 회원 이름을 가져옵니다.
            // 만약 user-service 장애(다운, 시간 초과 등) 발생 시, 지정한 UserClientFallback.getUserById() 가 
            // 자동으로 실행되어 안전하게 대체 데이터("🚨 서비스 일시 불가 ...")를 반환합니다.
            Map<String, Object> user = userClient.getUserById(userId);
            enriched.put("userName", user.get("name"));
            return enriched;
        }).toList();

        return Map.of(
            "service", "Order Service",
            "message", "주문 서비스 응답입니다.",
            "orders", enrichedOrders
        );
    }
}
