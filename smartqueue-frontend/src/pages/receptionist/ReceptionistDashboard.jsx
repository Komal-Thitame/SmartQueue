import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ReceptionistDashboard.css";
import { API_BASE_URL } from "../../config";

const ReceptionistDashboard = () => {
    const navigate = useNavigate();

    const [receptionistName, setReceptionistName] = useState("Receptionist");
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // --------------------------------------------------
    // Get receptionist name
    // --------------------------------------------------
    useEffect(() => {
        const storedName = localStorage.getItem("userName");

        if (storedName) {
            setReceptionistName(storedName);
        }
    }, []);

    // --------------------------------------------------
    // Fetch today's appointments
    // --------------------------------------------------
    const fetchAppointments = useCallback(async (showLoader = false) => {
        try {
            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            const response = await fetch(
                `${API_BASE_URL}/receptionist/appointments/today`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch today's appointments.");
            }

            const data = await response.json();

            const appointmentData = Array.isArray(data) ? data : [];

            // Sort by token number
            appointmentData.sort((a, b) => {
                const tokenA = Number(a?.tokenNumber) || 0;
                const tokenB = Number(b?.tokenNumber) || 0;

                return tokenA - tokenB;
            });

            setAppointments(appointmentData);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Dashboard appointment fetch error:", err);
            setError(
                err.message ||
                "Unable to load today's appointments."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchAppointments(true);
    }, [fetchAppointments]);

    // Auto refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchAppointments(false);
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchAppointments]);

    // --------------------------------------------------
    // Helpers
    // --------------------------------------------------

    const getStatus = (appointment) => {
        const status = appointment?.status;

        if (!status) return "WAITING";

        const normalized = String(status)
            .trim()
            .toUpperCase()
            .replace(/-/g, "_")
            .replace(/ /g, "_");

        if (normalized === "IN_CONSULTATION") {
            return "IN_CONSULTATION";
        }

        if (normalized === "IN_PROGRESS") {
            return "IN_CONSULTATION";
        }

        if (normalized === "SERVING") {
            return "IN_CONSULTATION";
        }

        return normalized;
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "IN_CONSULTATION":
                return "IN CONSULTATION";

            case "COMPLETED":
                return "COMPLETED";

            case "CANCELLED":
                return "CANCELLED";

            case "MISSED":
                return "MISSED";

            case "WAITING":
                return "WAITING";

            default:
                return status || "WAITING";
        }
    };

    const getDoctorName = (appointment) => {
        const doctor = appointment?.doctor;

        if (typeof doctor === "string" && doctor.trim()) {
            return doctor.startsWith("Dr.")
                ? doctor
                : `Dr. ${doctor}`;
        }

        const name =
            doctor?.name ||
            appointment?.doctorName ||
            "Doctor";

        if (String(name).toLowerCase().startsWith("dr.")) {
            return name;
        }

        return `Dr. ${name}`;
    };

    const getDoctorDepartment = (appointment) => {
        return (
            appointment?.doctor?.department ||
            appointment?.doctorDepartment ||
            "General"
        );
    };

    const getPatientName = (appointment) => {
        return (
            appointment?.patientName ||
            appointment?.patient?.name ||
            "Unknown Patient"
        );
    };

    const getPatientPhone = (appointment) => {
        return (
            appointment?.patientPhone ||
            appointment?.patient?.phone ||
            "—"
        );
    };

    const getToken = (appointment) => {
        const token = appointment?.tokenNumber;

        if (token === null || token === undefined || token === "") {
            return "—";
        }

        return `A-${String(token).padStart(2, "0")}`;
    };

    const formatTime = (appointment) => {
        const dateValue =
            appointment?.appointmentTime ||
            appointment?.time;

        if (!dateValue) {
            return "—";
        }

        try {
            const date = new Date(dateValue);

            if (Number.isNaN(date.getTime())) {
                return dateValue;
            }

            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateValue;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "WAITING":
                return "status-waiting";

            case "IN_CONSULTATION":
                return "status-consultation";

            case "COMPLETED":
                return "status-completed";

            case "CANCELLED":
                return "status-cancelled";

            case "MISSED":
                return "status-missed";

            default:
                return "status-waiting";
        }
    };

    // --------------------------------------------------
    // Dashboard statistics
    // --------------------------------------------------

    const stats = useMemo(() => {
        const waiting = appointments.filter(
            (appointment) =>
                getStatus(appointment) === "WAITING"
        ).length;

        const consultation = appointments.filter(
            (appointment) =>
                getStatus(appointment) === "IN_CONSULTATION"
        ).length;

        const completed = appointments.filter(
            (appointment) =>
                getStatus(appointment) === "COMPLETED"
        ).length;

        return {
            total: appointments.length,
            waiting,
            consultation,
            completed,
        };
    }, [appointments]);

    // --------------------------------------------------
    // Doctor-wise overview
    // --------------------------------------------------

    const doctorOverview = useMemo(() => {
        const doctorMap = {};

        appointments.forEach((appointment) => {
            const doctorId =
                appointment?.doctor?.id ||
                appointment?.doctorId ||
                getDoctorName(appointment);

            if (!doctorMap[doctorId]) {
                doctorMap[doctorId] = {
                    id: doctorId,
                    name: getDoctorName(appointment),
                    department: getDoctorDepartment(appointment),
                    waiting: 0,
                    consultation: 0,
                    completed: 0,
                    activeAppointments: [],
                };
            }

            const status = getStatus(appointment);

            if (status === "WAITING") {
                doctorMap[doctorId].waiting += 1;
                doctorMap[doctorId].activeAppointments.push(appointment);
            }

            if (status === "IN_CONSULTATION") {
                doctorMap[doctorId].consultation += 1;
                doctorMap[doctorId].activeAppointments.push(appointment);
            }

            if (status === "COMPLETED") {
                doctorMap[doctorId].completed += 1;
            }
        });

        return Object.values(doctorMap);
    }, [appointments]);

    // --------------------------------------------------
    // Recent appointments
    // --------------------------------------------------

    const recentAppointments = useMemo(() => {
        return [...appointments]
            .sort((a, b) => {
                const tokenA = Number(a?.tokenNumber) || 0;
                const tokenB = Number(b?.tokenNumber) || 0;

                return tokenB - tokenA;
            })
            .slice(0, 6);
    }, [appointments]);

    // --------------------------------------------------
    // Logout
    // --------------------------------------------------

    const handleLogout = () => {
        setIsLoggingOut(true);

        setTimeout(() => {
            localStorage.clear();

            navigate("/login", {
                replace: true,
            });
        }, 2000);
    };

    // --------------------------------------------------
    // Manual refresh
    // --------------------------------------------------

    const handleRefresh = () => {
        fetchAppointments(false);
    };

    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    return (
        <div className="receptionist-container">

            {/* ================= SIDEBAR ================= */}
            <aside className="receptionist-sidebar">

                <div className="sidebar-top">

                    <div className="sidebar-brand">
                        SmartQueue
                    </div>

                    <nav className="sidebar-nav">

                        <button
                            onClick={() =>
                                navigate("/receptionist/dashboard")
                            }
                            className="nav-btn active"
                        >
                            📊 Dashboard
                        </button>

                        <button
                            onClick={() =>
                                navigate("/receptionist/appointments")
                            }
                            className="nav-btn"
                        >
                            📅 Appointments
                        </button>

                        <button
                            onClick={() =>
                                navigate("/receptionist/queue")
                            }
                            className="nav-btn"
                        >
                            🎫 Live Queue
                        </button>

                        <button
                            onClick={() =>
                                navigate("/receptionist/patients")
                            }
                            className="nav-btn"
                        >
                            👤 Patients
                        </button>

                    </nav>
                </div>

                <div className="sidebar-bottom">

                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                    >
                        🚪 Logout
                    </button>

                </div>
            </aside>

            {/* ================= MAIN ================= */}
            <main className="receptionist-main">

                {/* Header */}
                <header className="receptionist-header">

                    <h1 className="header-title">
                        Receptionist Dashboard
                    </h1>

                    <div className="header-right">

                        <span
                            className="header-notification"
                            title="Notifications"
                        >
                            🔔
                        </span>

                        <div className="header-user">

                            <div className="user-avatar">
                                {receptionistName
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <span className="header-user-name">
                                {receptionistName}
                            </span>

                        </div>

                    </div>
                </header>

                {/* Body */}
                <div className="receptionist-body">

                    {/* ================= WELCOME ================= */}

                    <div className="queue-page-heading">

                        <h2 className="welcome-title">
                            Welcome back, {receptionistName} 👋
                        </h2>

                        <p className="welcome-sub">
                            Here is today's hospital appointment
                            and queue overview.
                        </p>

                    </div>

                    {/* ================= ERROR ================= */}

                    {error && (
                        <div className="queue-error">
                            <span>⚠️</span>

                            <span>{error}</span>

                            <button
                                className="action-btn"
                                onClick={() =>
                                    fetchAppointments(true)
                                }
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* ================= STATS ================= */}

                    <div className="queue-summary-grid">

                        {/* Today's Appointments */}
                        <div className="queue-summary-card summary-active">

                            <div className="queue-summary-circle">
                                📅
                            </div>

                            <div className="queue-summary-content">

                                <p className="queue-summary-label">
                                    Today's Appointments
                                </p>

                                <h2 className="queue-summary-value">
                                    {loading ? "—" : stats.total}
                                </h2>

                            </div>
                        </div>

                        {/* Waiting */}
                        <div className="queue-summary-card summary-waiting">

                            <div className="queue-summary-circle">
                                ⏳
                            </div>

                            <div className="queue-summary-content">

                                <p className="queue-summary-label">
                                    Waiting Patients
                                </p>

                                <h2 className="queue-summary-value">
                                    {loading ? "—" : stats.waiting}
                                </h2>

                            </div>
                        </div>

                        {/* Consultation */}
                        <div className="queue-summary-card summary-consultation">

                            <div className="queue-summary-circle">
                                🩺
                            </div>

                            <div className="queue-summary-content">

                                <p className="queue-summary-label">
                                    In Consultation
                                </p>

                                <h2 className="queue-summary-value">
                                    {loading
                                        ? "—"
                                        : stats.consultation}
                                </h2>

                            </div>
                        </div>

                        {/* Completed */}
                        <div className="queue-summary-card summary-completed">

                            <div className="queue-summary-circle">
                                ✓
                            </div>

                            <div className="queue-summary-content">

                                <p className="queue-summary-label">
                                    Completed Today
                                </p>

                                <h2 className="queue-summary-value">
                                    {loading
                                        ? "—"
                                        : stats.completed}
                                </h2>

                            </div>
                        </div>

                    </div>

                    {/* ================= QUICK ACTIONS ================= */}

                    <div className="queue-doctor-selector-card">

                        <div>
                            <h3 className="queue-selector-title">
                                Quick Actions
                            </h3>

                            <p className="queue-selector-subtitle">
                                Quickly manage today's patients and queue.
                            </p>
                        </div>

                        <div className="queue-selector-actions">

                            <button
                                className="doctor-view-btn"
                                onClick={() =>
                                    navigate(
                                        "/receptionist/appointments"
                                    )
                                }
                            >
                                📅 Book Appointment
                            </button>

                            <button
                                className="doctor-view-btn"
                                onClick={() =>
                                    navigate(
                                        "/receptionist/patients"
                                    )
                                }
                            >
                                👤 Patients
                            </button>

                            <button
                                className="doctor-view-btn"
                                onClick={() =>
                                    navigate(
                                        "/receptionist/queue"
                                    )
                                }
                            >
                                🎫 Live Queue
                            </button>

                        </div>

                    </div>

                    {/* ================= DOCTOR OVERVIEW ================= */}

                    <section className="doctor-overview-section">

                        <div className="section-heading-row">

                            <div>
                                <h3 className="section-title">
                                    Doctor Queue Overview
                                </h3>

                                <p className="section-subtitle">
                                    Current queue status for each doctor.
                                </p>
                            </div>

                            <button
                                className="queue-back-btn"
                                onClick={() =>
                                    navigate(
                                        "/receptionist/queue"
                                    )
                                }
                            >
                                View Live Queue →
                            </button>

                        </div>

                        {loading ? (
                            <div className="queue-loading">
                                <div className="queue-loading-icon">
                                    ⏳
                                </div>

                                <p>
                                    Loading doctor queues...
                                </p>
                            </div>
                        ) : doctorOverview.length === 0 ? (

                            <div className="queue-empty">

                                <div className="queue-empty-icon">
                                    📋
                                </div>

                                <h3>
                                    No appointments today
                                </h3>

                                <p>
                                    There are no appointments
                                    available for today.
                                </p>

                                <button
                                    className="doctor-view-btn"
                                    onClick={() =>
                                        navigate(
                                            "/receptionist/appointments"
                                        )
                                    }
                                >
                                    Book Appointment
                                </button>

                            </div>

                        ) : (

                            <div className="doctor-overview-grid">

                                {doctorOverview.map((doctor) => {

                                    const currentConsultation =
                                        doctor.activeAppointments.find(
                                            (appointment) =>
                                                getStatus(
                                                    appointment
                                                ) ===
                                                "IN_CONSULTATION"
                                        );

                                    const nextPatient =
                                        doctor.activeAppointments
                                            .filter(
                                                (appointment) =>
                                                    getStatus(
                                                        appointment
                                                    ) === "WAITING"
                                            )
                                            .sort(
                                                (a, b) =>
                                                    (Number(
                                                        a?.tokenNumber
                                                    ) || 0) -
                                                    (Number(
                                                        b?.tokenNumber
                                                    ) || 0)
                                            )[0];

                                    return (
                                        <div
                                            key={doctor.id}
                                            className="doctor-overview-card"
                                        >

                                            {/* Doctor Header */}
                                            <div className="doctor-card-header">

                                                <div>

                                                    <h3 className="doctor-card-name">
                                                        {doctor.name}
                                                    </h3>

                                                    <p className="doctor-card-department">
                                                        {doctor.department}
                                                    </p>

                                                </div>

                                                <span className="doctor-active-badge">
                                                    {doctor.waiting +
                                                        doctor.consultation}{" "}
                                                    Active
                                                </span>

                                            </div>

                                            {/* Current consultation */}
                                            <div className="doctor-current-box">

                                                <p className="doctor-current-label">
                                                    CURRENTLY SERVING
                                                </p>

                                                {currentConsultation ? (

                                                    <div className="doctor-current-info">

                                                        <span className="doctor-token">
                                                            {getToken(
                                                                currentConsultation
                                                            )}
                                                        </span>

                                                        <span className="doctor-current-patient">
                                                            {getPatientName(
                                                                currentConsultation
                                                            )}
                                                        </span>

                                                    </div>

                                                ) : (

                                                    <p className="doctor-no-current">
                                                        No patient in consultation
                                                    </p>

                                                )}

                                            </div>

                                            {/* Stats */}
                                            <div className="doctor-card-stats">

                                                <div className="doctor-stat">

                                                    <span className="doctor-stat-label">
                                                        Waiting
                                                    </span>

                                                    <span className="doctor-stat-value waiting-value">
                                                        {doctor.waiting}
                                                    </span>

                                                </div>

                                                <div className="doctor-stat">

                                                    <span className="doctor-stat-label">
                                                        Consultation
                                                    </span>

                                                    <span className="doctor-stat-value consultation-value">
                                                        {doctor.consultation}
                                                    </span>

                                                </div>

                                                <div className="doctor-stat">

                                                    <span className="doctor-stat-label">
                                                        Completed
                                                    </span>

                                                    <span className="doctor-stat-value completed-value">
                                                        {doctor.completed}
                                                    </span>

                                                </div>

                                            </div>

                                            {/* Next Patient */}
                                            {nextPatient && (
                                                <div className="doctor-next-patient">

                                                    <span>
                                                        Next Patient
                                                    </span>

                                                    <strong>
                                                        {getToken(
                                                            nextPatient
                                                        )}{" "}
                                                        —{" "}
                                                        {getPatientName(
                                                            nextPatient
                                                        )}
                                                    </strong>

                                                </div>
                                            )}

                                            {/* View Queue */}
                                            <button
                                                className="doctor-view-btn"
                                                onClick={() =>
                                                    navigate(
                                                        "/receptionist/queue",
                                                        {
                                                            state: {
                                                                doctorId:
                                                                doctor.id,
                                                            },
                                                        }
                                                    )
                                                }
                                            >
                                                View Queue →
                                            </button>

                                        </div>
                                    );
                                })}

                            </div>
                        )}

                    </section>

                    {/* ================= RECENT APPOINTMENTS ================= */}

                    <div className="table-card">

                        <div className="section-heading-row">

                            <div>

                                <h3 className="table-heading">
                                    Recent Appointments
                                </h3>

                                <p className="section-subtitle">
                                    Latest appointments from today.
                                </p>

                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                }}
                            >

                                {lastUpdated && (
                                    <span className="queue-last-updated">
                                        Updated{" "}
                                        {lastUpdated.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                )}

                                <button
                                    className="action-btn"
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                >
                                    {refreshing
                                        ? "Refreshing..."
                                        : "↻ Refresh"}
                                </button>

                            </div>

                        </div>

                        <div className="queue-table-wrapper">

                            {loading ? (

                                <div className="queue-loading">

                                    <div className="queue-loading-icon">
                                        ⏳
                                    </div>

                                    <p>
                                        Loading appointments...
                                    </p>

                                </div>

                            ) : recentAppointments.length === 0 ? (

                                <div className="queue-empty">

                                    <div className="queue-empty-icon">
                                        📅
                                    </div>

                                    <h3>
                                        No appointments today
                                    </h3>

                                    <p>
                                        Today's appointments will appear here.
                                    </p>

                                </div>

                            ) : (

                                <table className="custom-table">

                                    <thead>
                                    <tr>
                                        <th>Token</th>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>

                                    <tbody>

                                    {recentAppointments.map(
                                        (appointment) => {

                                            const status =
                                                getStatus(
                                                    appointment
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        appointment.id
                                                    }
                                                >

                                                    <td className="queue-token-cell">
                                                        {getToken(
                                                            appointment
                                                        )}
                                                    </td>

                                                    <td>

                                                        <div className="queue-table-patient-name">
                                                            {getPatientName(
                                                                appointment
                                                            )}
                                                        </div>

                                                        <div className="queue-table-phone">
                                                            {getPatientPhone(
                                                                appointment
                                                            )}
                                                        </div>

                                                    </td>

                                                    <td>

                                                        <div>
                                                            {getDoctorName(
                                                                appointment
                                                            )}
                                                        </div>

                                                        <div className="queue-table-phone">
                                                            {getDoctorDepartment(
                                                                appointment
                                                            )}
                                                        </div>

                                                    </td>

                                                    <td>
                                                        {formatTime(
                                                            appointment
                                                        )}
                                                    </td>

                                                    <td>

                                                            <span
                                                                className={`status-badge ${getStatusClass(
                                                                    status
                                                                )}`}
                                                            >
                                                                {getStatusLabel(
                                                                    status
                                                                )}
                                                            </span>

                                                    </td>

                                                    <td>

                                                        {status ===
                                                            "WAITING" && (
                                                                <button
                                                                    className="action-btn"
                                                                    onClick={() =>
                                                                        navigate(
                                                                            "/receptionist/appointments"
                                                                        )
                                                                    }
                                                                >
                                                                    Check-In
                                                                </button>
                                                            )}

                                                        {status ===
                                                            "IN_CONSULTATION" && (
                                                                <span className="queue-no-wait-cell">
                                                                    In progress
                                                                </span>
                                                            )}

                                                        {status ===
                                                            "COMPLETED" && (
                                                                <span className="queue-no-wait-cell">
                                                                    Completed
                                                                </span>
                                                            )}

                                                        {status ===
                                                            "CANCELLED" && (
                                                                <span className="queue-no-wait-cell">
                                                                    Cancelled
                                                                </span>
                                                            )}

                                                        {status ===
                                                            "MISSED" && (
                                                                <span className="queue-no-wait-cell">
                                                                    Missed
                                                                </span>
                                                            )}

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                    </tbody>

                                </table>
                            )}

                        </div>

                        {/* View all */}
                        {!loading &&
                            appointments.length > 6 && (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        marginTop: "18px",
                                    }}
                                >
                                    <button
                                        className="queue-back-btn"
                                        onClick={() =>
                                            navigate(
                                                "/receptionist/appointments"
                                            )
                                        }
                                    >
                                        View All Appointments →
                                    </button>
                                </div>
                            )}

                    </div>

                    {/* Auto refresh information */}
                    <div className="queue-last-updated">

                        <span className="auto-refresh-text">
                            🔄 Dashboard automatically refreshes every
                            30 seconds
                        </span>

                    </div>

                </div>
            </main>

            {/* ================= LOGOUT OVERLAY ================= */}

            {isLoggingOut && (
                <div className="logout-overlay">

                    <div className="logout-modal">

                        <div className="logout-spinner"></div>

                        <h3>
                            Logging out securely...
                        </h3>

                        <p>
                            Please wait while we clear your session.
                        </p>

                    </div>

                </div>
            )}

        </div>
    );
};

export default ReceptionistDashboard;