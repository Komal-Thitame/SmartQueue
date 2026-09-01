package com.smartqueue.smartqueue_backend.service;

import com.smartqueue.smartqueue_backend.dto.AppointmentDTO;
import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.entity.Doctor;
import com.smartqueue.smartqueue_backend.entity.Role;
import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.repository.AppointmentRepository;
import com.smartqueue.smartqueue_backend.repository.DoctorRepository;
import com.smartqueue.smartqueue_backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReceptionistService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;


    // =====================================================
    // 1. BOOK / GENERATE NEW TOKEN
    // =====================================================

    public Appointment bookAppointment(AppointmentDTO dto) {

        Doctor doctor = doctorRepository
                .findById(dto.getDoctorId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Doctor not found with id: "
                                        + dto.getDoctorId()
                        )
                );

        Long currentCount =
                appointmentRepository.countByDoctorId(
                        doctor.getId()
                );

        int nextTokenNumber =
                currentCount.intValue() + 1;

        Appointment appointment =
                new Appointment();

        appointment.setPatientName(
                dto.getPatientName()
        );

        appointment.setPatientPhone(
                dto.getPatientPhone()
        );

        appointment.setTokenNumber(
                nextTokenNumber
        );

        appointment.setStatus(
                AppointmentStatus.WAITING
        );

        appointment.setDoctor(
                doctor
        );


        // =====================================================
        // NEW: PATIENT ID
        // =====================================================

        if (dto.getPatientId() != null) {

            appointment.setPatientId(
                    dto.getPatientId()
            );
        }


        // =====================================================
        // NEW: APPOINTMENT DATE
        // =====================================================

        if (dto.getAppointmentDate() != null
                && !dto.getAppointmentDate().trim().isEmpty()) {

            appointment.setAppointmentDate(
                    dto.getAppointmentDate()
            );

        } else {

            appointment.setAppointmentDate(
                    LocalDate.now().toString()
            );
        }


        // =====================================================
        // NEW: PATIENT AGE
        // =====================================================

        if (dto.getAge() != null) {

            appointment.setAge(
                    dto.getAge()
            );
        }


        // =====================================================
        // NEW: PATIENT GENDER
        // =====================================================

        if (dto.getGender() != null) {

            appointment.setGender(
                    dto.getGender()
            );
        }


        // =====================================================
        // NEW: BOOKING SOURCE
        // =====================================================

        if (dto.getBookingSource() != null
                && !dto.getBookingSource().trim().isEmpty()) {

            appointment.setBookingSource(
                    dto.getBookingSource()
            );

        } else {

            // Receptionist se booking hui hai
            appointment.setBookingSource(
                    "RECEPTION"
            );
        }


        // =====================================================
        // SAVE APPOINTMENT
        // =====================================================

        return appointmentRepository.save(
                appointment
        );
    }


    // =====================================================
    // 2. GET APPOINTMENTS BY DOCTOR AND STATUS
    // =====================================================

    public List<Appointment> getAppointmentsByDoctorAndStatus(
            Long doctorId,
            AppointmentStatus status
    ) {

        return appointmentRepository
                .findByDoctorIdAndStatus(
                        doctorId,
                        status
                );
    }


    // =====================================================
    // 3. GET TODAY'S APPOINTMENTS
    // =====================================================

    public List<Appointment> getTodayAppointments() {

        return appointmentRepository.findAll();
    }


    // =====================================================
    // 4. UPDATE APPOINTMENT STATUS
    // =====================================================

    public void updateAppointmentStatus(
            Long appointmentId,
            AppointmentStatus status
    ) {

        Appointment appointment =
                appointmentRepository
                        .findById(appointmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found with id: "
                                                + appointmentId
                                )
                        );

        appointment.setStatus(status);

        appointmentRepository.save(appointment);
    }


    // =====================================================
    // 5. GET ALL REGISTERED PATIENTS
    // =====================================================

    public List<User> getAllPatients() {

        return userRepository.findByRole(
                Role.PATIENT
        );
    }


    // =====================================================
    // 6. SEARCH PATIENT BY NAME
    // =====================================================

    public List<User> searchPatients(
            String name
    ) {

        return userRepository
                .findByRoleAndNameContainingIgnoreCase(
                        Role.PATIENT,
                        name
                );
    }


    // =====================================================
    // 7. REGISTER NEW PATIENT
    // =====================================================

    public User registerPatient(User patient) {

        // Check email
        if (patient.getEmail() == null
                || patient.getEmail().trim().isEmpty()) {

            throw new RuntimeException(
                    "Patient email is required."
            );
        }


        // Check duplicate email
        if (userRepository.existsByEmail(
                patient.getEmail()
        )) {

            throw new RuntimeException(
                    "Patient with this email already exists."
            );
        }


        // Check name
        if (patient.getName() == null
                || patient.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Patient name is required."
            );
        }


        // Check phone
        if (patient.getPhone() == null
                || patient.getPhone().trim().isEmpty()) {

            throw new RuntimeException(
                    "Patient phone is required."
            );
        }


        // Role automatically PATIENT
        patient.setRole(
                Role.PATIENT
        );


        // Active by default
        patient.setActive(
                true
        );


        // Default password
        if (patient.getPassword() == null
                || patient.getPassword()
                .trim()
                .isEmpty()) {

            patient.setPassword(
                    "Patient@123"
            );
        }


        // Save patient
        return userRepository.save(
                patient
        );
    }
}