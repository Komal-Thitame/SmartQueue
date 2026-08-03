package com.smartqueue.smartqueue_backend.repository;

import com.smartqueue.smartqueue_backend.entity.QueueToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QueueTokenRepository extends JpaRepository<QueueToken, Long> {

    // 1. Find first token by department and status, ordered by createdAt Ascending
    Optional<QueueToken> findFirstByDepartmentAndStatusOrderByCreatedAtAsc(String department, String status);

    // 2. Find first token by department and status, ordered by updatedAt Descending
    Optional<QueueToken> findFirstByDepartmentAndStatusOrderByUpdatedAtDesc(String department, String status);

    // 3. Find list of tokens by department and status
    List<QueueToken> findByDepartmentAndStatus(String department, String status);
}