import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/PatientDashboard.css";

const MyTokens = () => {
    const navigate = useNavigate();

    // Dynamic user state from localStorage
    const [patientName, setPatientName] = useState('Patient');

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setPatientName(storedName);
        }
    }, []);

    // 1. Yeh state logout popup ke liye add ki hai
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // 2. Yeh logout function banaya hai jo 2.5 second blur karke redirect karega
    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, 2500);
    };

    const [tokenData, setTokenData] = useState({
        tokenNumber: "A-05",
        doctorName: "Dr. Sharma",
        department: "Cardiology",
        date: "2026-06-06",
        currentServing: "A-02",
        status: "Waiting"
    });

    return (
        <div className="patient-dashboard-container">
            {/* Sidebar Navigation */}
            <aside className="patient-sidebar">
                <div className="patient-sidebar-top">
                    <div className="patient-brand">SmartQueue</div>
                    <nav className="patient-nav">
                        <button onClick={() => navigate('/patient/dashboard')} className="patient-nav-btn">📊 Dashboard</button>
                        <button onClick={() => navigate('/patient/book-appointment')} className="patient-nav-btn">📅 Book Appointment</button>
                        <button onClick={() => navigate('/patient/mytokens')} className="patient-nav-btn active">🎫 My Tokens</button>
                        <button onClick={() => navigate('/patient/appointmenthistory')} className="patient-nav-btn">📜 History</button>
                        <button onClick={() => navigate('/patient/profile')} className="patient-nav-btn">👤 Profile</button>
                    </nav>
                </div>
                <div className="patient-sidebar-bottom">
                    {/* 3. Yahan onClick mein navigate ki jagah handleLogout laga diya hai */}
                    <button onClick={handleLogout} className="patient-logout-btn">
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="patient-main">
                <header className="patient-header">
                    <h1 className="patient-header-title">My Tokens & Live Status</h1>
                    <div className="patient-header-right">
                        <span style={{ cursor: 'pointer', fontSize: '18px' }}>🔔</span>

                        {/* Clickable Header Profile Section - Redirects to Profile Page */}
                        <div
                            onClick={() => navigate('/patient/profile')}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                            title="View Profile"
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

                <div className="patient-body patient-tokens-wrapper">
                    <div className="mb-6">
                        <h2 className="patient-welcome-title">Live Token Tracking</h2>
                        <p className="patient-welcome-sub">Track your live queue status and current running token in real-time.</p>
                    </div>

                    {tokenData ? (
                        <div className="token-card-box">
                            <span className="token-live-badge">● Live Queue Active</span>
                            <p style={{ fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Token Number</p>
                            <h1 className="token-number-display">{tokenData.tokenNumber}</h1>
                            <div className="token-details-grid">
                                <div className="token-detail-item"><p>Doctor</p><p>{tokenData.doctorName}</p></div>
                                <div className="token-detail-item"><p>Department</p><p>{tokenData.department}</p></div>
                                <div className="token-detail-item"><p>Currently Serving</p><p className="serving-highlight">{tokenData.currentServing}</p></div>
                                <div className="token-detail-item"><p>Status</p><p className="status-highlight">{tokenData.status}</p></div>
                            </div>
                            <button onClick={() => alert("Refreshing live token status...")} className="patient-primary-btn" style={{ width: '100%', padding: '12px', fontSize: '15px' }}>🔄 Refresh Status</button>
                        </div>
                    ) : (
                        <div className="patient-content-box" style={{ padding: '40px 0', textAlign: 'center' }}>
                            <div className="patient-empty-icon">🎫</div>
                            <h3 className="patient-empty-title">No Active Tokens</h3>
                            <p className="patient-empty-desc">You don't have any active tokens right now.</p>
                            <button onClick={() => navigate('/patient/book-appointment')} className="patient-primary-btn">Book Appointment Now</button>
                        </div>
                    )}
                </div>
            </main>

            {/* 4. Sabse last mein ye popup overlay add hota hai */}
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

export default MyTokens;