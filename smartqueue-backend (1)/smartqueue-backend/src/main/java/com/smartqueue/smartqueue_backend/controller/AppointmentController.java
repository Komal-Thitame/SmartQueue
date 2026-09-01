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


    // =========================================================
    // BOOK APPOINTMENT
    // =========================================================

    @PostMapping("/book/{doctorId}")
    public ResponseEntity<Appointment> bookAppointment(
            @PathVariable Long doctorId,
            @RequestBody Appointment appointment) {

        try {

            // Patient ID available hai to User table se
            // patient ka name aur phone lekar appointment mein set karo
            if (appointment.getPatientId() != null) {

                Optional<User> userOpt =
                        userRepository.findById(
                                appointment.getPatientId()
                        );

                if (userOpt.isPresent()) {

                    User user = userOpt.get();

                    appointment.setPatientName(
                            user.getName()
                    );

                    appointment.setPatientPhone(
                            user.getPhone()
                    );
                }
            }

            Appointment savedAppointment =
                    appointmentService.bookAppointment(
                            doctorId,
                            appointment
                    );

            return ResponseEntity.ok(
                    savedAppointment
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(500)
                    .build();
        }
    }


    // =========================================================
    // GET DOCTOR APPOINTMENTS
    // =========================================================

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(
            @PathVariable Long doctorId,
            @RequestParam AppointmentStatus status) {

        List<Appointment> appointments =
                appointmentService
                        .getAppointmentsByDoctorAndStatus(
                                doctorId,
                                status
                        );

        return ResponseEntity.ok(
                appointments
        );
    }


    // =========================================================
    // GET ALL PATIENT APPOINTMENTS
    // =========================================================

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(
            @PathVariable Long patientId) {

        List<Appointment> appointments =
                appointmentService
                        .getAppointmentsByPatientId(
                                patientId
                        );

        return ResponseEntity.ok(
                appointments
        );
    }


    // =========================================================
    // ACTIVE APPOINTMENTS
    // Today + Future + In Consultation
    // =========================================================

    @GetMapping("/active/{patientId}")
    public ResponseEntity<List<Map<String, Object>>>
    getActiveAppointments(
            @PathVariable Long patientId) {

        List<Appointment> allAppointments =
                appointmentService
                        .getAppointmentsByPatientId(
                                patientId
                        );

        String todayStr =
                LocalDate.now().toString();

        List<Map<String, Object>> responseList =
                new ArrayList<>();


        for (Appointment apt : allAppointments) {

            String aptDate =
                    apt.getAppointmentDate();

            // Date nahi hai to skip
            if (aptDate == null) {
                continue;
            }


            // =================================================
            // AUTO MISSED
            // Past date + WAITING = MISSED
            // =================================================

            if (aptDate.compareTo(todayStr) < 0
                    && apt.getStatus()
                    == AppointmentStatus.WAITING) {

                apt.setStatus(
                        AppointmentStatus.MISSED
                );

                appointmentRepository.save(
                        apt
                );

                continue;
            }


            // =================================================
            // TODAY OR FUTURE
            // =================================================

            boolean isTodayOrFuture =
                    aptDate.compareTo(todayStr) >= 0;


            // =================================================
            // VALID ACTIVE STATUS
            // =================================================

            boolean isValidStatus =
                    apt.getStatus()
                            == AppointmentStatus.WAITING
                            ||
                            apt.getStatus()
                                    == AppointmentStatus.BOOKED
                            ||
                            apt.getStatus()
                                    == AppointmentStatus.IN_CONSULTATION;


            if (isTodayOrFuture
                    && isValidStatus) {

                Map<String, Object> aptMap =
                        new HashMap<>();


                // =================================================
                // APPOINTMENT DETAILS
                // =================================================

                aptMap.put(
                        "id",
                        apt.getId()
                );

                aptMap.put(
                        "tokenNumber",
                        apt.getTokenNumber()
                );

                aptMap.put(
                        "status",
                        apt.getStatus()
                );

                aptMap.put(
                        "appointmentDate",
                        apt.getAppointmentDate()
                );

                aptMap.put(
                        "patientName",
                        apt.getPatientName()
                );

                aptMap.put(
                        "patientPhone",
                        apt.getPatientPhone()
                );

                aptMap.put(
                        "age",
                        apt.getAge()
                );

                aptMap.put(
                        "gender",
                        apt.getGender()
                );


                // =================================================
                // DOCTOR DETAILS
                // =================================================

                String doctorName =
                        "Doctor";

                Long doctorId =
                        null;


                if (apt.getDoctor() != null) {

                    doctorName =
                            apt.getDoctor().getName();

                    doctorId =
                            apt.getDoctor().getId();

                    aptMap.put(
                            "doctor",
                            apt.getDoctor()
                    );
                }


                aptMap.put(
                        "doctorName",
                        doctorName
                );


                // =================================================
                // CURRENT SERVING TOKEN
                // =================================================

                String currentServingToken =
                        "1";


                if (doctorId != null) {

                    List<QueueToken> doctorTokens =
                            queueTokenRepository
                                    .findByDoctorId(
                                            doctorId
                                    );


                    for (QueueToken qt :
                            doctorTokens) {

                        if ("SERVING"
                                .equalsIgnoreCase(
                                        qt.getStatus()
                                )) {

                            currentServingToken =
                                    qt.getTokenNumber();

                            break;
                        }
                    }
                }


                aptMap.put(
                        "currentServingToken",
                        currentServingToken
                );


                responseList.add(
                        aptMap
                );
            }
        }


        return ResponseEntity.ok(
                responseList
        );
    }


    // =========================================================
    // PATIENT HISTORY
    // Completed + Missed + Cancelled + Past Appointments
    // =========================================================

    @GetMapping("/history/{patientId}")
    public ResponseEntity<List<Appointment>>
    getPatientHistory(
            @PathVariable Long patientId) {

        List<Appointment> allAppointments =
                appointmentService
                        .getAppointmentsByPatientId(
                                patientId
                        );

        String todayStr =
                LocalDate.now().toString();


        List<Appointment> historyList =
                new ArrayList<>();


        for (Appointment apt :
                allAppointments) {


            // =================================================
            // HIDDEN APPOINTMENT
            // =================================================
            // Database se delete nahi hui hai.
            // Sirf patient history mein show nahi hogi.
            // =================================================

            Boolean historyHidden =
                    apt.getHistoryHidden();

            if (Boolean.TRUE.equals(
                    historyHidden)) {

                continue;
            }


            String aptDate =
                    apt.getAppointmentDate();


            // =================================================
            // AUTO MISSED
            // Past date + WAITING
            // =================================================

            if (aptDate != null
                    && aptDate.compareTo(todayStr) < 0
                    && apt.getStatus()
                    == AppointmentStatus.WAITING) {

                apt.setStatus(
                        AppointmentStatus.MISSED
                );

                appointmentRepository.save(
                        apt
                );
            }


            // =================================================
            // PAST DATE
            // =================================================

            boolean isPastDate =
                    aptDate != null
                            && aptDate.compareTo(
                            todayStr
                    ) < 0;


            // =================================================
            // FINISHED STATUS
            // =================================================

            boolean hasFinishedStatus =
                    apt.getStatus()
                            == AppointmentStatus.COMPLETED
                            ||
                            apt.getStatus()
                                    == AppointmentStatus.MISSED
                            ||
                            apt.getStatus()
                                    == AppointmentStatus.CANCELLED;


            // =================================================
            // ADD TO HISTORY
            // =================================================

            if (isPastDate
                    || hasFinishedStatus) {

                historyList.add(
                        apt
                );
            }
        }


        return ResponseEntity.ok(
                historyList
        );
    }


    // =========================================================
    // CANCEL APPOINTMENT
    // =========================================================

    @PutMapping("/cancel/{appointmentId}")
    public ResponseEntity<String>
    cancelAppointment(
            @PathVariable Long appointmentId) {

        try {

            Optional<Appointment> appointmentOpt =
                    appointmentRepository.findById(
                            appointmentId
                    );


            if (appointmentOpt.isPresent()) {

                Appointment appointment =
                        appointmentOpt.get();


                appointment.setStatus(
                        AppointmentStatus.CANCELLED
                );


                appointmentRepository.save(
                        appointment
                );


                return ResponseEntity.ok(
                        "Appointment successfully cancelled."
                );

            } else {

                return ResponseEntity
                        .status(404)
                        .body(
                                "Appointment not found."
                        );
            }


        } catch (Exception e) {

            return ResponseEntity
                    .status(500)
                    .body(
                            "Error cancelling appointment: "
                                    + e.getMessage()
                    );
        }
    }


    // =========================================================
    // HIDE APPOINTMENT FROM PATIENT HISTORY
    // =========================================================
    //
    // IMPORTANT:
    // Appointment DELETE nahi hogi.
    //
    // Database mein appointment rahegi.
    //
    // Sirf historyHidden = true hoga.
    //
    // Isliye patient history mein appointment
    // dobara show nahi hogi.
    // =========================================================

    @PutMapping("/hide/{appointmentId}")
    public ResponseEntity<String>
    hideAppointmentFromPatient(
            @PathVariable Long appointmentId) {

        try {

            Optional<Appointment> appointmentOpt =
                    appointmentRepository.findById(
                            appointmentId
                    );


            if (appointmentOpt.isPresent()) {

                Appointment appointment =
                        appointmentOpt.get();


                // =================================================
                // HIDE ONLY
                // =================================================

                appointment.setHistoryHidden(
                        true
                );


                // =================================================
                // SAVE
                // DELETE NAHI
                // =================================================

                appointmentRepository.save(
                        appointment
                );


                return ResponseEntity.ok(
                        "Appointment removed from patient history."
                );

            } else {

                return ResponseEntity
                        .status(404)
                        .body(
                                "Appointment not found."
                        );
            }


        } catch (Exception e) {

            return ResponseEntity
                    .status(500)
                    .body(
                            "Error removing appointment from history: "
                                    + e.getMessage()
                    );
        }
    }
}