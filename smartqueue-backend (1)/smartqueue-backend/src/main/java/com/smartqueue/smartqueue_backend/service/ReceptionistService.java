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
import org.springframework.security.crypto.password.PasswordEncoder;
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

    @Autowired
    private PasswordEncoder passwordEncoder;


    // =====================================================
    // 1. BOOK / GENERATE NEW TOKEN
    // =====================================================

    public Appointment bookAppointment(AppointmentDTO dto) {

        if (dto.getDoctorId() == null) {
            throw new RuntimeException("Doctor is required.");
        }

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

        // Patient Name
        appointment.setPatientName(
                dto.getPatientName()
        );

        // Patient Phone
        appointment.setPatientPhone(
                dto.getPatientPhone()
        );

        // Token Number
        appointment.setTokenNumber(
                nextTokenNumber
        );

        // Status
        appointment.setStatus(
                AppointmentStatus.WAITING
        );

        // Doctor
        appointment.setDoctor(
                doctor
        );


        // =====================================================
        // PATIENT ID
        // =====================================================

        if (dto.getPatientId() != null) {

            appointment.setPatientId(
                    dto.getPatientId()
            );
        }


        // =====================================================
        // APPOINTMENT DATE
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
        // PATIENT AGE
        // =====================================================

        if (dto.getAge() != null) {

            appointment.setAge(
                    dto.getAge()
            );
        }


        // =====================================================
        // PATIENT GENDER
        // =====================================================

        if (dto.getGender() != null) {

            appointment.setGender(
                    dto.getGender()
            );
        }


        // =====================================================
        // BOOKING SOURCE
        // =====================================================

        if (dto.getBookingSource() != null
                && !dto.getBookingSource().trim().isEmpty()) {

            appointment.setBookingSource(
                    dto.getBookingSource()
            );

        } else {

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

        String today =
                LocalDate.now().toString();

        return appointmentRepository
                .findByAppointmentDate(today);
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

        appointmentRepository.save(
                appointment
        );
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
    // 6. GET ALL DOCTORS
    // =====================================================

    public List<Doctor> getAllDoctors() {

        return doctorRepository.findAll();
    }


    // =====================================================
    // 7. SEARCH PATIENT BY NAME
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
    // 8. REGISTER NEW PATIENT
    // =====================================================

    public User registerPatient(User patient) {

        // -------------------------------------------------
        // CHECK EMAIL
        // -------------------------------------------------

        if (patient.getEmail() == null
                || patient.getEmail().trim().isEmpty()) {

            throw new RuntimeException(
                    "Patient email is required."
            );
        }


        // -------------------------------------------------
        // CHECK DUPLICATE EMAIL
        // -------------------------------------------------

        if (userRepository.existsByEmail(
                patient.getEmail()
        )) {

            throw new RuntimeException(
                    "Patient with this email already exists."
            );
        }


        // -------------------------------------------------
        // CHECK NAME
        // -------------------------------------------------

        if (patient.getName() == null
                || patient.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Patient name is required."
            );
        }


        // -------------------------------------------------
        // CHECK PHONE
        // -------------------------------------------------

        if (patient.getPhone() == null
                || patient.getPhone().trim().isEmpty()) {

            throw new RuntimeException(
                    "Patient phone is required."
            );
        }


        // -------------------------------------------------
        // ROLE = PATIENT
        // -------------------------------------------------

        patient.setRole(
                Role.PATIENT
        );


        // -------------------------------------------------
        // ACTIVE = TRUE
        // -------------------------------------------------

        patient.setActive(
                true
        );


        // -------------------------------------------------
        // DEFAULT PASSWORD
        // -------------------------------------------------

        if (patient.getPassword() == null
                || patient.getPassword()
                .trim()
                .isEmpty()) {

            patient.setPassword(
                    passwordEncoder.encode(
                            "Patient@123"
                    )
            );

        } else {

            patient.setPassword(
                    passwordEncoder.encode(
                            patient.getPassword()
                    )
            );
        }


        // -------------------------------------------------
        // SAVE PATIENT
        // -------------------------------------------------

        return userRepository.save(
                patient
        );
    }
}