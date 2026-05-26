package com.example.user;

import com.example.user.entity.User;
import com.example.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder) {
        return args -> {
            userRepository.deleteAll();
            userRepository.save(new User("Alice", "alice@example.com", passwordEncoder.encode("password123"), "ROLE_USER"));
            userRepository.save(new User("Bob", "bob@example.com", passwordEncoder.encode("password123"), "ROLE_USER"));
            System.out.println("🌱 Initialized mock users (Alice, Bob) with encrypted passwords in user_db database!");
        };
    }
}
