package com.example.order;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
public class OrderController {

    private final UserClient userClient;
    private final OrderProducer orderProducer;
    
    // Thread-safe dynamic in-memory database for orders
    private final List<Map<String, Object>> ordersList = new CopyOnWriteArrayList<>(List.of(
        Map.of("orderId", 101L, "item", "Laptop", "userId", 1L),
        Map.of("orderId", 102L, "item", "Mouse", "userId", 2L)
    ));

    public OrderController(UserClient userClient, OrderProducer orderProducer) {
        this.userClient = userClient;
        this.orderProducer = orderProducer;
    }

    @GetMapping("/orders")
    public Map<String, Object> getOrders() {
        List<Map<String, Object>> enrichedOrders = ordersList.stream().map(order -> {
            Map<String, Object> enriched = new HashMap<>(order);
            Long userId = Long.valueOf(order.get("userId").toString());
            // user-service 호출 및 서킷 브레이커 대체값 동작
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

    @PostMapping("/orders")
    public Map<String, Object> createOrder(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String item = request.get("item").toString();
        
        long newOrderId = ordersList.size() + 101L; // Simple ID generation logic
        Map<String, Object> newOrder = Map.of(
            "orderId", newOrderId,
            "item", item,
            "userId", userId
        );
        ordersList.add(newOrder);

        // Kafka로 주문 이벤트 비동기 발행
        orderProducer.sendOrderEvent(newOrder);

        return Map.of(
            "message", "주문이 성공적으로 생성되었습니다.",
            "order", newOrder
        );
    }
}
