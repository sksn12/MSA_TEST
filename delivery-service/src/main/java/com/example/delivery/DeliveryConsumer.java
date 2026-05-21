package com.example.delivery;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.HashMap;

@Service
public class DeliveryConsumer {

    private final List<Map<String, Object>> deliveries = new CopyOnWriteArrayList<>();

    @KafkaListener(topics = "order-topic", groupId = "delivery-group")
    public void consumeOrderEvent(Map<String, Object> orderData) {
        System.out.println("=========================================");
        System.out.println("🚚 [배송 서비스] Kafka 메시지 수신 완료!");
        System.out.println("📦 주문 내역 정보: " + orderData);
        System.out.println("👉 배송 준비를 시작합니다 (주문 ID: " + orderData.get("orderId") + ", 상품명: " + orderData.get("item") + ")");
        System.out.println("=========================================");

        // Create a new delivery record with status and timestamp
        Map<String, Object> delivery = new HashMap<>();
        delivery.put("orderId", orderData.get("orderId"));
        delivery.put("item", orderData.get("item"));
        delivery.put("userId", orderData.get("userId"));
        delivery.put("status", "PREPARING"); // 배송 준비 중
        delivery.put("timestamp", System.currentTimeMillis());
        deliveries.add(delivery);
    }

    public List<Map<String, Object>> getDeliveries() {
        return deliveries;
    }
}

