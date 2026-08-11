import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/PatientDashboard.css";

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [patientName, setPatientName] = useState('Patient');
    const [activeAppointment, setActiveAppointment] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        // LocalStorage se naam fetch karein
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setPatientName(storedName);
        }
    }, []);

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, 2500);
    };

    return (
        <div className="patient-dashboard-container">
            <aside className="patient-sidebar">
                <div className="patient-sidebar-top">
                    <div className="patient-brand">SmartQueue</div>
                    <nav className="patient-nav">
                        <button className="patient-nav-btn active">📊 Dashboard</button>
                        <button onClick={() => navigate('/patient/book-appointment')} className="patient-nav-btn">📅 Book Appointment</button>
                        <button onClick={() => navigate('/patient/mytokens')} className="patient-nav-btn">🎫 My Tokens</button>
                        <button onClick={() => navigate('/patient/appointmenthistory')} className="patient-nav-btn">📜 History</button>
                        <button onClick={() => navigate('/patient/profile')} className="patient-nav-btn">👤 Profile</button>
                    </nav>
                </div>
                <div className="patient-sidebar-bottom">
                    <button onClick={handleLogout} className="patient-logout-btn">🚪 Logout</button>
                </div>
            </aside>

            <main className="patient-main">
                {/* Header jahan click karne par Profile khulegi */}
                <header className="patient-header">
                    <h1 className="patient-header-title">Patient Dashboard</h1>
                    <div className="patient-header-right">
                        <span style={{ cursor: 'pointer', fontSize: '18px' }}>🔔</span>

                        {/* Yahan add kiya hai onClick: Profile page par redirect ke liye */}
                        <div
                            onClick={() => navigate('/patient/profile')}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                        >
                            <div className="patient-avatar">
                                {patientName.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                {patientName}
                            </span>
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
                                <h3 className="patient-stat-value">{activeAppointment ? 1 : 0}</h3>
                            </div>
                            <div className="patient-stat-icon emerald">📋</div>
                        </div>
                        <div className="patient-stat-card">
                            <div>
                                <p className="patient-stat-title">Waiting Patients</p>
                                <h3 className="patient-stat-value">{activeAppointment ? '3' : '-'}</h3>
                            </div>
                            <div className="patient-stat-icon blue">⏳</div>
                        </div>
                    </div>

                    <div className="patient-content-box">
                        <div style={{ padding: '24px 0' }}>
                            <div className="patient-empty-icon">🏥</div>
                            <h3 className="patient-empty-title">No active appointment</h3>
                            <p className="patient-empty-desc">You don't have any active appointments right now.</p>
                            <button onClick={() => navigate('/patient/book-appointment')} className="patient-primary-btn">
                                + Book Appointment
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {isLoggingOut && (
                <div className="logout-overlay">
                    <div className="logout-modal">
                        <div className="logout-spinner"></div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0' }}>Logging out securely...</h3>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Please wait...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;