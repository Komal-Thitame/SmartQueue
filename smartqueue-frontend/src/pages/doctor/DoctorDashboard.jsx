import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/ReceptionistDashboard.css";

const DoctorDashboard = () => {
    const navigate = useNavigate();

    const [doctorName, setDoctorName] = useState("Doctor");
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [doctorQueue, setDoctorQueue] = useState([]);
    const [isLoadingQueue, setIsLoadingQueue] = useState(true);

    const doctorId = localStorage.getItem("userId");

    // =========================================================
    // LOAD DOCTOR
    // =========================================================
    useEffect(() => {
        const storedName = localStorage.getItem("userName");

        if (storedName) {
            setDoctorName(storedName);
        }

        if (doctorId) {
            fetchDoctorQueue(doctorId);
        } else {
            console.error("No Doctor ID found in localStorage!");

            navigate("/login", {
                replace: true
            });
        }
    }, [doctorId, navigate]);

    // =========================================================
    // FETCH DOCTOR QUEUE
    // =========================================================
    const fetchDoctorQueue = async (id) => {
        try {
            setIsLoadingQueue(true);

            const response = await axios.get(
                `http://localhost:8081/api/queue/doctor-queue/${id}`
            );

            if (Array.isArray(response.data)) {
                setDoctorQueue(response.data);
            } else {
                setDoctorQueue([]);
            }

        } catch (error) {
            console.error(
                "Error fetching doctor queue:",
                error
            );

            setDoctorQueue([]);

        } finally {
            setIsLoadingQueue(false);
        }
    };

    // =========================================================
    // TODAY DATE
    // =========================================================
    const todayStr =
        new Date().toISOString().split("T")[0];

    // =========================================================
    // NORMALIZE DATE
    // =========================================================
    const getNormalizedDateStr = (item) => {

        const rawDate =
            item.appointmentDate ||
            item.date ||
            item.bookingDate ||
            item.created_at ||
            item.createdAt;

        if (!rawDate) {
            return todayStr;
        }

        try {
            return rawDate.split("T")[0];
        } catch (error) {
            return todayStr;
        }
    };

    // =========================================================
    // TODAY'S APPOINTMENTS
    // =========================================================
    const todaysQueue = doctorQueue.filter((item) => {

        const itemDate =
            getNormalizedDateStr(item);

        return itemDate === todayStr;
    });

    // =========================================================
    // LIVE QUEUE
    //
    // WAITING
    // IN_CONSULTATION
    // =========================================================
    const liveQueue = todaysQueue.filter((item) => {

        return (
            item.status === "WAITING" ||
            item.status === "IN_CONSULTATION"
        );
    });

    // =========================================================
    // STATS
    // =========================================================
    const totalPatients =
        todaysQueue.length;

    const waitingPatients =
        todaysQueue.filter(
            (item) =>
                item.status === "WAITING"
        ).length;

    const completedConsultations =
        todaysQueue.filter(
            (item) =>
                item.status === "COMPLETED"
        ).length;

    const stats = [
        {
            title: "Today's Patients",
            count: totalPatients,
            color: "#3b82f6"
        },
        {
            title: "Waiting in Queue",
            count: waitingPatients,
            color: "#eab308"
        },
        {
            title: "Completed Consultations",
            count: completedConsultations,
            color: "#22c55e"
        }
    ];

    // =========================================================
    // LOGOUT
    // =========================================================
    const handleLogout = () => {

        setIsLoggingOut(true);

        setTimeout(() => {

            localStorage.clear();

            navigate("/login", {
                replace: true
            });

        }, 1500);
    };

    // =========================================================
    // START / FINISH CHECKUP
    // =========================================================
    const updateStatus = async (
        appointmentId,
        newStatus
    ) => {

        try {

            console.log(
                "Updating appointment:",
                appointmentId,
                "Status:",
                newStatus
            );

            await axios.put(
                `http://localhost:8081/api/queue/update/${appointmentId}`,
                {
                    status: newStatus
                }
            );

            // Immediately refresh doctor queue
            if (doctorId) {
                await fetchDoctorQueue(doctorId);
            }

        } catch (error) {

            console.error(
                "Status update error:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            alert(
                error.response?.data?.message ||
                "Failed to update status. Please try again."
            );
        }
    };

    return (
        <div className="receptionist-container">

            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <aside className="receptionist-sidebar">

                <div className="sidebar-top">

                    <div className="sidebar-brand">
                        SmartQueue
                    </div>

                    <nav className="sidebar-nav">

                        <button
                            onClick={() =>
                                navigate("/doctor/dashboard")
                            }
                            className="nav-btn active"
                        >
                            📊 Dashboard
                        </button>

                        <button
                            onClick={() =>
                                navigate("/doctor/queue")
                            }
                            className="nav-btn"
                        >
                            🎫 My Queue
                        </button>

                        <button
                            onClick={() =>
                                navigate("/doctor/patients")
                            }
                            className="nav-btn"
                        >
                            👤 My Patients
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

            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="receptionist-main">

                {/* HEADER */}

                <header className="receptionist-header">

                    <h1 className="header-title">
                        Doctor Dashboard
                    </h1>

                    <div className="header-right">

                        <span
                            style={{
                                cursor: "pointer",
                                fontSize: "18px"
                            }}
                        >
                            🔔
                        </span>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                        >

                            <div className="user-avatar">
                                {doctorName
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
                                Dr. {doctorName}
                            </span>

                        </div>

                    </div>

                </header>

                {/* BODY */}

                <div className="receptionist-body">

                    {/* WELCOME */}

                    <div className="mb-6">

                        <h2 className="welcome-title">
                            Welcome, Dr. {doctorName} 🩺
                        </h2>

                        <p
                            style={{
                                color: "#6b7280",
                                margin: "4px 0 0 0",
                                fontSize: "14px"
                            }}
                        >
                            Manage today's live consultation
                            queue and patient checkups.
                        </p>

                    </div>

                    {/* =================================================
                        STATS
                    ================================================= */}

                    <div className="stats-grid">

                        {stats.map((s, index) => (

                            <div
                                key={index}
                                className="stat-card"
                                style={{
                                    borderLeft:
                                        `5px solid ${s.color}`
                                }}
                            >

                                <p className="stat-title">
                                    {s.title}
                                </p>

                                <h2 className="stat-count">
                                    {isLoadingQueue
                                        ? "..."
                                        : s.count}
                                </h2>

                            </div>

                        ))}

                    </div>

                    {/* =================================================
                        LIVE QUEUE
                    ================================================= */}

                    <div className="table-card">

                        <h3 className="table-heading">
                            Today's Live Consultation Queue
                        </h3>

                        {isLoadingQueue ? (

                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "40px 20px",
                                    color: "#6b7280"
                                }}
                            >

                                <div
                                    style={{
                                        fontSize: "30px",
                                        marginBottom: "10px"
                                    }}
                                >
                                    ⏳
                                </div>

                                <p style={{ margin: 0 }}>
                                    Loading live queue...
                                </p>

                            </div>

                        ) : (

                            <table className="custom-table">

                                <thead>

                                <tr>

                                    <th>
                                        Token
                                    </th>

                                    <th>
                                        Patient Name
                                    </th>

                                    <th>
                                        Age / Gender
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                                </thead>

                                <tbody>

                                {liveQueue.length > 0 ? (

                                    liveQueue.map((item) => (

                                        <tr key={item.id}>

                                            {/* TOKEN */}

                                            <td
                                                style={{
                                                    fontWeight: "700",
                                                    color: "#059669"
                                                }}
                                            >
                                                {item.tokenNumber}
                                            </td>

                                            {/* PATIENT */}

                                            <td>
                                                {item.patientName ||
                                                    "N/A"}
                                            </td>

                                            {/* AGE / GENDER */}

                                            <td>

                                                {item.age
                                                    ? `${item.age} yrs`
                                                    : "-"}

                                                {" "}

                                                {item.gender
                                                    ? `/ ${item.gender}`
                                                    : ""}

                                            </td>

                                            {/* STATUS */}

                                            <td>

                                                    <span
                                                        className={`status-badge ${
                                                            item.status
                                                                ? item.status
                                                                    .toLowerCase()
                                                                    .replace(
                                                                        "_",
                                                                        "-"
                                                                    )
                                                                : "waiting"
                                                        }`}
                                                    >

                                                        {item.status ===
                                                        "IN_CONSULTATION"
                                                            ? "IN CONSULTATION"
                                                            : item.status}

                                                    </span>

                                            </td>

                                            {/* ACTION */}

                                            <td>

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "8px"
                                                    }}
                                                >

                                                    {/* =========================
                                                            WAITING
                                                            START CHECKUP
                                                        ========================= */}

                                                    {item.status ===
                                                        "WAITING" && (

                                                            <button
                                                                className="action-btn"
                                                                style={{
                                                                    background:
                                                                        "#3b82f6",
                                                                    color: "#fff",
                                                                    border:
                                                                        "none",
                                                                    padding:
                                                                        "6px 12px",
                                                                    borderRadius:
                                                                        "6px",
                                                                    cursor:
                                                                        "pointer",
                                                                    fontWeight:
                                                                        "500"
                                                                }}
                                                                onClick={() =>
                                                                    updateStatus(
                                                                        item.id,
                                                                        "IN_CONSULTATION"
                                                                    )
                                                                }
                                                            >
                                                                Start Checkup
                                                            </button>

                                                        )}

                                                    {/* =========================
                                                            IN CONSULTATION
                                                            FINISH
                                                        ========================= */}

                                                    {item.status ===
                                                        "IN_CONSULTATION" && (

                                                            <button
                                                                className="action-btn"
                                                                style={{
                                                                    background:
                                                                        "#22c55e",
                                                                    color: "#fff",
                                                                    border:
                                                                        "none",
                                                                    padding:
                                                                        "6px 12px",
                                                                    borderRadius:
                                                                        "6px",
                                                                    cursor:
                                                                        "pointer",
                                                                    fontWeight:
                                                                        "500"
                                                                }}
                                                                onClick={() =>
                                                                    updateStatus(
                                                                        item.id,
                                                                        "COMPLETED"
                                                                    )
                                                                }
                                                            >
                                                                Finish
                                                            </button>

                                                        )}

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            style={{
                                                textAlign:
                                                    "center",
                                                padding:
                                                    "30px",
                                                color:
                                                    "#6b7280"
                                            }}
                                        >
                                            No patients scheduled
                                            for today in queue.
                                        </td>

                                    </tr>

                                )}

                                </tbody>

                            </table>

                        )}

                    </div>

                </div>

            </main>

            {/* =====================================================
                LOGOUT OVERLAY
            ===================================================== */}

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

export default DoctorDashboard;