package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.dto.AppointmentDTO;
import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.dto.QueueHistoryDTO;
import com.smartqueue.smartqueue_backend.service.ReceptionistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/receptionist")
@CrossOrigin(origins = "http://localhost:5173")
public class ReceptionistController {

    @Autowired
    private ReceptionistService receptionistService;

    /**
     * 1. Book Token / Create Appointment
     * Endpoint: POST http://localhost:8081/api/receptionist/book-token
     */
    @PostMapping("/book-token")
    public ResponseEntity<?> bookToken(@RequestBody AppointmentDTO dto) {
        try {
            Appointment appointment = receptionistService.bookAppointment(dto);
            return ResponseEntity.ok(Map.of(
                    "message", "Token generated successfully!",
                    "appointment", appointment
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * 2. Get Waiting Queue for a Specific Doctor
     * Endpoint: GET http://localhost:8081/api/receptionist/queue/{doctorId}
     */
    @GetMapping("/queue/{doctorId}")
    public ResponseEntity<?> getWaitingQueue(@PathVariable Long doctorId) {
        try {
            List<Appointment> waitingList = receptionistService.getAppointmentsByDoctorAndStatus(
                    doctorId,
                    AppointmentStatus.WAITING
            );
            return ResponseEntity.ok(waitingList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * 3. Get All Today's Appointments for Reception Desk
     * Endpoint: GET http://localhost:8081/api/receptionist/appointments/today
     */
    @GetMapping("/appointments/today")
    public ResponseEntity<?> getTodayAppointments() {
        try {
            List<Appointment> todayList = receptionistService.getTodayAppointments();
            return ResponseEntity.ok(todayList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * 4. Cancel or Skip Appointment by Reception
     * Endpoint: PUT http://localhost:8081/api/receptionist/cancel/{appointmentId}
     */
    @PutMapping("/cancel/{appointmentId}")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long appointmentId) {
        try {
            receptionistService.updateAppointmentStatus(appointmentId, AppointmentStatus.CANCELLED);
            return ResponseEntity.ok(Map.of("message", "Appointment cancelled successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    public static class PatientOverviewDTO {
        private Long id;
        private String patientCustomId;
        private String name;
        private String email;
        private String phone;
        private Boolean active;
        private LocalDateTime createdAt;
        private List<QueueHistoryDTO> queueHistory;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getPatientCustomId() { return patientCustomId; }
        public void setPatientCustomId(String patientCustomId) { this.patientCustomId = patientCustomId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public List<QueueHistoryDTO> getQueueHistory() { return queueHistory; }
        public void setQueueHistory(List<QueueHistoryDTO> queueHistory) { this.queueHistory = queueHistory; }
    }
}