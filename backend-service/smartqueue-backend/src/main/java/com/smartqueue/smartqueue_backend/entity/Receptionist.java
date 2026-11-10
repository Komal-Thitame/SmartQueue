package com.smartqueue.smartqueue_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "receptionists")
public class Receptionist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phone;

    @Column(unique = true, nullable = false)
    private String employeeId;

    private String counterNumber;
    private String shift;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    public Receptionist() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getCounterNumber() { return counterNumber; }
    public void setCounterNumber(String counterNumber) { this.counterNumber = counterNumber; }

    public String getShift() { return shift; }
    public void setShift(String shift) { this.shift = shift; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}