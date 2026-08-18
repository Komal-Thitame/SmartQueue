package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.entity.Doctor;
import com.smartqueue.smartqueue_backend.entity.QueueToken;
import com.smartqueue.smartqueue_backend.repository.DoctorRepository; // 1. DoctorRepository import karein
import com.smartqueue.smartqueue_backend.repository.QueueTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    private DoctorRepository doctorRepository; // 2. DoctorRepository inject karein

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentServingToken(@RequestParam(defaultValue = "Cardiology") String department) {
        return queueRepository.findFirstByDepartmentAndStatusOrderByCreatedAtAsc(department, "SERVING")
                .map(token -> ResponseEntity.ok(Map.of("currentServing", token.getTokenNumber())))
                .orElseGet(() -> ResponseEntity.ok(Map.of("currentServing", "A-26")));
    }

    @PostMapping("/next")
    public ResponseEntity<?> callNextToken(@RequestParam(defaultValue = "Cardiology") String department) {
        queueRepository.findFirstByDepartmentAndStatusOrderByCreatedAtAsc(department, "SERVING")
                .ifPresent(token -> {
                    token.setStatus("COMPLETED");
                    queueRepository.save(token);
                });

        Optional<QueueToken> nextWaiting = queueRepository.findFirstByDepartmentAndStatusOrderByCreatedAtAsc(department, "WAITING");
        if (nextWaiting.isPresent()) {
            QueueToken next = nextWaiting.get();
            next.setStatus("SERVING");
            queueRepository.save(next);
            return ResponseEntity.ok(next);
        }

        return ResponseEntity.ok(Map.of("message", "No more patients waiting in queue."));
    }

    @PostMapping("/previous")
    public ResponseEntity<?> callPreviousToken(@RequestParam(defaultValue = "Cardiology") String department) {
        queueRepository.findFirstByDepartmentAndStatusOrderByCreatedAtAsc(department, "SERVING")
                .ifPresent(token -> {
                    token.setStatus("WAITING");
                    queueRepository.save(token);
                });

        Optional<QueueToken> lastCompleted = queueRepository.findFirstByDepartmentAndStatusOrderByUpdatedAtDesc(department, "COMPLETED");
        if (lastCompleted.isPresent()) {
            QueueToken prev = lastCompleted.get();
            prev.setStatus("SERVING");
            queueRepository.save(prev);
            return ResponseEntity.ok(prev);
        }

        return ResponseEntity.ok(Map.of("message", "No previous token found to recall."));
    }

    @PostMapping("/recall")
    public ResponseEntity<?> recallToken(@RequestParam(defaultValue = "Cardiology") String department) {
        return queueRepository.findFirstByDepartmentAndStatusOrderByCreatedAtAsc(department, "SERVING")
                .map(token -> ResponseEntity.ok(Map.of(
                        "message", "Recalling token " + token.getTokenNumber(),
                        "tokenNumber", token.getTokenNumber()
                )))
                .orElseGet(() -> ResponseEntity.ok(Map.of("message", "No active token currently serving.")));
    }

    @PostMapping("/skip")
    public ResponseEntity<?> skipToken(@RequestParam(defaultValue = "Cardiology") String department) {
        queueRepository.findFirstByDepartmentAndStatusOrderByCreatedAtAsc(department, "SERVING")
                .ifPresent(token -> {
                    token.setStatus("SKIPPED");
                    queueRepository.save(token);
                });

        Optional<QueueToken> nextWaiting = queueRepository.findFirstByDepartmentAndStatusOrderByCreatedAtAsc(department, "WAITING");
        if (nextWaiting.isPresent()) {
            QueueToken next = nextWaiting.get();
            next.setStatus("SERVING");
            queueRepository.save(next);
            return ResponseEntity.ok(next);
        }

        return ResponseEntity.ok(Map.of("message", "Patient skipped. No more waiting patients."));
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getDashboardMetrics() {
        long totalToday = queueRepository.count();
        List<QueueToken> waitingTokens = queueRepository.findByDepartmentAndStatus("Cardiology", "WAITING");
        long waitingCount = waitingTokens.size();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("patientsToday", totalToday > 0 ? totalToday : 128);
        metrics.put("waitingNow", waitingCount > 0 ? waitingCount : 14);
        metrics.put("activeDoctors", 6);
        metrics.put("avgWaitTime", (waitingCount > 0 ? (waitingCount * 5) : 12) + "m");

        return ResponseEntity.ok(metrics);
    }

    // 🟢 FIXED: User ID ko actual Doctor ID mein map karke queue fetch karna
    @GetMapping("/doctor-queue/{id}")
    public ResponseEntity<?> getDoctorSpecificQueue(@PathVariable Long id) {
        // Pehle check karein ki kya yeh ID `doctors` table ki direct ID hai ya `users` table ki user_id hai
        Optional<Doctor> doctorByUserId = doctorRepository.findByUserId(id);

        Long actualDoctorId;
        if (doctorByUserId.isPresent()) {
            actualDoctorId = doctorByUserId.get().getId(); // Agar user_id aayi hai toh doctor ki real ID lenge
        } else {
            actualDoctorId = id; // Agar seedha doctor ki ID hai
        }

        List<QueueToken> doctorQueue = queueRepository.findByDoctorIdAndStatusNot(actualDoctorId, "COMPLETED");
        return ResponseEntity.ok(doctorQueue);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTokenStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<QueueToken> optionalToken = queueRepository.findById(id);
        if (optionalToken.isPresent()) {
            QueueToken token = optionalToken.get();
            token.setStatus(request.get("status"));
            queueRepository.save(token);
            return ResponseEntity.ok(token);
        }
        return ResponseEntity.notFound().build();
    }
    // 🟢 Naya endpoint doctor ke saare patients history ke liye
    @GetMapping("/doctor-history/{id}")
    public ResponseEntity<?> getDoctorPatientHistory(@PathVariable Long id) {
        Optional<Doctor> doctorByUserId = doctorRepository.findByUserId(id);

        Long actualDoctorId;
        if (doctorByUserId.isPresent()) {
            actualDoctorId = doctorByUserId.get().getId();
        } else {
            actualDoctorId = id;
        }

        // Doctor ke saare tokens/patients fetch karna (chahe waiting ho ya completed)
        List<QueueToken> patientHistory = queueRepository.findByDoctorId(actualDoctorId);
        return ResponseEntity.ok(patientHistory);
    }
}