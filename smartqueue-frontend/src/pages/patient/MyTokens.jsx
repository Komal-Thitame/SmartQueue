import React, { useState, useEffect, useCallback } from 'react';
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


    // =====================================================
    // FORMAT TOKEN DATA
    // =====================================================

    const formatTokenData = useCallback((appt, oldToken = null) => {

        return {
            id: appt.id || appt.appointmentId,

            tokenNumber:
                appt.tokenNumber ??
                oldToken?.tokenNumber ??
                "N/A",

            doctorName:
                appt.doctorName ||
                appt.doctor?.name ||
                oldToken?.doctorName ||
                "Dr. Assigned",

            department:
                appt.department ||
                appt.doctor?.department ||
                oldToken?.department ||
                "General",

            currentServing:
                appt.currentServing ??
                appt.currentServingToken ??
                oldToken?.currentServing ??
                "None",

            status:
                appt.status ??
                oldToken?.status ??
                "WAITING",

            patientsAhead:
                appt.patientsAhead ??
                oldToken?.patientsAhead ??
                0,

            estimatedWaitTime:
                appt.estimatedWaitTime ??
                oldToken?.estimatedWaitTime ??
                0
        };

    }, []);


    // =====================================================
    // FETCH ALL ACTIVE TOKENS
    // IMPORTANT: tokensList dependency removed
    // =====================================================

    const fetchAllActiveTokens = useCallback(async (id) => {

        if (!id) return;

        try {

            const response = await axios.get(
                `http://localhost:8081/api/appointments/active/${id}`
            );

            const data = response.data;

            if (Array.isArray(data) && data.length > 0) {

                setTokensList(prevList => {

                    const formattedTokens = data.map(appt => {

                        const oldToken = prevList.find(
                            token =>
                                token.id ===
                                (appt.id || appt.appointmentId)
                        );

                        return formatTokenData(
                            appt,
                            oldToken
                        );

                    });

                    return formattedTokens;

                });

                // Keep selected token
                setSelectedToken(prevSelected => {

                    if (!prevSelected) {
                        return formatTokenData(data[0]);
                    }

                    const updatedAppointment = data.find(
                        appt =>
                            (appt.id || appt.appointmentId) ===
                            prevSelected.id
                    );

                    if (updatedAppointment) {

                        return formatTokenData(
                            updatedAppointment,
                            prevSelected
                        );

                    }

                    return formatTokenData(data[0]);

                });

            } else {

                setTokensList([]);
                setSelectedToken(null);

            }

        } catch (error) {

            console.error(
                "Error fetching active tokens:",
                error
            );

            setTokensList([]);
            setSelectedToken(null);

        } finally {

            setLoading(false);

        }

    }, [formatTokenData]);


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        const storedName =
            localStorage.getItem("userName");

        const storedId =
            localStorage.getItem("userId");


        if (storedName) {
            setPatientName(storedName);
        }


        if (!storedId) {

            setLoading(false);
            return;

        }


        setUserId(storedId);


        // Appointment coming from previous page
        if (
            location.state &&
            location.state.selectedAppointment
        ) {

            const formatted =
                formatTokenData(
                    location.state.selectedAppointment
                );

            setSelectedToken(formatted);
            setTokensList([formatted]);
            setLoading(false);

        } else {

            fetchAllActiveTokens(storedId);

        }

    }, [
        location.state,
        formatTokenData,
        fetchAllActiveTokens
    ]);


    // =====================================================
    // FETCH LIVE TOKEN STATUS
    // =====================================================

    const fetchLiveTokenStatus = useCallback(
        async (appointmentId) => {

            if (!appointmentId) return;

            try {

                const response = await axios.get(
                    `http://localhost:8081/api/queue/appointment-status/${appointmentId}`
                );

                const liveData = response.data;


                // Update selected token
                setSelectedToken(prev => {

                    if (!prev) return prev;

                    return {
                        ...prev,

                        tokenNumber:
                            liveData.tokenNumber ??
                            prev.tokenNumber,

                        currentServing:
                            liveData.currentServing ??
                            liveData.currentServingToken ??
                            "None",

                        status:
                            liveData.status ??
                            "WAITING",

                        patientsAhead:
                            liveData.patientsAhead ??
                            0,

                        estimatedWaitTime:
                            liveData.estimatedWaitTime ??
                            0
                    };

                });


                // Update token list
                setTokensList(prevList => {

                    return prevList.map(token => {

                        if (
                            String(token.id) !==
                            String(appointmentId)
                        ) {
                            return token;
                        }

                        return {
                            ...token,

                            tokenNumber:
                                liveData.tokenNumber ??
                                token.tokenNumber,

                            currentServing:
                                liveData.currentServing ??
                                liveData.currentServingToken ??
                                "None",

                            status:
                                liveData.status ??
                                "WAITING",

                            patientsAhead:
                                liveData.patientsAhead ??
                                0,

                            estimatedWaitTime:
                                liveData.estimatedWaitTime ??
                                0
                        };

                    });

                });

            } catch (error) {

                console.error(
                    "Error fetching live token status:",
                    error
                );

            }

        },
        []
    );


    // =====================================================
    // AUTO REFRESH
    // Only selected token
    // =====================================================

    useEffect(() => {

        if (!selectedToken?.id) {
            return;
        }

        const appointmentId =
            selectedToken.id;


        // First call
        fetchLiveTokenStatus(
            appointmentId
        );


        // Every 5 seconds
        const interval = setInterval(() => {

            fetchLiveTokenStatus(
                appointmentId
            );

        }, 5000);


        return () => {
            clearInterval(interval);
        };

    }, [
        selectedToken?.id,
        fetchLiveTokenStatus
    ]);


    // =====================================================
    // SELECT TOKEN
    // =====================================================

    const handleSelectToken = (token) => {

        setSelectedToken(token);

    };


    // =====================================================
    // MANUAL REFRESH
    // =====================================================

    const handleRefresh = async () => {

        if (!selectedToken?.id) {
            return;
        }

        await fetchLiveTokenStatus(
            selectedToken.id
        );

    };


    // =====================================================
    // CANCEL APPOINTMENT
    // =====================================================

    const handleCancelAppointment =
        async (appointmentId) => {

            if (!appointmentId) return;


            const confirmed = window.confirm(
                "Are you sure you want to cancel this appointment?"
            );


            if (!confirmed) return;


            try {

                await axios.put(
                    `http://localhost:8081/api/appointments/cancel/${appointmentId}`
                );


                alert(
                    "Appointment cancelled successfully!"
                );


                // Reload active appointments
                if (userId) {

                    setLoading(true);

                    await fetchAllActiveTokens(
                        userId
                    );

                }

            } catch (error) {

                console.error(
                    "Error cancelling appointment:",
                    error
                );


                alert(
                    "Failed to cancel appointment. Please try again."
                );

            }

        };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        setIsLoggingOut(true);


        setTimeout(() => {

            localStorage.clear();

            navigate(
                '/login',
                {
                    replace: true
                }
            );

        }, 2500);

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="patient-dashboard-container">

            {/* SIDEBAR */}

            <aside className="patient-sidebar">

                <div className="patient-sidebar-top">

                    <div className="patient-brand">
                        SmartQueue
                    </div>


                    <nav className="patient-nav">

                        <button
                            onClick={() =>
                                navigate('/patient/dashboard')
                            }
                            className="patient-nav-btn"
                        >
                            📊 Dashboard
                        </button>


                        <button
                            onClick={() =>
                                navigate('/patient/book-appointment')
                            }
                            className="patient-nav-btn"
                        >
                            📅 Book Appointment
                        </button>


                        <button
                            onClick={() =>
                                navigate('/patient/mytokens')
                            }
                            className="patient-nav-btn active"
                        >
                            🎫 My Tokens
                        </button>


                        <button
                            onClick={() =>
                                navigate('/patient/appointmenthistory')
                            }
                            className="patient-nav-btn"
                        >
                            📜 History
                        </button>


                        <button
                            onClick={() =>
                                navigate('/patient/profile')
                            }
                            className="patient-nav-btn"
                        >
                            👤 Profile
                        </button>

                    </nav>

                </div>


                <div className="patient-sidebar-bottom">

                    <button
                        onClick={handleLogout}
                        className="patient-logout-btn"
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>


            {/* MAIN */}

            <main className="patient-main">

                {/* HEADER */}

                <header className="patient-header">

                    <h1 className="patient-header-title">
                        My Tokens & Live Status
                    </h1>


                    <div className="patient-header-right">

                        <span
                            style={{
                                cursor: 'pointer',
                                fontSize: '18px'
                            }}
                        >
                            🔔
                        </span>


                        <div
                            onClick={() =>
                                navigate('/patient/profile')
                            }
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                            }}
                            title="View Profile"
                        >

                            <div className="patient-avatar">

                                {patientName
                                    ? patientName
                                        .charAt(0)
                                        .toUpperCase()
                                    : 'P'}

                            </div>


                            <span
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}
                            >
                                {patientName}
                            </span>

                        </div>

                    </div>

                </header>


                {/* BODY */}

                <div className="patient-body patient-tokens-wrapper">

                    <div className="mb-6">

                        <h2 className="patient-welcome-title">
                            Live Token Tracking
                        </h2>


                        <p className="patient-welcome-sub">
                            Track your live queue status and current running token in real-time.
                        </p>

                    </div>


                    {/* MULTIPLE TOKENS */}

                    {tokensList.length > 1 && (

                        <div
                            style={{
                                display: 'flex',
                                gap: '10px',
                                marginBottom: '20px',
                                flexWrap: 'wrap'
                            }}
                        >

                            {tokensList.map(t => (

                                <button
                                    key={t.id}
                                    onClick={() =>
                                        handleSelectToken(t)
                                    }
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',

                                        border:
                                            selectedToken?.id === t.id
                                                ? '2px solid #059669'
                                                : '1px solid #d1d5db',

                                        background:
                                            selectedToken?.id === t.id
                                                ? '#ecfdf5'
                                                : '#fff',

                                        color:
                                            selectedToken?.id === t.id
                                                ? '#047857'
                                                : '#374151',

                                        fontWeight: '600',

                                        cursor: 'pointer'
                                    }}
                                >

                                    {t.doctorName}
                                    {" "}
                                    ({t.tokenNumber})

                                </button>

                            ))}

                        </div>

                    )}


                    {/* LOADING */}

                    {loading ? (

                        <div
                            style={{
                                textAlign: 'center',
                                padding: '40px',
                                color: '#6b7280'
                            }}
                        >
                            Loading your token status...
                        </div>

                    ) : selectedToken ? (

                        /* TOKEN CARD */

                        <div className="token-card-box">

                            <span className="token-live-badge">
                                ● Live Queue Active
                            </span>


                            <p
                                style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginTop: '10px'
                                }}
                            >
                                Your Token Number
                            </p>


                            <h1 className="token-number-display">
                                {selectedToken.tokenNumber}
                            </h1>


                            <div className="token-details-grid">

                                <div className="token-detail-item">

                                    <p>Doctor</p>

                                    <p>
                                        {selectedToken.doctorName}
                                    </p>

                                </div>


                                <div className="token-detail-item">

                                    <p>Department</p>

                                    <p>
                                        {selectedToken.department}
                                    </p>

                                </div>


                                <div className="token-detail-item">

                                    <p>Currently Serving</p>

                                    <p className="serving-highlight">
                                        {selectedToken.currentServing || "None"}
                                    </p>

                                </div>


                                <div className="token-detail-item">

                                    <p>Status</p>

                                    <p className="status-highlight">
                                        {selectedToken.status || "WAITING"}
                                    </p>

                                </div>


                                <div className="token-detail-item">

                                    <p>Patients Ahead</p>

                                    <p
                                        style={{
                                            fontWeight: '600',
                                            color: '#059669'
                                        }}
                                    >
                                        {selectedToken.patientsAhead}
                                        {" "}
                                        Patients
                                    </p>

                                </div>


                                <div className="token-detail-item">

                                    <p>Estimated Wait</p>

                                    <p
                                        style={{
                                            fontWeight: '600',
                                            color: '#d97706'
                                        }}
                                    >
                                        ~{selectedToken.estimatedWaitTime}
                                        {" "}
                                        min
                                    </p>

                                </div>

                            </div>


                            {/* REFRESH */}

                            <button
                                onClick={handleRefresh}
                                className="patient-primary-btn"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '15px',
                                    marginTop: '15px'
                                }}
                            >
                                🔄 Refresh Status
                            </button>


                            {/* CANCEL */}

                            {selectedToken.status === "WAITING" && (

                                <button
                                    onClick={() =>
                                        handleCancelAppointment(
                                            selectedToken.id
                                        )
                                    }
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

                            )}

                        </div>

                    ) : (

                        /* NO ACTIVE TOKEN */

                        <div
                            className="patient-content-box"
                            style={{
                                padding: '40px 0',
                                textAlign: 'center'
                            }}
                        >

                            <div className="patient-empty-icon">
                                🎫
                            </div>


                            <h3 className="patient-empty-title">
                                No Active Tokens
                            </h3>


                            <p className="patient-empty-desc">
                                You don't have any active tokens right now.
                            </p>


                            <button
                                onClick={() =>
                                    navigate(
                                        '/patient/book-appointment'
                                    )
                                }
                                className="patient-primary-btn"
                            >
                                Book Appointment Now
                            </button>

                        </div>

                    )}

                </div>

            </main>


            {/* LOGOUT POPUP */}

            {isLoggingOut && (

                <div className="logout-overlay">

                    <div className="logout-modal">

                        <div className="logout-spinner"></div>


                        <h3
                            style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#1f2937',
                                margin: '0'
                            }}
                        >
                            Logging out securely...
                        </h3>


                        <p
                            style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                margin: '0'
                            }}
                        >
                            Please wait while we clear your session.
                        </p>

                    </div>

                </div>

            )}

        </div>

    );

};

export default MyTokens;