package com.smartqueue.smartqueue_backend.repository;

import com.smartqueue.smartqueue_backend.entity.QueueToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QueueRepository extends JpaRepository<QueueToken, Long> {
    List<QueueToken> findByDepartmentAndStatus(String department, String status);
    Optional<QueueToken> findFirstByDepartmentAndStatusOrderByCreatedAtAsc(String department, String status);
}