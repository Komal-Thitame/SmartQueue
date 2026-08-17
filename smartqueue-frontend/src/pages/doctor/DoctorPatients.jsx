import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/ReceptionistDashboard.css";

const DoctorPatients = () => {
    const navigate = useNavigate();
    const [doctorName, setDoctorName] = useState('Doctor');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Patients list who visited the doctor
    const [patientsList, setPatientsList] = useState([
        { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com", phone: "9878787889", age: 28, gender: "Male", lastVisit: "2026-08-16", diagnosis: "Viral Fever" },
        { id: 2, name: "Priya Verma", email: "priya@gmail.com", phone: "8989787889", age: 24, gender: "Female", lastVisit: "2026-08-16", diagnosis: "Routine Checkup" },
        { id: 3, name: "Amit Kumar", email: "amit@gmail.com", phone: "7878787889", age: 32, gender: "Male", lastVisit: "2026-08-15", diagnosis: "Hypertension" }
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

    return (
        <div className="receptionist-container">
            {/* Sidebar Navigation */}
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

            {/* Main Content Area */}
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
                        <p className="welcome-sub">View patient medical records, history, and diagnosis details.</p>
                    </div>

                    {/* Patients Table */}
                    <div className="table-card">
                        <table className="custom-table">
                            <thead>
                            <tr>
                                <th>Patient Name</th>
                                <th>Contact</th>
                                <th>Age / Gender</th>
                                <th>Last Visit</th>
                                <th>Diagnosis</th>
                            </tr>
                            </thead>
                            <tbody>
                            {patientsList.map((patient) => (
                                <tr key={patient.id}>
                                    <td style={{ fontWeight: '600', color: '#1f2937' }}>{patient.name}</td>
                                    <td>
                                        <div style={{ fontSize: '13px' }}>{patient.phone}</div>
                                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{patient.email}</div>
                                    </td>
                                    <td>{patient.age} yrs / {patient.gender}</td>
                                    <td>{patient.lastVisit}</td>
                                    <td>
                                            <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>
                                                {patient.diagnosis}
                                            </span>
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

export default DoctorPatients;