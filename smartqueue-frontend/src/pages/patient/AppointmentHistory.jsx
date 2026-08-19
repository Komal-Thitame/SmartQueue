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

    // 🟢 Backend se patient ki appointments fetch karke sirf History/Past records filter karna
    const fetchAppointmentHistory = async (id) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8081/api/appointments/patient/${id}`);

            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                const todayStr = new Date().toISOString().split('T')[0];

                // Filter logic: Sirf wahi records jo past date ke hain YAA jinka status COMPLETED, CANCELLED, MISSED hai
                const pastAppointments = response.data.filter((appt) => {
                    const rawDate = appt.appointmentDate || appt.date || appt.bookingDate || appt.createdAt;
                    let formattedDate = todayStr;
                    if (rawDate) {
                        try {
                            formattedDate = rawDate.split('T')[0];
                        } catch (e) {
                            formattedDate = todayStr;
                        }
                    }

                    const status = (appt.status || "").toUpperCase();

                    // Rule: Date < today OR status completed/cancelled/missed (aur aaj ki WAITING/UPCOMING yaha nahi aayegi)
                    const isPastDate = formattedDate < todayStr;
                    const isFinishedStatus = status === "COMPLETED" || status === "CANCELLED" || status === "MISSED";

                    return isPastDate || isFinishedStatus;
                });

                const formattedHistory = pastAppointments.map((appt) => {
                    const rawDate = appt.appointmentDate || appt.date || appt.bookingDate || appt.createdAt;
                    let formattedDate = "N/A";

                    if (rawDate) {
                        try {
                            formattedDate = rawDate.split('T')[0]; // YYYY-MM-DD format
                        } catch (e) {
                            formattedDate = rawDate;
                        }
                    }

                    return {
                        id: appt.id,
                        date: formattedDate,
                        doctor: appt.doctor ? appt.doctor.name : (appt.doctorName || "Dr. Assigned"),
                        department: appt.doctor ? appt.doctor.department : (appt.department || "General"),
                        token: appt.tokenNumber ? `#${appt.tokenNumber}` : `#${appt.id}`,
                        status: appt.status || "COMPLETED"
                    };
                });

                // Latest past appointments ko upar dikhane ke liye reverse karna
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
                                                item.status.toUpperCase() === "COMPLETED"
                                                    ? "status-completed"
                                                    : item.status.toUpperCase() === "CANCELLED"
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
                                <p style={{ fontSize: '16px', fontWeight: '500' }}>No past appointment history found.</p>
                                <p style={{ fontSize: '14px', marginTop: '5px' }}>Your completed, cancelled, or missed past visits will appear here.</p>
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