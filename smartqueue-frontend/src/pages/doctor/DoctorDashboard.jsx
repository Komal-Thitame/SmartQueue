import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/ReceptionistDashboard.css"; // Hum same CSS use kar sakte hain consistency ke liye

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [doctorName, setDoctorName] = useState('Doctor');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Doctor stats
    const stats = [
        { title: "Today's Patients", count: 8, color: "#3b82f6" },
        { title: "Waiting in Queue", count: 3, color: "#eab308" },
        { title: "Completed Consultations", count: 5, color: "#22c55e" }
    ];

    // Live queue for doctor
    const [doctorQueue, setDoctorQueue] = useState([
        { id: 1, token: "A-01", patientName: "Rahul Sharma", age: 28, gender: "Male", status: "IN-PROGRESS" },
        { id: 2, token: "A-02", patientName: "Priya Verma", age: 24, gender: "Female", status: "WAITING" },
        { id: 3, token: "A-03", patientName: "Amit Kumar", age: 32, gender: "Male", status: "WAITING" },
    ]);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setDoctorName(storedName);
        }
    }, []);

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, 2000); // 👈 Exactly 2 seconds timer
    };

    const updateStatus = (id, newStatus) => {
        setDoctorQueue(doctorQueue.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
        ));
    };

    return (
        <div className="receptionist-container">
            {/* Sidebar Navigation */}
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

            {/* Main Content Area */}
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
                        <p className="welcome-sub">Manage your active patient consultations and live queue flow.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="stats-grid">
                        {stats.map((s, index) => (
                            <div key={index} className="stat-card" style={{ borderLeft: `5px solid ${s.color}` }}>
                                <p className="stat-title">{s.title}</p>
                                <h2 className="stat-count">{s.count}</h2>
                            </div>
                        ))}
                    </div>

                    {/* Live Queue Table */}
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
                            {doctorQueue.map((item) => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: '700', color: '#059669' }}>{item.token}</td>
                                    <td>{item.patientName}</td>
                                    <td>{item.age} yrs / {item.gender}</td>
                                    <td>
                                            <span className={`status-badge ${item.status.toLowerCase()}`}>
                                                {item.status}
                                            </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {item.status === "WAITING" && (
                                                <button
                                                    className="action-btn"
                                                    style={{ background: '#3b82f6', color: '#fff' }}
                                                    onClick={() => updateStatus(item.id, "IN-PROGRESS")}>
                                                    Start Checkup
                                                </button>
                                            )}
                                            {item.status === "IN-PROGRESS" && (
                                                <button
                                                    className="action-btn"
                                                    style={{ background: '#22c55e', color: '#fff' }}
                                                    onClick={() => updateStatus(item.id, "COMPLETED")}>
                                                    Finish
                                                </button>
                                            )}
                                            {item.status === "COMPLETED" && (
                                                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Done</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Logout Overlay */}
            {isLoggingOut && (
                <div className="logout-overlay">
                    <div className="logout-modal">
                        <div className="logout-spinner"></div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0' }}>Logging out securely...</h3>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Please wait while we clear your session.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;