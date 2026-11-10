package com.smartqueue.smartqueue_backend.repository;

import com.smartqueue.smartqueue_backend.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByEmail(String email);

    // 🟢 FIXED: Kyunki user relation hai, isiliye @Query ka use karke user_id match karenge
    @Query("SELECT d FROM Doctor d WHERE d.user.id = :userId")
    Optional<Doctor> findByUserId(@Param("userId") Long userId);

    // 1. Naya doctor add karte waqt check karne ke liye
    boolean existsByEmail(String email);

    // 2. Doctor update karte waqt check karne ke liye
    boolean existsByEmailAndIdNot(String email, Long id);
}