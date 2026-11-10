package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.entity.HospitalSettings;
import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.repository.SettingsRepository;
import com.smartqueue.smartqueue_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // 👈 Import BCrypt
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminSettingsController {

    @Autowired
    private SettingsRepository settingsRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Get Settings API
    @GetMapping("/settings")
    public ResponseEntity<HospitalSettings> getSettings() {
        Optional<HospitalSettings> settings = settingsRepository.findById(1L);
        if (settings.isPresent()) {
            return ResponseEntity.ok(settings.get());
        } else {
            HospitalSettings defaultSettings = new HospitalSettings();
            defaultSettings.setHospitalName("City Care Hospital");
            defaultSettings.setOpdBlock("OPD Block A");
            defaultSettings.setContactPhone("+91 9876543210");
            defaultSettings.setEmail("support@citycare.com");
            defaultSettings.setAddress("Main Road, Sangamner, Maharashtra");
            return ResponseEntity.ok(settingsRepository.save(defaultSettings));
        }
    }

    // 2. Update Settings API
    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody HospitalSettings newSettings) {
        HospitalSettings settings = settingsRepository.findById(1L).orElse(new HospitalSettings());

        settings.setHospitalName(newSettings.getHospitalName());
        settings.setOpdBlock(newSettings.getOpdBlock());
        settings.setContactPhone(newSettings.getContactPhone());
        settings.setEmail(newSettings.getEmail());
        settings.setAddress(newSettings.getAddress());

        settingsRepository.save(settings);
        return ResponseEntity.ok(Map.of("message", "Hospital settings updated successfully!"));
    }

    // 3. Secure & Hashed Password Update API for Login Compatibility
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordData) {
        String newPassword = passwordData.get("newPassword");

        Optional<User> optionalUser = userRepository.findById(1L);
        if (!optionalUser.isPresent()) {
            optionalUser = userRepository.findByEmail("admin@gmail.com");
        }

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // Password ko securely BCrypt hash karke save karein taaki login match ho jaye
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            user.setPassword(encoder.encode(newPassword));

            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Password updated successfully with secure encryption!"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Admin user not found!"));
        }
    }
}