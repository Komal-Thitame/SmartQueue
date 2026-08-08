package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.dto.DoctorDTO;
import com.smartqueue.smartqueue_backend.dto.RegisterRequest;
import com.smartqueue.smartqueue_backend.entity.Doctor;
import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.service.AdminService;
import com.smartqueue.smartqueue_backend.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private DoctorService doctorService; // Added DoctorService dependency

    // Single Endpoint for both Add and Update Doctor
    @PostMapping("/add-doctor")
    public ResponseEntity<?> saveOrUpdateDoctor(@RequestBody DoctorDTO doctorDTO) {
        try {
            Doctor savedDoctor = doctorService.saveOrUpdateDoctor(doctorDTO);
            return ResponseEntity.ok(Map.of("message", "Doctor saved successfully!", "doctor", savedDoctor));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/add-receptionist")
    public ResponseEntity<?> addReceptionist(@RequestBody RegisterRequest request) {
        try {
            User receptionist = adminService.addReceptionist(request);
            return ResponseEntity.ok(Map.of("message", "Receptionist added successfully!", "user", receptionist));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(adminService.getAllDoctors());
    }

    // Endpoint: GET http://localhost:8081/api/admin/receptionists
    @GetMapping("/receptionists")
    public ResponseEntity<List<User>> getAllReceptionists() {
        return ResponseEntity.ok(adminService.getAllReceptionists());
    }

    // Endpoint: DELETE http://localhost:8081/api/admin/doctor/{id}
    @DeleteMapping("/doctor/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        try {
            adminService.deleteDoctor(id);
            return ResponseEntity.ok(Map.of("message", "Doctor deleted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Endpoint: DELETE http://localhost:8081/api/admin/receptionist/{id}
    @DeleteMapping("/receptionist/{id}")
    public ResponseEntity<?> deleteReceptionist(@PathVariable Long id) {
        try {
            adminService.deleteReceptionist(id);
            return ResponseEntity.ok(Map.of("message", "Receptionist deleted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}