package com.smartqueue.smartqueue_backend.dto;

import lombok.Data;

@Data
public class AppointmentDTO {

    private String patientName;

    private String patientPhone;

    private Long doctorId;

    // Patient ID
    private Long patientId;

    // Appointment Date
    private String appointmentDate;

    // Patient Age
    private Integer age;

    // Patient Gender
    private String gender;

    // Patient Address
    private String address;

    // Booking Source
    // ONLINE / RECEPTION
    private String bookingSource;
}