package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.entity.Doctor;
import com.smartqueue.smartqueue_backend.entity.QueueToken;
import com.smartqueue.smartqueue_backend.repository.AppointmentRepository;
import com.smartqueue.smartqueue_backend.repository.DoctorRepository;
import com.smartqueue.smartqueue_backend.repository.QueueTokenRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = "http://localhost:5173")
public class QueueController {

    @Autowired
    private QueueTokenRepository queueRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;


    // =========================================================
    // HELPER METHOD
    // =========================================================

    private boolean isPastAppointment(String appointmentDate) {
        if (appointmentDate == null || appointmentDate.trim().isEmpty()) {
            return false;
        }

        try {
            LocalDate appointmentLocalDate =
                    LocalDate.parse(appointmentDate, DateTimeFormatter.ISO_LOCAL_DATE);

            return appointmentLocalDate.isBefore(LocalDate.now());

        } catch (Exception e) {
            return false;
        }
    }


    // =========================================================
    // CURRENT SERVING TOKEN
    // =========================================================

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentServingToken(
            @RequestParam(defaultValue = "Cardiology") String department) {

        return queueRepository
                .findFirstByDepartmentAndStatusOrderByCreatedAtAsc(
                        department,
                        "SERVING"
                )
                .map(token -> ResponseEntity.ok(
                        Map.of("currentServing", token.getTokenNumber())
                ))
                .orElseGet(() ->
                        ResponseEntity.ok(
                                Map.of("currentServing", "A-26")
                        )
                );
    }


    // =========================================================
    // NEXT TOKEN
    // =========================================================

    @PostMapping("/next")
    public ResponseEntity<?> callNextToken(
            @RequestParam(defaultValue = "Cardiology") String department) {

        queueRepository
                .findFirstByDepartmentAndStatusOrderByCreatedAtAsc(
                        department,
                        "SERVING"
                )
                .ifPresent(token -> {
                    token.setStatus("COMPLETED");
                    queueRepository.save(token);
                });


        Optional<QueueToken> nextWaiting =
                queueRepository
                        .findFirstByDepartmentAndStatusOrderByCreatedAtAsc(
                                department,
                                "WAITING"
                        );

        if (nextWaiting.isPresent()) {

            QueueToken next = nextWaiting.get();

            next.setStatus("SERVING");

            queueRepository.save(next);

            return ResponseEntity.ok(next);
        }

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "No more patients waiting in queue."
                )
        );
    }


    // =========================================================
    // PREVIOUS TOKEN
    // =========================================================

    @PostMapping("/previous")
    public ResponseEntity<?> callPreviousToken(
            @RequestParam(defaultValue = "Cardiology") String department) {

        queueRepository
                .findFirstByDepartmentAndStatusOrderByCreatedAtAsc(
                        department,
                        "SERVING"
                )
                .ifPresent(token -> {

                    token.setStatus("WAITING");

                    queueRepository.save(token);
                });


        Optional<QueueToken> lastCompleted =
                queueRepository
                        .findFirstByDepartmentAndStatusOrderByUpdatedAtDesc(
                                department,
                                "COMPLETED"
                        );


        if (lastCompleted.isPresent()) {

            QueueToken prev = lastCompleted.get();

            prev.setStatus("SERVING");

            queueRepository.save(prev);

            return ResponseEntity.ok(prev);
        }

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "No previous token found to recall."
                )
        );
    }


    // =========================================================
    // RECALL TOKEN
    // =========================================================

    @PostMapping("/recall")
    public ResponseEntity<?> recallToken(
            @RequestParam(defaultValue = "Cardiology") String department) {

        return queueRepository
                .findFirstByDepartmentAndStatusOrderByCreatedAtAsc(
                        department,
                        "SERVING"
                )
                .map(token -> ResponseEntity.ok(
                        Map.of(
                                "message",
                                "Recalling token " + token.getTokenNumber(),
                                "tokenNumber",
                                token.getTokenNumber()
                        )
                ))
                .orElseGet(() ->
                        ResponseEntity.ok(
                                Map.of(
                                        "message",
                                        "No active token currently serving."
                                )
                        )
                );
    }


    // =========================================================
    // SKIP TOKEN
    // =========================================================

    @PostMapping("/skip")
    public ResponseEntity<?> skipToken(
            @RequestParam(defaultValue = "Cardiology") String department) {

        queueRepository
                .findFirstByDepartmentAndStatusOrderByCreatedAtAsc(
                        department,
                        "SERVING"
                )
                .ifPresent(token -> {

                    token.setStatus("SKIPPED");

                    queueRepository.save(token);
                });


        Optional<QueueToken> nextWaiting =
                queueRepository
                        .findFirstByDepartmentAndStatusOrderByCreatedAtAsc(
                                department,
                                "WAITING"
                        );


        if (nextWaiting.isPresent()) {

            QueueToken next = nextWaiting.get();

            next.setStatus("SERVING");

            queueRepository.save(next);

            return ResponseEntity.ok(next);
        }

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Patient skipped. No more waiting patients."
                )
        );
    }


    // =========================================================
    // DASHBOARD METRICS
    // =========================================================

    @GetMapping("/metrics")
    public ResponseEntity<?> getDashboardMetrics() {

        long totalToday = queueRepository.count();

        List<QueueToken> waitingTokens =
                queueRepository.findByDepartmentAndStatus(
                        "Cardiology",
                        "WAITING"
                );

        long waitingCount = waitingTokens.size();


        Map<String, Object> metrics = new HashMap<>();

        metrics.put(
                "patientsToday",
                totalToday > 0 ? totalToday : 128
        );

        metrics.put(
                "waitingNow",
                waitingCount > 0 ? waitingCount : 14
        );

        metrics.put("activeDoctors", 6);

        metrics.put(
                "avgWaitTime",
                (waitingCount > 0 ? waitingCount * 5 : 12) + "m"
        );


        return ResponseEntity.ok(metrics);
    }


    // =========================================================
    // DOCTOR LIVE QUEUE
    // ONLY TODAY + WAITING / SERVING
    // PAST WAITING APPOINTMENTS -> MISSED
    // =========================================================

    @GetMapping("/doctor-queue/{id}")
    public ResponseEntity<?> getDoctorSpecificQueue(
            @PathVariable Long id) {

        Long actualDoctorId =
                doctorRepository
                        .findByUserId(id)
                        .map(Doctor::getId)
                        .orElse(id);


        // -------------------------------------------------
        // STEP 1:
        // Doctor ke purane WAITING appointments ko MISSED karo
        // -------------------------------------------------

        List<Appointment> allAppointments =
                appointmentRepository.findByDoctorId(actualDoctorId);


        for (Appointment appointment : allAppointments) {

            if (appointment.getStatus() == AppointmentStatus.WAITING
                    && isPastAppointment(
                    appointment.getAppointmentDate()
            )) {

                appointment.setStatus(AppointmentStatus.MISSED);

                appointmentRepository.save(appointment);
            }
        }


        // -------------------------------------------------
        // STEP 2:
        // Queue tokens ko get karo
        // -------------------------------------------------

        List<QueueToken> allTokens =
                queueRepository.findByDoctorId(actualDoctorId);


        // -------------------------------------------------
        // STEP 3:
        // Sirf un QueueTokens ko return karo jinka
        // corresponding appointment:
        //
        // TODAY hai
        // AND status WAITING / IN_CONSULTATION hai
        // -------------------------------------------------

        String today = LocalDate.now().toString();


        List<QueueToken> liveQueue =
                allTokens.stream()

                        .filter(token -> {

                            if (!"WAITING".equalsIgnoreCase(
                                    token.getStatus()
                            )
                                    &&
                                    !"SERVING".equalsIgnoreCase(
                                            token.getStatus()
                                    )) {

                                return false;
                            }


                            String queueTokenNumber =
                                    token.getTokenNumber();

                            if (queueTokenNumber == null) {
                                return false;
                            }


                            String cleanQueueToken =
                                    queueTokenNumber
                                            .replaceAll("[^0-9]", "")
                                            .trim();


                            return allAppointments.stream()
                                    .anyMatch(app -> {

                                        if (app.getTokenNumber() == null) {
                                            return false;
                                        }

                                        String cleanAppointmentToken =
                                                String.valueOf(
                                                                app.getTokenNumber()
                                                        )
                                                        .replaceAll(
                                                                "[^0-9]",
                                                                ""
                                                        )
                                                        .trim();


                                        boolean sameToken =
                                                cleanAppointmentToken.equals(
                                                        cleanQueueToken
                                                );


                                        boolean todayAppointment =
                                                today.equals(
                                                        app.getAppointmentDate()
                                                );


                                        boolean activeStatus =
                                                app.getStatus()
                                                        == AppointmentStatus.WAITING

                                                        ||

                                                        app.getStatus()
                                                                == AppointmentStatus.IN_CONSULTATION;


                                        return sameToken
                                                &&
                                                todayAppointment
                                                &&
                                                activeStatus;
                                    });
                        })

                        .toList();


        return ResponseEntity.ok(liveQueue);
    }


    // =========================================================
    // UPDATE TOKEN STATUS
    // =========================================================

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTokenStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        Optional<QueueToken> optionalToken =
                queueRepository.findById(id);


        if (optionalToken.isPresent()) {

            QueueToken token = optionalToken.get();

            String newStatus = request.get("status");

            token.setStatus(newStatus);

            queueRepository.save(token);


            try {

                List<Appointment> allAppointments =
                        appointmentRepository.findAll();


                String queueTokenNumStr =
                        token.getTokenNumber() != null

                                ?

                                token.getTokenNumber()
                                        .replaceAll(
                                                "[^0-9]",
                                                ""
                                        )
                                        .trim()

                                :

                                "";


                for (Appointment app : allAppointments) {

                    if (app.getTokenNumber() != null) {

                        String appTokenNumStr =
                                String.valueOf(
                                                app.getTokenNumber()
                                        )
                                        .replaceAll(
                                                "[^0-9]",
                                                ""
                                        )
                                        .trim();


                        if (!appTokenNumStr.isEmpty()

                                &&

                                appTokenNumStr.equals(
                                        queueTokenNumStr
                                )) {


                            if ("COMPLETED"
                                    .equalsIgnoreCase(newStatus)) {

                                app.setStatus(
                                        AppointmentStatus.COMPLETED
                                );
                            }

                            else if ("SERVING"
                                    .equalsIgnoreCase(newStatus)) {

                                app.setStatus(
                                        AppointmentStatus.IN_CONSULTATION
                                );
                            }

                            else if ("WAITING"
                                    .equalsIgnoreCase(newStatus)) {

                                app.setStatus(
                                        AppointmentStatus.WAITING
                                );
                            }

                            else if ("SKIPPED"
                                    .equalsIgnoreCase(newStatus)) {

                                app.setStatus(
                                        AppointmentStatus.CANCELLED
                                );
                            }


                            appointmentRepository.save(app);
                        }
                    }
                }

            } catch (Exception e) {

                System.err.println(
                        "Error syncing appointment status: "
                                + e.getMessage()
                );
            }


            return ResponseEntity.ok(token);
        }


        return ResponseEntity.notFound().build();
    }


    // =========================================================
    // DOCTOR PATIENT HISTORY
    // COMPLETED / MISSED / OTHER RECORDS
    // =========================================================

    @GetMapping("/doctor-history/{id}")
    public ResponseEntity<?> getDoctorPatientHistory(
            @PathVariable Long id) {

        Long actualDoctorId =
                doctorRepository
                        .findByUserId(id)
                        .map(Doctor::getId)
                        .orElse(id);


        List<QueueToken> patientHistory =
                queueRepository.findByDoctorId(actualDoctorId);


        return ResponseEntity.ok(patientHistory);
    }


    // =========================================================
    // CURRENT SERVING BY DOCTOR
    // =========================================================

    @GetMapping("/current-serving/{doctorId}")
    public ResponseEntity<?> getCurrentServingByDoctor(
            @PathVariable Long doctorId) {

        List<QueueToken> tokens =
                queueRepository.findByDoctorId(doctorId);


        Optional<QueueToken> servingToken =
                tokens.stream()

                        .filter(
                                t -> "SERVING"
                                        .equalsIgnoreCase(
                                                t.getStatus()
                                        )
                        )

                        .findFirst();


        if (servingToken.isPresent()) {

            return ResponseEntity.ok(
                    Map.of(
                            "currentServing",
                            servingToken
                                    .get()
                                    .getTokenNumber()
                    )
            );
        }


        return ResponseEntity.ok(
                Map.of(
                        "currentServing",
                        "None"
                )
        );
    }


    // =========================================================
    // APPOINTMENT STATUS
    // PATIENT SIDE API - SAME ENDPOINT
    // =========================================================

    @GetMapping("/appointment-status/{appointmentId}")
    public ResponseEntity<?> getStatusByAppointmentId(
            @PathVariable Long appointmentId) {

        Optional<Appointment> appOpt =
                appointmentRepository.findById(appointmentId);


        if (appOpt.isEmpty()) {

            return ResponseEntity.notFound().build();
        }


        Appointment app = appOpt.get();

        String currentServingToken = "None";

        long patientsAhead = 0;

        Long doctorId = null;


        if (app.getDoctor() != null) {

            doctorId = app.getDoctor().getId();
        }


        if (doctorId != null) {

            // ---------------------------------------------
            // Check Appointment table
            // ---------------------------------------------

            List<Appointment> doctorAppointments =
                    appointmentRepository.findByDoctorId(
                            doctorId
                    );


            for (Appointment da : doctorAppointments) {

                if (AppointmentStatus.IN_CONSULTATION
                        .equals(da.getStatus())

                        &&

                        da.getTokenNumber() != null) {


                    currentServingToken =
                            String.valueOf(
                                    da.getTokenNumber()
                            );

                    break;
                }
            }


            // ---------------------------------------------
            // Check QueueToken table
            // ---------------------------------------------

            if ("None".equals(currentServingToken)) {

                List<QueueToken> doctorTokens =
                        queueRepository.findByDoctorId(
                                doctorId
                        );


                for (QueueToken qt : doctorTokens) {

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


            // ---------------------------------------------
            // Patients Ahead
            // ---------------------------------------------

            if (app.getTokenNumber() != null

                    &&

                    app.getAppointmentDate() != null) {


                patientsAhead =
                        appointmentRepository
                                .countByDoctorIdAndAppointmentDateAndStatusAndTokenNumberLessThan(

                                        doctorId,

                                        app.getAppointmentDate(),

                                        AppointmentStatus.WAITING,

                                        app.getTokenNumber()
                                );
            }
        }


        Map<String, Object> response =
                new HashMap<>();


        response.put(
                "appointmentId",
                app.getId()
        );

        response.put(
                "tokenNumber",
                app.getTokenNumber()
        );

        response.put(
                "status",

                app.getStatus() != null

                        ?

                        app.getStatus().toString()

                        :

                        "WAITING"
        );

        response.put(
                "currentServing",
                currentServingToken
        );

        response.put(
                "patientsAhead",
                patientsAhead
        );

        response.put(
                "estimatedWaitTime",
                patientsAhead * 5
        );
        return ResponseEntity.ok(response);
    }
}