package com.example.delivery;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class DeliveryController {

    private final DeliveryConsumer deliveryConsumer;

    public DeliveryController(DeliveryConsumer deliveryConsumer) {
        this.deliveryConsumer = deliveryConsumer;
    }

    @GetMapping("/deliveries")
    public Map<String, Object> getDeliveries() {
        return Map.of(
            "service", "Delivery Service",
            "message", "배송 서비스 응답입니다.",
            "deliveries", deliveryConsumer.getDeliveries()
        );
    }
}
