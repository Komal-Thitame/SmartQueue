import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/PatientDashboard.css";

const AppointmentHistory = () => {
    const navigate = useNavigate();

    // Dynamic user state from localStorage
    const [patientName, setPatientName] = useState('Patient');

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setPatientName(storedName);
        }
    }, []);

    // Logout Popup state
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, 2500);
    };

    // Dummy Data - Ye baad me database se aayega
    const [history, setHistory] = useState([
        { id: 1, doctor: "Dr. Sharma", date: "2026-07-15", token: "A-02", status: "Completed" },
        { id: 2, doctor: "Dr. Rajesh Kumar", date: "2026-06-20", token: "C-01", status: "Completed" },
        { id: 3, doctor: "Dr. Priya Verma", date: "2026-05-10", token: "B-03", status: "Cancelled" }
    ]);

    return (
        <div className="patient-dashboard-container">
            <aside className="patient-sidebar">
                <div className="patient-sidebar-top">
                    <div className="patient-brand">SmartQueue</div>
                    <nav className="patient-nav">
                        <button onClick={() => navigate('/patient/dashboard')} className="patient-nav-btn">📊 Dashboard</button>
                        <button onClick={() => navigate('/patient/book-appointment')} className="patient-nav-btn">📅 Book Appointment</button>
                        <button onClick={() => navigate('/patient/mytokens')} className="patient-nav-btn">🎫 My Tokens</button>
                        <button onClick={() => navigate('/patient/appointmenthistory')} className="patient-nav-btn active">📜 History</button>
                        <button onClick={() => navigate('/patient/profile')} className="patient-nav-btn">👤 Profile</button>
                    </nav>
                </div>
                <div className="patient-sidebar-bottom">
                    <button onClick={handleLogout} className="patient-logout-btn">
                        🚪 Logout
                    </button>
                </div>
            </aside>

            <main className="patient-main">
                <header className="patient-header">
                    <h1 className="patient-header-title">Appointment History</h1>
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

                <div className="patient-body">
                    <div className="history-table-container">
                        <table className="history-table">
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Doctor</th>
                                <th>Token</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {history.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.date}</td>
                                    <td>{item.doctor}</td>
                                    <td>{item.token}</td>
                                    <td>
                                        <span className={item.status === "Completed" ? "status-completed" : "status-cancelled"}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Logout Popup Overlay */}
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

export default AppointmentHistory;