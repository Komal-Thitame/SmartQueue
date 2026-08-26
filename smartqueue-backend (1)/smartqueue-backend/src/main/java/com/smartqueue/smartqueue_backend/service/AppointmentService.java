package com.smartqueue.smartqueue_backend.service;

import com.smartqueue.smartqueue_backend.entity.Appointment;
import com.smartqueue.smartqueue_backend.entity.AppointmentStatus;
import com.smartqueue.smartqueue_backend.entity.Doctor;
import com.smartqueue.smartqueue_backend.entity.QueueToken;
import com.smartqueue.smartqueue_backend.entity.User;
import com.smartqueue.smartqueue_backend.repository.AppointmentRepository;
import com.smartqueue.smartqueue_backend.repository.DoctorRepository;
import com.smartqueue.smartqueue_backend.repository.QueueTokenRepository;
import com.smartqueue.smartqueue_backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QueueTokenRepository queueTokenRepository;


    // =====================================================
    // BOOK APPOINTMENT AND CREATE QUEUE TOKEN
    // =====================================================

    public Appointment bookAppointment(
            Long doctorId,
            Appointment appointmentDetails
    ) {

        // Doctor find karo
        Doctor doctor = doctorRepository
                .findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Doctor not found with id: " + doctorId
                        )
                );


        // =====================================================
        // PATIENT DETAILS USER TABLE SE FETCH KARO (WITH FALLBACK)
        // =====================================================

        User patient = null;

        if (appointmentDetails.getPatientId() != null) {
            patient = userRepository
                    .findById(appointmentDetails.getPatientId())
                    .orElse(null);
        }

        // Fallback: Agar patientId nahi mila, toh patient name se match karke dhoond lo
        if (patient == null && appointmentDetails.getPatientName() != null) {
            patient = userRepository.findAll().stream()
                    .filter(u -> u.getName() != null && u.getName().equalsIgnoreCase(appointmentDetails.getPatientName()))
                    .findFirst()
                    .orElse(null);
        }

        if (patient != null) {
            appointmentDetails.setPatientId(patient.getId());
            appointmentDetails.setPatientName(patient.getName());
            appointmentDetails.setPatientPhone(patient.getPhone());

            // 🟢 REAL PATIENT AGE & GENDER SET HO JAYEGI
            appointmentDetails.setAge(patient.getAge());
            appointmentDetails.setGender(patient.getGender());
        }


        // =====================================================
        // NEW TOKEN NUMBER GENERATE KARO
        // =====================================================

        long count =
                appointmentRepository.countByDoctorId(
                        doctorId
                );

        int nextToken =
                (int) count + 1;


        // =====================================================
        // APPOINTMENT DETAILS SET KARO
        // =====================================================

        appointmentDetails.setDoctor(
                doctor
        );

        appointmentDetails.setTokenNumber(
                nextToken
        );

        appointmentDetails.setStatus(
                AppointmentStatus.WAITING
        );

        // Agar appointment date nahi aayi hai toh aaj ki date set karein
        if (appointmentDetails.getAppointmentDate() == null) {
            appointmentDetails.setAppointmentDate(LocalDate.now().toString());
        }


        // =====================================================
        // SAVE APPOINTMENT
        // =====================================================

        Appointment savedAppointment =
                appointmentRepository.save(
                        appointmentDetails
                );


        // =====================================================
        // CREATE QUEUE TOKEN
        // =====================================================

        QueueToken queueToken =
                new QueueToken();


        // Example: A-01, A-02, A-10
        queueToken.setTokenNumber(
                "A-" + String.format(
                        "%02d",
                        nextToken
                )
        );


        // Doctor department
        queueToken.setDepartment(
                doctor.getDepartment()
        );


        // Initial queue status
        queueToken.setStatus(
                "WAITING"
        );


        // Doctor ID
        queueToken.setDoctorId(
                doctorId
        );


        // =====================================================
        // IMPORTANT: PATIENT ID SAVE KARO
        // =====================================================

        queueToken.setPatientId(
                savedAppointment.getPatientId()
        );


        // Patient Name
        queueToken.setPatientName(
                savedAppointment.getPatientName()
        );


        // =====================================================
        // SAVE QUEUE TOKEN
        // =====================================================

        queueTokenRepository.save(
                queueToken
        );


        return savedAppointment;
    }


    // =====================================================
    // GET APPOINTMENTS BY DOCTOR AND STATUS
    // =====================================================

    public List<Appointment> getAppointmentsByDoctorAndStatus(
            Long doctorId,
            AppointmentStatus status
    ) {

        return appointmentRepository
                .findByDoctorIdAndStatus(
                        doctorId,
                        status
                );
    }


    // =====================================================
    // GET PATIENT APPOINTMENTS WITH LIVE QUEUE TRACKING
    // =====================================================

    public List<Appointment> getAppointmentsByPatientId(
            Long patientId
    ) {

        List<Appointment> appointments =
                appointmentRepository
                        .findByPatientId(
                                patientId
                        );


        // Today's date
        String today =
                LocalDate.now().toString();


        for (Appointment appt : appointments) {

            if (appt.getDoctor() != null
                    &&
                    appt.getStatus()
                            == AppointmentStatus.WAITING) {


                Long doctorId =
                        appt.getDoctor().getId();


                // =====================================================
                // PATIENTS AHEAD COUNT
                // =====================================================

                long aheadCount =
                        appointmentRepository
                                .countByDoctorIdAndAppointmentDateAndStatusAndTokenNumberLessThan(

                                        doctorId,

                                        today,

                                        AppointmentStatus.WAITING,

                                        appt.getTokenNumber()
                                );


                appt.setPatientsAhead(
                        (int) aheadCount
                );


                // =====================================================
                // ESTIMATED WAIT TIME
                // Currently 5 minutes per patient
                // =====================================================

                appt.setEstimatedWaitTime(
                        (int) (aheadCount * 5)
                );


                // =====================================================
                // CURRENTLY SERVING TOKEN
                // =====================================================

                List<Appointment> servingList =
                        appointmentRepository
                                .findByDoctorIdAndStatusOrderByTokenNumberAsc(

                                        doctorId,

                                        AppointmentStatus.IN_CONSULTATION
                                );


                if (!servingList.isEmpty()) {

                    appt.setCurrentServingToken(
                            "A-"
                                    + String.format(
                                    "%02d",
                                    servingList
                                            .get(0)
                                            .getTokenNumber()
                            )
                    );

                } else {

                    List<Appointment> waitingList =
                            appointmentRepository
                                    .findByDoctorIdAndStatusOrderByTokenNumberAsc(

                                            doctorId,

                                            AppointmentStatus.WAITING
                                    );


                    if (!waitingList.isEmpty()) {

                        appt.setCurrentServingToken(
                                "A-"
                                        + String.format(
                                        "%02d",
                                        waitingList
                                                .get(0)
                                                .getTokenNumber()
                                )
                        );

                    } else {

                        appt.setCurrentServingToken(
                                "None"
                        );
                    }
                }
            }
        }


        return appointments;
    }
}