package com.smartqueue.smartqueue_backend.repository;

import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

    Long countByDoctorId(Long doctorId);

    List<Appointment> findByPatientId(Long patientId);

    // 🟢 Is token number se chhote aur WAITING status wale total appointments count karne ke liye
    long countByDoctorIdAndStatusAndTokenNumberLessThan(Long doctorId, AppointmentStatus status, Integer tokenNumber);

    long countByDoctorIdAndAppointmentDateAndStatusAndTokenNumberLessThan(
            Long doctorId, String appointmentDate, AppointmentStatus status, int tokenNumber
    );
    // 🟢 Doctor ka currently serving ya sabse pehla active token nikalne ke liye
    List<Appointment> findByDoctorIdAndStatusOrderByTokenNumberAsc(Long doctorId, AppointmentStatus status);
    List<Appointment> findByDoctorId(Long doctorId);
}
