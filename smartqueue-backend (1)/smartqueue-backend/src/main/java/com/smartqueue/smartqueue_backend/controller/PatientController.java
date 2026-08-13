package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:5173")
public class PatientController {

    @Autowired
    private UserRepository userRepository;

    // GET: Specific Patient Profile by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getPatientProfile(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "name", user.getName() != null ? user.getName() : "",
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "phone", user.getPhone() != null ? user.getPhone() : "",
                    "age", user.getAge() != null ? user.getAge() : "",
                    "gender", user.getGender() != null ? user.getGender() : "",
                    "address", user.getAddress() != null ? user.getAddress() : "",
                    "bloodGroup", ""
            ));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Patient not found"));
    }

    // PUT: Update Patient Profile by ID
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updatePatientProfile(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (updates.containsKey("name") && updates.get("name") != null) {
                user.setName(updates.get("name").toString());
            }
            if (updates.containsKey("email") && updates.get("email") != null) {
                user.setEmail(updates.get("email").toString());
            }
            if (updates.containsKey("phone") && updates.get("phone") != null) {
                user.setPhone(updates.get("phone").toString());
            }

            // Age conversion fix (String to Integer)
            if (updates.containsKey("age") && updates.get("age") != null && !updates.get("age").toString().isEmpty()) {
                try {
                    Integer ageVal = Integer.parseInt(updates.get("age").toString());
                    user.setAge(ageVal);
                } catch (NumberFormatException e) {
                    // Ignore if invalid
                }
            }

            if (updates.containsKey("gender") && updates.get("gender") != null) {
                user.setGender(updates.get("gender").toString());
            }
            if (updates.containsKey("address") && updates.get("address") != null) {
                user.setAddress(updates.get("address").toString());
            }

            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Patient not found"));
    }
}