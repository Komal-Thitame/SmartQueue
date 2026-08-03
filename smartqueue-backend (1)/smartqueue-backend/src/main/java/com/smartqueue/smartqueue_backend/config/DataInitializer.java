package com.smartqueue.smartqueue_backend.config;

import com.smartqueue.smartqueue_backend.entity.QueueToken;
import com.smartqueue.smartqueue_backend.entity.Role;
import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.repository.QueueTokenRepository;
import com.smartqueue.smartqueue_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initAdmin(
            UserRepository userRepository,
            QueueTokenRepository queueTokenRepository, // Cleaned repository name
            PasswordEncoder passwordEncoder) {
        return args -> {

            // 1. Create Default Admin User if not exists
            if (!userRepository.existsByEmail("admin@gmail.com")) {
                User admin = new User();
                admin.setName("Super Admin");
                admin.setEmail("admin@gmail.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);

                userRepository.save(admin);
                System.out.println("✅ Default Admin Created: admin@gmail.com / admin123");
            }

            // 2. Create Initial Queue Tokens for Testing if DB is empty
            if (queueTokenRepository.count() == 0) {

                // Using 3-argument constructor (tokenNumber, department, status)
                queueTokenRepository.save(new QueueToken("A-26", "Cardiology", "SERVING"));
                queueTokenRepository.save(new QueueToken("A-27", "Cardiology", "WAITING"));
                queueTokenRepository.save(new QueueToken("A-28", "Cardiology", "WAITING"));
                queueTokenRepository.save(new QueueToken("A-29", "Cardiology", "WAITING"));

                System.out.println("✅ Initial Queue Tokens Created Successfully!");
            }
        };
    }
}
