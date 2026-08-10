package com.smartqueue.smartqueue_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "hospital_settings")
public class HospitalSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String hospitalName;
    private String opdBlock;
    private String contactPhone;
    private String email;

    @Column(length = 500)
    private String address;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public String getOpdBlock() { return opdBlock; }
    public void setOpdBlock(String opdBlock) { this.opdBlock = opdBlock; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}