package com.smartqueue.smartqueue_backend.service;

import com.smartqueue.smartqueue_backend.dto.AdminReceptionistDTO;
import com.smartqueue.smartqueue_backend.entity.Receptionist;
import com.smartqueue.smartqueue_backend.entity.Role;
import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.repository.ReceptionistRepository;
import com.smartqueue.smartqueue_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminReceptionistService {

    @Autowired
    private ReceptionistRepository receptionistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public Receptionist createReceptionist(AdminReceptionistDTO dto) {
        // 1. Create User Authentication Profile
        User user = new User();
        user.setName(dto.getName());  // FIXED: Set user name
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone()); // FIXED: Set user phone
        user.setPassword(passwordEncoder.encode(dto.getTemporaryPassword()));
        user.setRole(Role.RECEPTIONIST);
        user.setActive(true);

        // Save User explicitly
        User savedUser = userRepository.save(user);

        // 2. Create Receptionist Staff Profile
        Receptionist receptionist = new Receptionist();
        receptionist.setName(dto.getName());
        receptionist.setPhone(dto.getPhone());
        receptionist.setEmployeeId(dto.getEmployeeId());
        receptionist.setCounterNumber(dto.getCounterNumber());
        receptionist.setShift(dto.getShift());
        receptionist.setUser(savedUser);

        return receptionistRepository.save(receptionist);
    }

    public List<Receptionist> getAllReceptionists() {
        return receptionistRepository.findAll();
    }

    public Receptionist toggleStatus(Long id) {
        Receptionist receptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receptionist not found"));
        User user = receptionist.getUser();

        // Toggle user active status
        Boolean currentStatus = user.getActive();
        user.setActive(currentStatus == null || !currentStatus);

        userRepository.save(user);
        return receptionist;
    }
    @Transactional
    public Receptionist updateReceptionist(Long id, AdminReceptionistDTO dto) {
        Receptionist receptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receptionist not found with id: " + id));

        // Update Receptionist entity fields
        receptionist.setName(dto.getName());
        receptionist.setPhone(dto.getPhone());
        receptionist.setCounterNumber(dto.getCounterNumber());
        receptionist.setShift(dto.getShift());

        // Update linked User entity fields
        User user = receptionist.getUser();
        if (user != null) {
            user.setName(dto.getName());
            user.setPhone(dto.getPhone());
            userRepository.save(user);
        }

        return receptionistRepository.save(receptionist);
    }
    public void resetPassword(Long id, String newPassword) {
        Receptionist receptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receptionist not found"));
        User user = receptionist.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}