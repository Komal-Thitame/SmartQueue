import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/PatientDashboard.css";

const PatientDashboard = () => {
    const navigate = useNavigate();

    // ============================
    // STATES
    // ============================

    const [patientName, setPatientName] = useState("Patient");

    const [activeAppointment, setActiveAppointment] = useState(null);

    const [isLoadingAppointment, setIsLoadingAppointment] = useState(true);

    const [isLoggingOut, setIsLoggingOut] = useState(false);


    // ============================
    // GET PATIENT NAME
    // ============================

    useEffect(() => {

        const storedName = localStorage.getItem("userName");

        if (storedName) {
            setPatientName(storedName);
        }

    }, []);


    // ============================
    // FETCH ACTIVE APPOINTMENT
    // ============================

    useEffect(() => {

        fetchActiveAppointment();

    }, []);


    const fetchActiveAppointment = async () => {

        try {

            setIsLoadingAppointment(true);

            const token = localStorage.getItem("token");

            /*
             * Backend API
             *
             * Patient ki current/upcoming
             * active appointment yaha se aayegi.
             */

            const response = await axios.get(
                "http://localhost:8080/api/patient/appointments/active",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            console.log(
                "Active Appointment:",
                response.data
            );


            /*
             * Backend se appointment mil gayi
             */

            setActiveAppointment(response.data);

        } catch (error) {

            console.error(
                "Active appointment fetch error:",
                error
            );


            /*
             * Agar appointment nahi hai
             * ya API abhi available nahi hai
             */

            setActiveAppointment(null);

        } finally {

            setIsLoadingAppointment(false);

        }

    };


    // ============================
    // LOGOUT
    // ============================

    const handleLogout = () => {

        setIsLoggingOut(true);

        setTimeout(() => {

            localStorage.clear();

            navigate("/login", {
                replace: true
            });

        }, 1500);

    };


    // ============================
    // VIEW MY TOKEN
    // ============================

    const handleViewToken = () => {

        navigate("/patient/mytokens");

    };


    // ============================
    // BOOK APPOINTMENT
    // ============================

    const handleBookAppointment = () => {

        navigate("/patient/book-appointment");

    };


    // ============================
    // UI
    // ============================

    return (

        <div className="patient-dashboard-container">


            {/* ======================================
                SIDEBAR
            ====================================== */}

            <aside className="patient-sidebar">

                <div className="patient-sidebar-top">


                    {/* LOGO */}

                    <div className="patient-brand">
                        SmartQueue
                    </div>


                    {/* NAVIGATION */}

                    <nav className="patient-nav">


                        {/* DASHBOARD */}

                        <button
                            className="patient-nav-btn active"
                            onClick={() =>
                                navigate("/patient/dashboard")
                            }
                        >
                            📊 Dashboard
                        </button>


                        {/* BOOK APPOINTMENT */}

                        <button
                            onClick={() =>
                                navigate("/patient/book-appointment")
                            }
                            className="patient-nav-btn"
                        >
                            📅 Book Appointment
                        </button>


                        {/* MY TOKENS */}

                        <button
                            onClick={() =>
                                navigate("/patient/mytokens")
                            }
                            className="patient-nav-btn"
                        >
                            🎫 My Tokens
                        </button>


                        {/* HISTORY */}

                        <button
                            onClick={() =>
                                navigate("/patient/appointmenthistory")
                            }
                            className="patient-nav-btn"
                        >
                            📜 History
                        </button>


                        {/* PROFILE */}

                        <button
                            onClick={() =>
                                navigate("/patient/profile")
                            }
                            className="patient-nav-btn"
                        >
                            👤 Profile
                        </button>


                    </nav>

                </div>


                {/* LOGOUT */}

                <div className="patient-sidebar-bottom">

                    <button
                        onClick={handleLogout}
                        className="patient-logout-btn"
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>


            {/* ======================================
                MAIN CONTENT
            ====================================== */}

            <main className="patient-main">


                {/* ==================================
                    HEADER
                ================================== */}

                <header className="patient-header">


                    <h1 className="patient-header-title">
                        Patient Dashboard
                    </h1>


                    <div className="patient-header-right">


                        {/* NOTIFICATION */}

                        <span
                            style={{
                                cursor: "pointer",
                                fontSize: "18px"
                            }}
                        >
                            🔔
                        </span>


                        {/* PROFILE */}

                        <div
                            onClick={() =>
                                navigate("/patient/profile")
                            }
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer"
                            }}
                        >


                            {/* AVATAR */}

                            <div className="patient-avatar">

                                {patientName
                                    .charAt(0)
                                    .toUpperCase()}

                            </div>


                            {/* NAME */}

                            <span
                                style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#374151"
                                }}
                            >
                                {patientName}
                            </span>


                        </div>

                    </div>

                </header>



                {/* ==================================
                    BODY
                ================================== */}

                <div className="patient-body">


                    {/* ==================================
                        WELCOME
                    ================================== */}

                    <div>

                        <h2 className="patient-welcome-title">

                            Good Morning, {patientName} 👋

                        </h2>


                        <p className="patient-welcome-sub">

                            Manage your appointments and
                            track your queue live status.

                        </p>

                    </div>



                    {/* ==================================
                        STAT CARDS
                    ================================== */}

                    <div className="patient-stats-grid">


                        {/* =================================
                            ACTIVE BOOKING
                        ================================= */}

                        <div className="patient-stat-card">

                            <div>

                                <p className="patient-stat-title">
                                    Active Booking
                                </p>


                                <h3 className="patient-stat-value">


                                    {isLoadingAppointment
                                        ? "..."
                                        : activeAppointment
                                            ? "1"
                                            : "0"}


                                </h3>

                            </div>


                            <div className="patient-stat-icon emerald">
                                📋
                            </div>

                        </div>



                        {/* =================================
                            WAITING PATIENTS
                        ================================= */}

                        <div className="patient-stat-card">

                            <div>

                                <p className="patient-stat-title">
                                    Waiting Patients
                                </p>


                                <h3 className="patient-stat-value">

                                    {/*
                                     * Abhi Queue Engine
                                     * complete nahi hua hai.
                                     *
                                     * Isliye fake "3" nahi
                                     * dikhayenge.
                                     */}

                                    -

                                </h3>

                            </div>


                            <div className="patient-stat-icon blue">
                                ⏳
                            </div>

                        </div>


                    </div>



                    {/* ==================================
                        APPOINTMENT CONTENT
                    ================================== */}

                    <div className="patient-content-box">


                        {/* ==================================
                            LOADING
                        ================================== */}

                        {isLoadingAppointment && (

                            <div
                                style={{
                                    padding: "50px 20px",
                                    textAlign: "center"
                                }}
                            >

                                <div
                                    style={{
                                        fontSize: "35px",
                                        marginBottom: "15px"
                                    }}
                                >
                                    ⏳
                                </div>


                                <h3
                                    style={{
                                        margin: "0 0 8px"
                                    }}
                                >
                                    Loading appointment...
                                </h3>


                                <p
                                    style={{
                                        color: "#6b7280",
                                        margin: 0
                                    }}
                                >
                                    Please wait.
                                </p>

                            </div>

                        )}



                        {/* ==================================
                            ACTIVE APPOINTMENT EXISTS
                        ================================== */}

                        {!isLoadingAppointment &&
                            activeAppointment && (

                                <div
                                    style={{
                                        padding: "28px"
                                    }}
                                >


                                    {/* TITLE */}

                                    <h3
                                        style={{
                                            fontSize: "22px",
                                            fontWeight: "600",
                                            marginBottom: "24px",
                                            color: "#1f2937"
                                        }}
                                    >
                                        Active Appointment
                                    </h3>



                                    {/* DOCTOR */}

                                    <div
                                        style={{
                                            marginBottom: "18px"
                                        }}
                                    >

                                        <p
                                            style={{
                                                color: "#6b7280",
                                                fontSize: "13px",
                                                marginBottom: "5px"
                                            }}
                                        >
                                            Doctor
                                        </p>


                                        <strong
                                            style={{
                                                fontSize: "16px"
                                            }}
                                        >
                                            {activeAppointment.doctorName ||
                                                "Doctor"}
                                        </strong>

                                    </div>



                                    {/* DEPARTMENT */}

                                    <div
                                        style={{
                                            marginBottom: "18px"
                                        }}
                                    >

                                        <p
                                            style={{
                                                color: "#6b7280",
                                                fontSize: "13px",
                                                marginBottom: "5px"
                                            }}
                                        >
                                            Department
                                        </p>


                                        <strong>
                                            {activeAppointment.department ||
                                                "Not Available"}
                                        </strong>

                                    </div>



                                    {/* DATE */}

                                    <div
                                        style={{
                                            marginBottom: "18px"
                                        }}
                                    >

                                        <p
                                            style={{
                                                color: "#6b7280",
                                                fontSize: "13px",
                                                marginBottom: "5px"
                                            }}
                                        >
                                            Appointment Date
                                        </p>


                                        <strong>
                                            {activeAppointment.appointmentDate ||
                                                "Not Available"}
                                        </strong>

                                    </div>



                                    {/* TIME */}

                                    <div
                                        style={{
                                            marginBottom: "18px"
                                        }}
                                    >

                                        <p
                                            style={{
                                                color: "#6b7280",
                                                fontSize: "13px",
                                                marginBottom: "5px"
                                            }}
                                        >
                                            Appointment Time
                                        </p>


                                        <strong>
                                            {activeAppointment.appointmentTime ||
                                                "Not Available"}
                                        </strong>

                                    </div>



                                    {/* STATUS */}

                                    <div
                                        style={{
                                            marginBottom: "20px"
                                        }}
                                    >

                                        <p
                                            style={{
                                                color: "#6b7280",
                                                fontSize: "13px",
                                                marginBottom: "5px"
                                            }}
                                        >
                                            Status
                                        </p>


                                        <strong
                                            style={{
                                                color: "#059669"
                                            }}
                                        >
                                            {activeAppointment.status ||
                                                "BOOKED"}
                                        </strong>

                                    </div>



                                    {/* =================================
                                        TOKEN
                                    ================================= */}

                                    {activeAppointment.tokenNumber && (

                                        <div
                                            style={{
                                                padding: "18px",
                                                background: "#ecfdf5",
                                                borderRadius: "12px",
                                                marginBottom: "20px"
                                            }}
                                        >


                                            <p
                                                style={{
                                                    margin: "0 0 5px",
                                                    color: "#6b7280",
                                                    fontSize: "13px"
                                                }}
                                            >
                                                Your Token
                                            </p>


                                            <h2
                                                style={{
                                                    margin: 0,
                                                    color: "#059669",
                                                    fontSize: "28px"
                                                }}
                                            >
                                                {activeAppointment.tokenNumber}
                                            </h2>


                                        </div>

                                    )}



                                    {/* VIEW TOKEN */}

                                    {activeAppointment.tokenNumber && (

                                        <button
                                            onClick={handleViewToken}
                                            className="patient-primary-btn"
                                        >
                                            🎫 View My Token
                                        </button>

                                    )}


                                </div>

                            )}



                        {/* ==================================
                            NO ACTIVE APPOINTMENT
                        ================================== */}

                        {!isLoadingAppointment &&
                            !activeAppointment && (

                                <div
                                    style={{
                                        padding: "24px 0",
                                        textAlign: "center"
                                    }}
                                >


                                    {/* ICON */}

                                    <div className="patient-empty-icon">
                                        🏥
                                    </div>


                                    {/* TITLE */}

                                    <h3 className="patient-empty-title">

                                        No active appointment

                                    </h3>


                                    {/* DESCRIPTION */}

                                    <p className="patient-empty-desc">

                                        You don't have any active
                                        appointments right now.

                                    </p>


                                    {/* BOOK BUTTON */}

                                    <button
                                        onClick={handleBookAppointment}
                                        className="patient-primary-btn"
                                    >
                                        + Book Appointment
                                    </button>


                                </div>

                            )}


                    </div>

                </div>

            </main>



            {/* ======================================
                LOGOUT OVERLAY
            ====================================== */}

            {isLoggingOut && (

                <div className="logout-overlay">


                    <div className="logout-modal">


                        <div className="logout-spinner"></div>


                        <h3
                            style={{
                                fontSize: "18px",
                                fontWeight: "600",
                                color: "#1f2937",
                                margin: "0"
                            }}
                        >
                            Logging out securely...
                        </h3>


                        <p
                            style={{
                                fontSize: "14px",
                                color: "#6b7280",
                                margin: "0"
                            }}
                        >
                            Please wait...
                        </p>


                    </div>

                </div>

            )}


        </div>

    );
};

export default PatientDashboard;