package com.smartqueue.smartqueue_backend.repository;

import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Kisi doctor ke specific status wale appointments dekhne ke liye
    List<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

    // Doctor ke aaj ke kul kitne tokens bane hain count karne ke liye
    Long countByDoctorId(Long doctorId);

    // 🟢 Patient ID ke basis par appointments fetch karne ke liye yeh line zaroori hai
    List<Appointment> findByPatientId(Long patientId);
}