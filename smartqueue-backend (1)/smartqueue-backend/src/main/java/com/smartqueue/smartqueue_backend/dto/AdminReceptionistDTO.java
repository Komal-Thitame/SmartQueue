package com.smartqueue.smartqueue_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminReceptionistDTO {
    private String name;
    private String email;
    private String phone;
    private String employeeId;
    private String counterNumber;
    private String shift;
    private String temporaryPassword;
}