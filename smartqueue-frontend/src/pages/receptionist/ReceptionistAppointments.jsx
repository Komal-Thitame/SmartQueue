import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "../../config"; // Apna config import karein
import "../../styles/ReceptionistDashboard.css";

const ReceptionistAppointments = () => {
    const navigate = useNavigate();
    const [receptionistName, setReceptionistName] = useState('Receptionist');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Modal state for Walk-in Appointment
    const [showModal, setShowModal] = useState(false);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);

    // Form fields for Walk-in
    const [walkInForm, setWalkInForm] = useState({
        patientId: "",
        doctorId: "",
        appointmentDate: new Date().toISOString().split('T')[0],
        isNewPatient: false,
        newName: "",
        newEmail: "",
        newPhone: "",
        newAge: "",
        newGender: "Male"
    });

    const [appointments, setAppointments] = useState([
        { id: 1, token: "A-01", patientName: "Rahul Sharma", doctor: "Dr. Amit", date: "2026-08-16", status: "WAITING" },
        { id: 2, token: "A-02", patientName: "Priya Verma", doctor: "Dr. Komal", date: "2026-08-16", status: "COMPLETED" },
        { id: 3, token: "A-03", patientName: "Amit Kumar", doctor: "Dr. Amit", date: "2026-08-16", status: "WAITING" },
    ]);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setReceptionistName(storedName);
        }
        // Fetch real patients and doctors list from backend if needed
        // fetchPatientsAndDoctors();
    }, []);

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, 2000); // Exact 2 seconds delay for logout
    };

    const handleCheckIn = (id) => {
        setAppointments(appointments.map(app =>
            app.id === id ? { ...app, status: "IN-PROGRESS" } : app
        ));
    };

    const handleWalkInSubmit = (e) => {
        e.preventDefault();
        // Dummy integration for frontend display; connect this to `${API_BASE_URL}/appointments/walk-in`
        const newToken = `A-0${appointments.length + 1}`;
        const newEntry = {
            id: appointments.length + 1,
            token: newToken,
            patientName: walkInForm.isNewPatient ? walkInForm.newName : "Selected Patient",
            doctor: "Dr. Amit", // Dynamic based on selection
            date: walkInForm.appointmentDate,
            status: "WAITING"
        };

        setAppointments([newEntry, ...appointments]);
        setShowModal(false);
        // Reset form
        setWalkInForm({
            patientId: "",
            doctorId: "",
            appointmentDate: new Date().toISOString().split('T')[0],
            isNewPatient: false,
            newName: "",
            newEmail: "",
            newPhone: "",
            newAge: "",
            newGender: "Male"
        });
    };

    return (
        <div className="receptionist-container">
            {/* Sidebar Navigation */}
            <aside className="receptionist-sidebar">
                <div className="sidebar-top">
                    <div className="sidebar-brand">SmartQueue</div>
                    <nav className="sidebar-nav">
                        <button onClick={() => navigate('/receptionist/dashboard')} className="nav-btn">📊 Dashboard</button>
                        <button onClick={() => navigate('/receptionist/appointments')} className="nav-btn active">📅 Appointments</button>
                        <button onClick={() => navigate('/receptionist/queue')} className="nav-btn">🎫 Live Queue</button>
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
                    <h1 className="header-title">Manage Appointments</h1>
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
                            <h2 className="welcome-title">All Patient Appointments</h2>
                            <p className="welcome-sub">View and update the status of hospital appointments or create walk-ins.</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                            + Walk-in Appointment
                        </button>
                    </div>

                    {/* Appointments Table */}
                    <div className="table-card">
                        <table className="custom-table">
                            <thead>
                            <tr>
                                <th>Token</th>
                                <th>Patient Name</th>
                                <th>Doctor</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {appointments.map((app) => (
                                <tr key={app.id}>
                                    <td style={{ fontWeight: '600' }}>{app.token}</td>
                                    <td>{app.patientName}</td>
                                    <td>{app.doctor}</td>
                                    <td>{app.date}</td>
                                    <td>
                                            <span className={`status-badge ${app.status.toLowerCase()}`}>
                                                {app.status}
                                            </span>
                                    </td>
                                    <td>
                                        {app.status === "WAITING" ? (
                                            <button className="action-btn" onClick={() => handleCheckIn(app.id)}>
                                                Check-In
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Completed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Walk-in Modal Form */}
            {showModal && (
                <div className="logout-overlay" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '450px', maxWidth: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ marginBottom: '15px', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>Create Walk-in Appointment</h3>

                        <form onSubmit={handleWalkInSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', marginBottom: '15px', fontWeight: '500' }}>
                                    <input
                                        type="checkbox"
                                        checked={walkInForm.isNewPatient}
                                        onChange={(e) => setWalkInForm({ ...walkInForm, isNewPatient: e.target.checked })}
                                    />
                                    Register New Patient (Walk-in)
                                </label>

                                {walkInForm.isNewPatient ? (
                                    <>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{ fontSize: '12px', color: '#4b5563', display: 'block', marginBottom: '4px' }}>Patient Name</label>
                                            <input type="text" placeholder="Enter full name" value={walkInForm.newName} onChange={(e) => setWalkInForm({ ...walkInForm, newName: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{ fontSize: '12px', color: '#4b5563', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                                            <input type="text" placeholder="Phone number" value={walkInForm.newPhone} onChange={(e) => setWalkInForm({ ...walkInForm, newPhone: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontSize: '12px', color: '#4b5563', display: 'block', marginBottom: '4px' }}>Search Existing Patient</label>
                                        <input type="text" placeholder="Enter patient email or phone" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontSize: '12px', color: '#4b5563', display: 'block', marginBottom: '4px' }}>Select Doctor</label>
                                <select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                                    <option value="">Choose Doctor</option>
                                    <option value="1">Dr. Amit (General)</option>
                                    <option value="2">Dr. Komal (Cardio)</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '12px', color: '#4b5563', display: 'block', marginBottom: '4px' }}>Appointment Date</label>
                                <input
                                    type="date"
                                    value={walkInForm.appointmentDate}
                                    onChange={(e) => setWalkInForm({ ...walkInForm, appointmentDate: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 14px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                                <button type="submit" style={{ padding: '8px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Create Appointment</button>
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

export default ReceptionistAppointments;