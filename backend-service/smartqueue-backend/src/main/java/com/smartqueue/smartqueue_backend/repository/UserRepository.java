package com.smartqueue.smartqueue_backend.repository;

import com.smartqueue.smartqueue_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import com.smartqueue.smartqueue_backend.entity.Role;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    // ==========================================
    // RECEPTIONIST - SEARCH PATIENT
    // ==========================================

    List<User> findByRoleAndNameContainingIgnoreCase(
            Role role,
            String name
    );
}