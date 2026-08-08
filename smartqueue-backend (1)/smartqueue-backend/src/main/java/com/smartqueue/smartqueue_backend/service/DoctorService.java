package com.smartqueue.smartqueue_backend.service;

import com.smartqueue.smartqueue_backend.dto.DoctorDTO;
import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.entity.Doctor;
import com.smartqueue.smartqueue_backend.repository.AppointmentRepository;
import com.smartqueue.smartqueue_backend.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DoctorService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    // Doctor Add / Update Logic with Email Uniqueness Check
    public Doctor saveOrUpdateDoctor(DoctorDTO dto) {
        if (dto.getId() == null) {
            // Naya doctor add karte waqt validation
            if (doctorRepository.existsByEmail(dto.getEmail())) {
                throw new RuntimeException("Email already exists!");
            }
        } else {
            // Existing doctor update karte waqt validation (Apni ID ko chhodkar check karega)
            if (doctorRepository.existsByEmailAndIdNot(dto.getEmail(), dto.getId())) {
                throw new RuntimeException("Email already exists with another doctor!");
            }
        }

        Doctor doctor;
        if (dto.getId() != null) {
            doctor = doctorRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + dto.getId()));
        } else {
            doctor = new Doctor();
        }

        doctor.setName(dto.getName());
        doctor.setDepartment(dto.getDepartment());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setEmail(dto.getEmail());
        doctor.setPhone(dto.getPhone());
        doctor.setRoomNumber(dto.getRoomNumber());
        doctor.setConsultationFee(dto.getConsultationFee());
        doctor.setAvailableTime(dto.getAvailableTime());

        // Password update handling (Jab blank na ho tabhi set kare)
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            doctor.setPassword(dto.getPassword());
        }

        return doctorRepository.save(doctor);
    }

    // Status update karne ke liye (IN_CONSULTATION ya COMPLETED)
    public Appointment updateAppointmentStatus(Long appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + appointmentId));

        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }
}