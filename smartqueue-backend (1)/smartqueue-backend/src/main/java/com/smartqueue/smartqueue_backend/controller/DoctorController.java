package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    // Endpoint: PUT http://localhost:8081/api/doctor/update-status/1?status=IN_CONSULTATION
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