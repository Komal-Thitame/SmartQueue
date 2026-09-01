package com.smartqueue.smartqueue_backend.repository;

import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Existing methods
    List<Appointment> findByDoctorIdAndStatus(
            Long doctorId,
            AppointmentStatus status
    );

    Long countByDoctorId(Long doctorId);

    List<Appointment> findByPatientId(Long patientId);

    // Token number se chhote WAITING appointments count karne ke liye
    long countByDoctorIdAndStatusAndTokenNumberLessThan(
            Long doctorId,
            AppointmentStatus status,
            Integer tokenNumber
    );

    long countByDoctorIdAndAppointmentDateAndStatusAndTokenNumberLessThan(
            Long doctorId,
            String appointmentDate,
            AppointmentStatus status,
            int tokenNumber
    );

    // Doctor ke status-wise appointments
    List<Appointment> findByDoctorIdAndStatusOrderByTokenNumberAsc(
            Long doctorId,
            AppointmentStatus status
    );

    // Doctor ke saare appointments
    List<Appointment> findByDoctorId(Long doctorId);


    // ==========================================
    // RECEPTIONIST - ALL APPOINTMENTS
    // ==========================================

    // Receptionist ke liye saare appointments
    // Latest appointment pehle show hogi
    List<Appointment> findAllByOrderByCreatedAtDesc();


    // ==========================================
    // NEW METHODS - DOCTOR QUEUE / MY PATIENTS
    // ==========================================

    // Sirf ek specific date ke doctor appointments
    List<Appointment> findByDoctorIdAndAppointmentDate(
            Long doctorId,
            String appointmentDate
    );

    // Specific date + status ke appointments
    List<Appointment> findByDoctorIdAndAppointmentDateAndStatus(
            Long doctorId,
            String appointmentDate,
            AppointmentStatus status
    );

    // Specific date ke appointments token order me
    List<Appointment> findByDoctorIdAndAppointmentDateOrderByTokenNumberAsc(
            Long doctorId,
            String appointmentDate
    );

    // Specific date + status ke appointments token order me
    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusOrderByTokenNumberAsc(
            Long doctorId,
            String appointmentDate,
            AppointmentStatus status
    );
}