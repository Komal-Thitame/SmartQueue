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
@CrossOrigin(origins = "*") // 👈 5173 aur 5174 dono ko allow karne ke liye
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

        // 🟢 Age, Gender, aur Address ko registration ke waqt set karna
        user.setAge(request.getAge());
        user.setGender(request.getGender());
        user.setAddress(request.getAddress());

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

        // 🟢 Login successful hone par user ki saari details return karna taaki profile dynamic bane
        return ResponseEntity.ok(
                Map.of(
                        "token", "temporary-token",
                        "role", user.getRole().toString(),
                        "message", "Login Successful",
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "phone", user.getPhone() != null ? user.getPhone() : "",
                        "age", user.getAge() != null ? user.getAge() : 0,
                        "gender", user.getGender() != null ? user.getGender() : "",
                        "address", user.getAddress() != null ? user.getAddress() : ""
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