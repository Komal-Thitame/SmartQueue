package com.smartqueue.smartqueue_backend.service;

import com.smartqueue.smartqueue_backend.dto.DoctorDTO;
import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.entity.Doctor;
import com.smartqueue.smartqueue_backend.entity.Role;
import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.repository.AppointmentRepository;
import com.smartqueue.smartqueue_backend.repository.DoctorRepository;
import com.smartqueue.smartqueue_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class DoctorService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Doctor Add / Update Logic with Email Uniqueness Check & User Table Entry
    public Doctor saveOrUpdateDoctor(DoctorDTO dto) {
        if (dto.getId() == null) {
            if (doctorRepository.existsByEmail(dto.getEmail())) {
                throw new RuntimeException("Email already exists!");
            }
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new RuntimeException("Email already registered in users!");
            }
        } else {
            if (doctorRepository.existsByEmailAndIdNot(dto.getEmail(), dto.getId())) {
                throw new RuntimeException("Email already exists with another doctor!");
            }
        }

        Doctor doctor;
        User user;

        if (dto.getId() != null) {
            doctor = doctorRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + dto.getId()));

            user = userRepository.findByEmail(doctor.getEmail()).orElse(new User());
        } else {
            doctor = new Doctor();
            user = new User();
            user.setRole(Role.DOCTOR);
        }

        doctor.setName(dto.getName());
        doctor.setDepartment(dto.getDepartment());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setEmail(dto.getEmail());
        doctor.setPhone(dto.getPhone());
        doctor.setRoomNumber(dto.getRoomNumber());
        doctor.setConsultationFee(dto.getConsultationFee());
        doctor.setAvailableTime(dto.getAvailableTime());

        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());

        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            doctor.setPassword(dto.getPassword());
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        } else if (dto.getId() == null) {
            throw new RuntimeException("Password is required for new doctor!");
        }

        User savedUser = userRepository.save(user);
        doctor.setUser(savedUser);

        return doctorRepository.save(doctor);
    }

    public Appointment updateAppointmentStatus(Long appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + appointmentId));

        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }
}