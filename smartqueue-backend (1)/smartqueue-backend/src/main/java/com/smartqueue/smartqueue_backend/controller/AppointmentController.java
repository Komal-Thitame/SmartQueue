package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.entity.QueueToken;
import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.repository.AppointmentRepository;
import com.smartqueue.smartqueue_backend.repository.QueueTokenRepository;
import com.smartqueue.smartqueue_backend.repository.UserRepository;
import com.smartqueue.smartqueue_backend.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    @Autowired
    private QueueTokenRepository queueTokenRepository;

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

    // 🟢 Fixed Active Appointments Endpoint: Allows WAITING, BOOKED, and IN_CONSULTATION
    @GetMapping("/active/{patientId}")
    public ResponseEntity<List<Map<String, Object>>> getActiveAppointments(@PathVariable Long patientId) {
        List<Appointment> allAppointments = appointmentService.getAppointmentsByPatientId(patientId);
        String todayStr = LocalDate.now().toString();
        List<Map<String, Object>> responseList = new ArrayList<>();

        for (Appointment apt : allAppointments) {
            String aptDate = apt.getAppointmentDate();
            if (aptDate == null) continue;

            // Past dates missed check
            if (aptDate.compareTo(todayStr) < 0 && apt.getStatus() == AppointmentStatus.WAITING) {
                apt.setStatus(AppointmentStatus.MISSED);
                appointmentRepository.save(apt);
                continue;
            }

            boolean isTodayOrFuture = aptDate.compareTo(todayStr) >= 0;

            // 🟢 Include IN_CONSULTATION so that active serving tokens don't disappear from patient dashboard
            boolean isValidStatus = apt.getStatus() == AppointmentStatus.WAITING ||
                    apt.getStatus() == AppointmentStatus.BOOKED ||
                    apt.getStatus() == AppointmentStatus.IN_CONSULTATION;

            if (isTodayOrFuture && isValidStatus) {
                Map<String, Object> aptMap = new HashMap<>();
                aptMap.put("id", apt.getId());
                aptMap.put("tokenNumber", apt.getTokenNumber());
                aptMap.put("status", apt.getStatus());
                aptMap.put("appointmentDate", apt.getAppointmentDate());
                aptMap.put("patientName", apt.getPatientName());
                aptMap.put("patientPhone", apt.getPatientPhone());

                String doctorName = "Doctor";
                Long doctorId = null;
                if (apt.getDoctor() != null) {
                    doctorName = apt.getDoctor().getName();
                    doctorId = apt.getDoctor().getId();
                    aptMap.put("doctor", apt.getDoctor());
                }
                aptMap.put("doctorName", doctorName);

                // Fetch current serving token for this doctor
                String currentServingToken = "1";
                if (doctorId != null) {
                    List<QueueToken> doctorTokens = queueTokenRepository.findByDoctorId(doctorId);
                    for (QueueToken qt : doctorTokens) {
                        if ("SERVING".equalsIgnoreCase(qt.getStatus())) {
                            currentServingToken = qt.getTokenNumber();
                            break;
                        }
                    }
                }
                aptMap.put("currentServingToken", currentServingToken);

                responseList.add(aptMap);
            }
        }

        return ResponseEntity.ok(responseList);
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