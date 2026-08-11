import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/PatientDashboard.css";

const PatientProfile = () => {
    const navigate = useNavigate();

    // Dynamic user state from localStorage
    const [patientName, setPatientName] = useState('Patient');

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setPatientName(storedName);
            // Optionally update initial profile name if stored
            setProfile(prev => ({ ...prev, name: storedName }));
        }
    }, []);

    // Logout popup state
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, 2500);
    };

    // Profile state - Ye baad me backend Spring Boot API se fetch hogi
    const [profile, setProfile] = useState({
        name: "Komal",
        email: "komal@gmail.com",
        phone: "+91 9876543210",
        bloodGroup: "O+",
        age: "22",
        gender: "Female",
        address: "Sangamner, Maharashtra"
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsEditing(false);
        // Yahan baad me Spring Boot backend ko PUT/POST request bhejenge profile update karne ke liye
        alert("Profile updated successfully!");
    };

    return (
        <div className="patient-dashboard-container">
            {/* Sidebar Navigation */}
            <aside className="patient-sidebar">
                <div className="patient-sidebar-top">
                    <div className="patient-brand">SmartQueue</div>
                    <nav className="patient-nav">
                        <button onClick={() => navigate('/patient/dashboard')} className="patient-nav-btn">📊 Dashboard</button>
                        <button onClick={() => navigate('/patient/book-appointment')} className="patient-nav-btn">📅 Book Appointment</button>
                        <button onClick={() => navigate('/patient/mytokens')} className="patient-nav-btn">🎫 My Tokens</button>
                        <button onClick={() => navigate('/patient/appointmenthistory')} className="patient-nav-btn">📜 History</button>
                        <button onClick={() => navigate('/patient/profile')} className="patient-nav-btn active">👤 Profile</button>
                    </nav>
                </div>
                <div className="patient-sidebar-bottom">
                    <button onClick={handleLogout} className="patient-logout-btn">🚪 Logout</button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="patient-main">
                <header className="patient-header">
                    <h1 className="patient-header-title">Patient Profile</h1>
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

                <div className="patient-body" style={{ maxWidth: '700px' }}>
                    <div className="mb-6" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 className="patient-welcome-title">Personal Information</h2>
                            <p className="patient-welcome-sub">View and update your personal and medical details.</p>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: isEditing ? '#6b7280' : '#059669',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '14px'
                            }}
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: isEditing ? '#fff' : '#f9fafb' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: isEditing ? '#fff' : '#f9fafb' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: isEditing ? '#fff' : '#f9fafb' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Blood Group</label>
                                    <input
                                        type="text"
                                        name="bloodGroup"
                                        value={profile.bloodGroup}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: isEditing ? '#fff' : '#f9fafb' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Age</label>
                                    <input
                                        type="text"
                                        name="age"
                                        value={profile.age}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: isEditing ? '#fff' : '#f9fafb' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Gender</label>
                                    <input
                                        type="text"
                                        name="gender"
                                        value={profile.gender}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: isEditing ? '#fff' : '#f9fafb' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={profile.address}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: isEditing ? '#fff' : '#f9fafb' }}
                                />
                            </div>

                            {isEditing && (
                                <button
                                    type="submit"
                                    className="patient-primary-btn"
                                    style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '10px' }}
                                >
                                    Save Changes
                                </button>
                            )}
                        </form>
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

export default PatientProfile;