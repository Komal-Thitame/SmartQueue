import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/PatientDashboard.css";

const AppointmentHistory = () => {
    const navigate = useNavigate();

    const [patientName, setPatientName] = useState("Patient");
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setPatientName(storedName);
        }
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const patientId = localStorage.getItem("userId");

            if (!patientId) {
                console.error("No patient ID found in localStorage!");
                setLoading(false);
                setAppointments([]);
                return;
            }

            // 🟢 FIXED: Yahan `/active/` ki jagah `/patient/` endpoint use kiya hai taaki saari history mile
            const response = await axios.get(
                `http://localhost:8081/api/appointments/patient/${patientId}`
            );

            const data = response.data;
            if (Array.isArray(data)) {
                // Latest appointments ko sabse upar dikhane ke liye sort karna
                const sortedData = data.sort((a, b) => {
                    const dateA = new Date(a.appointmentDate || a.date || a.createdAt || 0);
                    const dateB = new Date(b.appointmentDate || b.date || b.createdAt || 0);
                    return dateB - dateA;
                });
                setAppointments(sortedData);
            } else {
                setAppointments([]);
            }

        } catch (error) {
            console.error("Appointments fetch error:", error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            navigate("/login", { replace: true });
        }, 1500);
    };

    // Smart Date Helper & Normalizer
    const todayStr = new Date().toISOString().split('T')[0];

    const displayAppointmentDate = (app) => {
        const rawDate = app.appointmentDate || app.date || app.bookingDate || app.created_at || app.createdAt;
        if (!rawDate) return "Today (Aaj)";

        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            const formattedRaw = rawDate.split('T')[0];

            if (formattedRaw === todayStr) {
                return "Today (Aaj)";
            } else if (formattedRaw === tomorrowStr) {
                return "Tomorrow (Kal)";
            } else {
                const dateObj = new Date(rawDate);
                if (!isNaN(dateObj.getTime())) {
                    return dateObj.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    });
                }
            }
        } catch (e) {
            // Fallback
        }
        return rawDate;
    };

    const getStatusClass = (status) => {
        const st = (status || "WAITING").toUpperCase();
        switch (st) {
            case "COMPLETED":
                return "status-completed";
            case "CANCELLED":
                return "status-cancelled";
            case "MISSED":
                return "status-missed";
            case "IN_PROGRESS":
            case "IN_CONSULTATION":
                return "status-progress";
            default:
                return "status-waiting";
        }
    };

    return (
        <div className="patient-dashboard-container">
            {/* SIDEBAR */}
            <aside className="patient-sidebar">
                <div className="patient-sidebar-top">
                    <div className="patient-brand">SmartQueue</div>
                    <nav className="patient-nav">
                        <button onClick={() => navigate("/patient/dashboard")} className="patient-nav-btn">📊 Dashboard</button>
                        <button onClick={() => navigate("/patient/book-appointment")} className="patient-nav-btn">📅 Book Appointment</button>
                        <button onClick={() => navigate("/patient/mytokens")} className="patient-nav-btn">🎫 My Tokens</button>
                        <button onClick={() => navigate("/patient/appointmenthistory")} className="patient-nav-btn active">📜 History</button>
                        <button onClick={() => navigate("/patient/profile")} className="patient-nav-btn">👤 Profile</button>
                    </nav>
                </div>
                <div className="patient-sidebar-bottom">
                    <button onClick={handleLogout} className="patient-logout-btn">🚪 Logout</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="patient-main">
                <header className="patient-header">
                    <h1 className="patient-header-title">Appointment History</h1>
                    <div className="patient-header-right">
                        <span style={{ cursor: "pointer", fontSize: "18px" }}>🔔</span>
                        <div onClick={() => navigate("/patient/profile")} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                            <div className="patient-avatar">{patientName.charAt(0).toUpperCase()}</div>
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>{patientName}</span>
                        </div>
                    </div>
                </header>

                <div className="patient-body">
                    <div className="history-table-container">
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                                Loading appointment history...
                            </div>
                        ) : appointments.length > 0 ? (
                            <table className="history-table">
                                <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Doctor</th>
                                    <th>Department</th>
                                    <th>Token</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {appointments.map((app, index) => (
                                    <tr key={app.id || index}>
                                        <td>{displayAppointmentDate(app)}</td>
                                        <td>{app.doctorName || app.doctor?.name || "Doctor Not Assigned"}</td>
                                        <td>{app.department || app.doctor?.department || "General"}</td>
                                        <td>{app.tokenNumber ? `#${app.tokenNumber}` : "N/A"}</td>
                                        <td>
                                                <span className={getStatusClass(app.status)}>
                                                    {(app.status || "WAITING").toUpperCase()}
                                                </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                                <p style={{ fontSize: "16px", fontWeight: "500" }}>No appointment history found.</p>
                                <p style={{ fontSize: "14px", marginTop: "5px" }}>Your appointment records will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {isLoggingOut && (
                <div className="logout-overlay">
                    <div className="logout-modal">
                        <div className="logout-spinner"></div>
                        <h3>Logging out securely...</h3>
                        <p>Please wait...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentHistory;