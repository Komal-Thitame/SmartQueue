import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/PatientDashboard.css";

const PatientDashboard = () => {
    const navigate = useNavigate();

    const [patientName, setPatientName] = useState("Patient");
    const [activeAppointments, setActiveAppointments] = useState([]);
    const [historyAppointments, setHistoryAppointments] = useState([]);
    const [isLoadingAppointment, setIsLoadingAppointment] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [removingHistoryId, setRemovingHistoryId] = useState(null);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");

        if (storedName) {
            setPatientName(storedName);
        }

        fetchActiveAppointments();
        fetchHistoryAppointments();
    }, []);

    // ============================
    // FETCH ACTIVE APPOINTMENTS
    // ============================
    const fetchActiveAppointments = async () => {
        try {
            setIsLoadingAppointment(true);

            const patientId = localStorage.getItem("userId");

            if (!patientId) {
                console.error("No patient ID found in localStorage!");
                setActiveAppointments([]);
                return;
            }

            const response = await axios.get(
                `http://localhost:8081/api/appointments/active/${patientId}`
            );

            const appointments = response.data;

            if (Array.isArray(appointments)) {
                setActiveAppointments(appointments);
            } else {
                setActiveAppointments([]);
            }

        } catch (error) {
            console.error("Active appointments fetch error:", error);
            setActiveAppointments([]);
        } finally {
            setIsLoadingAppointment(false);
        }
    };

    // ============================
    // FETCH HISTORY APPOINTMENTS
    // ============================
    const fetchHistoryAppointments = async () => {
        try {
            const patientId = localStorage.getItem("userId");

            if (!patientId) {
                setHistoryAppointments([]);
                return;
            }

            const response = await axios.get(
                `http://localhost:8081/api/appointments/history/${patientId}`
            );

            if (Array.isArray(response.data)) {
                setHistoryAppointments(response.data);
            } else {
                setHistoryAppointments([]);
            }

        } catch (error) {
            console.error("History appointments fetch error:", error);
            setHistoryAppointments([]);
        }
    };

    // ============================
    // CANCEL APPOINTMENT
    // ============================
    const handleCancelAppointment = async (appointmentId) => {
        if (
            window.confirm(
                "Are you sure you want to cancel this appointment?"
            )
        ) {
            try {
                await axios.put(
                    `http://localhost:8081/api/appointments/cancel/${appointmentId}`
                );

                alert("Appointment cancelled successfully!");

                fetchActiveAppointments();
                fetchHistoryAppointments();

            } catch (error) {
                console.error("Error cancelling appointment:", error);

                alert(
                    "Failed to cancel appointment. Please try again."
                );
            }
        }
    };

    // ============================
    // REMOVE HISTORY
    // ============================
    const handleRemoveHistory = async (appointmentId) => {
        const confirmRemove = window.confirm(
            "Remove this appointment from your history?\n\n" +
            "This will only hide it from your history. " +
            "The appointment record will NOT be permanently deleted."
        );

        if (!confirmRemove) {
            return;
        }

        try {
            setRemovingHistoryId(appointmentId);

            await axios.put(
                `http://localhost:8081/api/appointments/hide/${appointmentId}`
            );

            // Remove immediately from UI
            setHistoryAppointments((prev) =>
                prev.filter((app) => app.id !== appointmentId)
            );

            alert("Appointment removed from your history.");

        } catch (error) {
            console.error("Error removing history appointment:", error);

            alert(
                "Failed to remove appointment from history. Please try again."
            );
        } finally {
            setRemovingHistoryId(null);
        }
    };

    // ============================
    // LOGOUT
    // ============================
    const handleLogout = () => {
        setIsLoggingOut(true);

        setTimeout(() => {
            localStorage.clear();
            navigate("/login", { replace: true });
        }, 1500);
    };

    // ============================
    // VIEW TOKEN
    // ============================
    const handleViewToken = (appointment) => {
        navigate("/patient/mytokens", {
            state: {
                selectedAppointment: appointment
            }
        });
    };

    // ============================
    // BOOK APPOINTMENT
    // ============================
    const handleBookAppointment = () => {
        navigate("/patient/book-appointment");
    };

    // ============================
    // DATE HELPERS
    // ============================
    const todayStr = new Date()
        .toISOString()
        .split("T")[0];

    const getNormalizedDateStr = (app) => {
        const rawDate =
            app.appointmentDate ||
            app.date ||
            app.bookingDate ||
            app.created_at ||
            app.createdAt;

        if (!rawDate) {
            return todayStr;
        }

        try {
            return rawDate.split("T")[0];
        } catch (e) {
            return todayStr;
        }
    };

    const displayAppointmentDate = (app) => {
        const rawDate =
            app.appointmentDate ||
            app.date ||
            app.bookingDate ||
            app.created_at ||
            app.createdAt;

        if (!rawDate) {
            return "Today (Aaj)";
        }

        try {
            const tomorrow = new Date();

            tomorrow.setDate(
                tomorrow.getDate() + 1
            );

            const tomorrowStr = tomorrow
                .toISOString()
                .split("T")[0];

            const formattedRaw = rawDate.split("T")[0];

            if (formattedRaw === todayStr) {
                return "Today (Aaj)";
            }

            if (formattedRaw === tomorrowStr) {
                return "Tomorrow (Kal)";
            }

            const dateObj = new Date(rawDate);

            if (!isNaN(dateObj.getTime())) {
                return dateObj.toLocaleDateString(
                    "en-GB",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );
            }

        } catch (e) {
            // Fallback
        }

        return rawDate;
    };

    // ============================
    // TODAY'S APPOINTMENTS
    // ============================
    const todaysAppointments =
        activeAppointments.filter((app) => {

            const formattedRaw =
                getNormalizedDateStr(app);

            const status =
                app.status || "WAITING";

            return (
                formattedRaw === todayStr &&
                status !== "COMPLETED" &&
                status !== "CANCELLED"
            );
        });

    // ============================
    // UPCOMING APPOINTMENTS
    // ============================
    const upcomingAppointments =
        activeAppointments.filter((app) => {

            const formattedRaw =
                getNormalizedDateStr(app);

            const status =
                app.status || "WAITING";

            return (
                formattedRaw > todayStr &&
                status !== "CANCELLED"
            );
        });

    // ============================
    // DASHBOARD COUNTS
    // ============================
    const activeBookingsCount =
        todaysAppointments.length;

    const waitingTokensCount =
        todaysAppointments.filter(
            (app) =>
                app.status === "WAITING" ||
                !app.status
        ).length;

    // ============================
    // RETURN UI
    // ============================
    return (
        <div className="patient-dashboard-container">

            {/* ============================
                SIDEBAR
            ============================ */}
            <aside className="patient-sidebar">

                <div className="patient-sidebar-top">

                    <div className="patient-brand">
                        SmartQueue
                    </div>

                    <nav className="patient-nav">

                        <button
                            className="patient-nav-btn active"
                            onClick={() =>
                                navigate("/patient/dashboard")
                            }
                        >
                            📊 Dashboard
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/patient/book-appointment"
                                )
                            }
                            className="patient-nav-btn"
                        >
                            📅 Book Appointment
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/patient/mytokens"
                                )
                            }
                            className="patient-nav-btn"
                        >
                            🎫 My Tokens
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/patient/appointmenthistory"
                                )
                            }
                            className="patient-nav-btn"
                        >
                            📜 History
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/patient/profile"
                                )
                            }
                            className="patient-nav-btn"
                        >
                            👤 Profile
                        </button>

                    </nav>

                </div>

                <div className="patient-sidebar-bottom">

                    <button
                        onClick={handleLogout}
                        className="patient-logout-btn"
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>


            {/* ============================
                MAIN
            ============================ */}
            <main className="patient-main">

                {/* HEADER */}
                <header className="patient-header">

                    <h1 className="patient-header-title">
                        Patient Dashboard
                    </h1>

                    <div className="patient-header-right">

                        <span
                            style={{
                                cursor: "pointer",
                                fontSize: "18px"
                            }}
                        >
                            🔔
                        </span>

                        <div
                            onClick={() =>
                                navigate(
                                    "/patient/profile"
                                )
                            }
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer"
                            }}
                        >

                            <div className="patient-avatar">
                                {patientName
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

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


                {/* BODY */}
                <div className="patient-body">

                    {/* WELCOME */}
                    <div>

                        <h2 className="patient-welcome-title">
                            Good Morning, {patientName} 👋
                        </h2>

                        <p className="patient-welcome-sub">
                            Manage your appointments and track
                            your queue live status.
                        </p>

                    </div>


                    {/* ============================
                        STATS
                    ============================ */}
                    <div className="patient-stats-grid">

                        <div className="patient-stat-card">

                            <div>

                                <p className="patient-stat-title">
                                    Today's Active Bookings
                                </p>

                                <h3 className="patient-stat-value">
                                    {isLoadingAppointment
                                        ? "..."
                                        : activeBookingsCount}
                                </h3>

                            </div>

                            <div className="patient-stat-icon emerald">
                                📋
                            </div>

                        </div>


                        <div className="patient-stat-card">

                            <div>

                                <p className="patient-stat-title">
                                    Waiting Tokens
                                </p>

                                <h3 className="patient-stat-value">
                                    {isLoadingAppointment
                                        ? "..."
                                        : waitingTokensCount}
                                </h3>

                            </div>

                            <div className="patient-stat-icon blue">
                                ⏳
                            </div>

                        </div>

                    </div>


                    {/* ============================
                        LOADING
                    ============================ */}
                    {isLoadingAppointment && (

                        <div
                            className="patient-content-box"
                            style={{
                                padding: "40px 20px",
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
                                Loading appointments...
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


                    {/* ============================
                        TODAY'S APPOINTMENTS
                    ============================ */}
                    {!isLoadingAppointment && (

                        <div
                            className="patient-content-box"
                            style={{
                                padding: "28px",
                                marginBottom: "24px"
                            }}
                        >

                            <h3
                                style={{
                                    fontSize: "20px",
                                    fontWeight: "600",
                                    marginBottom: "20px",
                                    color: "#1f2937"
                                }}
                            >
                                🩺 Today's Appointments
                            </h3>


                            {todaysAppointments.length > 0 ? (

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "20px"
                                    }}
                                >

                                    {todaysAppointments.map(
                                        (app, index) => (

                                            <div
                                                key={
                                                    app.id || index
                                                }
                                                style={{
                                                    border:
                                                        "1px solid #e5e7eb",
                                                    borderRadius:
                                                        "12px",
                                                    padding: "20px",
                                                    background:
                                                        "#f9fafb"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems:
                                                            "flex-start",
                                                        marginBottom:
                                                            "12px"
                                                    }}
                                                >

                                                    <div>

                                                        <h4
                                                            style={{
                                                                margin:
                                                                    "0 0 4px",
                                                                fontSize:
                                                                    "18px",
                                                                color:
                                                                    "#111827"
                                                            }}
                                                        >
                                                            🩺{" "}
                                                            {app.doctorName ||
                                                                app.doctor
                                                                    ?.name ||
                                                                "Doctor"}
                                                        </h4>

                                                        <p
                                                            style={{
                                                                margin: 0,
                                                                color:
                                                                    "#6b7280",
                                                                fontSize:
                                                                    "14px"
                                                            }}
                                                        >
                                                            {app.department ||
                                                                "General Department"}
                                                        </p>

                                                    </div>


                                                    <span
                                                        style={{
                                                            padding:
                                                                "4px 10px",
                                                            background:
                                                                "#ecfdf5",
                                                            color:
                                                                "#059669",
                                                            borderRadius:
                                                                "20px",
                                                            fontSize:
                                                                "12px",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >
                                                        {app.status ||
                                                            "WAITING"}
                                                    </span>

                                                </div>


                                                <div
                                                    style={{
                                                        display:
                                                            "grid",
                                                        gridTemplateColumns:
                                                            "repeat(auto-fit, minmax(150px, 1fr))",
                                                        gap: "12px",
                                                        margin:
                                                            "16px 0",
                                                        background:
                                                            "#ffffff",
                                                        padding:
                                                            "12px",
                                                        borderRadius:
                                                            "8px",
                                                        border:
                                                            "1px solid #f3f4f6"
                                                    }}
                                                >

                                                    <div>

                                                        <span
                                                            style={{
                                                                display:
                                                                    "block",
                                                                fontSize:
                                                                    "12px",
                                                                color:
                                                                    "#6b7280"
                                                            }}
                                                        >
                                                            Token Number
                                                        </span>

                                                        <strong
                                                            style={{
                                                                fontSize:
                                                                    "16px",
                                                                color:
                                                                    "#059669"
                                                            }}
                                                        >
                                                            {app.tokenNumber ||
                                                                "N/A"}
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span
                                                            style={{
                                                                display:
                                                                    "block",
                                                                fontSize:
                                                                    "12px",
                                                                color:
                                                                    "#6b7280"
                                                            }}
                                                        >
                                                            Date & Time
                                                        </span>

                                                        <strong
                                                            style={{
                                                                fontSize:
                                                                    "14px",
                                                                color:
                                                                    "#374151"
                                                            }}
                                                        >
                                                            {displayAppointmentDate(
                                                                app
                                                            )}
                                                        </strong>

                                                    </div>

                                                </div>


                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        gap: "10px",
                                                        flexWrap:
                                                            "wrap"
                                                    }}
                                                >

                                                    <button
                                                        onClick={() =>
                                                            handleViewToken(
                                                                app
                                                            )
                                                        }
                                                        style={{
                                                            padding:
                                                                "8px 16px",
                                                            background:
                                                                "#10b981",
                                                            color:
                                                                "#fff",
                                                            border:
                                                                "none",
                                                            borderRadius:
                                                                "6px",
                                                            cursor:
                                                                "pointer",
                                                            fontWeight:
                                                                "500",
                                                            fontSize:
                                                                "14px"
                                                        }}
                                                    >
                                                        🎫 View Queue Details
                                                    </button>


                                                    <button
                                                        onClick={() =>
                                                            handleCancelAppointment(
                                                                app.id
                                                            )
                                                        }
                                                        style={{
                                                            padding:
                                                                "8px 16px",
                                                            background:
                                                                "#ef4444",
                                                            color:
                                                                "#fff",
                                                            border:
                                                                "none",
                                                            borderRadius:
                                                                "6px",
                                                            cursor:
                                                                "pointer",
                                                            fontWeight:
                                                                "500",
                                                            fontSize:
                                                                "14px"
                                                        }}
                                                    >
                                                        ❌ Cancel Appointment
                                                    </button>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            ) : (

                                <p
                                    style={{
                                        color: "#6b7280",
                                        margin: 0
                                    }}
                                >
                                    No appointments scheduled
                                    for today.
                                </p>

                            )}

                        </div>

                    )}


                    {/* ============================
                        UPCOMING APPOINTMENTS
                    ============================ */}
                    {!isLoadingAppointment &&
                        upcomingAppointments.length > 0 && (

                            <div
                                className="patient-content-box"
                                style={{
                                    padding: "28px",
                                    marginBottom: "24px"
                                }}
                            >

                                <h3
                                    style={{
                                        fontSize: "20px",
                                        fontWeight: "600",
                                        marginBottom: "20px",
                                        color: "#1f2937"
                                    }}
                                >
                                    📅 Upcoming Appointments
                                </h3>


                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "15px"
                                    }}
                                >

                                    {upcomingAppointments.map(
                                        (app, index) => (

                                            <div
                                                key={
                                                    app.id || index
                                                }
                                                style={{
                                                    border:
                                                        "1px solid #e5e7eb",
                                                    borderRadius:
                                                        "12px",
                                                    padding:
                                                        "16px 20px",
                                                    background:
                                                        "#f0fdf4",
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems:
                                                        "center",
                                                    flexWrap:
                                                        "wrap",
                                                    gap: "10px"
                                                }}
                                            >

                                                <div>

                                                    <h4
                                                        style={{
                                                            margin:
                                                                "0 0 4px",
                                                            fontSize:
                                                                "16px",
                                                            color:
                                                                "#111827"
                                                        }}
                                                    >
                                                        🩺{" "}
                                                        {app.doctorName ||
                                                            app.doctor
                                                                ?.name ||
                                                            "Doctor"}
                                                    </h4>

                                                    <p
                                                        style={{
                                                            margin: 0,
                                                            color:
                                                                "#4b5563",
                                                            fontSize:
                                                                "13px"
                                                        }}
                                                    >
                                                        Date:{" "}
                                                        <strong>
                                                            {displayAppointmentDate(
                                                                app
                                                            )}
                                                        </strong>{" "}
                                                        | Token:{" "}
                                                        <strong>
                                                            #
                                                            {
                                                                app.tokenNumber
                                                            }
                                                        </strong>
                                                    </p>

                                                </div>


                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        gap: "10px",
                                                        alignItems:
                                                            "center"
                                                    }}
                                                >

                                                    <span
                                                        style={{
                                                            padding:
                                                                "4px 10px",
                                                            background:
                                                                "#dbeafe",
                                                            color:
                                                                "#1d4ed8",
                                                            borderRadius:
                                                                "20px",
                                                            fontSize:
                                                                "12px",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >
                                                        BOOKED
                                                    </span>


                                                    <button
                                                        onClick={() =>
                                                            handleCancelAppointment(
                                                                app.id
                                                            )
                                                        }
                                                        style={{
                                                            padding:
                                                                "6px 12px",
                                                            background:
                                                                "#ef4444",
                                                            color:
                                                                "#fff",
                                                            border:
                                                                "none",
                                                            borderRadius:
                                                                "6px",
                                                            cursor:
                                                                "pointer",
                                                            fontWeight:
                                                                "500",
                                                            fontSize:
                                                                "13px"
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        )}


                    {/* ============================
                        HISTORY
                    ============================ */}
                    {!isLoadingAppointment &&
                        historyAppointments.length > 0 && (

                            <div
                                className="patient-content-box"
                                style={{
                                    padding: "28px"
                                }}
                            >

                                {/* HISTORY HEADER */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems: "center",
                                        marginBottom: "20px",
                                        gap: "15px",
                                        flexWrap: "wrap"
                                    }}
                                >

                                    <div>

                                        <h3
                                            style={{
                                                fontSize:
                                                    "20px",
                                                fontWeight:
                                                    "600",
                                                margin: 0,
                                                color:
                                                    "#1f2937"
                                            }}
                                        >
                                            📜 Past / History
                                            Appointments
                                        </h3>

                                        <p
                                            style={{
                                                margin:
                                                    "5px 0 0",
                                                fontSize:
                                                    "13px",
                                                color:
                                                    "#6b7280"
                                            }}
                                        >
                                            Completed, missed and
                                            cancelled appointments
                                        </p>

                                    </div>


                                    <span
                                        style={{
                                            fontSize:
                                                "13px",
                                            color:
                                                "#6b7280",
                                            background:
                                                "#f3f4f6",
                                            padding:
                                                "6px 10px",
                                            borderRadius:
                                                "20px"
                                        }}
                                    >
                                        {historyAppointments.length}{" "}
                                        Records
                                    </span>

                                </div>


                                {/* HISTORY LIST */}
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection:
                                            "column",
                                        gap: "12px"
                                    }}
                                >

                                    {historyAppointments.map(
                                        (app, index) => (

                                            <div
                                                key={
                                                    app.id || index
                                                }
                                                style={{
                                                    border:
                                                        "1px solid #e5e7eb",
                                                    borderRadius:
                                                        "10px",
                                                    padding:
                                                        "14px 18px",
                                                    background:
                                                        "#f9fafb",
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems:
                                                        "center",
                                                    flexWrap:
                                                        "wrap",
                                                    gap: "12px"
                                                }}
                                            >

                                                {/* HISTORY INFO */}
                                                <div
                                                    style={{
                                                        flex:
                                                            "1 1 auto"
                                                    }}
                                                >

                                                    <h4
                                                        style={{
                                                            margin:
                                                                "0 0 2px",
                                                            fontSize:
                                                                "15px",
                                                            color:
                                                                "#374151"
                                                        }}
                                                    >
                                                        🩺{" "}
                                                        {app.doctorName ||
                                                            app.doctor
                                                                ?.name ||
                                                            "Doctor"}
                                                    </h4>

                                                    <p
                                                        style={{
                                                            margin: 0,
                                                            color:
                                                                "#6b7280",
                                                            fontSize:
                                                                "13px"
                                                        }}
                                                    >
                                                        {
                                                            displayAppointmentDate(
                                                                app
                                                            )
                                                        }{" "}
                                                        • Token #
                                                        {
                                                            app.tokenNumber ||
                                                            "N/A"
                                                        }
                                                    </p>

                                                </div>


                                                {/* STATUS + REMOVE */}
                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap: "10px",
                                                        flexWrap:
                                                            "wrap"
                                                    }}
                                                >

                                                    <span
                                                        style={{
                                                            padding:
                                                                "4px 10px",
                                                            background:
                                                                app.status ===
                                                                "COMPLETED"
                                                                    ? "#ecfdf5"
                                                                    : app.status ===
                                                                    "MISSED"
                                                                        ? "#fef3c7"
                                                                        : "#fee2e2",
                                                            color:
                                                                app.status ===
                                                                "COMPLETED"
                                                                    ? "#059669"
                                                                    : app.status ===
                                                                    "MISSED"
                                                                        ? "#d97706"
                                                                        : "#dc2626",
                                                            borderRadius:
                                                                "20px",
                                                            fontSize:
                                                                "12px",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >
                                                        {app.status ||
                                                            "UNKNOWN"}
                                                    </span>


                                                    {/* REMOVE BUTTON */}
                                                    <button
                                                        onClick={() =>
                                                            handleRemoveHistory(
                                                                app.id
                                                            )
                                                        }
                                                        disabled={
                                                            removingHistoryId ===
                                                            app.id
                                                        }
                                                        style={{
                                                            padding:
                                                                "6px 12px",
                                                            background:
                                                                removingHistoryId ===
                                                                app.id
                                                                    ? "#9ca3af"
                                                                    : "#6b7280",
                                                            color:
                                                                "#fff",
                                                            border:
                                                                "none",
                                                            borderRadius:
                                                                "6px",
                                                            cursor:
                                                                removingHistoryId ===
                                                                app.id
                                                                    ? "not-allowed"
                                                                    : "pointer",
                                                            fontWeight:
                                                                "500",
                                                            fontSize:
                                                                "12px",
                                                            opacity:
                                                                removingHistoryId ===
                                                                app.id
                                                                    ? 0.8
                                                                    : 1
                                                        }}
                                                    >
                                                        {removingHistoryId ===
                                                        app.id
                                                            ? "Removing..."
                                                            : "🗑️ Remove"}
                                                    </button>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        )}


                    {/* NO HISTORY MESSAGE */}
                    {!isLoadingAppointment &&
                        historyAppointments.length === 0 && (

                            <div
                                className="patient-content-box"
                                style={{
                                    padding: "28px",
                                    marginTop: "0"
                                }}
                            >

                                <h3
                                    style={{
                                        fontSize:
                                            "20px",
                                        fontWeight:
                                            "600",
                                        marginBottom:
                                            "8px",
                                        color:
                                            "#1f2937"
                                    }}
                                >
                                    📜 Appointment History
                                </h3>

                                <p
                                    style={{
                                        color:
                                            "#6b7280",
                                        margin: 0
                                    }}
                                >
                                    No past appointments
                                    available.
                                </p>

                            </div>

                        )}

                </div>

            </main>


            {/* ============================
                LOGOUT OVERLAY
            ============================ */}
            {isLoggingOut && (

                <div className="logout-overlay">

                    <div className="logout-modal">

                        <div className="logout-spinner"></div>

                        <h3
                            style={{
                                fontSize:
                                    "18px",
                                fontWeight:
                                    "600",
                                color:
                                    "#1f2937",
                                margin: 0
                            }}
                        >
                            Logging out securely...
                        </h3>

                        <p
                            style={{
                                fontSize:
                                    "14px",
                                color:
                                    "#6b7280",
                                margin: 0
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