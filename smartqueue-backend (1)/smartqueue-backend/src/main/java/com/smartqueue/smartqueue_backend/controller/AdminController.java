
package com.smartqueue.smartqueue_backend.controller;

import com.smartqueue.smartqueue_backend.dto.DoctorDTO;
import com.smartqueue.smartqueue_backend.dto.DoctorResponseDTO;
import com.smartqueue.smartqueue_backend.dto.ReceptionistResponseDTO;
import com.smartqueue.smartqueue_backend.dto.RegisterRequest;

import com.smartqueue.smartqueue_backend.entity.Doctor;
import com.smartqueue.smartqueue_backend.entity.User;

import com.smartqueue.smartqueue_backend.service.AdminService;
import com.smartqueue.smartqueue_backend.service.DoctorService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private DoctorService doctorService;

    // ADD DOCTOR
    @PostMapping("/add-doctor")
    public ResponseEntity<?> saveOrUpdateDoctor(
            @RequestBody DoctorDTO doctorDTO) {

        try {
            Doctor savedDoctor =
                    doctorService.saveOrUpdateDoctor(doctorDTO);

            DoctorResponseDTO dto =
                    convertToDoctorResponse(savedDoctor);

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Doctor saved successfully!",
                            "doctor", dto
                    )
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ADD RECEPTIONIST
    @PostMapping("/add-receptionist")
    public ResponseEntity<?> addReceptionist(
            @RequestBody RegisterRequest request) {

        try {
            adminService.addReceptionist(request);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Receptionist added successfully!"
                    )
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // GET ALL DOCTORS - SAFE RESPONSE
    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorResponseDTO>> getAllDoctors() {

        List<DoctorResponseDTO> doctors =
                adminService.getAllDoctors()
                        .stream()
                        .map(this::convertToDoctorResponse)
                        .toList();

        return ResponseEntity.ok(doctors);
    }

    // GET ALL RECEPTIONISTS - SAFE RESPONSE
    @GetMapping("/receptionists")
    public ResponseEntity<List<ReceptionistResponseDTO>>
    getAllReceptionists() {

        List<ReceptionistResponseDTO> receptionists =
                adminService.getAllReceptionists()
                        .stream()
                        .map(this::convertToReceptionistResponse)
                        .toList();

        return ResponseEntity.ok(receptionists);
    }

    // DELETE DOCTOR
    @DeleteMapping("/doctor/{id}")
    public ResponseEntity<?> deleteDoctor(
            @PathVariable Long id) {

        try {
            adminService.deleteDoctor(id);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Doctor deleted successfully!"
                    )
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // DELETE RECEPTIONIST
    @DeleteMapping("/receptionist/{id}")
    public ResponseEntity<?> deleteReceptionist(
            @PathVariable Long id) {

        try {
            adminService.deleteReceptionist(id);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Receptionist deleted successfully!"
                    )
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // CONVERT DOCTOR ENTITY TO SAFE RESPONSE DTO
    private DoctorResponseDTO convertToDoctorResponse(
            Doctor doctor) {

        DoctorResponseDTO dto = new DoctorResponseDTO();

        dto.setId(doctor.getId());
        dto.setName(doctor.getName());
        dto.setEmail(doctor.getEmail());
        dto.setPhone(doctor.getPhone());
        dto.setSpecialization(doctor.getSpecialization());
        dto.setDepartment(doctor.getDepartment());
        dto.setConsultationFee(doctor.getConsultationFee());
        dto.setRoomNumber(doctor.getRoomNumber());
        dto.setAvailableTime(doctor.getAvailableTime());
        dto.setActive(doctor.getActive());

        return dto;
    }

    // CONVERT USER ENTITY TO SAFE RECEPTIONIST RESPONSE DTO
    private ReceptionistResponseDTO convertToReceptionistResponse(
            User user) {

        ReceptionistResponseDTO dto =
                new ReceptionistResponseDTO();

        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setActive(user.getActive());
        dto.setCreatedAt(user.getCreatedAt());

        return dto;
    }
}
