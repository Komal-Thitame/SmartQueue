package com.smartqueue.smartqueue_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "queue_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueueToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tokenNumber;

    private String department;

    // WAITING, IN-PROGRESS, COMPLETED, SKIPPED
    private String status;

    private Long doctorId;

    private String patientName;

    // ==============================
    // CONSULTATION TIME TRACKING
    // ==============================

    // Doctor clicks "Start Checkup"
    private LocalDateTime consultationStartTime;

    // Doctor clicks "Finish"
    private LocalDateTime consultationEndTime;

    // Actual consultation duration in minutes
    private Integer actualConsultationMinutes;


    // ==============================
    // AUDIT FIELDS
    // ==============================

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    // Custom Constructor for DataInitializer
    public QueueToken(String tokenNumber, String department, String status) {
        this.tokenNumber = tokenNumber;
        this.department = department;
        this.status = status;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }


    // Custom Constructor with doctorId
    public QueueToken(
            String tokenNumber,
            String department,
            String status,
            Long doctorId
    ) {
        this.tokenNumber = tokenNumber;
        this.department = department;
        this.status = status;
        this.doctorId = doctorId;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }


    @PrePersist
    protected void onCreate() {

        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }

        this.updatedAt = LocalDateTime.now();
    }


    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}