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

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status = AppointmentStatus.WAITING;
    // Statuses: WAITING, IN_CONSULTATION, COMPLETED, CANCELLED

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Transient
    private Long patientId;

}