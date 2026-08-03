package com.smartqueue.smartqueue_backend.dto;

import lombok.Data;

@Data
public class AppointmentDTO {
    private String patientName;
    private String patientPhone;
    private Long doctorId;
}