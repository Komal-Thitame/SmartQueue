import React, { useState, useEffect } from 'react';
import '../styles/AdminSettings.css';

export default function AdminSettingsSection() {
    const [hospitalInfo, setHospitalInfo] = useState({
        hospitalName: '',
        opdBlock: '',
        contactPhone: '',
        email: '',
        address: ''
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');

    // 1. Fetch Hospital Settings on Component Mount
    useEffect(() => {
        fetch('http://localhost:8081/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setHospitalInfo({
                        hospitalName: data.hospitalName || '',
                        opdBlock: data.opdBlock || '',
                        contactPhone: data.contactPhone || '',
                        email: data.email || '',
                        address: data.address || ''
                    });
                }
            })
            .catch(err => console.error("Error fetching settings:", err));
    }, []);

    const handleHospitalChange = (e) => {
        setHospitalInfo({ ...hospitalInfo, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    // 2. Save Hospital Settings Handler
    const handleSaveHospital = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8081/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(hospitalInfo)
            });
            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Hospital settings updated successfully!');
            } else {
                setMessage('Failed to update settings.');
            }
        } catch (err) {
            console.error("Error updating settings:", err);
            setMessage('Network error.');
        }

        setTimeout(() => setMessage(''), 3000);
    };

    // 3. Update Password Handler (Connected with Logged-in User Email)
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        // LocalStorage se logged-in admin ka email uthayein
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const adminEmail = storedUser.email || localStorage.getItem('email') || 'admin@gmail.com';

        try {
            const response = await fetch('http://localhost:8081/api/admin/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: adminEmail,
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                })
            });
            const data = await response.json();

            if (response.ok) {
                setPasswordMessage(data.message || 'Password changed successfully!');
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert(data.message || 'Current password is incorrect!');
            }
        } catch (err) {
            console.error("Error changing password:", err);
            alert('Error connecting to server.');
        }

        setTimeout(() => setPasswordMessage(''), 3000);
    };

    return (
        <div className="admin-settings-container">
            <div className="settings-header-card">
                <div>
                    <h1 className="settings-title">Admin Settings</h1>
                    <p className="settings-subtitle">Manage hospital profile, system preferences, and security settings.</p>
                </div>
                {message && <div className="settings-alert">{message}</div>}
            </div>

            <div className="settings-grid">
                {/* Hospital Information Section */}
                <div className="settings-card">
                    <h2 className="settings-card-title">🏥 Hospital Information</h2>
                    <form onSubmit={handleSaveHospital}>
                        <div className="settings-form-group">
                            <label className="settings-label">Hospital Name</label>
                            <input
                                type="text"
                                name="hospitalName"
                                value={hospitalInfo.hospitalName}
                                onChange={handleHospitalChange}
                                className="settings-input"
                                required
                            />
                        </div>
                        <div className="settings-form-group">
                            <label className="settings-label">OPD Block / Branch</label>
                            <input
                                type="text"
                                name="opdBlock"
                                value={hospitalInfo.opdBlock}
                                onChange={handleHospitalChange}
                                className="settings-input"
                                required
                            />
                        </div>
                        <div className="settings-form-row">
                            <div className="settings-form-group">
                                <label className="settings-label">Contact Phone</label>
                                <input
                                    type="text"
                                    name="contactPhone"
                                    value={hospitalInfo.contactPhone}
                                    onChange={handleHospitalChange}
                                    className="settings-input"
                                    required
                                />
                            </div>
                            <div className="settings-form-group">
                                <label className="settings-label">Official Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={hospitalInfo.email}
                                    onChange={handleHospitalChange}
                                    className="settings-input"
                                    required
                                />
                            </div>
                        </div>
                        <div className="settings-form-group">
                            <label className="settings-label">Address</label>
                            <textarea
                                name="address"
                                rows="2"
                                value={hospitalInfo.address}
                                onChange={handleHospitalChange}
                                className="settings-textarea"
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="settings-btn-primary">
                            Save Hospital Settings
                        </button>
                    </form>
                </div>

                {/* Security & Password Section */}
                <div className="settings-card">
                    <h2 className="settings-card-title">🔒 Security & Password</h2>
                    {passwordMessage && <div className="settings-alert" style={{ marginBottom: '16px' }}>{passwordMessage}</div>}
                    <form onSubmit={handleUpdatePassword}>
                        <div className="settings-form-group">
                            <label className="settings-label">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                placeholder="••••••••"
                                value={passwords.currentPassword}
                                onChange={handlePasswordChange}
                                className="settings-input"
                                required
                            />
                        </div>
                        <div className="settings-form-group">
                            <label className="settings-label">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="••••••••"
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                                className="settings-input"
                                required
                            />
                        </div>
                        <div className="settings-form-group">
                            <label className="settings-label">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                className="settings-input"
                                required
                            />
                        </div>
                        <div style={{ marginTop: '24px' }}>
                            <button type="submit" className="settings-btn-dark">
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}