package com.smartqueue.smartqueue_backend.service;

import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.entity.Doctor;
import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.repository.AppointmentRepository;
import com.smartqueue.smartqueue_backend.repository.DoctorRepository;
import com.smartqueue.smartqueue_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository; // UserRepository inject kiya

    // Appointment book karne aur token generate karne ka method
    public Appointment bookAppointment(Long doctorId, Appointment appointmentDetails) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));

        // Agar frontend se patientId aayi hai, toh User table se naam aur phone fetch karke set karein
        if (appointmentDetails.getPatientId() != null) {
            User patient = userRepository.findById(appointmentDetails.getPatientId()).orElse(null);
            if (patient != null) {
                appointmentDetails.setPatientName(patient.getName());
                appointmentDetails.setPatientPhone(patient.getPhone());
            }
        }

        // Doctor ke total bookings count karke naya token number assign karna
        long count = appointmentRepository.countByDoctorId(doctorId);
        int nextToken = (int) count + 1;

        appointmentDetails.setDoctor(doctor);
        appointmentDetails.setTokenNumber(nextToken);
        appointmentDetails.setStatus(AppointmentStatus.WAITING);

        return appointmentRepository.save(appointmentDetails);
    }

    // Specific doctor aur status ke hisaab se appointments laana
    public List<Appointment> getAppointmentsByDoctorAndStatus(Long doctorId, AppointmentStatus status) {
        return appointmentRepository.findByDoctorIdAndStatus(doctorId, status);
    }

    // Patient ki appointments laana aur live queue tracking calculate karna
    public List<Appointment> getAppointmentsByPatientId(Long patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);

        for (Appointment appt : appointments) {
            if (appt.getDoctor() != null && appt.getStatus() == AppointmentStatus.WAITING) {
                Long doctorId = appt.getDoctor().getId();

                // 1. Is token se pehle kitne log WAITING mein hain
                long aheadCount = appointmentRepository.countByDoctorIdAndStatusAndTokenNumberLessThan(
                        doctorId, AppointmentStatus.WAITING, appt.getTokenNumber()
                );
                appt.setPatientsAhead((int) aheadCount);

                // 2. Estimated Wait Time (Har patient ka 5 min average maan kar)
                appt.setEstimatedWaitTime((int) (aheadCount * 5));

                // 3. Currently Serving Token pata karna
                List<Appointment> servingList = appointmentRepository.findByDoctorIdAndStatusOrderByTokenNumberAsc(
                        doctorId, AppointmentStatus.IN_CONSULTATION
                );
                if (!servingList.isEmpty()) {
                    appt.setCurrentServingToken("A-0" + servingList.get(0).getTokenNumber());
                } else {
                    List<Appointment> waitingList = appointmentRepository.findByDoctorIdAndStatusOrderByTokenNumberAsc(
                            doctorId, AppointmentStatus.WAITING
                    );
                    if (!waitingList.isEmpty()) {
                        appt.setCurrentServingToken("A-0" + waitingList.get(0).getTokenNumber());
                    } else {
                        appt.setCurrentServingToken("A-01");
                    }
                }
            }
        }

        return appointments;
    }
}