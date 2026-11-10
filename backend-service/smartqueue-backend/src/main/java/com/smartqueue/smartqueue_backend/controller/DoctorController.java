package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.entity.Doctor;
import com.smartqueue.smartqueue_backend.repository.DoctorRepository;
import com.smartqueue.smartqueue_backend.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors") // Plural 'doctors' rakhein taaki frontend match ho
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorController {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DoctorService doctorService;

    // 1. GET API: Admin dwara add kiye gaye saare doctors fetch karne ke liye (Patient ke liye)
    @GetMapping("/all")
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // 2. PUT API: Appointment status update karne ke liye (Doctor dashboard ke liye)
    @PutMapping("/update-status/{appointmentId}")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long appointmentId,
            @RequestParam AppointmentStatus status) {
        try {
            Appointment updatedAppointment = doctorService.updateAppointmentStatus(appointmentId, status);
            return ResponseEntity.ok(Map.of(
                    "message", "Appointment status updated successfully!",
                    "appointment", updatedAppointment
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}