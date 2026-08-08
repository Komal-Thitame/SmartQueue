package com.smartqueue.smartqueue_backend.repository;

import com.smartqueue.smartqueue_backend.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByEmail(String email);

    // 1. Naya doctor add karte waqt check karne ke liye
    boolean existsByEmail(String email);

    // 2. Doctor update karte waqt check karne ke liye (Aapki ID chhodkar kisi aur doctor ka email duplicate hai ya nahi)
    boolean existsByEmailAndIdNot(String email, Long id);
}