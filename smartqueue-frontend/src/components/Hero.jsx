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
    FaCircle
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


        /* -----------------------------------------------------
           TOTAL
        ----------------------------------------------------- */

        const totalPatients =
            validAppointments.length;


        /* -----------------------------------------------------
           WAITING
        ----------------------------------------------------- */

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


        /* -----------------------------------------------------
           CONSULTATION
        ----------------------------------------------------- */

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


        /* -----------------------------------------------------
           COMPLETED
        ----------------------------------------------------- */

        const completedAppointments =
            validAppointments.filter(
                (appointment) =>
                    normalizeStatus(
                        appointment.status
                    ) === "COMPLETED"
            );


        /* -----------------------------------------------------
           CURRENT SERVING
        ----------------------------------------------------- */

        const currentServing =
            consultationAppointments[0] || null;


        /* -----------------------------------------------------
           TOTAL WAIT
        ----------------------------------------------------- */

        const estimatedWait =
            waitingAppointments.length * 15;


        /* -----------------------------------------------------
           SUCCESS
        ----------------------------------------------------- */

        const successPercentage =
            totalPatients > 0
                ? Math.round(
                    (
                        completedAppointments.length /
                        totalPatients
                    ) * 100
                )
                : 0;


        /* -----------------------------------------------------
           DOCTOR GROUPS
        ----------------------------------------------------- */

        const doctorMap = {};

        validAppointments.forEach((appointment) => {

            const doctorName =
                getDoctorName(appointment);

            if (!doctorMap[doctorName]) {

                doctorMap[doctorName] = {

                    doctorName,

                    department:
                        getDepartment(appointment),

                    appointments: []

                };

            }

            doctorMap[doctorName]
                .appointments
                .push(appointment);

        });


        /* -----------------------------------------------------
           DOCTOR QUEUES
        ----------------------------------------------------- */

        const doctorQueues =
            Object.values(doctorMap)
                .map((doctor) => {

                    const doctorAppointments =
                        doctor.appointments;

                    const waiting =
                        doctorAppointments
                            .filter(
                                (a) =>
                                    normalizeStatus(
                                        a.status
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

                    const serving =
                        doctorAppointments
                            .filter((a) => {

                                const status =
                                    normalizeStatus(
                                        a.status
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
                            )[0] || null;


                    const completed =
                        doctorAppointments.filter(
                            (a) =>
                                normalizeStatus(
                                    a.status
                                ) === "COMPLETED"
                        );


                    const currentToken =
                        serving
                            ? getTokenNumber(serving)
                            : waiting[0]
                                ? getTokenNumber(waiting[0])
                                : null;


                    return {

                        doctorName:
                        doctor.doctorName,

                        department:
                        doctor.department,

                        waitingCount:
                        waiting.length,

                        completedCount:
                        completed.length,

                        serving,

                        currentToken,

                        status:
                            serving
                                ? "IN CONSULTATION"
                                : waiting.length > 0
                                    ? "WAITING"
                                    : "AVAILABLE"

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


        return {

            totalPatients,

            waitingCount:
            waitingAppointments.length,

            consultationCount:
            consultationAppointments.length,

            completedCount:
            completedAppointments.length,

            estimatedWait,

            successPercentage,

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


                    <h1>

                        SmartQueue

                        <span>

                            Smart Waiting,

                            <br />

                            Better Healthcare

                        </span>

                    </h1>


                    <p className="hero-description">

                        A smarter way to manage hospital queues.
                        Book appointments, track your token and
                        stay updated with real-time queue information
                        without waiting unnecessarily.

                    </p>


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
                    LIVE HOSPITAL OVERVIEW
                ================================================= */}

                <div className="queue-preview">


                    <div className="queue-orbit"></div>


                    <div className="visual-dot dot-one"></div>

                    <div className="visual-dot dot-two"></div>

                    <div className="visual-dot dot-three"></div>


                    {/* =================================================
                        SINGLE MAIN PANEL
                    ================================================= */}

                    <div className="hospital-live-panel">


                        {/* TOP HEADER */}

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
                                        Today's queue overview
                                    </span>

                                </div>

                            </div>


                            <div className="hospital-live-status">

                                <FaCircle />

                                LIVE

                            </div>

                        </div>


                        {/* =================================================
                            SUMMARY
                        ================================================= */}

                        <div className="hospital-summary">


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


                            <div className="hospital-summary-item">

                                <span className="summary-icon orange">

                                    <FaClock />

                                </span>

                                <div>

                                    <strong>

                                        {loading
                                            ? "..."
                                            : `${heroData.estimatedWait}`
                                        }

                                        {!loading && (
                                            <em>
                                                min
                                            </em>
                                        )}

                                    </strong>

                                    <small>
                                        Avg. Wait
                                    </small>

                                </div>

                            </div>


                            <div className="summary-divider"></div>


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

                                <span>
                                    NOW SERVING
                                </span>

                                <small>
                                    Live token
                                </small>

                            </div>


                            <div className="now-serving-content">


                                <div className="token-display">

                                    {loading

                                        ? "..."

                                        : heroData.currentServing

                                            ? `A${String(
                                                getTokenNumber(
                                                    heroData.currentServing
                                                )
                                            ).padStart(2, "0")}`

                                            : "--"

                                    }

                                </div>


                                <div className="serving-doctor">

                                    <div className="serving-doctor-icon">

                                        <FaUserMd />

                                    </div>

                                    <div>

                                        <strong>

                                            {heroData.currentServing
                                                ? getDoctorName(
                                                    heroData.currentServing
                                                )
                                                : "Waiting for doctor"
                                            }

                                        </strong>

                                        <span>

                                            {heroData.currentServing
                                                ? getDepartment(
                                                    heroData.currentServing
                                                )
                                                : "Queue will update automatically"
                                            }

                                        </span>

                                    </div>

                                </div>


                                <div className="serving-active">

                                    <span></span>

                                    Active

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            DOCTOR QUEUE
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

                            <FaChevronRight />

                        </div>


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
                                            key={`${doctor.doctorName}-${index}`}
                                        >


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


                                            <div className="doctor-row-info">

                                                <strong>
                                                    {doctor.doctorName}
                                                </strong>

                                                <span>
                                                    {doctor.department}
                                                </span>

                                            </div>


                                            <div className="doctor-token">

                                                <small>
                                                    Token
                                                </small>

                                                <strong>

                                                    {doctor.currentToken !== null
                                                        ? `A${String(
                                                            doctor.currentToken
                                                        ).padStart(2, "0")}`
                                                        : "--"
                                                    }

                                                </strong>

                                            </div>


                                            <div className="doctor-waiting">

                                                <strong>
                                                    {doctor.waitingCount}
                                                </strong>

                                                <small>
                                                    waiting
                                                </small>

                                            </div>


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

                                    <FaStethoscope />

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