package com.smartqueue.smartqueue_backend.service;

import com.smartqueue.smartqueue_backend.dto.DoctorDTO;
import com.smartqueue.smartqueue_backend.dto.RegisterRequest;
import com.smartqueue.smartqueue_backend.entity.Doctor;
import com.smartqueue.smartqueue_backend.entity.Role;
import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.repository.DoctorRepository;
import com.smartqueue.smartqueue_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Doctor addDoctor(DoctorDTO doctorDTO) {
        if (userRepository.existsByEmail(doctorDTO.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        User user = new User();
        user.setName(doctorDTO.getName());
        user.setEmail(doctorDTO.getEmail());
        user.setPassword(passwordEncoder.encode(doctorDTO.getPassword()));
        user.setPhone(doctorDTO.getPhone());
        user.setRole(Role.DOCTOR);
        User savedUser = userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setName(doctorDTO.getName());
        doctor.setEmail(doctorDTO.getEmail());
        doctor.setPhone(doctorDTO.getPhone());
        doctor.setSpecialization(doctorDTO.getSpecialization());
        doctor.setDepartment(doctorDTO.getDepartment());
        doctor.setConsultationFee(doctorDTO.getConsultationFee());
        doctor.setRoomNumber(doctorDTO.getRoomNumber());
        doctor.setAvailableTime(doctorDTO.getAvailableTime());
        doctor.setUser(savedUser);

        return doctorRepository.save(doctor);
    }

    public User addReceptionist(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(Role.RECEPTIONIST);

        return userRepository.save(user);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public List<User> getAllReceptionists() {
        return userRepository.findByRole(Role.RECEPTIONIST);
    }

    // 🟢 SAFE DELETE DOCTOR (Linked User ko bhi clean karega)
    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));

        // Agar user account linked hai toh use bhi delete karein
        if (doctor.getUser() != null) {
            userRepository.delete(doctor.getUser());
        }

        doctorRepository.delete(doctor);
    }

    @Transactional
    public void deleteReceptionist(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Receptionist not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}