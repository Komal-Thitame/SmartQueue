package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173") // React frontend ke liye CORS allow kiya hai
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    // POST API: Nayi appointment book karne ke liye
    @PostMapping("/book/{doctorId}")
    public ResponseEntity<Appointment> bookAppointment(
            @PathVariable Long doctorId,
            @RequestBody Appointment appointment) {
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