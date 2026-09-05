import React, { useEffect, useMemo, useState } from "react";

import {
    FaArrowRight,
    FaUserClock,
    FaCalendarCheck,
    FaHeartbeat,
    FaCheckCircle,
    FaClock,
    FaUserMd,
    FaUsers,
    FaStethoscope,
    FaHospital,
    FaChevronRight
} from "react-icons/fa";

import { API_BASE_URL } from "../config";

import "./Hero.css";


function Hero() {

    const [appointments, setAppointments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [lastUpdated, setLastUpdated] = useState(null);


    /* =========================================================
       NORMALIZE STATUS
    ========================================================= */

    const normalizeStatus = (status) => {

        if (!status) return "";

        return String(status)
            .toUpperCase()
            .replace(/[- ]/g, "_");
    };


    /* =========================================================
       TOKEN NUMBER
    ========================================================= */

    const getTokenNumber = (appointment) => {

        const token =
            appointment?.tokenNumber ??
            appointment?.token ??
            appointment?.tokenNo;

        if (
            token === null ||
            token === undefined ||
            token === ""
        ) {
            return null;
        }

        const number = Number(token);

        return Number.isFinite(number)
            ? number
            : null;
    };


    /* =========================================================
       DOCTOR NAME
    ========================================================= */

    const getDoctorName = (appointment) => {

        return (
            appointment?.doctorName ||
            appointment?.doctor?.name ||
            appointment?.doctor?.fullName ||
            appointment?.doctor?.user?.name ||
            appointment?.doctor?.user?.fullName ||
            "Doctor"
        );
    };


    /* =========================================================
       DEPARTMENT
    ========================================================= */

    const getDepartment = (appointment) => {

        return (
            appointment?.department ||
            appointment?.doctor?.department ||
            appointment?.doctor?.specialization ||
            "General"
        );
    };


    /* =========================================================
       FETCH TODAY APPOINTMENTS
    ========================================================= */

    const fetchAppointments = async () => {

        try {

            const response = await fetch(
                `${API_BASE_URL}/receptionist/appointments/today`
            );


            if (!response.ok) {

                throw new Error(
                    `API Error: ${response.status}`
                );

            }


            const data = await response.json();


            if (Array.isArray(data)) {

                setAppointments(data);

            } else {

                setAppointments([]);

            }


            setLastUpdated(new Date());


        } catch (error) {

            console.error(
                "Hero appointment fetch error:",
                error
            );

            setAppointments([]);

        } finally {

            setLoading(false);

        }

    };


    /* =========================================================
       INITIAL LOAD + AUTO REFRESH
    ========================================================= */

    useEffect(() => {

        fetchAppointments();


        const interval = setInterval(() => {

            fetchAppointments();

        }, 15000);


        return () => {

            clearInterval(interval);

        };

    }, []);


    /* =========================================================
       REAL HERO DATA
    ========================================================= */

    const heroData = useMemo(() => {

        const validAppointments =
            appointments.filter(
                (appointment) =>
                    appointment !== null &&
                    appointment !== undefined
            );


        /* =====================================================
           TOTAL
        ===================================================== */

        const totalPatients =
            validAppointments.length;


        /* =====================================================
           WAITING
        ===================================================== */

        const waitingAppointments =
            validAppointments
                .filter(
                    (appointment) =>
                        normalizeStatus(
                            appointment.status
                        ) === "WAITING"
                )
                .sort(
                    (a, b) =>
                        (
                            getTokenNumber(a) ??
                            999999
                        ) -
                        (
                            getTokenNumber(b) ??
                            999999
                        )
                );


        /* =====================================================
           IN CONSULTATION
        ===================================================== */

        const consultationAppointments =
            validAppointments
                .filter(
                    (appointment) => {

                        const status =
                            normalizeStatus(
                                appointment.status
                            );

                        return (
                            status === "IN_CONSULTATION" ||
                            status === "IN_PROGRESS" ||
                            status === "SERVING"
                        );

                    }
                )
                .sort(
                    (a, b) =>
                        (
                            getTokenNumber(a) ??
                            999999
                        ) -
                        (
                            getTokenNumber(b) ??
                            999999
                        )
                );


        /* =====================================================
           COMPLETED
        ===================================================== */

        const completedAppointments =
            validAppointments.filter(
                (appointment) =>
                    normalizeStatus(
                        appointment.status
                    ) === "COMPLETED"
            );


        /* =====================================================
           CANCELLED
        ===================================================== */

        const cancelledAppointments =
            validAppointments.filter(
                (appointment) =>
                    normalizeStatus(
                        appointment.status
                    ) === "CANCELLED"
            );


        /* =====================================================
           MISSED
        ===================================================== */

        const missedAppointments =
            validAppointments.filter(
                (appointment) =>
                    normalizeStatus(
                        appointment.status
                    ) === "MISSED"
            );


        /* =====================================================
           CURRENT SERVING
        ===================================================== */

        const currentServing =
            consultationAppointments[0] || null;


        /* =====================================================
           NEXT WAITING PATIENT
        ===================================================== */

        const nextPatient =
            waitingAppointments[0] || null;


        /* =====================================================
           CURRENT TOKEN
        ===================================================== */

        const currentToken =
            currentServing
                ? getTokenNumber(currentServing)
                : null;


        /* =====================================================
           NEXT TOKEN
        ===================================================== */

        const nextToken =
            nextPatient
                ? getTokenNumber(nextPatient)
                : null;


        /* =====================================================
           ESTIMATED WAIT

           15 minutes / waiting patient
        ===================================================== */

        const estimatedWait =
            waitingAppointments.length * 15;


        /* =====================================================
           COMPLETION %
        ===================================================== */

        const successPercentage =
            totalPatients > 0
                ? Math.round(
                    (
                        completedAppointments.length /
                        totalPatients
                    ) * 100
                )
                : 0;


        /* =====================================================
           CURRENT DOCTOR
        ===================================================== */

        const doctorName =
            currentServing
                ? getDoctorName(currentServing)
                : nextPatient
                    ? getDoctorName(nextPatient)
                    : "No doctor serving";


        /* =====================================================
           DEPARTMENT
        ===================================================== */

        const department =
            currentServing
                ? getDepartment(currentServing)
                : nextPatient
                    ? getDepartment(nextPatient)
                    : "Hospital Queue";


        /* =====================================================
           CURRENT PATIENT
        ===================================================== */

        const currentPatient =
            currentServing?.patientName ||
            currentServing?.patient?.name ||
            "Patient";


        /* =====================================================
           NEXT PATIENT NAME
        ===================================================== */

        const nextPatientName =
            nextPatient?.patientName ||
            nextPatient?.patient?.name ||
            "Next Patient";


        return {

            totalPatients,

            waitingCount:
            waitingAppointments.length,

            consultationCount:
            consultationAppointments.length,

            completedCount:
            completedAppointments.length,

            cancelledCount:
            cancelledAppointments.length,

            missedCount:
            missedAppointments.length,

            successPercentage,

            estimatedWait,

            currentServing,

            nextPatient,

            currentToken,

            nextToken,

            doctorName,

            department,

            currentPatient,

            nextPatientName

        };

    }, [appointments]);


    /* =========================================================
       UPDATED TIME TEXT
    ========================================================= */

    const updatedText = useMemo(() => {

        if (!lastUpdated) {

            return "Updating...";

        }

        return "Updated just now";

    }, [lastUpdated]);


    return (

        <section
            className="hero"
            id="home"
        >


            {/* =================================================
                BACKGROUND
            ================================================= */}

            <div className="hero-bg-circle one"></div>

            <div className="hero-bg-circle two"></div>

            <div className="hero-grid"></div>

            <div className="hero-glow"></div>



            <div className="hero-container">


                {/* =================================================
                    LEFT SIDE
                ================================================= */}

                <div className="hero-content">


                    {/* Badge */}

                    <div className="hero-badge">

                        <span className="badge-icon">

                            <FaHeartbeat />

                        </span>


                        <span>
                            Smart Healthcare Queue System
                        </span>


                        <span className="badge-live">

                            <span className="badge-live-dot"></span>

                            LIVE

                        </span>

                    </div>



                    {/* Heading */}

                    <h1>

                        SmartQueue

                        <span>

                            Smart Waiting,

                            <br />

                            Better Healthcare

                        </span>

                    </h1>



                    {/* Description */}

                    <p className="hero-description">

                        A smarter way to manage hospital queues.
                        Book appointments, track your token and
                        stay updated with real-time queue information
                        without waiting unnecessarily.

                    </p>



                    {/* Buttons */}

                    <div className="hero-buttons">

                        <a
                            href="/register"
                            className="primary-btn"
                        >

                            <span>
                                Get Started
                            </span>


                            <span className="btn-icon">

                                <FaArrowRight />

                            </span>

                        </a>


                        <a
                            href="#features"
                            className="secondary-btn"
                        >

                            Explore Features

                            <FaChevronRight />

                        </a>

                    </div>



                    {/* Trust */}

                    <div className="hero-trust">


                        <div className="trust-item">

                            <span className="trust-icon">

                                <FaCheckCircle />

                            </span>

                            <div>

                                <strong>
                                    Real-Time
                                </strong>

                                <small>
                                    Queue Updates
                                </small>

                            </div>

                        </div>



                        <div className="trust-item">

                            <span className="trust-icon">

                                <FaCheckCircle />

                            </span>

                            <div>

                                <strong>
                                    Secure
                                </strong>

                                <small>
                                    Healthcare Platform
                                </small>

                            </div>

                        </div>



                        <div className="trust-item">

                            <span className="trust-icon">

                                <FaCheckCircle />

                            </span>

                            <div>

                                <strong>
                                    Easy
                                </strong>

                                <small>
                                    Appointment Booking
                                </small>

                            </div>

                        </div>


                    </div>

                </div>



                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <div className="queue-preview">


                    {/* Decorative circle */}

                    <div className="queue-orbit"></div>



                    {/* =================================================
                        TOP REAL DATA CARD
                    ================================================= */}

                    <div className="floating-card top">


                        <div className="floating-icon">

                            <FaUsers />

                        </div>


                        <div className="floating-content">

                            <strong>

                                {loading
                                    ? "..."
                                    : heroData.totalPatients
                                }

                            </strong>


                            <small>
                                Patients Today
                            </small>


                            <div className="mini-patient-row">

                                <span>
                                    <FaUserMd />
                                </span>

                                <span>
                                    <FaStethoscope />
                                </span>

                                <span>
                                    <FaHeartbeat />
                                </span>


                                {heroData.totalPatients > 3 && (

                                    <b>

                                        +{heroData.totalPatients - 3}

                                    </b>

                                )}

                            </div>

                        </div>

                    </div>



                    {/* =================================================
                        MAIN QUEUE CARD
                        ONLY ONE MAIN CARD
                    ================================================= */}

                    <div className="queue-card">


                        {/* Accent */}

                        <div className="queue-accent"></div>



                        {/* Header */}

                        <div className="queue-header">


                            <div className="queue-title">


                                <span className="queue-title-icon">

                                    <FaHospital />

                                </span>


                                <div>

                                    <h3>
                                        Live Queue
                                    </h3>

                                    <small>
                                        {heroData.department}
                                    </small>

                                </div>

                            </div>



                            <div className="online-status">

                                <span></span>

                                LIVE

                            </div>

                        </div>



                        <div className="queue-divider"></div>



                        {/* =================================================
                            DOCTOR VISUAL
                        ================================================= */}

                        <div className="doctor-visual">


                            <div className="doctor-glow"></div>


                            <div className="doctor-avatar">

                                <FaUserMd />

                            </div>


                            <div className="doctor-status-dot"></div>


                            <div className="doctor-mini-badge">

                                <FaHeartbeat />

                            </div>

                        </div>



                        {/* =================================================
                            NOW SERVING
                        ================================================= */}

                        <div className="serving">


                            <p>
                                NOW SERVING
                            </p>


                            <h2>

                                {loading

                                    ? "..."

                                    : heroData.currentToken !== null

                                        ? `A${String(
                                            heroData.currentToken
                                        ).padStart(2, "0")}`

                                        : "--"

                                }

                            </h2>


                            <div className="doctor-room">

                                <FaUserMd />


                                <span className="doctor-name-text">

                                    {heroData.doctorName}

                                </span>


                                <span className="room-separator">
                                    •
                                </span>


                                <span>

                                    {heroData.currentServing?.roomNumber ||
                                        heroData.currentServing?.doctorRoom ||
                                        "Queue Active"
                                    }

                                </span>

                            </div>

                        </div>



                        {/* =================================================
                            INFO
                        ================================================= */}

                        <div className="queue-info">


                            {/* Waiting */}

                            <div className="queue-info-item">


                                <span className="info-icon">

                                    <FaUserClock />

                                </span>


                                <div>

                                    <small>
                                        Waiting
                                    </small>


                                    <strong>

                                        {loading
                                            ? "..."
                                            : heroData.waitingCount
                                        }

                                    </strong>


                                    <span>
                                        Patients
                                    </span>

                                </div>

                            </div>



                            <div className="queue-info-divider"></div>



                            {/* Estimated */}

                            <div className="queue-info-item">


                                <span className="info-icon clock">

                                    <FaClock />

                                </span>


                                <div>

                                    <small>
                                        Estimated Wait
                                    </small>


                                    <strong>

                                        {loading
                                            ? "..."
                                            : heroData.estimatedWait
                                        }


                                        {!loading && (

                                            <em>
                                                min
                                            </em>

                                        )}

                                    </strong>


                                    <span>
                                        Approx.
                                    </span>

                                </div>

                            </div>

                        </div>



                        {/* =================================================
                            COMPLETION
                        ================================================= */}

                        <div className="queue-progress">


                            <div className="progress-header">

                                <span>
                                    Today's Completed
                                </span>


                                <strong>

                                    {loading
                                        ? "..."
                                        : `${heroData.successPercentage}%`
                                    }

                                </strong>

                            </div>


                            <div className="progress-bar">

                                <span
                                    style={{
                                        width:
                                            `${heroData.successPercentage}%`
                                    }}
                                ></span>

                            </div>

                        </div>



                        {/* =================================================
                            NEXT PATIENT
                        ================================================= */}

                        <div className="next-patient">


                            <div className="next-patient-icon">

                                <FaUserClock />

                            </div>


                            <div className="next-patient-content">

                                <small>
                                    NEXT PATIENT
                                </small>


                                <strong>

                                    {loading

                                        ? "..."

                                        : heroData.nextToken !== null

                                            ? `A${String(
                                                heroData.nextToken
                                            ).padStart(2, "0")}`

                                            : "No waiting patient"

                                    }

                                </strong>

                            </div>


                            <span className="next-patient-name">

                                {!loading &&
                                    heroData.nextPatient &&
                                    heroData.nextPatientName
                                }

                            </span>


                            <span className="next-arrow">

                                →

                            </span>

                        </div>



                        {/* =================================================
                            FOOTER
                        ================================================= */}

                        <div className="queue-footer">


                            <span>

                                <span className="footer-dot"></span>


                                {heroData.waitingCount > 0

                                    ? "Queue is active"

                                    : heroData.consultationCount > 0

                                        ? "Consultation in progress"

                                        : "No patients waiting"

                                }

                            </span>


                            <span>
                                {updatedText}
                            </span>

                        </div>


                    </div>



                    {/* =================================================
                        BOTTOM SUCCESS CARD
                    ================================================= */}

                    <div className="floating-card bottom">


                        <div className="floating-icon calendar">

                            <FaCalendarCheck />

                        </div>


                        <div className="floating-content">


                            <strong>

                                {loading
                                    ? "..."
                                    : `${heroData.successPercentage}%`
                                }

                            </strong>


                            <small>
                                Appointment Success
                            </small>


                            <div className="success-progress">

                                <span
                                    style={{
                                        width:
                                            `${heroData.successPercentage}%`
                                    }}
                                ></span>

                            </div>

                        </div>


                        <span className="floating-check">

                            ✓

                        </span>

                    </div>



                    {/* Decorative dots */}

                    <span className="visual-dot dot-one"></span>

                    <span className="visual-dot dot-two"></span>

                    <span className="visual-dot dot-three"></span>

                    <span className="visual-dot dot-four"></span>


                </div>

            </div>

        </section>

    );

}


export default Hero;