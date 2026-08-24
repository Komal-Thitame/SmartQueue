import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../styles/ReceptionistDashboard.css";

const DoctorQueue = () => {
    const navigate = useNavigate();

    const [doctorName, setDoctorName] = useState('Doctor');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [queueList, setQueueList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [updatingId, setUpdatingId] = useState(null);

    // Average expected consultation time
    const AVERAGE_CONSULTATION_TIME = 15;

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        const userId = localStorage.getItem("userId");

        if (storedName) {
            setDoctorName(storedName);
        }

        if (userId) {
            fetchDoctorQueue(userId);
        } else {
            setLoading(false);
        }
    }, []);

    // Live timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Refresh queue automatically every 30 seconds
    useEffect(() => {
        const userId = localStorage.getItem("userId");

        if (!userId) return;

        const interval = setInterval(() => {
            fetchDoctorQueue(userId, false);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchDoctorQueue = async (userId, showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }

            const response = await axios.get(
                `http://localhost:8081/api/queue/doctor-queue/${userId}`
            );

            const sortedQueue = [...response.data].sort((a, b) => {
                const tokenA = parseInt(
                    String(a.tokenNumber || a.token || "").replace(/\D/g, "")
                ) || 0;

                const tokenB = parseInt(
                    String(b.tokenNumber || b.token || "").replace(/\D/g, "")
                ) || 0;

                return tokenA - tokenB;
            });

            setQueueList(sortedQueue);

        } catch (error) {
            console.error("Error fetching doctor queue:", error);
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    // Local storage key for consultation start time
    const getStartTimeKey = (id) => {
        return `consultationStart_${id}`;
    };

    const saveConsultationStartTime = (id) => {
        localStorage.setItem(
            getStartTimeKey(id),
            new Date().toISOString()
        );
    };

    const getConsultationStartTime = (id) => {
        const savedTime = localStorage.getItem(getStartTimeKey(id));

        return savedTime ? new Date(savedTime) : null;
    };

    const removeConsultationStartTime = (id) => {
        localStorage.removeItem(getStartTimeKey(id));
    };

    const getElapsedMinutes = (id) => {
        const startTime = getConsultationStartTime(id);

        if (!startTime) return 0;

        const difference =
            currentTime.getTime() - startTime.getTime();

        return Math.max(0, Math.floor(difference / 60000));
    };

    const formatDuration = (minutes) => {
        if (minutes < 1) {
            return "< 1 min";
        }

        if (minutes < 60) {
            return `${minutes} min`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        return `${hours}h ${remainingMinutes}m`;
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const hasCurrentPatient = queueList.some(
        item => item.status === "IN-PROGRESS"
    );

    // Calculate complete smart queue
    const calculatedQueue = useMemo(() => {
        const activeQueue = queueList.filter(
            item => item.status !== "COMPLETED"
        );

        const completedQueue = queueList.filter(
            item => item.status === "COMPLETED"
        );

        const currentPatient = activeQueue.find(
            item => item.status === "IN-PROGRESS"
        );

        const waitingPatients = activeQueue.filter(
            item => item.status === "WAITING"
        );

        let result = [];

        // COMPLETED patients
        completedQueue.forEach(item => {
            result.push({
                ...item,
                queuePosition: "-",
                estimatedTurn: "Completed",
                waitingTime: "-",
                consultationTime: "Completed"
            });
        });

        let estimatedStartTime = new Date(currentTime);

        // CURRENT PATIENT
        if (currentPatient) {
            const elapsedMinutes = getElapsedMinutes(currentPatient.id);

            const remainingMinutes = Math.max(
                0,
                AVERAGE_CONSULTATION_TIME - elapsedMinutes
            );

            // If consultation takes longer than average,
            // queue shows delay and estimates keep updating
            const delayMinutes = Math.max(
                0,
                elapsedMinutes - AVERAGE_CONSULTATION_TIME
            );

            let consultationText;

            if (delayMinutes > 0) {
                consultationText =
                    `${formatDuration(elapsedMinutes)} (Delayed ${delayMinutes} min)`;
            } else {
                consultationText =
                    `${formatDuration(elapsedMinutes)} elapsed`;
            }

            result.push({
                ...currentPatient,
                queuePosition: 1,
                estimatedTurn: "Now",
                waitingTime: "In consultation",
                consultationTime: consultationText,
                delayMinutes
            });

            /*
             * Normal consultation:
             * Remaining time = 15 - elapsed
             *
             * If doctor continues beyond 15 minutes,
             * the system keeps the next estimate moving
             * with the live consultation.
             */
            if (elapsedMinutes < AVERAGE_CONSULTATION_TIME) {
                estimatedStartTime = new Date(
                    currentTime.getTime() +
                    remainingMinutes * 60000
                );
            } else {
                // Patient is taking longer than expected.
                // Next patient's time moves with the ongoing consultation.
                estimatedStartTime = new Date(
                    currentTime.getTime() + 5 * 60000
                );
            }
        }

        // WAITING PATIENTS
        waitingPatients.forEach((item, index) => {
            const position =
                currentPatient ? index + 2 : index + 1;

            const estimatedTurnDate = new Date(
                estimatedStartTime
            );

            const waitMinutes = Math.max(
                0,
                Math.ceil(
                    (
                        estimatedTurnDate.getTime() -
                        currentTime.getTime()
                    ) / 60000
                )
            );

            result.push({
                ...item,
                queuePosition: position,
                estimatedTurn: formatTime(estimatedTurnDate),
                waitingTime:
                    waitMinutes === 0
                        ? "Next"
                        : `~${waitMinutes} min`,
                consultationTime: "-"
            });

            estimatedStartTime = new Date(
                estimatedStartTime.getTime() +
                AVERAGE_CONSULTATION_TIME * 60000
            );
        });

        return result;
    }, [queueList, currentTime]);

    const handleLogout = () => {
        setIsLoggingOut(true);

        setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, 2000);
    };

    const updateStatus = async (item, newStatus) => {
        try {
            setUpdatingId(item.id);

            // Prevent starting another patient
            if (
                newStatus === "IN-PROGRESS" &&
                hasCurrentPatient
            ) {
                alert(
                    "Please finish the current patient's consultation first."
                );
                return;
            }

            // Update backend
            await axios.put(
                `http://localhost:8081/api/queue/update/${item.id}`,
                {
                    status: newStatus
                }
            );

            // START CONSULTATION
            if (newStatus === "IN-PROGRESS") {
                saveConsultationStartTime(item.id);
            }

            // FINISH CONSULTATION
            if (newStatus === "COMPLETED") {
                const elapsedMinutes =
                    getElapsedMinutes(item.id);

                removeConsultationStartTime(item.id);

                alert(
                    `Consultation completed successfully.\n\n` +
                    `Actual consultation time: ${formatDuration(elapsedMinutes)}`
                );
            }

            // Update frontend immediately
            setQueueList(previousQueue =>
                previousQueue.map(queueItem =>
                    queueItem.id === item.id
                        ? {
                            ...queueItem,
                            status: newStatus
                        }
                        : queueItem
                )
            );

            // Fetch latest backend queue
            const userId = localStorage.getItem("userId");

            if (userId) {
                await fetchDoctorQueue(userId, false);
            }

        } catch (error) {
            console.error("Error updating status:", error);

            alert("Failed to update patient status.");

        } finally {
            setUpdatingId(null);
        }
    };

    const waitingCount = queueList.filter(
        item => item.status === "WAITING"
    ).length;

    const completedCount = queueList.filter(
        item => item.status === "COMPLETED"
    ).length;

    const currentPatient = calculatedQueue.find(
        item => item.status === "IN-PROGRESS"
    );

    return (
        <div className="receptionist-container">

            {/* Sidebar */}
            <aside className="receptionist-sidebar">

                <div className="sidebar-top">

                    <div className="sidebar-brand">
                        SmartQueue
                    </div>

                    <nav className="sidebar-nav">

                        <button
                            onClick={() =>
                                navigate('/doctor/dashboard')
                            }
                            className="nav-btn"
                        >
                            📊 Dashboard
                        </button>

                        <button
                            onClick={() =>
                                navigate('/doctor/queue')
                            }
                            className="nav-btn active"
                        >
                            🎫 My Queue
                        </button>

                        <button
                            onClick={() =>
                                navigate('/doctor/patients')
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

            {/* Main Content */}
            <main className="receptionist-main">

                {/* Header */}
                <header className="receptionist-header">

                    <h1 className="header-title">
                        Live Queue Management
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
                                {doctorName.charAt(0).toUpperCase()}
                            </div>

                            <span
                                style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#374151"
                                }}
                            >
                                {doctorName}
                            </span>

                        </div>

                    </div>

                </header>

                <div className="receptionist-body">

                    {/* Page Title */}
                    <div className="mb-6">

                        <h2 className="welcome-title">
                            My Assigned Queue
                        </h2>

                        <p className="welcome-sub">
                            Monitor live consultation progress and automatically updated patient waiting estimates.
                        </p>

                    </div>

                    {/* Queue Summary */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "16px",
                            marginBottom: "20px"
                        }}
                    >

                        <div className="table-card">
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "13px",
                                    color: "#6b7280"
                                }}
                            >
                                CURRENT PATIENT
                            </p>

                            <h3
                                style={{
                                    margin: "8px 0 0",
                                    color: "#1f2937"
                                }}
                            >
                                {currentPatient
                                    ? currentPatient.tokenNumber ||
                                    currentPatient.token
                                    : "No active patient"}
                            </h3>
                        </div>

                        <div className="table-card">
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "13px",
                                    color: "#6b7280"
                                }}
                            >
                                WAITING PATIENTS
                            </p>

                            <h3
                                style={{
                                    margin: "8px 0 0",
                                    color: "#d97706"
                                }}
                            >
                                {waitingCount}
                            </h3>
                        </div>

                        <div className="table-card">
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "13px",
                                    color: "#6b7280"
                                }}
                            >
                                COMPLETED TODAY
                            </p>

                            <h3
                                style={{
                                    margin: "8px 0 0",
                                    color: "#059669"
                                }}
                            >
                                {completedCount}
                            </h3>
                        </div>

                        <div className="table-card">
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "13px",
                                    color: "#6b7280"
                                }}
                            >
                                AVG. CONSULTATION
                            </p>

                            <h3
                                style={{
                                    margin: "8px 0 0",
                                    color: "#2563eb"
                                }}
                            >
                                {AVERAGE_CONSULTATION_TIME} min
                            </h3>
                        </div>

                    </div>

                    {/* Queue Table */}
                    <div className="table-card">

                        {loading ? (

                            <p
                                style={{
                                    textAlign: "center",
                                    padding: "30px",
                                    color: "#6b7280"
                                }}
                            >
                                Loading live queue...
                            </p>

                        ) : calculatedQueue.length === 0 ? (

                            <p
                                style={{
                                    textAlign: "center",
                                    padding: "30px",
                                    color: "#6b7280"
                                }}
                            >
                                No patients in the queue right now.
                            </p>

                        ) : (

                            <div
                                style={{
                                    overflowX: "auto"
                                }}
                            >

                                <table className="custom-table">

                                    <thead>
                                    <tr>
                                        <th>Position</th>
                                        <th>Token</th>
                                        <th>Patient Name</th>
                                        <th>Age / Gender</th>
                                        <th>Status</th>
                                        <th>Consultation</th>
                                        <th>Estimated Turn</th>
                                        <th>Waiting Time</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>

                                    <tbody>

                                    {calculatedQueue.map((item) => (

                                        <tr key={item.id}>

                                            {/* Position */}
                                            <td
                                                style={{
                                                    fontWeight: "700",
                                                    color: "#374151"
                                                }}
                                            >
                                                {item.queuePosition}
                                            </td>

                                            {/* Token */}
                                            <td
                                                style={{
                                                    fontWeight: "700",
                                                    color: "#059669"
                                                }}
                                            >
                                                {item.tokenNumber ||
                                                    item.token}
                                            </td>

                                            {/* Name */}
                                            <td>
                                                {item.patientName}
                                            </td>

                                            {/* Age / Gender */}
                                            <td>
                                                {item.age || "N/A"} yrs /{" "}
                                                {item.gender || "N/A"}
                                            </td>

                                            {/* Status */}
                                            <td>

                                                    <span
                                                        className={`status-badge ${(
                                                            item.status || ""
                                                        )
                                                            .toLowerCase()
                                                            .replace("-", "")}`}
                                                    >
                                                        {item.status}
                                                    </span>

                                            </td>

                                            {/* Consultation */}
                                            <td
                                                style={{
                                                    fontSize: "13px",
                                                    fontWeight:
                                                        item.status ===
                                                        "IN-PROGRESS"
                                                            ? "600"
                                                            : "400",
                                                    color:
                                                        item.delayMinutes >
                                                        0
                                                            ? "#dc2626"
                                                            : "#4b5563"
                                                }}
                                            >
                                                {item.consultationTime}
                                            </td>

                                            {/* Estimated Turn */}
                                            <td
                                                style={{
                                                    fontWeight: "600",
                                                    color: "#374151"
                                                }}
                                            >
                                                {item.estimatedTurn}
                                            </td>

                                            {/* Waiting Time */}
                                            <td
                                                style={{
                                                    color: "#6b7280"
                                                }}
                                            >
                                                {item.waitingTime}
                                            </td>

                                            {/* Action */}
                                            <td>

                                                {item.status ===
                                                    "WAITING" && (

                                                        <button
                                                            className="action-btn"
                                                            style={{
                                                                background:
                                                                    hasCurrentPatient
                                                                        ? "#9ca3af"
                                                                        : "#3b82f6",
                                                                color: "#fff",
                                                                cursor:
                                                                    hasCurrentPatient
                                                                        ? "not-allowed"
                                                                        : "pointer"
                                                            }}
                                                            disabled={
                                                                hasCurrentPatient ||
                                                                updatingId ===
                                                                item.id
                                                            }
                                                            onClick={() =>
                                                                updateStatus(
                                                                    item,
                                                                    "IN-PROGRESS"
                                                                )
                                                            }
                                                        >
                                                            {updatingId ===
                                                            item.id
                                                                ? "Starting..."
                                                                : "Start Checkup"}
                                                        </button>

                                                    )}

                                                {item.status ===
                                                    "IN-PROGRESS" && (

                                                        <button
                                                            className="action-btn"
                                                            style={{
                                                                background:
                                                                    "#22c55e",
                                                                color: "#fff"
                                                            }}
                                                            disabled={
                                                                updatingId ===
                                                                item.id
                                                            }
                                                            onClick={() =>
                                                                updateStatus(
                                                                    item,
                                                                    "COMPLETED"
                                                                )
                                                            }
                                                        >
                                                            {updatingId ===
                                                            item.id
                                                                ? "Finishing..."
                                                                : "Finish"}
                                                        </button>

                                                    )}

                                                {item.status ===
                                                    "COMPLETED" && (

                                                        <span
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                                color:
                                                                    "#059669",
                                                                fontWeight:
                                                                    "600"
                                                            }}
                                                        >
                                                            ✓ Completed
                                                        </span>

                                                    )}

                                            </td>

                                        </tr>

                                    ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </div>

            </main>

            {/* Logout Overlay */}
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
                            Please wait while we clear your session.
                        </p>

                    </div>

                </div>

            )}

        </div>
    );
};

export default DoctorQueue;