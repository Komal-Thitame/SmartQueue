package com.smartqueue.smartqueue_backend.service;

import com.smartqueue.smartqueue_backend.dto.PatientOverviewDTO;
import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminPatientService {

    @Autowired
    private UserRepository userRepository;

    public List<PatientOverviewDTO> getAllPatientsOverview() {
        return userRepository.findAll().stream()
                // Role enum ko string me convert karke check karein
                .filter(user -> user.getRole() != null && "PATIENT".equalsIgnoreCase(user.getRole().name()))
                .map(user -> {
                    PatientOverviewDTO dto = new PatientOverviewDTO();
                    dto.setId(user.getId());
                    dto.setPatientCustomId("P-" + String.format("%03d", user.getId())); // Table view format (P-001, P-002...)
                    dto.setName(user.getName());
                    dto.setEmail(user.getEmail());
                    dto.setPhone(user.getPhone());
                    dto.setActive(user.getActive());
                    dto.setCreatedAt(user.getCreatedAt());
                    return dto;
                }).collect(Collectors.toList());
    }

    public PatientOverviewDTO getPatientDetailOverview(Long id) {
        // ID ke base par database se user find karein
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return null;
        }

        PatientOverviewDTO dto = new PatientOverviewDTO();
        dto.setId(user.getId());
        dto.setPatientCustomId("P-" + String.format("%03d", user.getId()));
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setActive(user.getActive());
        dto.setCreatedAt(user.getCreatedAt());

        // Queue history ke liye empty list set ki hai taaki null pointer error na aaye
        dto.setQueueHistory(new ArrayList<>());

        return dto;
    }
}