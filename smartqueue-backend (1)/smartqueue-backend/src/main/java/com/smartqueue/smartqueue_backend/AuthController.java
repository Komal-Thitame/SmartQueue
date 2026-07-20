package com.smartqueue.smartqueue_backend;

import com.smartqueue.smartqueue_backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        Map<String, String> response = new HashMap<>();

        // 1. Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            response.put("message", "Email already registered!");
            return ResponseEntity.badRequest().body(response);
        }

        // 2. Assign default Role as PATIENT using Enum
        if (user.getRole() == null) {
            user.setRole(com.smartqueue.smartqueue_backend.entity.User.Role.PATIENT);
        }

        try {
            // 3. Save user to database
            userRepository.save(user);
            response.put("message", "Registration successful!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("message", "Database Error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginData) {
        Map<String, String> response = new HashMap<>();
        String email = loginData.get("email");
        String password = loginData.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            response.put("message", "Login successful!");
            response.put("token", "dummy-jwt-token"); // Temporary token
            response.put("role", userOpt.get().getRole().toString());
            return ResponseEntity.ok(response);
        }

        response.put("message", "Invalid email or password!");
        return ResponseEntity.badRequest().body(response);
    }
}