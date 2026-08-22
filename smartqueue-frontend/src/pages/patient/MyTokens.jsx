import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import "../../styles/PatientDashboard.css";

const MyTokens = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [patientName, setPatientName] = useState('Patient');
    const [userId, setUserId] = useState(null);
    const [tokensList, setTokensList] = useState([]);
    const [selectedToken, setSelectedToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // 🟢 Updated formatter using backend data properties
    const formatTokenData = (appt) => {
        return {
            id: appt.id || appt.appointmentId,
            tokenNumber: appt.tokenNumber,
            doctorName: appt.doctorName || appt.doctor?.name || selectedToken?.doctorName || "Dr. Assigned",
            department: appt.department || appt.doctor?.department || selectedToken?.department || "General",
            currentServing: appt.currentServing || appt.currentServingToken || "None",
            status: appt.status || "WAITING",
            patientsAhead: appt.patientsAhead !== undefined ? appt.patientsAhead : 0,
            estimatedWaitTime: appt.estimatedWaitTime !== undefined ? appt.estimatedWaitTime : 0
        };
    };

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        const storedId = localStorage.getItem("userId");

        if (storedName) {
            setPatientName(storedName);
        }

        if (storedId) {
            setUserId(storedId);

            if (location.state && location.state.selectedAppointment) {
                const formatted = formatTokenData(location.state.selectedAppointment);
                setSelectedToken(formatted);
                setLoading(false);
            } else {
                fetchAllActiveTokens(storedId);
            }
        } else {
            setLoading(false);
        }
    }, [location.state]);

    // 🟢 Fetch Live Token Status from Backend Endpoint
    const fetchLiveTokenStatus = async (appointmentId) => {
        if (!appointmentId) return;

        try {
            const response = await axios.get(
                `http://localhost:8081/api/queue/appointment-status/${appointmentId}`
            );

            const liveData = response.data;

            setSelectedToken(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    tokenNumber: liveData.tokenNumber,
                    currentServing: liveData.currentServing || "None",
                    status: liveData.status || "WAITING",
                    patientsAhead: liveData.patientsAhead ?? 0,
                    estimatedWaitTime: liveData.estimatedWaitTime ?? 0
                };
            });
        } catch (error) {
            console.error("Error fetching live token status:", error);
        }
    };

    // 🟢 Real-time auto refresh every 3 seconds for selected token
    useEffect(() => {
        if (!selectedToken?.id) return;

        fetchLiveTokenStatus(selectedToken.id);

        const interval = setInterval(() => {
            fetchLiveTokenStatus(selectedToken.id);
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedToken?.id]);

    const fetchAllActiveTokens = async (id) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8081/api/appointments/active/${id}`);

            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                const formattedTokens = response.data.map(appt => formatTokenData(appt));
                setTokensList(formattedTokens);
                setSelectedToken(formattedTokens[0]);
            } else {
                setSelectedToken(null);
                setTokensList([]);
            }
        } catch (error) {
            console.log("Error fetching active tokens:", error);
            setSelectedToken(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm("Are you sure you want to cancel this appointment?")) {
            try {
                await axios.put(`http://localhost:8081/api/appointments/cancel/${appointmentId}`);
                alert("Appointment cancelled successfully!");
                if (userId) {
                    fetchAllActiveTokens(userId);
                }
            } catch (error) {
                console.error("Error cancelling appointment:", error);
                alert("Failed to cancel appointment. Please try again.");
            }
        }
    };

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, 2500);
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
                        <button onClick={() => navigate('/patient/mytokens')} className="patient-nav-btn active">🎫 My Tokens</button>
                        <button onClick={() => navigate('/patient/appointmenthistory')} className="patient-nav-btn">📜 History</button>
                        <button onClick={() => navigate('/patient/profile')} className="patient-nav-btn">👤 Profile</button>
                    </nav>
                </div>
                <div className="patient-sidebar-bottom">
                    <button onClick={handleLogout} className="patient-logout-btn">
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="patient-main">
                <header className="patient-header">
                    <h1 className="patient-header-title">My Tokens & Live Status</h1>
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

                <div className="patient-body patient-tokens-wrapper">
                    <div className="mb-6">
                        <h2 className="patient-welcome-title">Live Token Tracking</h2>
                        <p className="patient-welcome-sub">Track your live queue status and current running token in real-time.</p>
                    </div>

                    {tokensList.length > 1 && (
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            {tokensList.map((t, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedToken(t)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        border: selectedToken?.tokenNumber === t.tokenNumber ? '2px solid #059669' : '1px solid #d1d5db',
                                        background: selectedToken?.tokenNumber === t.tokenNumber ? '#ecfdf5' : '#fff',
                                        color: selectedToken?.tokenNumber === t.tokenNumber ? '#047857' : '#374151',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {t.doctorName} ({t.tokenNumber})
                                </button>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading your token status...</div>
                    ) : selectedToken ? (
                        <div className="token-card-box">
                            <span className="token-live-badge">● Live Queue Active</span>
                            <p style={{ fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}>Your Token Number</p>
                            <h1 className="token-number-display">{selectedToken.tokenNumber}</h1>

                            <div className="token-details-grid">
                                <div className="token-detail-item"><p>Doctor</p><p>{selectedToken.doctorName}</p></div>
                                <div className="token-detail-item"><p>Department</p><p>{selectedToken.department}</p></div>
                                <div className="token-detail-item"><p>Currently Serving</p><p className="serving-highlight">{selectedToken.currentServing || "None"}</p></div>
                                <div className="token-detail-item"><p>Status</p><p className="status-highlight">{selectedToken.status || "WAITING"}</p></div>
                                <div className="token-detail-item"><p>Patients Ahead</p><p style={{ fontWeight: '600', color: '#059669' }}>{selectedToken.patientsAhead} Patients</p></div>
                                <div className="token-detail-item"><p>Estimated Wait</p><p style={{ fontWeight: '600', color: '#d97706' }}>~{selectedToken.estimatedWaitTime} min</p></div>
                            </div>

                            <button
                                onClick={() => selectedToken?.id && fetchLiveTokenStatus(selectedToken.id)}
                                className="patient-primary-btn"
                                style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '15px' }}
                            >
                                🔄 Refresh Status
                            </button>

                            <button
                                onClick={() => handleCancelAppointment(selectedToken.id)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '15px',
                                    marginTop: '10px',
                                    background: '#ef4444',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                ❌ Cancel Appointment
                            </button>
                        </div>
                    ) : (
                        <div className="patient-content-box" style={{ padding: '40px 0', textAlign: 'center' }}>
                            <div className="patient-empty-icon">🎫</div>
                            <h3 className="patient-empty-title">No Active Tokens</h3>
                            <p className="patient-empty-desc">You don't have any active tokens right now.</p>
                            <button onClick={() => navigate('/patient/book-appointment')} className="patient-primary-btn">Book Appointment Now</button>
                        </div>
                    )}
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

export default MyTokens;