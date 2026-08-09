package com.smartqueue.smartqueue_backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PatientOverviewDTO {
    private Long id;
    private String patientCustomId;
    private String name;
    private String email;
    private String phone;
    private Boolean active;
    private LocalDateTime createdAt;
    private List<QueueHistoryDTO> queueHistory;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPatientCustomId() { return patientCustomId; }
    public void setPatientCustomId(String patientCustomId) { this.patientCustomId = patientCustomId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<QueueHistoryDTO> getQueueHistory() { return queueHistory; }
    public void setQueueHistory(List<QueueHistoryDTO> queueHistory) { this.queueHistory = queueHistory; }
}