package com.smartqueue.smartqueue_backend.dto;

import lombok.Data;

@Data
public class DoctorDTO {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String specialization;
    private String department;
    private Double consultationFee;
    private String roomNumber;
    private String availableTime;
}