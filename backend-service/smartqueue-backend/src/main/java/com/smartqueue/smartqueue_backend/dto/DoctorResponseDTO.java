package com.smartqueue.smartqueue_backend.dto;
import lombok.Data;

@Data
public class DoctorResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String specialization;
    private String department;
    private Double consultationFee;
    private String roomNumber;
    private String availableTime;
    private Boolean active;
}