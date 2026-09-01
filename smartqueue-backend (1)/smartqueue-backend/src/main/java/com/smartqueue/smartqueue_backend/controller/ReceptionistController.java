package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.dto.AppointmentDTO;
import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.service.ReceptionistService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/receptionist")
@CrossOrigin(origins = "http://localhost:5173")
public class ReceptionistController {

    @Autowired
    private ReceptionistService receptionistService;


    // =====================================================
    // 1. BOOK TOKEN / CREATE APPOINTMENT
    // =====================================================

    @PostMapping("/book-token")
    public ResponseEntity<?> bookToken(
            @RequestBody AppointmentDTO dto) {

        try {

            Appointment appointment =
                    receptionistService.bookAppointment(dto);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Token generated successfully!",
                            "appointment",
                            appointment
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // 2. GET WAITING QUEUE FOR DOCTOR
    // =====================================================

    @GetMapping("/queue/{doctorId}")
    public ResponseEntity<?> getWaitingQueue(
            @PathVariable Long doctorId) {

        try {

            List<Appointment> waitingList =
                    receptionistService
                            .getAppointmentsByDoctorAndStatus(
                                    doctorId,
                                    AppointmentStatus.WAITING
                            );

            return ResponseEntity.ok(waitingList);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // 3. GET TODAY'S APPOINTMENTS
    // =====================================================

    @GetMapping("/appointments/today")
    public ResponseEntity<?> getTodayAppointments() {

        try {

            List<Appointment> todayList =
                    receptionistService
                            .getTodayAppointments();

            return ResponseEntity.ok(todayList);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // 4. CANCEL APPOINTMENT
    // =====================================================

    @PutMapping("/cancel/{appointmentId}")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable Long appointmentId) {

        try {

            receptionistService.updateAppointmentStatus(
                    appointmentId,
                    AppointmentStatus.CANCELLED
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Appointment cancelled successfully!"
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // 5. CHECK-IN PATIENT
    // =====================================================

    @PutMapping("/check-in/{appointmentId}")
    public ResponseEntity<?> checkInPatient(
            @PathVariable Long appointmentId) {

        try {

            receptionistService.updateAppointmentStatus(
                    appointmentId,
                    AppointmentStatus.IN_CONSULTATION
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Patient checked-in successfully!"
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // 6. GET ALL REGISTERED PATIENTS
    // =====================================================

    @GetMapping("/patients")
    public ResponseEntity<?> getAllPatients() {

        try {

            List<User> patients =
                    receptionistService.getAllPatients();

            return ResponseEntity.ok(patients);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // 7. SEARCH PATIENT BY NAME
    // =====================================================

    @GetMapping("/patients/search")
    public ResponseEntity<?> searchPatients(
            @RequestParam String name) {

        try {

            List<User> patients =
                    receptionistService.searchPatients(name);

            return ResponseEntity.ok(patients);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // 8. REGISTER NEW PATIENT
    // =====================================================

    @PostMapping("/patients")
    public ResponseEntity<?> registerPatient(
            @RequestBody User patient) {

        try {

            User savedPatient =
                    receptionistService.registerPatient(
                            patient
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Patient registered successfully!",
                            "patient",
                            savedPatient
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }
}