package com.example.order.producer;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class OrderProducer {

    private static final String TOPIC = "order-topic";
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OrderProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendOrderEvent(Map<String, Object> orderData) {
        System.out.println("Kafka Producer: Sending order event -> " + orderData);
        kafkaTemplate.send(TOPIC, orderData);
    }
}
