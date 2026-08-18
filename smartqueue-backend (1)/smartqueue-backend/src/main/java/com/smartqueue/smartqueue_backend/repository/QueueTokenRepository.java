package com.smartqueue.smartqueue_backend.repository;

import com.smartqueue.smartqueue_backend.entity.QueueToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QueueTokenRepository extends JpaRepository<QueueToken, Long> {

    Optional<QueueToken> findFirstByDepartmentAndStatusOrderByCreatedAtAsc(String department, String status);

    Optional<QueueToken> findFirstByDepartmentAndStatusOrderByUpdatedAtDesc(String department, String status);

    List<QueueToken> findByDepartmentAndStatus(String department, String status);

    List<QueueToken> findByDoctorIdAndStatusNot(Long doctorId, String status);

    // 🟢 ADD THIS: Doctor ke saare patients (History + Live) fetch karne ke liye
    List<QueueToken> findByDoctorId(Long doctorId);

}