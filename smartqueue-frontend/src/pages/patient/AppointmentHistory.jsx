import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../styles/PatientDashboard.css";

const AppointmentHistory = () => {
    const navigate = useNavigate();

    // Dynamic user states from localStorage
    const [patientName, setPatientName] = useState('Patient');
    const [userId, setUserId] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Logout Popup state
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        const storedId = localStorage.getItem("userId");

        if (storedName) {
            setPatientName(storedName);
        }

        if (storedId) {
            setUserId(storedId);
            fetchAppointmentHistory(storedId);
        } else {
            setLoading(false);
        }
    }, []);

    // 🟢 Backend se patient ki saari appointments fetch karna
    const fetchAppointmentHistory = async (id) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8081/api/appointments/patient/${id}`);

            if (response.data && response.data.length > 0) {
                // Backend data ko table format ke hisaab se map karna
                const formattedHistory = response.data.map((appt) => {
                    // Date formatting (agar createdAt ya date field maujood ho)
                    let formattedDate = "N/A";
                    if (appt.createdAt) {
                        formattedDate = appt.createdAt.substring(0, 10); // YYYY-MM-DD format
                    }

                    return {
                        id: appt.id,
                        date: formattedDate,
                        doctor: appt.doctor ? appt.doctor.name : (appt.doctorName || "Dr. Assigned"),
                        department: appt.doctor ? appt.doctor.department : "General",
                        token: appt.tokenNumber ? `A-0${appt.tokenNumber}` : `A-0${appt.id}`,
                        status: appt.status || "WAITING"
                    };
                });

                // Latest appointments ko upar dikhane ke liye reverse kar sakte hain ya waise hi rakh sakte hain
                setHistory(formattedHistory.reverse());
            } else {
                setHistory([]);
            }
        } catch (error) {
            console.log("Error fetching appointment history:", error);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

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
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading appointment history...</div>
                        ) : history.length > 0 ? (
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
                                {history.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.date}</td>
                                        <td>{item.doctor}</td>
                                        <td>{item.department}</td>
                                        <td>{item.token}</td>
                                        <td>
                                            <span className={
                                                item.status === "COMPLETED" || item.status === "Completed"
                                                    ? "status-completed"
                                                    : item.status === "CANCELLED" || item.status === "Cancelled"
                                                        ? "status-cancelled"
                                                        : "status-waiting"
                                            }>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                <p style={{ fontSize: '16px', fontWeight: '500' }}>No appointment history found.</p>
                                <p style={{ fontSize: '14px', marginTop: '5px' }}>Your past and active appointments will appear here.</p>
                            </div>
                        )}
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