package com.smartqueue.smartqueue_backend.service;

import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.entity.Doctor;
import com.smartqueue.smartqueue_backend.repository.AppointmentRepository;
import com.smartqueue.smartqueue_backend.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    // Appointment book karne aur token generate karne ka method
    public Appointment bookAppointment(Long doctorId, Appointment appointmentDetails) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));

        // Doctor ke total bookings count karke naya token number assign karna
        long count = appointmentRepository.countByDoctorId(doctorId);
        int nextToken = (int) count + 1;

        appointmentDetails.setDoctor(doctor);
        appointmentDetails.setTokenNumber(nextToken);
        appointmentDetails.setStatus(AppointmentStatus.WAITING);

        return appointmentRepository.save(appointmentDetails);
    }

    // Specific doctor aur status ke hisaab se appointments laana
    public List<Appointment> getAppointmentsByDoctorAndStatus(Long doctorId, AppointmentStatus status) {
        return appointmentRepository.findByDoctorIdAndStatus(doctorId, status);
    }
}