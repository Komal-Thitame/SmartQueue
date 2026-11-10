package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.dto.PatientOverviewDTO;
import com.smartqueue.smartqueue_backend.service.AdminPatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/patients")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminPatientController {

    @Autowired
    private AdminPatientService patientService;

    @GetMapping
    public ResponseEntity<List<PatientOverviewDTO>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatientsOverview());
    }

    @GetMapping("/{id}/overview")
    public ResponseEntity<PatientOverviewDTO> getPatientDetailOverview(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientDetailOverview(id));
    }
}