package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.repository.AppointmentRepository;
import com.smartqueue.smartqueue_backend.repository.UserRepository;
import com.smartqueue.smartqueue_backend.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @PostMapping("/book/{doctorId}")
    public ResponseEntity<Appointment> bookAppointment(
            @PathVariable Long doctorId,
            @RequestBody Appointment appointment) {

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

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(
            @PathVariable Long doctorId,
            @RequestParam AppointmentStatus status) {
        List<Appointment> appointments = appointmentService.getAppointmentsByDoctorAndStatus(doctorId, status);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable Long patientId) {
        List<Appointment> appointments = appointmentService.getAppointmentsByPatientId(patientId);
        return ResponseEntity.ok(appointments);
    }

    // 🟢 Active Appointments Endpoint with Date Filtering & Auto-Missed Logic
    @GetMapping("/active/{patientId}")
    public ResponseEntity<List<Appointment>> getActiveAppointments(@PathVariable Long patientId) {
        List<Appointment> allAppointments = appointmentService.getAppointmentsByPatientId(patientId);
        String todayStr = LocalDate.now().toString(); // e.g., "2026-08-19"

        List<Appointment> activeApts = allAppointments.stream()
                .filter(apt -> {
                    String aptDate = apt.getAppointmentDate(); // Ab yeh method successfully resolve ho jayega
                    if (aptDate == null) return true;

                    boolean isTodayOrFuture = aptDate.compareTo(todayStr) >= 0;
                    boolean isWaitingOrBooked = apt.getStatus() == AppointmentStatus.WAITING ||
                            apt.getStatus() == AppointmentStatus.BOOKED;

                    // Agar date beet chuki hai aur status WAITING hai, toh MISSED mark kar dein
                    if (aptDate.compareTo(todayStr) < 0 && apt.getStatus() == AppointmentStatus.WAITING) {
                        apt.setStatus(AppointmentStatus.MISSED);
                        appointmentRepository.save(apt);
                        return false; // Active list se hata dein
                    }

                    return isTodayOrFuture && isWaitingOrBooked;
                })
                .toList();

        return ResponseEntity.ok(activeApts);
    }

    @PutMapping("/cancel/{appointmentId}")
    public ResponseEntity<String> cancelAppointment(@PathVariable Long appointmentId) {
        try {
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);

            if (appointmentOpt.isPresent()) {
                Appointment appointment = appointmentOpt.get();
                appointment.setStatus(AppointmentStatus.CANCELLED);
                appointmentRepository.save(appointment);

                return ResponseEntity.ok("Appointment successfully cancelled.");
            } else {
                return ResponseEntity.status(404).body("Appointment not found.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error cancelling appointment: " + e.getMessage());
        }
    }
}