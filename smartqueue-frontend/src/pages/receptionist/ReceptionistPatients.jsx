import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/ReceptionistDashboard.css";

const ReceptionistPatients = () => {
    const navigate = useNavigate();
    const [receptionistName, setReceptionistName] = useState('Receptionist');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Patients list state
    const [patientsList, setPatientsList] = useState([
        { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com", phone: "9878787889", age: 28, gender: "Male" },
        { id: 2, name: "Priya Verma", email: "priya@gmail.com", phone: "8989787889", age: 24, gender: "Female" },
        { id: 3, name: "Amit Kumar", email: "amit@gmail.com", phone: "7878787889", age: 32, gender: "Male" }
    ]);

    // New patient form state
    const [newPatient, setNewPatient] = useState({
        name: "",
        email: "",
        phone: "",
        age: "",
        gender: "Male"
    });

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

    const handleRegisterPatient = (e) => {
        e.preventDefault();
        const entry = {
            id: patientsList.length + 1,
            ...newPatient
        };
        setPatientsList([entry, ...patientsList]);
        setShowAddModal(false);
        setNewPatient({ name: "", email: "", phone: "", age: "", gender: "Male" });
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
                        <button onClick={() => navigate('/receptionist/queue')} className="nav-btn">🎫 Live Queue</button>
                        <button onClick={() => navigate('/receptionist/patients')} className="nav-btn active">👤 Patients</button>
                    </nav>
                </div>
                <div className="sidebar-bottom">
                    <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="receptionist-main">
                <header className="receptionist-header">
                    <h1 className="header-title">Patients Directory</h1>
                    <div className="header-right">
                        <span style={{ cursor: 'pointer', fontSize: '18px' }}>🔔</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="user-avatar">{receptionistName.charAt(0).toUpperCase()}</div>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{receptionistName}</span>
                        </div>
                    </div>
                </header>

                <div className="receptionist-body">
                    <div className="mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 className="welcome-title">Registered Patients</h2>
                            <p className="welcome-sub">View patient profiles or register new walk-in patients.</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                            + Register Patient
                        </button>
                    </div>

                    {/* Patients Table */}
                    <div className="table-card">
                        <table className="custom-table">
                            <thead>
                            <tr>
                                <th>Patient Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Age</th>
                                <th>Gender</th>
                            </tr>
                            </thead>
                            <tbody>
                            {patientsList.map((patient) => (
                                <tr key={patient.id}>
                                    <td style={{ fontWeight: '600', color: '#1f2937' }}>{patient.name}</td>
                                    <td>{patient.email}</td>
                                    <td>{patient.phone}</td>
                                    <td>{patient.age}</td>
                                    <td>{patient.gender}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Register Patient Modal */}
            {showAddModal && (
                <div className="logout-overlay" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '450px', maxWidth: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ marginBottom: '15px', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>Register New Patient</h3>

                        <form onSubmit={handleRegisterPatient}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '12px', color: '#4b5563', display: 'block', marginBottom: '4px' }}>Full Name</label>
                                <input type="text" placeholder="Enter full name" value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '12px', color: '#4b5563', display: 'block', marginBottom: '4px' }}>Email</label>
                                <input type="email" placeholder="Email address" value={newPatient.email} onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '12px', color: '#4b5563', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                                <input type="text" placeholder="Phone number" value={newPatient.phone} onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '12px', color: '#4b5563', display: 'block', marginBottom: '4px' }}>Age</label>
                                    <input type="number" placeholder="Age" value={newPatient.age} onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '12px', color: '#4b5563', display: 'block', marginBottom: '4px' }}>Gender</label>
                                    <select value={newPatient.gender} onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 14px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                                <button type="submit" style={{ padding: '8px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Register</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

export default ReceptionistPatients;