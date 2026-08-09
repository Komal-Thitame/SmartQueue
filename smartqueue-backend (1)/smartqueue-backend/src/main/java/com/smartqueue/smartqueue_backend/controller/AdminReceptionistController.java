package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.dto.AdminReceptionistDTO;
import com.smartqueue.smartqueue_backend.entity.Receptionist;
import com.smartqueue.smartqueue_backend.service.AdminReceptionistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/receptionist-mgmt") // Changed to avoid duplicate mapping with AdminController
@CrossOrigin(origins = "http://localhost:5173")
public class AdminReceptionistController {

    @Autowired
    private AdminReceptionistService adminReceptionistService;

    @GetMapping
    public ResponseEntity<List<Receptionist>> getAll() {
        return ResponseEntity.ok(adminReceptionistService.getAllReceptionists());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addReceptionist(@RequestBody AdminReceptionistDTO dto) {
        return ResponseEntity.ok(adminReceptionistService.createReceptionist(dto));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(adminReceptionistService.toggleStatus(id));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        adminReceptionistService.resetPassword(id, body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
    @PutMapping("/update/{id}")
    public ResponseEntity<Receptionist> updateReceptionist(
            @PathVariable Long id,
            @RequestBody AdminReceptionistDTO dto) {
        Receptionist updated = adminReceptionistService.updateReceptionist(id, dto);
        return ResponseEntity.ok(updated);
    }
}