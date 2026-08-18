import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../styles/ReceptionistDashboard.css";

const DoctorQueue = () => {
    const navigate = useNavigate();
    const [doctorName, setDoctorName] = useState('Doctor');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [queueList, setQueueList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        const userId = localStorage.getItem("userId");

        if (storedName) {
            setDoctorName(storedName);
        }

        if (userId) {
            fetchDoctorQueue(userId);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchDoctorQueue = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8081/api/queue/doctor-queue/${userId}`);
            setQueueList(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching doctor queue:", error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, 2000);
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:8081/api/queue/update/${id}`, {
                status: newStatus
            });

            setQueueList(queueList.map(item =>
                item.id === id ? { ...item, status: newStatus } : item
            ));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    return (
        <div className="receptionist-container">
            {/* Sidebar Navigation */}
            <aside className="receptionist-sidebar">
                <div className="sidebar-top">
                    <div className="sidebar-brand">SmartQueue</div>
                    <nav className="sidebar-nav">
                        <button onClick={() => navigate('/doctor/dashboard')} className="nav-btn">📊 Dashboard</button>
                        <button onClick={() => navigate('/doctor/queue')} className="nav-btn active">🎫 My Queue</button>
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
                    <h1 className="header-title">Live Queue Management</h1>
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
                        <h2 className="welcome-title">My Assigned Queue</h2>
                        <p className="welcome-sub">Monitor your real-time consultation line and manage patient statuses.</p>
                    </div>

                    {/* Queue Table */}
                    <div className="table-card">
                        {loading ? (
                            <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Loading live queue...</p>
                        ) : queueList.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No patients in the queue right now.</p>
                        ) : (
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
                                {queueList.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: '700', color: '#059669' }}>{item.tokenNumber || item.token}</td>
                                        <td>{item.patientName}</td>
                                        <td>{item.age || 'N/A'} yrs / {item.gender || 'N/A'}</td>
                                        <td>
                                            <span className={`status-badge ${(item.status || '').toLowerCase()}`}>
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
                                                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '550' }}>Done</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
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

export default DoctorQueue;