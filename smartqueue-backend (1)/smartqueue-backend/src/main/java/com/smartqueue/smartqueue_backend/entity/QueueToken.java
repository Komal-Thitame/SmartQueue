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
    private String status; // WAITING, SERVING, COMPLETED, SKIPPED

    private Long doctorId;

    // 🟢 Yeh line add karna zaroori hai taaki setPatientName error na aaye
    private String patientName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Custom Constructor specifically for DataInitializer (3 arguments)
    public QueueToken(String tokenNumber, String department, String status) {
        this.tokenNumber = tokenNumber;
        this.department = department;
        this.status = status;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Custom Constructor with doctorId (4 arguments)
    public QueueToken(String tokenNumber, String department, String status, Long doctorId) {
        this.tokenNumber = tokenNumber;
        this.department = department;
        this.status = status;
        this.doctorId = doctorId;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}