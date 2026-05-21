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
            // user-service 장애 시 자동으로 UserClientFallback.getUserById()가 실행됨
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
