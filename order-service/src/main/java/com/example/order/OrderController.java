package com.example.order;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class OrderController {

    private final UserClient userClient;
    private final OrderProducer orderProducer;
    private final OrderRepository orderRepository;

    public OrderController(UserClient userClient, OrderProducer orderProducer, OrderRepository orderRepository) {
        this.userClient = userClient;
        this.orderProducer = orderProducer;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/orders")
    public Map<String, Object> getOrders() {
        List<Map<String, Object>> enrichedOrders = orderRepository.findAll().stream().map(order -> {
            Map<String, Object> enriched = new HashMap<>();
            enriched.put("orderId", order.getOrderId());
            enriched.put("item", order.getItem());
            enriched.put("userId", order.getUserId());
            // user-service 호출 및 서킷 브레이커 대체값 동작
            Map<String, Object> user = userClient.getUserById(order.getUserId());
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
        
        OrderEntity orderEntity = new OrderEntity(item, userId);
        OrderEntity savedOrder = orderRepository.save(orderEntity);

        Map<String, Object> orderEvent = Map.of(
            "orderId", savedOrder.getOrderId(),
            "item", savedOrder.getItem(),
            "userId", savedOrder.getUserId()
        );

        // Kafka로 주문 이벤트 비동기 발행
        orderProducer.sendOrderEvent(orderEvent);

        return Map.of(
            "message", "주문이 성공적으로 생성되었습니다.",
            "order", orderEvent
        );
    }
}
