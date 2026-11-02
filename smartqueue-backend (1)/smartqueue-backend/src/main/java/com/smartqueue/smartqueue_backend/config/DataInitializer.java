package com.smartqueue.smartqueue_backend.config;

import com.smartqueue.smartqueue_backend.entity.Role;
import com.smartqueue.smartqueue_backend.entity.User;
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
        };
    }
}
