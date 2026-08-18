import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/PatientDashboard.css";

const PatientDashboard = () => {
    const navigate = useNavigate();

    const [patientName, setPatientName] = useState("Patient");
    const [activeAppointment, setActiveAppointment] = useState(null);
    const [waitingCount, setWaitingCount] = useState("-");
    const [isLoadingAppointment, setIsLoadingAppointment] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setPatientName(storedName);
        }
    }, []);

    useEffect(() => {
        fetchActiveAppointment();
    }, []);

    const fetchActiveAppointment = async () => {
        try {
            setIsLoadingAppointment(true);
            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:8081/api/patient/appointments/active",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setActiveAppointment(response.data);

            // 🟢 Agar active appointment mil gayi hai, toh us department/doctor ke waiting patients fetch karein
            if (response.data && response.data.department) {
                fetchWaitingPatients(response.data.department);
            } else {
                setWaitingCount("0");
            }

        } catch (error) {
            console.error("Active appointment fetch error:", error);
            setActiveAppointment(null);
            setWaitingCount("0");
        } finally {
            setIsLoadingAppointment(false);
        }
    };

    // 🟢 Waiting patients count laane ke liye function
    const fetchWaitingPatients = async (department) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:8081/api/queue/waiting-count?department=${department}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setWaitingCount(response.data.count || response.data || "0");
        } catch (error) {
            console.error("Error fetching waiting count:", error);
            setWaitingCount("0");
        }
    };

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            navigate("/login", { replace: true });
        }, 1500);
    };

    const handleViewToken = () => {
        navigate("/patient/mytokens");
    };

    const handleBookAppointment = () => {
        navigate("/patient/book-appointment");
    };

    return (
        <div className="patient-dashboard-container">
            <aside className="patient-sidebar">
                <div className="patient-sidebar-top">
                    <div className="patient-brand">SmartQueue</div>
                    <nav className="patient-nav">
                        <button className="patient-nav-btn active" onClick={() => navigate("/patient/dashboard")}>📊 Dashboard</button>
                        <button onClick={() => navigate("/patient/book-appointment")} className="patient-nav-btn">📅 Book Appointment</button>
                        <button onClick={() => navigate("/patient/mytokens")} className="patient-nav-btn">🎫 My Tokens</button>
                        <button onClick={() => navigate("/patient/appointmenthistory")} className="patient-nav-btn">📜 History</button>
                        <button onClick={() => navigate("/patient/profile")} className="patient-nav-btn">👤 Profile</button>
                    </nav>
                </div>
                <div className="patient-sidebar-bottom">
                    <button onClick={handleLogout} className="patient-logout-btn">🚪 Logout</button>
                </div>
            </aside>

            <main className="patient-main">
                <header className="patient-header">
                    <h1 className="patient-header-title">Patient Dashboard</h1>
                    <div className="patient-header-right">
                        <span style={{ cursor: "pointer", fontSize: "18px" }}>🔔</span>
                        <div onClick={() => navigate("/patient/profile")} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                            <div className="patient-avatar">{patientName.charAt(0).toUpperCase()}</div>
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>{patientName}</span>
                        </div>
                    </div>
                </header>

                <div className="patient-body">
                    <div>
                        <h2 className="patient-welcome-title">Good Morning, {patientName} 👋</h2>
                        <p className="patient-welcome-sub">Manage your appointments and track your queue live status.</p>
                    </div>

                    <div className="patient-stats-grid">
                        <div className="patient-stat-card">
                            <div>
                                <p className="patient-stat-title">Active Booking</p>
                                <h3 className="patient-stat-value">
                                    {isLoadingAppointment ? "..." : activeAppointment ? "1" : "0"}
                                </h3>
                            </div>
                            <div className="patient-stat-icon emerald">📋</div>
                        </div>

                        <div className="patient-stat-card">
                            <div>
                                <p className="patient-stat-title">Waiting Patients</p>
                                <h3 className="patient-stat-value">
                                    {isLoadingAppointment ? "..." : waitingCount}
                                </h3>
                            </div>
                            <div className="patient-stat-icon blue">⏳</div>
                        </div>
                    </div>

                    <div className="patient-content-box">
                        {isLoadingAppointment && (
                            <div style={{ padding: "50px 20px", textAlign: "center" }}>
                                <div style={{ fontSize: "35px", marginBottom: "15px" }}>⏳</div>
                                <h3 style={{ margin: "0 0 8px" }}>Loading appointment...</h3>
                                <p style={{ color: "#6b7280", margin: 0 }}>Please wait.</p>
                            </div>
                        )}

                        {!isLoadingAppointment && activeAppointment && (
                            <div style={{ padding: "28px" }}>
                                <h3 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "24px", color: "#1f2937" }}>Active Appointment</h3>

                                <div style={{ marginBottom: "18px" }}>
                                    <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "5px" }}>Doctor</p>
                                    <strong style={{ fontSize: "16px" }}>{activeAppointment.doctorName || "Doctor"}</strong>
                                </div>

                                <div style={{ marginBottom: "18px" }}>
                                    <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "5px" }}>Department</p>
                                    <strong>{activeAppointment.department || "Not Available"}</strong>
                                </div>

                                <div style={{ marginBottom: "18px" }}>
                                    <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "5px" }}>Appointment Date</p>
                                    <strong>{activeAppointment.appointmentDate || "Not Available"}</strong>
                                </div>

                                <div style={{ marginBottom: "18px" }}>
                                    <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "5px" }}>Appointment Time</p>
                                    <strong>{activeAppointment.appointmentTime || "Not Available"}</strong>
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "5px" }}>Status</p>
                                    <strong style={{ color: "#059669" }}>{activeAppointment.status || "BOOKED"}</strong>
                                </div>

                                {activeAppointment.tokenNumber && (
                                    <div style={{ padding: "18px", background: "#ecfdf5", borderRadius: "12px", marginBottom: "20px" }}>
                                        <p style={{ margin: "0 0 5px", color: "#6b7280", fontSize: "13px" }}>Your Token</p>
                                        <h2 style={{ margin: 0, color: "#059669", fontSize: "28px" }}>{activeAppointment.tokenNumber}</h2>
                                    </div>
                                )}

                                {activeAppointment.tokenNumber && (
                                    <button onClick={handleViewToken} className="patient-primary-btn">🎫 View My Token</button>
                                )}
                            </div>
                        )}

                        {!isLoadingAppointment && !activeAppointment && (
                            <div style={{ padding: "24px 0", textAlign: "center" }}>
                                <div className="patient-empty-icon">🏥</div>
                                <h3 className="patient-empty-title">No active appointment</h3>
                                <p className="patient-empty-desc">You don't have any active appointments right now.</p>
                                <button onClick={handleBookAppointment} className="patient-primary-btn">+ Book Appointment</button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {isLoggingOut && (
                <div className="logout-overlay">
                    <div className="logout-modal">
                        <div className="logout-spinner"></div>
                        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", margin: "0" }}>Logging out securely...</h3>
                        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>Please wait...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;