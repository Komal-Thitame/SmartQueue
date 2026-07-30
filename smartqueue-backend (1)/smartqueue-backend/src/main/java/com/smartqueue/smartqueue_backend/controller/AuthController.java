package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.dto.AuthResponse;
import com.smartqueue.smartqueue_backend.dto.LoginRequest;
import com.smartqueue.smartqueue_backend.dto.RegisterRequest;
import com.smartqueue.smartqueue_backend.dto.ResetPasswordRequest;
import com.smartqueue.smartqueue_backend.entity.Role;
import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.repository.UserRepository;
import com.smartqueue.smartqueue_backend.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    // ================= REGISTER =================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request
    ){
        if(userRepository.existsByEmail(request.getEmail())){
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Email already registered"));
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(Role.PATIENT);

        userRepository.save(user);

        return ResponseEntity.ok(
                new AuthResponse(
                        null,
                        user.getRole().toString(),
                        "Registration Successful"
                )
        );
    }

    // ================= LOGIN =================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request
    ){
        User user = userRepository
                .findByEmail(request.getEmail())
                .orElse(null);

        if(user == null){
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Invalid Email or Password"));
        }

        if(!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )){
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Invalid Email or Password"));
        }

        return ResponseEntity.ok(
                new AuthResponse(
                        "temporary-token",
                        user.getRole().toString(),
                        "Login Successful"
                )
        );
    }

    // ================= RESET PASSWORD =================

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String message = authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", message));
    }
}