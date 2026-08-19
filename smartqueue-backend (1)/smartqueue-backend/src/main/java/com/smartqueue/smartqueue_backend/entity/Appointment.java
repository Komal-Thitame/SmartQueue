package com.smartqueue.smartqueue_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String patientName;
    private String patientPhone;
    private Integer tokenNumber;

    // 🟢 Yeh naya field add kiya gaya hai appointment ki date store karne ke liye (e.g., "2026-08-19")
    private String appointmentDate;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status = AppointmentStatus.WAITING;
    // Statuses: WAITING, IN_CONSULTATION, COMPLETED, CANCELLED, MISSED, BOOKED

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(name = "patient_id")
    private Long patientId;

    @Transient
    private Integer patientsAhead;

    @Transient
    private Integer estimatedWaitTime;

    @Transient
    private String currentServingToken;
}