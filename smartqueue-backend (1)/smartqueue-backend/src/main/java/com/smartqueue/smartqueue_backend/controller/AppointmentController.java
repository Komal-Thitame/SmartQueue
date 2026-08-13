package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.repository.UserRepository;
import com.smartqueue.smartqueue_backend.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserRepository userRepository; // 👈 UserRepository inject kiya hai

    // POST API: Nayi appointment book karne ke liye
    @PostMapping("/book/{doctorId}")
    public ResponseEntity<Appointment> bookAppointment(
            @PathVariable Long doctorId,
            @RequestBody Appointment appointment) {

        // 🟢 Agar appointment object mein patientId maujood hai, toh database se user ka name aur phone nikal kar set kar dein
        if (appointment.getPatientId() != null) {
            Optional<User> userOpt = userRepository.findById(appointment.getPatientId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                appointment.setPatientName(user.getName());
                appointment.setPatientPhone(user.getPhone());
            }
        }

        Appointment savedAppointment = appointmentService.bookAppointment(doctorId, appointment);
        return ResponseEntity.ok(savedAppointment);
    }

    // GET API: Doctor ki appointments status ke sath fetch karne ke liye
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(
            @PathVariable Long doctorId,
            @RequestParam AppointmentStatus status) {
        List<Appointment> appointments = appointmentService.getAppointmentsByDoctorAndStatus(doctorId, status);
        return ResponseEntity.ok(appointments);
    }
}