package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.entity.Doctor;
import com.smartqueue.smartqueue_backend.entity.QueueToken;
import com.smartqueue.smartqueue_backend.entity.User;

import com.smartqueue.smartqueue_backend.repository.AppointmentRepository;
import com.smartqueue.smartqueue_backend.repository.DoctorRepository;
import com.smartqueue.smartqueue_backend.repository.QueueTokenRepository;
import com.smartqueue.smartqueue_backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

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

    @Autowired
    private UserRepository userRepository;


    // =========================================================
    // CONSTANT
    // =========================================================

    private static final int AVERAGE_CONSULTATION_TIME = 15;


    // =========================================================
    // HELPER - PAST APPOINTMENT
    // =========================================================

    private boolean isPastAppointment(String appointmentDate) {

        if (appointmentDate == null
                || appointmentDate.trim().isEmpty()) {

            return false;
        }

        try {

            LocalDate appointmentLocalDate =
                    LocalDate.parse(
                            appointmentDate,
                            DateTimeFormatter.ISO_LOCAL_DATE
                    );

            return appointmentLocalDate.isBefore(
                    LocalDate.now()
            );

        } catch (Exception e) {

            return false;
        }
    }


    // =========================================================
    // NORMALIZE TOKEN NUMBER
    // =========================================================

    private String normalizeToken(Object tokenNumber) {

        if (tokenNumber == null) {
            return "";
        }

        return String.valueOf(tokenNumber)
                .replaceAll("[^0-9]", "")
                .trim();
    }


    // =========================================================
    // FIND ACTUAL DOCTOR ID
    // =========================================================

    private Long getActualDoctorId(Long id) {

        return doctorRepository
                .findByUserId(id)
                .map(Doctor::getId)
                .orElse(id);
    }


    // =========================================================
    // FIND QUEUE TOKEN FOR APPOINTMENT
    // =========================================================

    private Optional<QueueToken> findQueueTokenForAppointment(
            Appointment appointment) {

        if (appointment == null
                || appointment.getTokenNumber() == null
                || appointment.getDoctor() == null) {

            return Optional.empty();
        }

        Long doctorId =
                appointment.getDoctor().getId();

        String appointmentToken =
                normalizeToken(
                        appointment.getTokenNumber()
                );

        List<QueueToken> doctorTokens =
                queueRepository.findByDoctorId(
                        doctorId
                );

        return doctorTokens.stream()

                .filter(token ->

                        appointmentToken.equals(
                                normalizeToken(
                                        token.getTokenNumber()
                                )
                        )
                )

                .sorted(
                        Comparator.comparing(
                                QueueToken::getCreatedAt,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        ).reversed()
                )

                .findFirst();
    }


    // =========================================================
    // CURRENT SERVING TOKEN
    // =========================================================

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentServingToken(
            @RequestParam(
                    defaultValue = "Cardiology"
            ) String department) {

        return queueRepository
                .findFirstByDepartmentAndStatusOrderByCreatedAtAsc(
                        department,
                        "IN-PROGRESS"
                )

                .map(token ->

                        ResponseEntity.ok(
                                Map.of(
                                        "currentServing",
                                        token.getTokenNumber()
                                )
                        )
                )

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
            @RequestParam(
                    defaultValue = "Cardiology"
            ) String department) {

        // -----------------------------------------------------
        // COMPLETE CURRENT PATIENT
        // -----------------------------------------------------

        queueRepository
                .findFirstByDepartmentAndStatusOrderByCreatedAtAsc(
                        department,
                        "IN-PROGRESS"
                )

                .ifPresent(token -> {

                    LocalDateTime endTime =
                            LocalDateTime.now();

                    token.setConsultationEndTime(
                            endTime
                    );

                    if (token.getConsultationStartTime()
                            != null) {

                        long minutes =
                                Duration.between(
                                        token.getConsultationStartTime(),
                                        endTime
                                ).toMinutes();

                        token.setActualConsultationMinutes(
                                (int) minutes
                        );
                    }

                    token.setStatus(
                            "COMPLETED"
                    );

                    queueRepository.save(
                            token
                    );

                    syncAppointmentStatus(
                            token,
                            "COMPLETED"
                    );
                });


        // -----------------------------------------------------
        // FIND NEXT WAITING PATIENT
        // -----------------------------------------------------

        Optional<QueueToken> nextWaiting =
                queueRepository
                        .findFirstByDepartmentAndStatusOrderByCreatedAtAsc(
                                department,
                                "WAITING"
                        );


        if (nextWaiting.isPresent()) {

            QueueToken next =
                    nextWaiting.get();

            next.setStatus(
                    "IN-PROGRESS"
            );

            next.setConsultationStartTime(
                    LocalDateTime.now()
            );

            next.setConsultationEndTime(
                    null
            );

            next.setActualConsultationMinutes(
                    null
            );

            queueRepository.save(
                    next
            );

            syncAppointmentStatus(
                    next,
                    "IN-PROGRESS"
            );

            return ResponseEntity.ok(
                    buildQueueTokenResponse(next)
            );
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
            @RequestParam(
                    defaultValue = "Cardiology"
            ) String department) {

        queueRepository
                .findFirstByDepartmentAndStatusOrderByCreatedAtAsc(
                        department,
                        "IN-PROGRESS"
                )

                .ifPresent(token -> {

                    token.setStatus(
                            "WAITING"
                    );

                    token.setConsultationStartTime(
                            null
                    );

                    token.setConsultationEndTime(
                            null
                    );

                    token.setActualConsultationMinutes(
                            null
                    );

                    queueRepository.save(
                            token
                    );

                    syncAppointmentStatus(
                            token,
                            "WAITING"
                    );
                });


        Optional<QueueToken> lastCompleted =
                queueRepository
                        .findFirstByDepartmentAndStatusOrderByUpdatedAtDesc(
                                department,
                                "COMPLETED"
                        );


        if (lastCompleted.isPresent()) {

            QueueToken previous =
                    lastCompleted.get();

            previous.setStatus(
                    "IN-PROGRESS"
            );

            previous.setConsultationStartTime(
                    LocalDateTime.now()
            );

            previous.setConsultationEndTime(
                    null
            );

            previous.setActualConsultationMinutes(
                    null
            );

            queueRepository.save(
                    previous
            );

            syncAppointmentStatus(
                    previous,
                    "IN-PROGRESS"
            );

            return ResponseEntity.ok(
                    buildQueueTokenResponse(previous)
            );
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
            @RequestParam(
                    defaultValue = "Cardiology"
            ) String department) {

        return queueRepository
                .findFirstByDepartmentAndStatusOrderByCreatedAtAsc(
                        department,
                        "IN-PROGRESS"
                )

                .map(token ->

                        ResponseEntity.ok(
                                Map.of(
                                        "message",
                                        "Recalling token "
                                                + token.getTokenNumber(),

                                        "tokenNumber",
                                        token.getTokenNumber()
                                )
                        )
                )

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
            @RequestParam(
                    defaultValue = "Cardiology"
            ) String department) {

        queueRepository
                .findFirstByDepartmentAndStatusOrderByCreatedAtAsc(
                        department,
                        "IN-PROGRESS"
                )

                .ifPresent(token -> {

                    token.setStatus(
                            "SKIPPED"
                    );

                    token.setConsultationEndTime(
                            LocalDateTime.now()
                    );

                    queueRepository.save(
                            token
                    );

                    syncAppointmentStatus(
                            token,
                            "SKIPPED"
                    );
                });


        Optional<QueueToken> nextWaiting =
                queueRepository
                        .findFirstByDepartmentAndStatusOrderByCreatedAtAsc(
                                department,
                                "WAITING"
                        );


        if (nextWaiting.isPresent()) {

            QueueToken next =
                    nextWaiting.get();

            next.setStatus(
                    "IN-PROGRESS"
            );

            next.setConsultationStartTime(
                    LocalDateTime.now()
            );

            next.setConsultationEndTime(
                    null
            );

            next.setActualConsultationMinutes(
                    null
            );

            queueRepository.save(
                    next
            );

            syncAppointmentStatus(
                    next,
                    "IN-PROGRESS"
            );

            return ResponseEntity.ok(
                    buildQueueTokenResponse(next)
            );
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

        List<QueueToken> allTokens =
                queueRepository.findAll();

        LocalDate today =
                LocalDate.now();

        List<QueueToken> todayTokens =
                allTokens.stream()

                        .filter(token -> {

                            if (token.getCreatedAt() == null) {
                                return false;
                            }

                            return token
                                    .getCreatedAt()
                                    .toLocalDate()
                                    .equals(today);
                        })

                        .collect(
                                Collectors.toList()
                        );


        long totalToday =
                todayTokens.size();


        long waitingCount =
                todayTokens.stream()

                        .filter(token ->
                                "WAITING".equalsIgnoreCase(
                                        token.getStatus()
                                )
                        )

                        .count();


        long completedCount =
                todayTokens.stream()

                        .filter(token ->
                                "COMPLETED".equalsIgnoreCase(
                                        token.getStatus()
                                )
                        )

                        .count();


        Map<String, Object> metrics =
                new HashMap<>();

        metrics.put(
                "patientsToday",
                totalToday
        );

        metrics.put(
                "waitingNow",
                waitingCount
        );

        metrics.put(
                "completedToday",
                completedCount
        );

        metrics.put(
                "activeDoctors",
                6
        );

        metrics.put(
                "avgWaitTime",
                (waitingCount
                        * AVERAGE_CONSULTATION_TIME)
                        + " min"
        );

        metrics.put(
                "averageConsultationTime",
                AVERAGE_CONSULTATION_TIME
        );


        return ResponseEntity.ok(
                metrics
        );
    }


    // =========================================================
    // DOCTOR LIVE QUEUE
    // =========================================================

    @GetMapping("/doctor-queue/{id}")
    public ResponseEntity<?> getDoctorSpecificQueue(
            @PathVariable Long id) {

        Long actualDoctorId =
                getActualDoctorId(id);


        List<Appointment> allAppointments =
                appointmentRepository.findByDoctorId(
                        actualDoctorId
                );


        // -----------------------------------------------------
        // OLD WAITING APPOINTMENTS -> MISSED
        // -----------------------------------------------------

        for (Appointment appointment :
                allAppointments) {

            if (appointment.getStatus()
                    == AppointmentStatus.WAITING

                    &&

                    isPastAppointment(
                            appointment.getAppointmentDate()
                    )) {

                appointment.setStatus(
                        AppointmentStatus.MISSED
                );

                appointmentRepository.save(
                        appointment
                );
            }
        }


        String today =
                LocalDate.now().toString();


        List<Appointment> todayAppointments =
                allAppointments.stream()

                        .filter(app -> {

                            boolean todayAppointment =
                                    today.equals(
                                            app.getAppointmentDate()
                                    );

                            boolean validStatus =
                                    app.getStatus()
                                            == AppointmentStatus.WAITING

                                            ||

                                            app.getStatus()
                                                    == AppointmentStatus.IN_CONSULTATION

                                            ||

                                            app.getStatus()
                                                    == AppointmentStatus.COMPLETED;

                            return todayAppointment
                                    && validStatus;
                        })

                        .collect(
                                Collectors.toList()
                        );


        List<Map<String, Object>> response =
                new ArrayList<>();


        for (Appointment appointment :
                todayAppointments) {

            Map<String, Object> item =
                    new HashMap<>();


            item.put(
                    "id",
                    appointment.getId()
            );

            item.put(
                    "appointmentId",
                    appointment.getId()
            );

            item.put(
                    "tokenNumber",
                    appointment.getTokenNumber()
            );

            item.put(
                    "appointmentDate",
                    appointment.getAppointmentDate()
            );

            item.put(
                    "status",
                    appointment.getStatus()
            );


            // -------------------------------------------------
            // DOCTOR
            // -------------------------------------------------

            if (appointment.getDoctor() != null) {

                item.put(
                        "doctorId",
                        appointment.getDoctor().getId()
                );

                item.put(
                        "doctorName",
                        appointment.getDoctor().getName()
                );
            }


            // -------------------------------------------------
            // PATIENT
            // -------------------------------------------------

            String patientName =
                    "N/A";


            QueueToken queueToken =
                    findQueueTokenForAppointment(
                            appointment
                    ).orElse(null);


            if (queueToken != null) {

                item.put(
                        "queueTokenId",
                        queueToken.getId()
                );

                item.put(
                        "queueStatus",
                        queueToken.getStatus()
                );


                item.put(
                        "consultationStartTime",
                        queueToken.getConsultationStartTime()
                );

                item.put(
                        "consultationEndTime",
                        queueToken.getConsultationEndTime()
                );

                item.put(
                        "actualConsultationMinutes",
                        queueToken.getActualConsultationMinutes()
                );


                // -------------------------------------------------
                // CURRENT ELAPSED TIME
                // -------------------------------------------------

                if (queueToken.getConsultationStartTime()
                        != null
                        &&

                        "IN-PROGRESS".equalsIgnoreCase(
                                queueToken.getStatus()
                        )) {

                    long elapsedMinutes =
                            Duration.between(
                                    queueToken
                                            .getConsultationStartTime(),
                                    LocalDateTime.now()
                            ).toMinutes();

                    item.put(
                            "elapsedConsultationMinutes",
                            Math.max(
                                    0,
                                    elapsedMinutes
                            )
                    );

                } else {

                    item.put(
                            "elapsedConsultationMinutes",
                            0
                    );
                }


                // -------------------------------------------------
                // PATIENT AGE + GENDER
                // -------------------------------------------------

                if (queueToken.getPatientId()
                        != null) {

                    Optional<User> patientOpt =
                            userRepository.findById(
                                    queueToken.getPatientId()
                            );


                    if (patientOpt.isPresent()) {

                        User patient =
                                patientOpt.get();

                        patientName =
                                patient.getName();


                        item.put(
                                "age",
                                patient.getAge()
                        );

                        item.put(
                                "gender",
                                patient.getGender()
                        );
                    }
                }
            }


            item.put(
                    "patientName",
                    patientName
            );


            response.add(item);
        }


        // -----------------------------------------------------
        // SORT BY TOKEN
        // -----------------------------------------------------

        response.sort(
                Comparator.comparingInt(
                        item -> {

                            String token =
                                    normalizeToken(
                                            item.get(
                                                    "tokenNumber"
                                            )
                                    );

                            if (token.isEmpty()) {
                                return Integer.MAX_VALUE;
                            }

                            try {

                                return Integer.parseInt(
                                        token
                                );

                            } catch (Exception e) {

                                return Integer.MAX_VALUE;
                            }
                        }
                )
        );


        return ResponseEntity.ok(
                response
        );
    }


    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTokenStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        String newStatus =
                request.get("status");


        if (newStatus == null
                || newStatus.trim().isEmpty()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Status is required"
                    )
            );
        }


        newStatus =
                newStatus
                        .trim()
                        .toUpperCase();


        if ("SERVING".equals(newStatus)) {

            newStatus =
                    "IN-PROGRESS";
        }


        // -----------------------------------------------------
        // APPOINTMENT FIRST
        // -----------------------------------------------------

        Optional<Appointment> appointmentOpt =
                appointmentRepository.findById(id);


        Appointment appointment;


        if (appointmentOpt.isPresent()) {

            appointment =
                    appointmentOpt.get();

        } else {

            Optional<QueueToken> tokenOpt =
                    queueRepository.findById(id);


            if (tokenOpt.isEmpty()) {

                return ResponseEntity
                        .notFound()
                        .build();
            }


            QueueToken token =
                    tokenOpt.get();


            return updateQueueTokenDirectly(
                    token,
                    newStatus
            );
        }


        // -----------------------------------------------------
        // FIND QUEUE TOKEN
        // -----------------------------------------------------

        Optional<QueueToken> tokenOpt =
                findQueueTokenForAppointment(
                        appointment
                );


        if (tokenOpt.isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Queue token not found for this appointment."
                            )
                    );
        }


        QueueToken token =
                tokenOpt.get();


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

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Please finish the current consultation before starting another patient."
                                )
                        );
            }


            if (token.getConsultationStartTime()
                    == null) {

                token.setConsultationStartTime(
                        LocalDateTime.now()
                );
            }


            token.setConsultationEndTime(
                    null
            );

            token.setActualConsultationMinutes(
                    null
            );

            token.setStatus(
                    "IN-PROGRESS"
            );


            queueRepository.save(
                    token
            );


            appointment.setStatus(
                    AppointmentStatus.IN_CONSULTATION
            );


            appointmentRepository.save(
                    appointment
            );


            return ResponseEntity.ok(
                    buildStatusResponse(
                            token,
                            appointment
                    )
            );
        }


        // =====================================================
        // FINISH CHECKUP
        // =====================================================

        else if ("COMPLETED".equals(newStatus)) {

            if (token.getConsultationStartTime()
                    == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
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
                    (int) Math.max(
                            0,
                            minutes
                    )
            );


            token.setStatus(
                    "COMPLETED"
            );


            queueRepository.save(
                    token
            );


            appointment.setStatus(
                    AppointmentStatus.COMPLETED
            );


            appointmentRepository.save(
                    appointment
            );


            return ResponseEntity.ok(
                    buildStatusResponse(
                            token,
                            appointment
                    )
            );
        }


        // =====================================================
        // WAITING
        // =====================================================

        else if ("WAITING".equals(newStatus)) {

            token.setStatus(
                    "WAITING"
            );

            token.setConsultationStartTime(
                    null
            );

            token.setConsultationEndTime(
                    null
            );

            token.setActualConsultationMinutes(
                    null
            );


            queueRepository.save(
                    token
            );


            appointment.setStatus(
                    AppointmentStatus.WAITING
            );


            appointmentRepository.save(
                    appointment
            );


            return ResponseEntity.ok(
                    buildStatusResponse(
                            token,
                            appointment
                    )
            );
        }


        // =====================================================
        // SKIPPED
        // =====================================================

        else if ("SKIPPED".equals(newStatus)) {

            token.setStatus(
                    "SKIPPED"
            );

            token.setConsultationEndTime(
                    LocalDateTime.now()
            );


            queueRepository.save(
                    token
            );


            appointment.setStatus(
                    AppointmentStatus.CANCELLED
            );


            appointmentRepository.save(
                    appointment
            );


            return ResponseEntity.ok(
                    buildStatusResponse(
                            token,
                            appointment
                    )
            );
        }


        return ResponseEntity
                .badRequest()
                .body(
                        Map.of(
                                "message",
                                "Invalid status: "
                                        + newStatus
                        )
                );
    }


    // =========================================================
    // DIRECT QUEUE TOKEN UPDATE
    // =========================================================

    private ResponseEntity<?> updateQueueTokenDirectly(
            QueueToken token,
            String newStatus) {

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

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Please finish the current consultation before starting another patient."
                                )
                        );
            }


            if (token.getConsultationStartTime()
                    == null) {

                token.setConsultationStartTime(
                        LocalDateTime.now()
                );
            }


            token.setConsultationEndTime(
                    null
            );

            token.setActualConsultationMinutes(
                    null
            );

            token.setStatus(
                    "IN-PROGRESS"
            );
        }


        else if ("COMPLETED".equals(newStatus)) {

            if (token.getConsultationStartTime()
                    == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
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
                    (int) Math.max(
                            0,
                            minutes
                    )
            );


            token.setStatus(
                    "COMPLETED"
            );
        }


        else if ("WAITING".equals(newStatus)) {

            token.setStatus(
                    "WAITING"
            );

            token.setConsultationStartTime(
                    null
            );

            token.setConsultationEndTime(
                    null
            );

            token.setActualConsultationMinutes(
                    null
            );
        }


        else if ("SKIPPED".equals(newStatus)) {

            token.setStatus(
                    "SKIPPED"
            );

            token.setConsultationEndTime(
                    LocalDateTime.now()
            );
        }


        else {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Invalid status: "
                                            + newStatus
                            )
                    );
        }


        QueueToken saved =
                queueRepository.save(
                        token
                );


        syncAppointmentStatus(
                saved,
                newStatus
        );


        return ResponseEntity.ok(
                buildQueueTokenResponse(saved)
        );
    }


    // =========================================================
    // SYNC APPOINTMENT STATUS
    // =========================================================

    private void syncAppointmentStatus(
            QueueToken token,
            String newStatus) {

        if (token == null
                || token.getTokenNumber() == null) {

            return;
        }


        String queueTokenNumber =
                normalizeToken(
                        token.getTokenNumber()
                );


        List<Appointment> appointments =
                appointmentRepository.findAll();


        for (Appointment appointment :
                appointments) {

            if (appointment.getTokenNumber()
                    == null) {

                continue;
            }


            String appointmentTokenNumber =
                    normalizeToken(
                            appointment.getTokenNumber()
                    );


            if (!queueTokenNumber.equals(
                    appointmentTokenNumber
            )) {

                continue;
            }


            if (appointment.getDoctor() != null
                    && token.getDoctorId() != null
                    && !appointment.getDoctor()
                    .getId()
                    .equals(
                            token.getDoctorId()
                    )) {

                continue;
            }


            if ("IN-PROGRESS".equalsIgnoreCase(
                    newStatus
            )) {

                appointment.setStatus(
                        AppointmentStatus.IN_CONSULTATION
                );
            }

            else if ("COMPLETED".equalsIgnoreCase(
                    newStatus
            )) {

                appointment.setStatus(
                        AppointmentStatus.COMPLETED
                );
            }

            else if ("WAITING".equalsIgnoreCase(
                    newStatus
            )) {

                appointment.setStatus(
                        AppointmentStatus.WAITING
                );
            }

            else if ("SKIPPED".equalsIgnoreCase(
                    newStatus
            )) {

                appointment.setStatus(
                        AppointmentStatus.CANCELLED
                );
            }


            appointmentRepository.save(
                    appointment
            );
        }
    }


    // =========================================================
    // STATUS RESPONSE
    // =========================================================

    private Map<String, Object> buildStatusResponse(
            QueueToken token,
            Appointment appointment) {

        Map<String, Object> response =
                new HashMap<>();


        response.put(
                "queueTokenId",
                token.getId()
        );

        response.put(
                "appointmentId",
                appointment.getId()
        );

        response.put(
                "tokenNumber",
                token.getTokenNumber()
        );

        response.put(
                "status",
                appointment.getStatus()
        );

        response.put(
                "queueStatus",
                token.getStatus()
        );

        response.put(
                "consultationStartTime",
                token.getConsultationStartTime()
        );

        response.put(
                "consultationEndTime",
                token.getConsultationEndTime()
        );

        response.put(
                "actualConsultationMinutes",
                token.getActualConsultationMinutes()
        );


        return response;
    }


    // =========================================================
    // QUEUE TOKEN RESPONSE
    // =========================================================

    private Map<String, Object> buildQueueTokenResponse(
            QueueToken token) {

        Map<String, Object> response =
                new HashMap<>();


        response.put(
                "queueTokenId",
                token.getId()
        );

        response.put(
                "tokenNumber",
                token.getTokenNumber()
        );

        response.put(
                "status",
                token.getStatus()
        );

        response.put(
                "consultationStartTime",
                token.getConsultationStartTime()
        );

        response.put(
                "consultationEndTime",
                token.getConsultationEndTime()
        );

        response.put(
                "actualConsultationMinutes",
                token.getActualConsultationMinutes()
        );


        return response;
    }


    // =========================================================
    // DOCTOR PATIENT HISTORY
    // =========================================================

    @GetMapping("/doctor-history/{id}")
    public ResponseEntity<?> getDoctorPatientHistory(
            @PathVariable Long id) {

        Long actualDoctorId =
                getActualDoctorId(id);


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

        Long actualDoctorId =
                getActualDoctorId(
                        doctorId
                );


        List<QueueToken> tokens =
                queueRepository.findByDoctorId(
                        actualDoctorId
                );


        Optional<QueueToken> currentToken =
                tokens.stream()

                        .filter(
                                t ->
                                        "IN-PROGRESS"
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
    // PATIENT APPOINTMENT LIVE STATUS
    // =========================================================

    @GetMapping("/appointment-status/{appointmentId}")
    public ResponseEntity<?> getStatusByAppointmentId(
            @PathVariable Long appointmentId) {

        Optional<Appointment> appOpt =
                appointmentRepository.findById(
                        appointmentId
                );


        if (appOpt.isEmpty()) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        Appointment app =
                appOpt.get();


        Long doctorId = null;


        if (app.getDoctor() != null) {

            doctorId =
                    app.getDoctor().getId();
        }


        // -----------------------------------------------------
        // DEFAULT VALUES
        // -----------------------------------------------------

        String currentServingToken =
                "None";

        long patientsAhead = 0;


        // -----------------------------------------------------
        // FIND QUEUE TOKEN
        // -----------------------------------------------------

        Optional<QueueToken> queueTokenOpt =
                findQueueTokenForAppointment(
                        app
                );


        QueueToken queueToken =
                queueTokenOpt.orElse(null);


        // -----------------------------------------------------
        // CURRENT SERVING
        // -----------------------------------------------------

        if (doctorId != null) {

            List<QueueToken> doctorTokens =
                    queueRepository.findByDoctorId(
                            doctorId
                    );


            Optional<QueueToken> currentToken =
                    doctorTokens.stream()

                            .filter(qt ->
                                    "IN-PROGRESS"
                                            .equalsIgnoreCase(
                                                    qt.getStatus()
                                            )
                            )

                            .findFirst();


            if (currentToken.isPresent()) {

                currentServingToken =
                        currentToken
                                .get()
                                .getTokenNumber();
            }


            // -------------------------------------------------
            // PATIENTS AHEAD
            // -------------------------------------------------

            if (app.getTokenNumber() != null
                    && app.getAppointmentDate() != null
                    && app.getStatus() == AppointmentStatus.WAITING) {

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


        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

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
                        ? app.getStatus().toString()
                        : "WAITING"
        );


        // 🟢 QUEUE STATUS
        response.put(
                "queueStatus",
                queueToken != null
                        ? queueToken.getStatus()
                        : app.getStatus()
        );


        response.put(
                "currentServing",
                currentServingToken
        );


        response.put(
                "patientsAhead",
                patientsAhead
        );


        // -----------------------------------------------------
        // WAIT TIME
        // -----------------------------------------------------

        response.put(
                "estimatedWaitTime",
                patientsAhead
                        * AVERAGE_CONSULTATION_TIME
        );


        response.put(
                "averageConsultationTime",
                AVERAGE_CONSULTATION_TIME
        );


        // -----------------------------------------------------
        // CONSULTATION DETAILS
        // -----------------------------------------------------

        if (queueToken != null) {

            response.put(
                    "consultationStartTime",
                    queueToken.getConsultationStartTime()
            );

            response.put(
                    "consultationEndTime",
                    queueToken.getConsultationEndTime()
            );

            response.put(
                    "actualConsultationMinutes",
                    queueToken.getActualConsultationMinutes()
            );


            // -------------------------------------------------
            // LIVE ELAPSED MINUTES
            // -------------------------------------------------

            if (queueToken.getConsultationStartTime()
                    != null
                    &&

                    "IN-PROGRESS".equalsIgnoreCase(
                            queueToken.getStatus()
                    )) {

                long elapsedMinutes =
                        Duration.between(
                                queueToken
                                        .getConsultationStartTime(),
                                LocalDateTime.now()
                        ).toMinutes();

                response.put(
                        "elapsedConsultationMinutes",
                        Math.max(
                                0,
                                elapsedMinutes
                        )
                );

            } else {

                response.put(
                        "elapsedConsultationMinutes",
                        0
                );
            }
        }


        return ResponseEntity.ok(
                response
        );
    }
}