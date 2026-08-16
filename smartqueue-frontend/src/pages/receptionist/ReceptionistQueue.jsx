import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/ReceptionistDashboard.css";

const ReceptionistQueue = () => {
    const navigate = useNavigate();
    const [receptionistName, setReceptionistName] = useState('Receptionist');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Live Queue list state
    const [queueList, setQueueList] = useState([
        { id: 1, token: "A-01", patientName: "Rahul Sharma", doctor: "Dr. Amit", status: "IN-PROGRESS" },
        { id: 2, token: "A-02", patientName: "Priya Verma", doctor: "Dr. Komal", status: "WAITING" },
        { id: 3, token: "A-03", patientName: "Amit Kumar", doctor: "Dr. Amit", status: "WAITING" },
    ]);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setReceptionistName(storedName);
        }
    }, []);

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, 2000);
    };

    // Status update handler (e.g., WAITING -> IN-PROGRESS -> COMPLETED)
    const updateQueueStatus = (id, newStatus) => {
        setQueueList(queueList.map(item =>
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
                        <button onClick={() => navigate('/receptionist/dashboard')} className="nav-btn">📊 Dashboard</button>
                        <button onClick={() => navigate('/receptionist/appointments')} className="nav-btn">📅 Appointments</button>
                        <button onClick={() => navigate('/receptionist/queue')} className="nav-btn active">🎫 Live Queue</button>
                        <button onClick={() => navigate('/receptionist/patients')} className="nav-btn">👤 Patients</button>
                    </nav>
                </div>
                <div className="sidebar-bottom">
                    <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="receptionist-main">
                <header className="receptionist-header">
                    <h1 className="header-title">Live Queue Management</h1>
                    <div className="header-right">
                        <span style={{ cursor: 'pointer', fontSize: '18px' }}>🔔</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="user-avatar">{receptionistName.charAt(0).toUpperCase()}</div>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{receptionistName}</span>
                        </div>
                    </div>
                </header>

                <div className="receptionist-body">
                    <div className="mb-6">
                        <h2 className="welcome-title">Active Hospital Queue</h2>
                        <p className="welcome-sub">Monitor token statuses and manage real-time patient flow.</p>
                    </div>

                    {/* Live Queue Table */}
                    <div className="table-card">
                        <table className="custom-table">
                            <thead>
                            <tr>
                                <th>Token Number</th>
                                <th>Patient Name</th>
                                <th>Assigned Doctor</th>
                                <th>Current Status</th>
                                <th>Manage Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {queueList.map((item) => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: '700', fontSize: '16px', color: '#059669' }}>{item.token}</td>
                                    <td>{item.patientName}</td>
                                    <td>{item.doctor}</td>
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
                                                    onClick={() => updateQueueStatus(item.id, "IN-PROGRESS")}>
                                                    Call In
                                                </button>
                                            )}
                                            {item.status === "IN-PROGRESS" && (
                                                <button
                                                    className="action-btn"
                                                    style={{ background: '#22c55e', color: '#fff' }}
                                                    onClick={() => updateQueueStatus(item.id, "COMPLETED")}>
                                                    Complete
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
                        <h3>Logging out securely...</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceptionistQueue;