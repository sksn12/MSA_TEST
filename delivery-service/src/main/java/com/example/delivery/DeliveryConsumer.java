package com.example.delivery;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class DeliveryConsumer {

    private final DeliveryRepository deliveryRepository;

    public DeliveryConsumer(DeliveryRepository deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }

    @KafkaListener(topics = "order-topic", groupId = "delivery-group")
    public void consumeOrderEvent(Map<String, Object> orderData) {
        System.out.println("=========================================");
        System.out.println("🚚 [배송 서비스] Kafka 메시지 수신 완료!");
        System.out.println("📦 주문 내역 정보: " + orderData);
        System.out.println("👉 배송 준비를 시작합니다 (주문 ID: " + orderData.get("orderId") + ", 상품명: " + orderData.get("item") + ")");
        System.out.println("=========================================");

        Long orderId = Long.valueOf(orderData.get("orderId").toString());
        String item = orderData.get("item").toString();
        Long userId = Long.valueOf(orderData.get("userId").toString());

        // Create a new delivery record with status and timestamp
        Delivery delivery = new Delivery(orderId, item, userId, "PREPARING", System.currentTimeMillis());
        deliveryRepository.save(delivery);
    }

    public List<Delivery> getDeliveries() {
        return deliveryRepository.findAll();
    }
}

