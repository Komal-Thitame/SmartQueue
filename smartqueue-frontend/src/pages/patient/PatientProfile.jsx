import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../styles/PatientDashboard.css";

const PatientProfile = () => {
    const navigate = useNavigate();

    // Dynamic user states
    const [patientName, setPatientName] = useState('Patient');
    const [userId, setUserId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Profile state initialized with localStorage values
    const [profile, setProfile] = useState({
        name: localStorage.getItem("userName") || "",
        email: localStorage.getItem("email") || "",
        phone: "",
        bloodGroup: "",
        age: "",
        gender: "",
        address: ""
    });

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        const storedId = localStorage.getItem("userId");
        const storedEmail = localStorage.getItem("email");

        if (storedName) {
            setPatientName(storedName);
        }

        if (storedId) {
            setUserId(storedId);
            fetchPatientProfile(storedId).catch(err => console.error("Error fetching profile:", err));
        } else {
            // Fallback if userId is missing in localStorage
            setProfile({
                name: storedName || "Patient",
                email: storedEmail || "",
                phone: "",
                bloodGroup: "",
                age: "",
                gender: "",
                address: ""
            });
        }
    }, []);

    // Fetch profile details from backend API with robust mapping for different key formats
    const fetchPatientProfile = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8081/api/patients/${id}`);
            if (response.data) {
                console.log("Fetched User Data:", response.data);
                setProfile({
                    name: response.data.name || response.data.fullName || localStorage.getItem("userName") || "",
                    email: response.data.email || localStorage.getItem("email") || "",
                    phone: response.data.phone || response.data.phoneNumber || "",
                    bloodGroup: response.data.bloodGroup || response.data.bloodgroup || "",
                    age: response.data.age || "",
                    gender: response.data.gender || "",
                    address: response.data.address || ""
                });
                setPatientName(response.data.name || localStorage.getItem("userName"));
            }
        } catch (error) {
            console.log("API not found or error, using localStorage fallback data.");
            setProfile({
                name: localStorage.getItem("userName") || "Patient",
                email: localStorage.getItem("email") || "",
                phone: "",
                bloodGroup: "",
                age: "",
                gender: "",
                address: ""
            });
        }
    };

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, 2000);
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (userId) {
                // 🟢 Updated: Database mein update request bhejna
                await axios.put(`http://localhost:8081/api/patients/update/${userId}`, profile);

                setIsEditing(false);
                setPatientName(profile.name);
                localStorage.setItem("userName", profile.name);

                // 🟢 Updated: Save hone ke baad turant naya data fetch karna
                await fetchPatientProfile(userId);
                alert("Profile updated successfully!");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setIsEditing(false);
            alert("Failed to update profile in database.");
        }
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
                        <div
                            onClick={() => navigate('/patient/profile')}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                            title="View Profile"
                        >
                            <div className="patient-avatar">
                                {patientName ? patientName.charAt(0).toUpperCase() : 'P'}
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
                                    <input type="text" name="name" value={profile.name} onChange={handleChange} disabled={!isEditing} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: isEditing ? '#fff' : '#f9fafb' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email Address</label>
                                    <input type="email" name="email" value={profile.email} onChange={handleChange} disabled={!isEditing} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: isEditing ? '#fff' : '#f9fafb' }} />
                                </div>
                            </div>
                            {/* ... Rest of your form fields ... */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Phone Number</label>
                                    <input type="text" name="phone" value={profile.phone} onChange={handleChange} disabled={!isEditing} placeholder="Enter phone number" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: isEditing ? '#fff' : '#f9fafb' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Blood Group</label>
                                    <input type="text" name="bloodGroup" value={profile.bloodGroup} onChange={handleChange} disabled={!isEditing} placeholder="e.g. O+" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: isEditing ? '#fff' : '#f9fafb' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Age</label>
                                    <input type="text" name="age" value={profile.age} onChange={handleChange} disabled={!isEditing} placeholder="Enter age" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: isEditing ? '#fff' : '#f9fafb' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Gender</label>
                                    <input type="text" name="gender" value={profile.gender} onChange={handleChange} disabled={!isEditing} placeholder="Enter gender" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: isEditing ? '#fff' : '#f9fafb' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Address</label>
                                <input type="text" name="address" value={profile.address} onChange={handleChange} disabled={!isEditing} placeholder="Enter address" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: isEditing ? '#fff' : '#f9fafb' }} />
                            </div>
                            {isEditing && (
                                <button type="submit" className="patient-primary-btn" style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '10px' }}>Save Changes</button>
                            )}
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PatientProfile;