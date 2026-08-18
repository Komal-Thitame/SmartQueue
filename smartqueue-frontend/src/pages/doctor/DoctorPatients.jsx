import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../styles/ReceptionistDashboard.css";

const DoctorPatients = () => {
    const navigate = useNavigate();
    const [doctorName, setDoctorName] = useState('Doctor');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [patientsList, setPatientsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        const userId = localStorage.getItem("userId");

        if (storedName) {
            setDoctorName(storedName);
        }

        if (userId) {
            fetchPatientHistory(userId);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchPatientHistory = async (userId) => {
        try {
            // 🟢 Fixed: properly using await and axios.get
            const response = await axios.get(`http://localhost:8081/api/queue/doctor-history/${userId}`);
            setPatientsList(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching patient records:", error);
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

    return (
        <div className="receptionist-container">
            <aside className="receptionist-sidebar">
                <div className="sidebar-top">
                    <div className="sidebar-brand">SmartQueue</div>
                    <nav className="sidebar-nav">
                        <button onClick={() => navigate('/doctor/dashboard')} className="nav-btn">📊 Dashboard</button>
                        <button onClick={() => navigate('/doctor/queue')} className="nav-btn">🎫 My Queue</button>
                        <button onClick={() => navigate('/doctor/patients')} className="nav-btn active">👤 My Patients</button>
                    </nav>
                </div>
                <div className="sidebar-bottom">
                    <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
                </div>
            </aside>

            <main className="receptionist-main">
                <header className="receptionist-header">
                    <h1 className="header-title">Patients Records</h1>
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
                        <h2 className="welcome-title">My Consulted Patients</h2>
                        <p className="welcome-sub">View patient medical records and visit history.</p>
                    </div>

                    <div className="table-card">
                        {loading ? (
                            <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Loading records...</p>
                        ) : patientsList.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No consultation history found.</p>
                        ) : (
                            <table className="custom-table">
                                <thead>
                                <tr>
                                    <th>Token</th>
                                    <th>Patient Name</th>
                                    <th>Age / Gender</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {patientsList.map((patient) => (
                                    <tr key={patient.id}>
                                        <td style={{ fontWeight: '700', color: '#059669' }}>{patient.tokenNumber}</td>
                                        <td style={{ fontWeight: '600' }}>{patient.patientName}</td>
                                        <td>{patient.age || 'N/A'} yrs / {patient.gender || 'N/A'}</td>
                                        <td>{patient.department}</td>
                                        <td>
                                                <span className={`status-badge ${(patient.status || '').toLowerCase()}`}>
                                                    {patient.status}
                                                </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

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

export default DoctorPatients;