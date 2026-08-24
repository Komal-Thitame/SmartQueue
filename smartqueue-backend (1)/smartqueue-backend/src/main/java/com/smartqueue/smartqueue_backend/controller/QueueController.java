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

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
                    LocalDate.parse(
                            appointmentDate,
                            DateTimeFormatter.ISO_LOCAL_DATE
                    );

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
                        "IN-PROGRESS"
                )
                .map(token -> ResponseEntity.ok(
                        Map.of(
                                "currentServing",
                                token.getTokenNumber()
                        )
                ))
                .orElseGet(() ->
                        ResponseEntity.ok(
                                Map.of(
                                        "currentServing",
                                        "None"
                                )
                        )
                );
    }


    // =========================================================
    // NEXT TOKEN
    // =========================================================

    @PostMapping("/next")
    public ResponseEntity<?> callNextToken(
            @RequestParam(defaultValue = "Cardiology") String department) {

        // Current IN-PROGRESS patient ko complete karo
        queueRepository
                .findFirstByDepartmentAndStatusOrderByCreatedAtAsc(
                        department,
                        "IN-PROGRESS"
                )
                .ifPresent(token -> {

                    LocalDateTime endTime = LocalDateTime.now();

                    token.setConsultationEndTime(endTime);

                    if (token.getConsultationStartTime() != null) {

                        long minutes = Duration.between(
                                token.getConsultationStartTime(),
                                endTime
                        ).toMinutes();

                        token.setActualConsultationMinutes(
                                (int) minutes
                        );
                    }

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

            next.setStatus("IN-PROGRESS");

            next.setConsultationStartTime(
                    LocalDateTime.now()
            );

            next.setConsultationEndTime(null);

            next.setActualConsultationMinutes(null);

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
                        "IN-PROGRESS"
                )
                .ifPresent(token -> {

                    token.setStatus("WAITING");

                    token.setConsultationStartTime(null);
                    token.setConsultationEndTime(null);
                    token.setActualConsultationMinutes(null);

                    queueRepository.save(token);
                });


        Optional<QueueToken> lastCompleted =
                queueRepository
                        .findFirstByDepartmentAndStatusOrderByUpdatedAtDesc(
                                department,
                                "COMPLETED"
                        );


        if (lastCompleted.isPresent()) {

            QueueToken previous = lastCompleted.get();

            previous.setStatus("IN-PROGRESS");

            previous.setConsultationStartTime(
                    LocalDateTime.now()
            );

            previous.setConsultationEndTime(null);

            previous.setActualConsultationMinutes(null);

            queueRepository.save(previous);

            return ResponseEntity.ok(previous);
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
                        "IN-PROGRESS"
                )
                .map(token -> ResponseEntity.ok(
                        Map.of(
                                "message",
                                "Recalling token "
                                        + token.getTokenNumber(),
                                "tokenNumber",
                                token.getTokenNumber()
                        )
                ))
                .orElseGet(() ->
                        ResponseEntity.ok(
                                Map.of(
                                        "message",
                                        "No active patient currently in consultation."
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
                        "IN-PROGRESS"
                )
                .ifPresent(token -> {

                    token.setStatus("SKIPPED");

                    token.setConsultationEndTime(
                            LocalDateTime.now()
                    );

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

            next.setStatus("IN-PROGRESS");

            next.setConsultationStartTime(
                    LocalDateTime.now()
            );

            next.setConsultationEndTime(null);

            next.setActualConsultationMinutes(null);

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
                waitingCount
        );

        metrics.put(
                "activeDoctors",
                6
        );

        metrics.put(
                "avgWaitTime",
                (waitingCount * 15) + " min"
        );


        return ResponseEntity.ok(metrics);
    }


    // =========================================================
    // DOCTOR LIVE QUEUE
    // ONLY TODAY + WAITING / IN-PROGRESS
    // =========================================================

    @GetMapping("/doctor-queue/{id}")
    public ResponseEntity<?> getDoctorSpecificQueue(
            @PathVariable Long id) {

        // userId se actual doctorId find karo
        Long actualDoctorId =
                doctorRepository
                        .findByUserId(id)
                        .map(Doctor::getId)
                        .orElse(id);


        // Old WAITING appointments ko MISSED karo
        List<Appointment> allAppointments =
                appointmentRepository.findByDoctorId(
                        actualDoctorId
                );


        for (Appointment appointment : allAppointments) {

            if (appointment.getStatus() == AppointmentStatus.WAITING
                    &&
                    isPastAppointment(
                            appointment.getAppointmentDate()
                    )) {

                appointment.setStatus(
                        AppointmentStatus.MISSED
                );

                appointmentRepository.save(appointment);
            }
        }


        // Doctor ke saare queue tokens
        List<QueueToken> allTokens =
                queueRepository.findByDoctorId(
                        actualDoctorId
                );


        String today = LocalDate.now().toString();


        List<QueueToken> liveQueue =
                allTokens.stream()

                        .filter(token ->

                                "WAITING".equalsIgnoreCase(
                                        token.getStatus()
                                )

                                        ||

                                        "IN-PROGRESS".equalsIgnoreCase(
                                                token.getStatus()
                                        )
                        )

                        .filter(token -> {

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
    // START / FINISH CONSULTATION
    // =========================================================

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTokenStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        Optional<QueueToken> optionalToken =
                queueRepository.findById(id);


        if (optionalToken.isEmpty()) {
            return ResponseEntity.notFound().build();
        }


        QueueToken token = optionalToken.get();


        String newStatus = request.get("status");


        if (newStatus == null || newStatus.trim().isEmpty()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Status is required"
                    )
            );
        }


        newStatus = newStatus
                .trim()
                .toUpperCase();


        // =====================================================
        // START CHECKUP
        // =====================================================

        if ("IN-PROGRESS".equals(newStatus)) {

            List<QueueToken> doctorTokens =
                    queueRepository.findByDoctorId(
                            token.getDoctorId()
                    );


            boolean anotherPatientInProgress =
                    doctorTokens.stream()
                            .anyMatch(t ->

                                    !t.getId().equals(
                                            token.getId()
                                    )

                                            &&

                                            "IN-PROGRESS"
                                                    .equalsIgnoreCase(
                                                            t.getStatus()
                                                    )
                            );


            if (anotherPatientInProgress) {

                return ResponseEntity.badRequest().body(
                        Map.of(
                                "message",
                                "Please finish the current consultation before starting another patient."
                        )
                );
            }


            // Start time save
            if (token.getConsultationStartTime() == null) {

                token.setConsultationStartTime(
                        LocalDateTime.now()
                );
            }


            token.setConsultationEndTime(null);
            token.setActualConsultationMinutes(null);

            token.setStatus("IN-PROGRESS");
        }


        // =====================================================
        // FINISH CHECKUP
        // =====================================================

        else if ("COMPLETED".equals(newStatus)) {

            if (token.getConsultationStartTime() == null) {

                return ResponseEntity.badRequest().body(
                        Map.of(
                                "message",
                                "Consultation has not been started yet."
                        )
                );
            }


            LocalDateTime endTime =
                    LocalDateTime.now();


            token.setConsultationEndTime(
                    endTime
            );


            long minutes =
                    Duration.between(
                            token.getConsultationStartTime(),
                            endTime
                    ).toMinutes();


            token.setActualConsultationMinutes(
                    (int) minutes
            );


            token.setStatus("COMPLETED");
        }


        // =====================================================
        // WAITING
        // =====================================================

        else if ("WAITING".equals(newStatus)) {

            token.setStatus("WAITING");

            token.setConsultationStartTime(null);
            token.setConsultationEndTime(null);
            token.setActualConsultationMinutes(null);
        }


        // =====================================================
        // SKIPPED
        // =====================================================

        else if ("SKIPPED".equals(newStatus)) {

            token.setStatus("SKIPPED");
        }


        // =====================================================
        // INVALID STATUS
        // =====================================================

        else {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Invalid status: "
                                    + newStatus
                    )
            );
        }


        // Save QueueToken
        QueueToken savedToken =
                queueRepository.save(token);


        // =====================================================
        // SYNC APPOINTMENT STATUS
        // =====================================================

        try {

            List<Appointment> allAppointments =
                    appointmentRepository.findAll();


            String queueTokenNumStr =
                    token.getTokenNumber() != null

                            ?

                            token.getTokenNumber()
                                    .replaceAll("[^0-9]", "")
                                    .trim()

                            :

                            "";


            for (Appointment app : allAppointments) {

                if (app.getTokenNumber() == null) {
                    continue;
                }


                String appTokenNumStr =
                        String.valueOf(
                                        app.getTokenNumber()
                                )
                                .replaceAll("[^0-9]", "")
                                .trim();


                if (!appTokenNumStr.isEmpty()
                        &&
                        appTokenNumStr.equals(
                                queueTokenNumStr
                        )) {


                    if ("IN-PROGRESS"
                            .equalsIgnoreCase(newStatus)) {

                        app.setStatus(
                                AppointmentStatus.IN_CONSULTATION
                        );
                    }


                    else if ("COMPLETED"
                            .equalsIgnoreCase(newStatus)) {

                        app.setStatus(
                                AppointmentStatus.COMPLETED
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

        } catch (Exception e) {

            System.err.println(
                    "Error syncing appointment status: "
                            + e.getMessage()
            );
        }


        return ResponseEntity.ok(
                savedToken
        );
    }


    // =========================================================
    // DOCTOR PATIENT HISTORY
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
                queueRepository.findByDoctorId(
                        actualDoctorId
                );


        return ResponseEntity.ok(
                patientHistory
        );
    }


    // =========================================================
    // CURRENT SERVING BY DOCTOR
    // =========================================================

    @GetMapping("/current-serving/{doctorId}")
    public ResponseEntity<?> getCurrentServingByDoctor(
            @PathVariable Long doctorId) {

        List<QueueToken> tokens =
                queueRepository.findByDoctorId(
                        doctorId
                );


        Optional<QueueToken> currentToken =
                tokens.stream()

                        .filter(
                                t -> "IN-PROGRESS"
                                        .equalsIgnoreCase(
                                                t.getStatus()
                                        )
                        )

                        .findFirst();


        if (currentToken.isPresent()) {

            return ResponseEntity.ok(
                    Map.of(
                            "currentServing",
                            currentToken
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
    // PATIENT SIDE API
    // =========================================================

    @GetMapping("/appointment-status/{appointmentId}")
    public ResponseEntity<?> getStatusByAppointmentId(
            @PathVariable Long appointmentId) {

        Optional<Appointment> appOpt =
                appointmentRepository.findById(
                        appointmentId
                );


        if (appOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }


        Appointment app = appOpt.get();


        String currentServingToken = "None";

        long patientsAhead = 0;

        Long doctorId = null;


        if (app.getDoctor() != null) {

            doctorId = app
                    .getDoctor()
                    .getId();
        }


        if (doctorId != null) {

            // Find current consultation from Appointment table
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


            // Fallback: QueueToken table
            if ("None".equals(currentServingToken)) {

                List<QueueToken> doctorTokens =
                        queueRepository.findByDoctorId(
                                doctorId
                        );


                for (QueueToken qt : doctorTokens) {

                    if ("IN-PROGRESS"
                            .equalsIgnoreCase(
                                    qt.getStatus()
                            )) {

                        currentServingToken =
                                qt.getTokenNumber();

                        break;
                    }
                }
            }


            // Patients Ahead
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
                patientsAhead * 15
        );


        return ResponseEntity.ok(
                response
        );
    }
}