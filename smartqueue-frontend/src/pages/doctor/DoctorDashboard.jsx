import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../styles/ReceptionistDashboard.css";

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [doctorName, setDoctorName] = useState('Doctor');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [doctorQueue, setDoctorQueue] = useState([]);

    // Doctor dynamic stats calculated from queue data
    const totalPatients = doctorQueue.length;
    const waitingPatients = doctorQueue.filter(item => item.status === "WAITING").length;
    const completedConsultations = doctorQueue.filter(item => item.status === "COMPLETED").length;

    const stats = [
        { title: "Today's Patients", count: totalPatients > 0 ? totalPatients : 0, color: "#3b82f6" },
        { title: "Waiting in Queue", count: waitingPatients, color: "#eab308" },
        { title: "Completed Consultations", count: completedConsultations, color: "#22c55e" }
    ];

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setDoctorName(storedName);
        }

        // 🟢 FIXED: Direct logged-in doctor ki ID localStorage se fetch karein
        const doctorId = localStorage.getItem("userId");

        if (doctorId) {
            fetchDoctorQueue(doctorId);
        } else {
            console.error("No Doctor ID found in localStorage!");
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    // Database se live queue fetch karne ka function
    const fetchDoctorQueue = async (doctorId) => {
        try {
            console.log(`Fetching queue for doctor ID: ${doctorId}`);
            const response = await axios.get(`http://localhost:8081/api/queue/doctor-queue/${doctorId}`);
            console.log("Queue data received:", response.data);
            setDoctorQueue(response.data);
        } catch (error) {
            console.error("Error fetching queue:", error);
        }
    };

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, 2000);
    };

    // Database mein status update karne ka function
    const updateStatus = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:8081/api/queue/update/${id}`, { status: newStatus });

            // UI refresh / local state update
            setDoctorQueue(doctorQueue.map(item =>
                item.id === id ? { ...item, status: newStatus } : item
            ));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    return (
        <div className="receptionist-container">
            <aside className="receptionist-sidebar">
                <div className="sidebar-top">
                    <div className="sidebar-brand">SmartQueue</div>
                    <nav className="sidebar-nav">
                        <button onClick={() => navigate('/doctor/dashboard')} className="nav-btn active">📊 Dashboard</button>
                        <button onClick={() => navigate('/doctor/queue')} className="nav-btn">🎫 My Queue</button>
                        <button onClick={() => navigate('/doctor/patients')} className="nav-btn">👤 My Patients</button>
                    </nav>
                </div>
                <div className="sidebar-bottom">
                    <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
                </div>
            </aside>

            <main className="receptionist-main">
                <header className="receptionist-header">
                    <h1 className="header-title">Doctor Dashboard</h1>
                    <div className="header-right">
                        <span style={{ cursor: 'pointer', fontSize: '18px' }}>🔔</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="user-avatar">{doctorName.charAt(0).toUpperCase()}</div>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{doctorName}</span>
                        </div>
                    </div>
                </header>

                <div className="receptionist-body">
                    <div className="mb-6">
                        <h2 className="welcome-title">Welcome, Dr. {doctorName} 🩺</h2>
                    </div>

                    <div className="stats-grid">
                        {stats.map((s, index) => (
                            <div key={index} className="stat-card" style={{ borderLeft: `5px solid ${s.color}` }}>
                                <p className="stat-title">{s.title}</p>
                                <h2 className="stat-count">{s.count}</h2>
                            </div>
                        ))}
                    </div>

                    <div className="table-card">
                        <h3 className="table-heading">Live Consultation Queue</h3>
                        <table className="custom-table">
                            <thead>
                            <tr>
                                <th>Token</th>
                                <th>Patient Name</th>
                                <th>Age / Gender</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {doctorQueue.length > 0 ? (
                                doctorQueue.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: '700', color: '#059669' }}>{item.tokenNumber}</td>
                                        <td>{item.patientName || "N/A"}</td>
                                        <td>{item.age ? `${item.age} yrs` : "-"} {item.gender ? `/ ${item.gender}` : ""}</td>
                                        <td>
                                            <span className={`status-badge ${item.status ? item.status.toLowerCase() : 'waiting'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {item.status === "WAITING" && (
                                                    <button className="action-btn" style={{ background: '#3b82f6', color: '#fff' }} onClick={() => updateStatus(item.id, "SERVING")}>Start Checkup</button>
                                                )}
                                                {item.status === "SERVING" && (
                                                    <button className="action-btn" style={{ background: '#22c55e', color: '#fff' }} onClick={() => updateStatus(item.id, "COMPLETED")}>Finish</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No patients in queue.</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {isLoggingOut && (
                <div className="logout-overlay">
                    <div className="logout-modal">
                        <div className="logout-spinner"></div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0' }}>Logging out securely...</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;