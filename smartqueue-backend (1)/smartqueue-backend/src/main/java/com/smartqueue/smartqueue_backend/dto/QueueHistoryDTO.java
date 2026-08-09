package com.smartqueue.smartqueue_backend.dto;

import java.time.LocalDate;

public class QueueHistoryDTO {
    private LocalDate appointmentDate;
    private String doctorName;
    private String tokenNumber;
    private String status;

    public QueueHistoryDTO() {}

    public QueueHistoryDTO(LocalDate appointmentDate, String doctorName, String tokenNumber, String status) {
        this.appointmentDate = appointmentDate;
        this.doctorName = doctorName;
        this.tokenNumber = tokenNumber;
        this.status = status;
    }

    // Getters and Setters
    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}