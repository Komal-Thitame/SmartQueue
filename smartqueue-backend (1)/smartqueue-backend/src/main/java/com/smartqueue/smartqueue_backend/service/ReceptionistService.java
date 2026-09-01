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

        Doctor doctor =
                doctorRepository.findById(dto.getDoctorId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Doctor not found with id: "
                                                + dto.getDoctorId()
                                )
                        );


        // Doctor ke total tokens count karke
        // agla token number set karein

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


        return appointmentRepository.save(
                appointment
        );
    }


    // =====================================================
    // 2. GET APPOINTMENTS BY DOCTOR AND STATUS
    // =====================================================

    public List<Appointment>
    getAppointmentsByDoctorAndStatus(
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
    // 3. GET ALL TODAY'S APPOINTMENTS
    // =====================================================

    public List<Appointment>
    getTodayAppointments() {

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


        appointment.setStatus(
                status
        );


        appointmentRepository.save(
                appointment
        );
    }


    // =====================================================
    // 5. GET ALL PATIENTS
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
}