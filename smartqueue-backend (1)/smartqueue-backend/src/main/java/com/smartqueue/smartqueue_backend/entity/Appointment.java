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

    // Age
    private Integer age;

    // Gender
    private String gender;

    // Token Number
    private Integer tokenNumber;

    // Appointment Date
    private String appointmentDate;

    // Appointment Status
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status = AppointmentStatus.WAITING;

    /*
     * Statuses:
     * WAITING
     * IN_CONSULTATION
     * COMPLETED
     * CANCELLED
     * MISSED
     * BOOKED
     */

    // Appointment creation time
    private LocalDateTime createdAt = LocalDateTime.now();

    // Doctor relation
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    // Patient ID
    @Column(name = "patient_id")
    private Long patientId;

    // Booking Source
    // ONLINE = Patient ne khud appointment book ki
    // RECEPTION = Receptionist ne patient ke liye appointment book ki
    @Column(name = "booking_source")
    private String bookingSource;

    /*
     * Patient history se appointment hide karne ke liye.
     *
     * Database se appointment permanently delete nahi hogi.
     *
     * Boolean use kiya hai kyunki database mein purane records
     * mein history_hidden NULL ho sakta hai.
     */
    @Column(name = "history_hidden")
    private Boolean historyHidden = false;

    // ============================
    // TRANSIENT FIELDS
    // ============================

    /*
     * Ye fields database mein store nahi hongi.
     * Sirf API response / queue calculation ke liye use hongi.
     */

    @Transient
    private Integer patientsAhead;

    @Transient
    private Integer estimatedWaitTime;

    @Transient
    private String currentServingToken;
}