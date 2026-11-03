package com.smartqueue.smartqueue_backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReceptionistResponseDTO {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private Boolean active;
    private LocalDateTime createdAt;
}