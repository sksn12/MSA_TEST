package com.example.order;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableFeignClients
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(OrderRepository orderRepository) {
        return args -> {
            if (orderRepository.count() == 0) {
                orderRepository.save(new OrderEntity("Laptop", 1L));
                orderRepository.save(new OrderEntity("Mouse", 2L));
                System.out.println("🌱 Initialized mock orders in order_db database!");
            }
        };
    }
}
