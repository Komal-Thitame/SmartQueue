import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/ReceptionistDashboard.css";

const ReceptionistDashboard = () => {
    const navigate = useNavigate();

    const [receptionistName, setReceptionistName] = useState('Receptionist');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setReceptionistName(storedName);
        }
    }, []);

    // Stats data (dummy data for UI preview)
    const stats = [
        { title: "Today's Appointments", count: 12, color: "#3b82f6" },
        { title: "Waiting Patients", count: 5, color: "#eab308" },
        { title: "Completed", count: 7, color: "#22c55e" }
    ];

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, 2000); // 👈 Set to exactly 2 seconds (2000ms)
    };

    return (
        <div className="receptionist-container">
            {/* Sidebar Navigation */}
            <aside className="receptionist-sidebar">
                <div className="sidebar-top">
                    <div className="sidebar-brand">SmartQueue</div>
                    <nav className="sidebar-nav">
                        <button onClick={() => navigate('/receptionist/dashboard')} className="nav-btn active">📊 Dashboard</button>
                        <button onClick={() => navigate('/receptionist/appointments')} className="nav-btn">📅 Appointments</button>
                        <button onClick={() => navigate('/receptionist/queue')} className="nav-btn">🎫 Live Queue</button>
                        <button onClick={() => navigate('/receptionist/patients')} className="nav-btn">👤 Patients</button>
                    </nav>
                </div>
                <div className="sidebar-bottom">
                    <button onClick={handleLogout} className="logout-btn">
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="receptionist-main">
                <header className="receptionist-header">
                    <h1 className="header-title">Receptionist Dashboard</h1>
                    <div className="header-right">
                        <span style={{ cursor: 'pointer', fontSize: '18px' }}>🔔</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="user-avatar">
                                {receptionistName.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                {receptionistName}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="receptionist-body">
                    <div className="mb-6">
                        <h2 className="welcome-title">Welcome back, {receptionistName} 👋</h2>
                        <p className="welcome-sub">Here is the overview of today's hospital queue and appointments.</p>
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

                    {/* Quick View Table */}
                    <div className="table-card">
                        <h3 className="table-heading">Recent Appointments</h3>
                        <table className="custom-table">
                            <thead>
                            <tr>
                                <th>Token</th>
                                <th>Patient Name</th>
                                <th>Doctor</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td style={{ fontWeight: '600' }}>A-01</td>
                                <td>Rahul Sharma</td>
                                <td>Dr. Amit</td>
                                <td><span className="status-badge">WAITING</span></td>
                                <td>
                                    <button className="action-btn">Check-In</button>
                                </td>
                            </tr>
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

export default ReceptionistDashboard;