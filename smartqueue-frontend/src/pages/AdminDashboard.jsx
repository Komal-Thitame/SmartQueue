import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QueueOperations from './QueueOperations'; // Queue Operations Component Import
import '../styles/AdminDashboard.css';
import DoctorSection from './DoctorSection';
import ReceptionistSection from './ReceptionistSection.jsx'; // Import Receptionist Section
import PatientSection from './AdminPatientSection.jsx'; // 👈 Patient Section Import Kiya

const AdminDashboard = () => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const [activeTab, setActiveTab] = useState('control');
    const [selectedDept, setSelectedDept] = useState('Cardiology');
    const [currentToken, setCurrentToken] = useState(1);

    // Profile Dropdown Toggle State
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Dynamic User State (Default empty, strictly loaded from Storage)
    const [currentUser, setCurrentUser] = useState({
        name: 'Admin User',
        email: '',
        role: 'Super Admin',
        hospital: 'City Care Hospital',
        block: 'OPD Block A'
    });

    // 1. Single Clean Effect: Fetch logged-in user email/data on mount
    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('role');

        let displayEmail = storedEmail || "";
        let displayName = "Admin User";
        let displayRole = storedRole || "Super Admin";

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.email) displayEmail = parsedUser.email;
                if (parsedUser.name) displayName = parsedUser.name;
                if (parsedUser.role) displayRole = parsedUser.role;
            } catch (e) {
                console.error("User json parse error", e);
            }
        }

        // Email se Name fallback auto-formatted (e.g. admin@gmail.com -> Admin)
        if (displayEmail && displayName === "Admin User") {
            const nameFromEmail = displayEmail.split('@')[0];
            displayName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        }

        setCurrentUser(prev => ({
            ...prev,
            email: displayEmail || "admin@gmail.com",
            name: displayName,
            role: displayRole
        }));
    }, []);

    // 2. Click Outside Listener to Auto-close Popup
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 3. FETCH LIVE TOKEN FROM BACKEND ON MOUNT & DEPT CHANGE
    useEffect(() => {
        fetchCurrentToken(selectedDept);
    }, [selectedDept]);

    const fetchCurrentToken = async (dept) => {
        try {
            const response = await fetch(`http://localhost:8081/api/queue/current?department=${dept}`);
            const data = await response.json();
            if (data.currentServing) {
                const num = parseInt(data.currentServing.split('-')[1]) || 1;
                setCurrentToken(num);
            }
        } catch (err) {
            console.error("Failed to fetch live token status from Spring Boot", err);
        }
    };

    // 4. ACTION HANDLERS (UPDATED WITH ALL BACKEND APIs)
    const handleNextToken = async () => {
        try {
            const response = await fetch(`http://localhost:8081/api/queue/next?department=${selectedDept}`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.tokenNumber) {
                const nextNum = parseInt(data.tokenNumber.split('-')[1]);
                setCurrentToken(nextNum);
            } else if (data.message) {
                alert(data.message);
            }
        } catch (err) {
            console.error("Error calling next token", err);
            // Fallback for UI testing
            setCurrentToken(prev => prev + 1);
        }
    };

    const handlePreviousToken = async () => {
        try {
            const response = await fetch(`http://localhost:8081/api/queue/previous?department=${selectedDept}`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.tokenNumber) {
                const prevNum = parseInt(data.tokenNumber.split('-')[1]);
                setCurrentToken(prevNum);
            } else if (data.message) {
                alert(data.message);
            }
        } catch (err) {
            console.error("Error calling previous token", err);
            // Fallback for UI testing
            setCurrentToken(prev => Math.max(1, prev - 1));
        }
    };

    // 🔔 RECALL TOKEN HANDLER
    const handleRecallToken = async () => {
        try {
            const response = await fetch(`http://localhost:8081/api/queue/recall?department=${selectedDept}`, {
                method: 'POST'
            });
            const data = await response.json();
            alert(`🔔 ALERT: Recalling Token A-${currentToken} to Cabin!`);
        } catch (err) {
            console.error("Error recalling token", err);
            alert(`🔔 ALERT: Recalling Token A-${currentToken} to Cabin!`);
        }
    };

    // ⏭️ SKIP PATIENT HANDLER
    const handleSkipToken = async () => {
        try {
            const response = await fetch(`http://localhost:8081/api/queue/skip?department=${selectedDept}`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.tokenNumber) {
                const nextNum = parseInt(data.tokenNumber.split('-')[1]);
                setCurrentToken(nextNum);
                alert(`⏭️ Patient Skipped! Now Serving: ${data.tokenNumber}`);
            } else if (data.message) {
                alert(data.message);
            } else {
                setCurrentToken(prev => prev + 1);
                alert(`⏭️ Patient Skipped! Token updated to A-${currentToken + 1}`);
            }
        } catch (err) {
            console.error("Error skipping patient", err);
            // Fallback UI Increment
            setCurrentToken(prev => prev + 1);
            alert(`⏭️ Patient Skipped! Token updated to A-${currentToken + 1}`);
        }
    };

    const handleLogout = () => {
        // Clear auth data completely
        localStorage.removeItem('user');
        localStorage.removeItem('email');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        sessionStorage.clear();

        // Redirect to Login page
        navigate('/login');
    };

    const getUserInitial = () => {
        if (currentUser.name && currentUser.name.length > 0) {
            return currentUser.name.charAt(0).toUpperCase();
        }
        if (currentUser.email && currentUser.email.length > 0) {
            return currentUser.email.charAt(0).toUpperCase();
        }
        return 'A';
    };

    return (
        <div className="sq-saas-layout light-theme">

            {/* 1. FIXED TEAL SIDEBAR */}
            <aside className="sq-rail-sidebar">
                <div className="sq-rail-logo">🏥</div>

                <nav className="sq-rail-nav">
                    <button
                        className={`rail-btn ${activeTab === 'control' ? 'active' : ''}`}
                        onClick={() => setActiveTab('control')}
                        title="Control Center"
                    >
                        <span className="rail-icon">🎛️</span>
                        <span className="rail-lbl">Control</span>
                    </button>

                    <button
                        className={`rail-btn ${activeTab === 'queue' ? 'active' : ''}`}
                        onClick={() => setActiveTab('queue')}
                        title="Queue Operations"
                    >
                        <span className="rail-icon">🎫</span>
                        <span className="rail-lbl">Queue Ops</span>
                    </button>

                    <button
                        className={`rail-btn ${activeTab === 'doctors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('doctors')}
                        title="Doctor Matrix"
                    >
                        <span className="rail-icon">👨‍⚕️</span>
                        <span className="rail-lbl">Doctors</span>
                    </button>

                    <button
                        className={`rail-btn ${activeTab === 'reception' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reception')}
                        title="Reception Desk"
                    >
                        <span className="rail-icon">👩‍💼</span>
                        <span className="rail-lbl">Reception</span>
                    </button>

                    {/* 👈 Patients Tab Clickable Button */}
                    <button
                        className={`rail-btn ${activeTab === 'patients' ? 'active' : ''}`}
                        onClick={() => setActiveTab('patients')}
                        title="Patient Logs"
                    >
                        <span className="rail-icon">👥</span>
                        <span className="rail-lbl">Patients</span>
                    </button>

                    <button
                        className={`rail-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bookings')}
                        title="Appointments"
                    >
                        <span className="rail-icon">📅</span>
                        <span className="rail-lbl">Bookings</span>
                    </button>
                </nav>

                <div className="sq-rail-footer">
                    <button
                        className={`rail-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                        title="Settings"
                    >
                        <span className="rail-icon">⚙️</span>
                        <span className="rail-lbl">Settings</span>
                    </button>
                </div>
            </aside>

            {/* MAIN OPERATIONS HUB */}
            <div className="sq-main-wrapper">

                {/* TOP SAAS BAR */}
                <header className="sq-saas-header">
                    <div className="header-title-zone">
                        <h2>SmartQueue <span className="ops-pill">{activeTab.toUpperCase()} CENTER</span></h2>
                        <span className="location-tag">{currentUser.hospital} • {currentUser.block}</span>
                    </div>

                    <div className="header-right-zone">
                        <div className="sq-pulse-indicator">
                            <span className="pulse-dot"></span> Realtime Engine Active
                        </div>
                        <button className="sq-bell-btn" title="Emergency Alerts">🔔 <span className="dot-alert"></span></button>

                        {/* INTERACTIVE ADMIN PROFILE WITH OUTSIDE CLICK REF */}
                        <div className="profile-wrapper" ref={dropdownRef}>
                            <div
                                className={`sq-user-avatar ${showProfileMenu ? 'active' : ''}`}
                                onClick={() => setShowProfileMenu(prev => !prev)}
                            >
                                <span className="avatar-box">{getUserInitial()}</span>
                                <div className="user-info">
                                    <strong>{currentUser.name}</strong>
                                    <small>{currentUser.role} <span className="caret-icon">{showProfileMenu ? '▲' : '▼'}</span></small>
                                </div>
                            </div>

                            {/* MODERN GLASS DROPDOWN POPUP MENU */}
                            {showProfileMenu && (
                                <div className="profile-dropdown animate-fade-in">
                                    <div className="dropdown-header">
                                        <div className="dropdown-avatar">{getUserInitial()}</div>
                                        <div className="dropdown-user-details">
                                            <h4>{currentUser.name}</h4>
                                            <p>{currentUser.email}</p>
                                            <span className="role-badge">{currentUser.role}</span>
                                        </div>
                                    </div>

                                    <div className="dropdown-divider"></div>

                                    <div className="dropdown-info-list">
                                        <div className="info-item">
                                            <span className="info-lbl">Hospital</span>
                                            <span className="info-val">{currentUser.hospital}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-lbl">Location</span>
                                            <span className="info-val">{currentUser.block}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-lbl">Status</span>
                                            <span className="info-val text-teal">● Active Session</span>
                                        </div>
                                    </div>

                                    <div className="dropdown-divider"></div>

                                    <button className="logout-btn" onClick={handleLogout}>
                                        <span className="logout-icon">🚪</span> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* DYNAMIC CANVAS */}
                <main className="sq-canvas">
                    {/* 1. CONTROL CENTER TAB */}
                    {activeTab === 'control' && (
                        <>
                            {/* HERO WELCOME & PERFORMANCE BANNER */}
                            <div className="sq-glass-banner mb-3">
                                <div className="banner-content">
                                    <h3>Good Morning, {currentUser.name} 👋</h3>
                                    <p>Today's Queue Performance is operating at <strong className="text-teal">94% Efficiency</strong>. Estimated wait time reduced by 4 mins.</p>
                                </div>
                                <div className="banner-right-group">
                                    <div className="emergency-chip-alert">
                                        🚨 <strong>1 Emergency Priority</strong> in Queue
                                    </div>
                                    <div className="banner-badge">
                                        <span>OPS SCORE</span>
                                        <h2>94/100</h2>
                                    </div>
                                </div>
                            </div>

                            {/* KPI METRICS STRIP */}
                            <div className="sq-metrics-grid mb-3">
                                <div className="metric-card">
                                    <span className="m-lbl">PATIENTS TODAY</span>
                                    <div className="m-val-row">
                                        <span className="m-val">128</span>
                                        <span className="m-trend green">↑ 8%</span>
                                    </div>
                                </div>
                                <div className="metric-card alert-card">
                                    <span className="m-lbl">WAITING NOW</span>
                                    <div className="m-val-row">
                                        <span className="m-val text-amber">14</span>
                                        <span className="m-sub">in Lounge</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <span className="m-lbl">ACTIVE DOCTORS</span>
                                    <div className="m-val-row">
                                        <span className="m-val text-teal">6</span>
                                        <span className="m-sub">Consulting</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <span className="m-lbl">AVG WAIT TIME</span>
                                    <div className="m-val-row">
                                        <span className="m-val text-teal">12m</span>
                                        <span className="m-trend green">↓ 3m</span>
                                    </div>
                                </div>
                            </div>

                            {/* TWO-COLUMN CONTROL MATRIX */}
                            <div className="sq-matrix-grid mb-3">
                                {/* LIVE QUEUE DISPLAY BOARD */}
                                <div className="sq-glass-card hero-token-board">
                                    <div className="card-head">
                                        <div className="head-badge">
                                            <span className="live-dot-red">●</span> LIVE QUEUE CONTROL
                                        </div>
                                        <div className="dept-select-wrapper">
                                            <select
                                                className="dept-dropdown"
                                                value={selectedDept}
                                                onChange={(e) => setSelectedDept(e.target.value)}
                                            >
                                                <option value="Cardiology">Cardiology Department</option>
                                                <option value="General OPD">General OPD</option>
                                                <option value="Pediatrics">Pediatrics OPD</option>
                                                <option value="Orthopedics">Orthopedics</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="token-display-center">
                                        <span className="now-serving-title">NOW SERVING</span>
                                        <div className="huge-token-badge">A-{currentToken}</div>

                                        <div className="next-queue-strip">
                                            <span className="next-title">NEXT IN LINE:</span>
                                            <div className="token-chips">
                                                <span className="chip active">A-{currentToken + 1}</span>
                                                <span className="chip">A-{currentToken + 2}</span>
                                                <span className="chip">A-{currentToken + 3}</span>
                                            </div>
                                        </div>

                                        <div className="queue-quick-actions">
                                            <button className="action-btn secondary" onClick={handlePreviousToken}>
                                                ◀ Call Previous
                                            </button>
                                            <button className="action-btn primary" onClick={handleNextToken}>
                                                ▶ Call Next (A-{currentToken + 1})
                                            </button>
                                            <button className="action-btn secondary" onClick={handleRecallToken}>
                                                🔔 Recall Token
                                            </button>
                                            <button className="action-btn danger" onClick={handleSkipToken}>
                                                ⏭️ Skip Patient
                                            </button>
                                        </div>
                                    </div>

                                    <div className="board-footer-meta">
                                        <span>⏱️ Est. Wait Time: <strong>12 mins</strong></span>
                                        <span>📍 Active Doctor: <strong>Dr. Sharma (Cabin 1)</strong></span>
                                    </div>
                                </div>

                                {/* DOCTOR STATUS MATRIX */}
                                <div className="sq-glass-card">
                                    <div className="card-head">
                                        <h4>👨‍⚕️ DOCTOR STATUS MATRIX</h4>
                                        <small>Live Availability</small>
                                    </div>

                                    <div className="doc-matrix-list">
                                        <div className="doc-row">
                                            <div className="doc-meta">
                                                <strong>Dr. Sharma</strong>
                                                <small>Cardiology • Cabin 1</small>
                                            </div>
                                            <span className="status-pill serving">🟢 Serving (A-{currentToken})</span>
                                        </div>

                                        <div className="doc-row">
                                            <div className="doc-meta">
                                                <strong>Dr. Patil</strong>
                                                <small>General OPD • Cabin 4</small>
                                            </div>
                                            <span className="status-pill busy">🟡 Busy</span>
                                        </div>

                                        <div className="doc-row">
                                            <div className="doc-meta">
                                                <strong>Dr. Joshi</strong>
                                                <small>Orthopedics • Cabin 2</small>
                                            </div>
                                            <span className="status-pill offline">🔴 Offline</span>
                                        </div>

                                        <div className="doc-row">
                                            <div className="doc-meta">
                                                <strong>Dr. Verma</strong>
                                                <small>Pediatrics • Cabin 3</small>
                                            </div>
                                            <span className="status-pill serving">🟢 Serving (P-08)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* 2. QUEUE OPERATIONS TAB */}
                    {activeTab === 'queue' && <QueueOperations />}

                    {/* 3. DOCTOR MATRIX TAB */}
                    {activeTab === 'doctors' && <DoctorSection />}

                    {/* 4. RECEPTION DESK TAB */}
                    {activeTab === 'reception' && <ReceptionistSection />}

                    {/* 5. PATIENTS TAB 👈 Clickable Patient Management View */}
                    {activeTab === 'patients' && <PatientSection />}

                    {/* 6. FALLBACK FOR OTHER TABS */}
                    {activeTab !== 'control' &&
                        activeTab !== 'queue' &&
                        activeTab !== 'doctors' &&
                        activeTab !== 'reception' &&
                        activeTab !== 'patients' && (
                            <div className="sq-glass-card">
                                <h3>Section: {activeTab.toUpperCase()}</h3>
                                <p className="mt-2 text-muted">Manage hospital operations for {activeTab}.</p>
                            </div>
                        )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;