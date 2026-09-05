import React, { useEffect, useMemo, useState } from "react";

import {
    FaArrowRight,
    FaHeartbeat,
    FaCheckCircle,
    FaClock,
    FaUserMd,
    FaUsers,
    FaStethoscope,
    FaHospital,
    FaChevronRight,
    FaCircle,
    FaUserClock
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
       DOCTOR ID
    ========================================================= */

    const getDoctorId = (appointment) => {

        return (
            appointment?.doctorId ??
            appointment?.doctor?.id ??
            appointment?.doctor?.user?.id ??
            null
        );

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
            appointment?.doctor?.speciality ||
            "General"
        );

    };


    /* =========================================================
       PATIENT NAME
    ========================================================= */

    const getPatientName = (appointment) => {

        return (
            appointment?.patientName ||
            appointment?.patient?.name ||
            "Patient"
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
       HERO DATA
    ========================================================= */

    const heroData = useMemo(() => {

        const validAppointments =
            appointments.filter(
                (appointment) =>
                    appointment !== null &&
                    appointment !== undefined
            );


        /* =====================================================
           TOTAL PATIENTS
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
                .filter((appointment) => {

                    const status =
                        normalizeStatus(
                            appointment.status
                        );

                    return (
                        status === "IN_CONSULTATION" ||
                        status === "IN_PROGRESS" ||
                        status === "SERVING"
                    );

                })
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
           CURRENT SERVING
        ===================================================== */

        const currentServing =
            consultationAppointments[0] || null;


        /* =====================================================
           ESTIMATED WAIT

           15 MINUTES PER WAITING PATIENT
        ===================================================== */

        const estimatedWait =
            waitingAppointments.length * 15;


        /* =====================================================
           DOCTOR GROUPS

           Group appointments doctor-wise.
        ===================================================== */

        const doctorMap = {};


        validAppointments.forEach((appointment) => {

            const doctorId =
                getDoctorId(appointment);

            const doctorName =
                getDoctorName(appointment);

            /*
             * Prefer doctor ID.
             * If ID is not available, use doctor name.
             */

            const key =
                doctorId !== null
                    ? `doctor-${doctorId}`
                    : `doctor-${doctorName}`;


            if (!doctorMap[key]) {

                doctorMap[key] = {

                    doctorId,

                    doctorName,

                    department:
                        getDepartment(appointment),

                    appointments: []

                };

            }


            doctorMap[key]
                .appointments
                .push(appointment);

        });


        /* =====================================================
           DOCTOR QUEUES
        ===================================================== */

        const doctorQueues =
            Object.values(doctorMap)
                .map((doctor) => {

                    const doctorAppointments =
                        doctor.appointments;


                    /* -----------------------------------------
                       WAITING
                    ----------------------------------------- */

                    const waiting =
                        doctorAppointments
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


                    /* -----------------------------------------
                       SERVING
                    ----------------------------------------- */

                    const serving =
                        doctorAppointments
                            .filter((appointment) => {

                                const status =
                                    normalizeStatus(
                                        appointment.status
                                    );

                                return (
                                    status ===
                                    "IN_CONSULTATION" ||
                                    status ===
                                    "IN_PROGRESS" ||
                                    status ===
                                    "SERVING"
                                );

                            })
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
                            )[0] || null;


                    /* -----------------------------------------
                       COMPLETED
                    ----------------------------------------- */

                    const completed =
                        doctorAppointments.filter(
                            (appointment) =>
                                normalizeStatus(
                                    appointment.status
                                ) === "COMPLETED"
                        );


                    /* -----------------------------------------
                       CANCELLED
                    ----------------------------------------- */

                    const cancelled =
                        doctorAppointments.filter(
                            (appointment) =>
                                normalizeStatus(
                                    appointment.status
                                ) === "CANCELLED"
                        );


                    /* -----------------------------------------
                       CURRENT TOKEN
                    ----------------------------------------- */

                    const currentToken =
                        serving
                            ? getTokenNumber(serving)
                            : waiting.length > 0
                                ? getTokenNumber(waiting[0])
                                : null;


                    /* -----------------------------------------
                       DOCTOR STATUS
                    ----------------------------------------- */

                    let status = "AVAILABLE";

                    if (serving) {

                        status = "IN CONSULTATION";

                    } else if (waiting.length > 0) {

                        status = "WAITING";

                    }


                    return {

                        doctorId:
                        doctor.doctorId,

                        doctorName:
                        doctor.doctorName,

                        department:
                        doctor.department,

                        waitingCount:
                        waiting.length,

                        completedCount:
                        completed.length,

                        cancelledCount:
                        cancelled.length,

                        serving,

                        currentToken,

                        status

                    };

                })
                .sort((a, b) => {

                    const order = {

                        "IN CONSULTATION": 1,

                        "WAITING": 2,

                        "AVAILABLE": 3

                    };

                    return (
                        order[a.status] -
                        order[b.status]
                    );

                });


        /* =====================================================
           ACTIVE DOCTORS
        ===================================================== */

        const activeDoctors =
            doctorQueues.filter(
                (doctor) =>
                    doctor.status ===
                    "IN CONSULTATION" ||
                    doctor.status ===
                    "WAITING"
            ).length;


        /* =====================================================
           COMPLETION RATE
        ===================================================== */

        const completionPercentage =
            totalPatients > 0
                ? Math.round(
                    (
                        completedAppointments.length /
                        totalPatients
                    ) * 100
                )
                : 0;


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

            estimatedWait,

            completionPercentage,

            activeDoctors,

            totalDoctors:
            doctorQueues.length,

            currentServing,

            doctorQueues

        };

    }, [appointments]);


    /* =========================================================
       UPDATED TEXT
    ========================================================= */

    const updatedText = useMemo(() => {

        if (!lastUpdated) {

            return "Updating...";

        }

        return "Updated just now";

    }, [lastUpdated]);


    /* =========================================================
       TOKEN FORMAT
    ========================================================= */

    const formatToken = (token) => {

        if (
            token === null ||
            token === undefined
        ) {

            return "--";

        }

        return `A${String(token).padStart(2, "0")}`;

    };


    /* =========================================================
       RENDER
    ========================================================= */

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

            <div className="hero-glow"></div>

            <div className="hero-grid"></div>


            <div className="hero-container">


                {/* =================================================
                    LEFT CONTENT
                ================================================= */}

                <div className="hero-content">


                    {/* BADGE */}

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


                    {/* HEADING */}

                    <h1>

                        SmartQueue

                        <span>

                            Smart Waiting,

                            <br />

                            Better Healthcare

                        </span>

                    </h1>


                    {/* DESCRIPTION */}

                    <p className="hero-description">

                        A smarter way to manage hospital queues.
                        Book appointments, track your token and
                        stay updated with real-time queue information
                        without waiting unnecessarily.

                    </p>


                    {/* BUTTONS */}

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


                    {/* TRUST */}

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


                    <div className="queue-orbit"></div>


                    <div className="visual-dot dot-one"></div>

                    <div className="visual-dot dot-two"></div>

                    <div className="visual-dot dot-three"></div>


                    {/* =================================================
                        MAIN HOSPITAL PANEL
                    ================================================= */}

                    <div className="hospital-live-panel">


                        {/* TOP ACCENT */}

                        <div className="panel-top-accent"></div>


                        {/* =================================================
                            HEADER
                        ================================================= */}

                        <div className="hospital-panel-header">


                            <div className="hospital-panel-title">


                                <div className="hospital-panel-icon">

                                    <FaHospital />

                                </div>


                                <div>

                                    <h3>
                                        Live Hospital Queue
                                    </h3>

                                    <span>
                                        Real-time queue overview
                                    </span>

                                </div>


                            </div>


                            <div className="hospital-live-status">

                                <FaCircle />

                                LIVE

                            </div>


                        </div>


                        {/* =================================================
                            SUMMARY CARDS
                        ================================================= */}

                        <div className="hospital-summary">


                            {/* PATIENTS */}

                            <div className="hospital-summary-item">

                                <span className="summary-icon teal">

                                    <FaUsers />

                                </span>

                                <div>

                                    <strong>

                                        {loading
                                            ? "..."
                                            : heroData.totalPatients
                                        }

                                    </strong>

                                    <small>
                                        Patients Today
                                    </small>

                                </div>

                            </div>


                            <div className="summary-divider"></div>


                            {/* DOCTORS */}

                            <div className="hospital-summary-item">

                                <span className="summary-icon blue">

                                    <FaUserMd />

                                </span>

                                <div>

                                    <strong>

                                        {loading
                                            ? "..."
                                            : heroData.totalDoctors
                                        }

                                    </strong>

                                    <small>
                                        Doctors
                                    </small>

                                </div>

                            </div>


                            <div className="summary-divider"></div>


                            {/* WAITING */}

                            <div className="hospital-summary-item">

                                <span className="summary-icon orange">

                                    <FaClock />

                                </span>

                                <div>

                                    <strong>

                                        {loading
                                            ? "..."
                                            : heroData.waitingCount
                                        }

                                    </strong>

                                    <small>
                                        Waiting
                                    </small>

                                </div>

                            </div>


                            <div className="summary-divider"></div>


                            {/* COMPLETED */}

                            <div className="hospital-summary-item">

                                <span className="summary-icon green">

                                    <FaCheckCircle />

                                </span>

                                <div>

                                    <strong>

                                        {loading
                                            ? "..."
                                            : heroData.completedCount
                                        }

                                    </strong>

                                    <small>
                                        Completed
                                    </small>

                                </div>

                            </div>


                        </div>


                        {/* =================================================
                            NOW SERVING
                        ================================================= */}

                        <div className="now-serving-box">


                            <div className="now-serving-heading">

                                <div>

                                    <span>
                                        NOW SERVING
                                    </span>

                                    <small>
                                        Current consultation
                                    </small>

                                </div>


                                {heroData.currentServing && (

                                    <span className="live-token-label">

                                        LIVE TOKEN

                                    </span>

                                )}

                            </div>


                            {loading ? (

                                <div className="now-serving-loading">

                                    <span></span>

                                    Loading live queue...

                                </div>

                            ) : heroData.currentServing ? (

                                <div className="now-serving-content">


                                    {/* TOKEN */}

                                    <div className="token-display">

                                        {formatToken(
                                            getTokenNumber(
                                                heroData.currentServing
                                            )
                                        )}

                                    </div>


                                    {/* DOCTOR */}

                                    <div className="serving-doctor">


                                        <div className="serving-doctor-icon">

                                            <FaUserMd />

                                            <span></span>

                                        </div>


                                        <div>

                                            <strong>

                                                {getDoctorName(
                                                    heroData.currentServing
                                                )}

                                            </strong>

                                            <span>

                                                {getDepartment(
                                                    heroData.currentServing
                                                )}

                                            </span>

                                        </div>


                                    </div>


                                    {/* ACTIVE */}

                                    <div className="serving-active">

                                        <span></span>

                                        Serving

                                    </div>


                                </div>

                            ) : (

                                <div className="no-serving">

                                    <div className="no-serving-icon">

                                        <FaUserClock />

                                    </div>

                                    <div>

                                        <strong>
                                            No consultation in progress
                                        </strong>

                                        <span>
                                            Queue will update automatically
                                        </span>

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            DOCTOR QUEUES
                        ================================================= */}

                        <div className="doctor-queue-heading">


                            <div>

                                <strong>
                                    Doctor Queues
                                </strong>

                                <span>
                                    Live status across departments
                                </span>

                            </div>


                            <div className="doctor-count">

                                {heroData.totalDoctors}

                                <span>
                                    doctors
                                </span>

                            </div>


                        </div>


                        {/* =================================================
                            DOCTOR LIST
                        ================================================= */}

                        <div className="doctor-queue-list">


                            {loading ? (

                                <div className="queue-loading-state">

                                    <span className="loading-dot"></span>

                                    Loading live queues...

                                </div>

                            ) : heroData.doctorQueues.length > 0 ? (

                                heroData.doctorQueues
                                    .slice(0, 3)
                                    .map((doctor, index) => (

                                        <div
                                            className="doctor-queue-row"
                                            key={
                                                doctor.doctorId ??
                                                `${doctor.doctorName}-${index}`
                                            }
                                        >


                                            {/* AVATAR */}

                                            <div className="doctor-row-avatar">

                                                <FaUserMd />

                                                <span
                                                    className={
                                                        doctor.status ===
                                                        "IN CONSULTATION"
                                                            ? "status-green"
                                                            : doctor.status ===
                                                            "WAITING"
                                                                ? "status-orange"
                                                                : "status-gray"
                                                    }
                                                ></span>

                                            </div>


                                            {/* INFO */}

                                            <div className="doctor-row-info">

                                                <strong>
                                                    {doctor.doctorName}
                                                </strong>

                                                <span>
                                                    {doctor.department}
                                                </span>

                                            </div>


                                            {/* TOKEN */}

                                            <div className="doctor-token">

                                                <small>
                                                    Token
                                                </small>

                                                <strong>

                                                    {formatToken(
                                                        doctor.currentToken
                                                    )}

                                                </strong>

                                            </div>


                                            {/* WAITING */}

                                            <div className="doctor-waiting">

                                                <strong>
                                                    {doctor.waitingCount}
                                                </strong>

                                                <small>
                                                    waiting
                                                </small>

                                            </div>


                                            {/* STATUS */}

                                            <div
                                                className={
                                                    `doctor-status ${
                                                        doctor.status ===
                                                        "IN CONSULTATION"
                                                            ? "status-active"
                                                            : doctor.status ===
                                                            "WAITING"
                                                                ? "status-waiting"
                                                                : "status-available"
                                                    }`
                                                }
                                            >

                                                {doctor.status ===
                                                "IN CONSULTATION"
                                                    ? "Serving"
                                                    : doctor.status ===
                                                    "WAITING"
                                                        ? "Waiting"
                                                        : "Available"
                                                }

                                            </div>


                                        </div>

                                    ))

                            ) : (

                                <div className="queue-empty-state">

                                    <div className="queue-empty-icon">

                                        <FaStethoscope />

                                    </div>

                                    <div>

                                        <strong>
                                            No active queues
                                        </strong>

                                        <span>
                                            Doctor queues will appear here
                                        </span>

                                    </div>

                                </div>

                            )}


                            {/* MORE DOCTORS */}

                            {!loading &&
                                heroData.doctorQueues.length > 3 && (

                                    <div className="more-doctors">

                                        <span>

                                            +{heroData.doctorQueues.length - 3}

                                            {" "}

                                            more doctors with active queues

                                        </span>

                                        <FaChevronRight />

                                    </div>

                                )}

                        </div>


                        {/* =================================================
                            FOOTER
                        ================================================= */}

                        <div className="hospital-panel-footer">


                            <div>

                                <span className="footer-live-dot"></span>

                                <span>
                                    Queue system is active
                                </span>

                            </div>


                            <span>
                                {updatedText}
                            </span>


                        </div>


                    </div>


                </div>


            </div>


        </section>

    );

}


export default Hero;