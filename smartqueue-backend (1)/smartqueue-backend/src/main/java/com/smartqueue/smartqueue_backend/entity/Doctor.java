package com.smartqueue.smartqueue_backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "doctors")
@Data
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String phone;
    private String specialization;
    private String department;
    private Double consultationFee;
    private String roomNumber;
    private String availableTime;

    private Boolean active = true;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}