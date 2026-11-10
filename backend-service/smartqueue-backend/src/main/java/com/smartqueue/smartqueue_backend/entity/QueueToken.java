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

    // ==============================
    // BASIC QUEUE DETAILS
    // ==============================

    private String tokenNumber;

    private String department;

    // WAITING, IN-PROGRESS, COMPLETED, SKIPPED
    private String status;

    // Actual Doctor ID
    private Long doctorId;

    // IMPORTANT:
    // Patient ka User ID store hoga.
    // Is ID se User table se real age aur gender fetch karenge.
    private Long patientId;

    // Patient name
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

    // Token creation time
    private LocalDateTime createdAt;

    // Last update time
    private LocalDateTime updatedAt;


    // ==============================
    // CUSTOM CONSTRUCTOR
    // For DataInitializer
    // ==============================

    public QueueToken(
            String tokenNumber,
            String department,
            String status
    ) {
        this.tokenNumber = tokenNumber;
        this.department = department;
        this.status = status;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }


    // ==============================
    // CUSTOM CONSTRUCTOR
    // WITH DOCTOR ID
    // ==============================

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


    // ==============================
    // BEFORE INSERT
    // ==============================

    @PrePersist
    protected void onCreate() {

        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }

        this.updatedAt = LocalDateTime.now();
    }


    // ==============================
    // BEFORE UPDATE
    // ==============================

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}