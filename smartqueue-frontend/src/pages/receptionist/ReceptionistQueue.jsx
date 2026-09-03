import React, {
    useState,
    useEffect,
    useCallback
} from "react";

import { useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../../config";

import "../../styles/ReceptionistDashboard.css";


const AVERAGE_CONSULTATION_TIME = 15;


const ReceptionistQueue = () => {

    const navigate = useNavigate();


    // =====================================================
    // RECEPTIONIST
    // =====================================================

    const [receptionistName, setReceptionistName] =
        useState("Receptionist");

    const [isLoggingOut, setIsLoggingOut] =
        useState(false);


    // =====================================================
    // QUEUE STATES
    // =====================================================

    const [queueList, setQueueList] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [lastUpdated, setLastUpdated] =
        useState(null);


    // =====================================================
    // FILTER STATES
    // =====================================================

    const [searchText, setSearchText] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [doctorFilter, setDoctorFilter] =
        useState("ALL");


    // =====================================================
    // RECEPTIONIST NAME
    // =====================================================

    useEffect(() => {

        const storedName =
            localStorage.getItem("userName");

        if (storedName) {
            setReceptionistName(storedName);
        }

    }, []);


    // =====================================================
    // FETCH TODAY'S APPOINTMENTS
    // =====================================================

    const fetchQueue = useCallback(
        async (showLoader = false) => {

            try {

                if (showLoader) {
                    setRefreshing(true);
                }

                setError("");

                const response = await fetch(
                    `${API_BASE_URL}/receptionist/appointments/today`
                );

                if (!response.ok) {

                    throw new Error(
                        `Failed to load queue (${response.status})`
                    );
                }

                const data =
                    await response.json();

                if (!Array.isArray(data)) {

                    throw new Error(
                        "Invalid queue data received from server."
                    );
                }


                // =================================================
                // SORT BY TOKEN
                // =================================================

                const sortedData =
                    [...data].sort((a, b) => {

                        const tokenA =
                            Number(a.tokenNumber || 0);

                        const tokenB =
                            Number(b.tokenNumber || 0);

                        return tokenA - tokenB;
                    });


                setQueueList(sortedData);

                setLastUpdated(
                    new Date()
                );

            } catch (err) {

                console.error(
                    "Live Queue Error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load live queue."
                );

            } finally {

                setLoading(false);

                setRefreshing(false);
            }

        },
        []
    );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchQueue(true);

    }, [fetchQueue]);


    // =====================================================
    // AUTO REFRESH EVERY 5 SECONDS
    // =====================================================

    useEffect(() => {

        const interval =
            setInterval(() => {

                fetchQueue(false);

            }, 5000);


        return () => {

            clearInterval(interval);

        };

    }, [fetchQueue]);


    // =====================================================
    // MANUAL REFRESH
    // =====================================================

    const handleRefresh = () => {

        fetchQueue(true);

    };


    // =====================================================
    // DOCTOR NAME
    // =====================================================

    const getDoctorName = (appointment) => {

        if (appointment?.doctor?.name) {
            return appointment.doctor.name;
        }

        if (appointment?.doctorName) {
            return appointment.doctorName;
        }

        return "N/A";
    };


    // =====================================================
    // FORMAT DOCTOR NAME
    // Avoid: Dr. Dr. Sarthak
    // =====================================================

    const formatDoctorName = (name) => {

        if (!name || name === "N/A") {
            return "N/A";
        }

        const trimmedName =
            name.trim();

        if (
            trimmedName
                .toLowerCase()
                .startsWith("dr.")
        ) {

            return trimmedName;
        }

        return `Dr. ${trimmedName}`;
    };


    // =====================================================
    // DOCTOR DEPARTMENT
    // =====================================================

    const getDoctorDepartment = (appointment) => {

        if (appointment?.doctor?.department) {
            return appointment.doctor.department;
        }

        if (appointment?.department) {
            return appointment.department;
        }

        return "";
    };


    // =====================================================
    // PATIENT NAME
    // =====================================================

    const getPatientName = (appointment) => {

        if (
            appointment?.patientName &&
            appointment.patientName.trim() !== ""
        ) {

            return appointment.patientName;
        }

        return "N/A";
    };


    // =====================================================
    // TOKEN
    // =====================================================

    const getToken = (appointment) => {

        if (
            appointment?.tokenNumber !== null &&
            appointment?.tokenNumber !== undefined
        ) {

            return `A-${String(
                appointment.tokenNumber
            ).padStart(2, "0")}`;
        }

        return "N/A";
    };


    // =====================================================
    // NORMALIZE STATUS
    // =====================================================

    const getStatus = (appointment) => {

        const status =
            appointment?.status ||
            appointment?.queueStatus ||
            "WAITING";


        switch (
            status.toUpperCase()
            ) {

            case "WAITING":
            case "BOOKED":

                return "WAITING";


            case "IN_PROGRESS":
            case "IN-PROGRESS":
            case "IN PROGRESS":
            case "IN_CONSULTATION":
            case "IN-CONSULTATION":

                return "IN_CONSULTATION";


            case "COMPLETED":

                return "COMPLETED";


            case "CANCELLED":

                return "CANCELLED";


            case "MISSED":

                return "MISSED";


            case "SKIPPED":

                return "SKIPPED";


            default:

                return status.toUpperCase();
        }
    };


    // =====================================================
    // STATUS LABEL
    // =====================================================

    const getStatusLabel = (status) => {

        switch (status) {

            case "WAITING":

                return "WAITING";


            case "IN_CONSULTATION":

                return "IN CONSULTATION";


            case "COMPLETED":

                return "COMPLETED";


            case "CANCELLED":

                return "CANCELLED";


            case "MISSED":

                return "MISSED";


            case "SKIPPED":

                return "SKIPPED";


            default:

                return status;
        }
    };


    // =====================================================
    // UNIQUE DOCTORS
    // =====================================================

    const doctors = [
        ...new Map(

            queueList
                .map((item) => {

                    const name =
                        getDoctorName(item);

                    return [
                        name,
                        {
                            name,
                            department:
                                getDoctorDepartment(item)
                        }
                    ];

                })
                .filter(
                    ([name]) =>
                        name &&
                        name !== "N/A"
                )

        ).values()
    ];


    // =====================================================
    // SELECTED DOCTOR DATA
    // =====================================================

    const doctorFilteredQueue =
        queueList.filter(
            (appointment) => {

                if (doctorFilter === "ALL") {
                    return true;
                }

                return (
                    getDoctorName(appointment) ===
                    doctorFilter
                );
            }
        );


    // =====================================================
    // SELECTED DOCTOR NAME
    // =====================================================

    const selectedDoctor =
        doctorFilter !== "ALL"
            ? doctors.find(
                (doctor) =>
                    doctor.name === doctorFilter
            )
            : null;


    // =====================================================
    // ACTIVE QUEUE
    // WAITING + IN CONSULTATION
    // =====================================================

    const activeQueue =
        doctorFilteredQueue.filter(
            (appointment) => {

                const status =
                    getStatus(appointment);

                return (
                    status === "WAITING" ||
                    status === "IN_CONSULTATION"
                );
            }
        );


    // =====================================================
    // WAITING QUEUE
    // =====================================================

    const waitingQueue =
        doctorFilteredQueue
            .filter(
                (appointment) =>
                    getStatus(appointment) ===
                    "WAITING"
            )
            .sort(
                (a, b) =>
                    Number(a.tokenNumber || 0) -
                    Number(b.tokenNumber || 0)
            );


    // =====================================================
    // CURRENTLY SERVING
    // =====================================================

    const currentServing =
        doctorFilteredQueue.find(
            (appointment) =>
                getStatus(appointment) ===
                "IN_CONSULTATION"
        );


    // =====================================================
    // NEXT PATIENT
    // =====================================================

    const nextPatient =
        waitingQueue.length > 0
            ? waitingQueue[0]
            : null;


    // =====================================================
    // SEARCH + STATUS FILTER
    // =====================================================

    const filteredQueue =
        activeQueue.filter(
            (appointment) => {

                const patientName =
                    getPatientName(
                        appointment
                    ).toLowerCase();


                const token =
                    getToken(
                        appointment
                    ).toLowerCase();


                const doctorName =
                    getDoctorName(
                        appointment
                    ).toLowerCase();


                const status =
                    getStatus(
                        appointment
                    );


                const search =
                    searchText
                        .trim()
                        .toLowerCase();


                const matchesSearch =
                    search === "" ||
                    patientName.includes(search) ||
                    token.includes(search) ||
                    doctorName.includes(search);


                const matchesStatus =
                    statusFilter === "ALL" ||
                    status === statusFilter;


                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );


    // =====================================================
    // GLOBAL / SELECTED DOCTOR COUNTS
    // =====================================================

    const waitingCount =
        doctorFilteredQueue.filter(
            (item) =>
                getStatus(item) ===
                "WAITING"
        ).length;


    const consultationCount =
        doctorFilteredQueue.filter(
            (item) =>
                getStatus(item) ===
                "IN_CONSULTATION"
        ).length;


    const completedCount =
        doctorFilteredQueue.filter(
            (item) =>
                getStatus(item) ===
                "COMPLETED"
        ).length;


    const activeCount =
        waitingCount +
        consultationCount;


    // =====================================================
    // GET DOCTOR OVERVIEW DATA
    // =====================================================

    const getDoctorOverview = (doctor) => {

        const doctorAppointments =
            queueList.filter(
                (appointment) =>
                    getDoctorName(appointment) ===
                    doctor.name
            );


        const waiting =
            doctorAppointments.filter(
                (appointment) =>
                    getStatus(appointment) ===
                    "WAITING"
            );


        const consultation =
            doctorAppointments.filter(
                (appointment) =>
                    getStatus(appointment) ===
                    "IN_CONSULTATION"
            );


        const completed =
            doctorAppointments.filter(
                (appointment) =>
                    getStatus(appointment) ===
                    "COMPLETED"
            );


        return {

            name: doctor.name,

            department:
            doctor.department,

            waitingCount:
            waiting.length,

            consultationCount:
            consultation.length,

            completedCount:
            completed.length,

            activeCount:
                waiting.length +
                consultation.length,

            currentServing:
                consultation.length > 0
                    ? consultation[0]
                    : null,

            nextPatient:
                waiting.length > 0
                    ? [...waiting].sort(
                        (a, b) =>
                            Number(
                                a.tokenNumber || 0
                            ) -
                            Number(
                                b.tokenNumber || 0
                            )
                    )[0]
                    : null
        };
    };


    // =====================================================
    // DOCTOR OVERVIEW
    // =====================================================

    const doctorOverview =
        doctors.map(
            getDoctorOverview
        );


    // =====================================================
    // WAIT TIME
    // =====================================================

    const getWaitTime = (appointment) => {

        const index =
            waitingQueue.findIndex(
                (item) =>
                    item.id ===
                    appointment.id
            );


        if (index === -1) {
            return "-";
        }


        return `~${
            (index + 1) *
            AVERAGE_CONSULTATION_TIME
        } min`;
    };


    // =====================================================
    // QUEUE POSITION
    // =====================================================

    const getQueuePosition = (appointment) => {

        const index =
            waitingQueue.findIndex(
                (item) =>
                    item.id ===
                    appointment.id
            );


        if (index === -1) {
            return "-";
        }


        return `#${index + 1}`;
    };


    // =====================================================
    // LAST UPDATED
    // =====================================================

    const getLastUpdatedText = () => {

        if (!lastUpdated) {
            return "Not updated yet";
        }


        return lastUpdated.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );
    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        setIsLoggingOut(true);


        setTimeout(() => {

            localStorage.clear();

            navigate(
                "/login",
                {
                    replace: true
                }
            );

        }, 2000);
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="receptionist-container">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="receptionist-sidebar">

                <div className="sidebar-top">

                    <div className="sidebar-brand">
                        SmartQueue
                    </div>


                    <nav className="sidebar-nav">

                        <button
                            onClick={() =>
                                navigate(
                                    "/receptionist/dashboard"
                                )
                            }
                            className="nav-btn"
                        >
                            📊 Dashboard
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    "/receptionist/appointments"
                                )
                            }
                            className="nav-btn"
                        >
                            📅 Appointments
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    "/receptionist/queue"
                                )
                            }
                            className="nav-btn active"
                        >
                            🎫 Live Queue
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    "/receptionist/patients"
                                )
                            }
                            className="nav-btn"
                        >
                            👤 Patients
                        </button>

                    </nav>

                </div>


                <div className="sidebar-bottom">

                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="receptionist-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="receptionist-header">

                    <h1 className="header-title">
                        Live Queue Management
                    </h1>


                    <div className="header-right">

                        <span className="header-notification">
                            🔔
                        </span>


                        <div className="header-user">

                            <div className="user-avatar">

                                {receptionistName
                                    .charAt(0)
                                    .toUpperCase()}

                            </div>


                            <span className="header-user-name">
                                {receptionistName}
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    BODY
                ================================================= */}

                <div className="receptionist-body">


                    {/* =================================================
                        PAGE TITLE
                    ================================================= */}

                    <div className="queue-page-heading">

                        <h2 className="welcome-title">

                            {doctorFilter === "ALL"
                                ? "Hospital Queue Overview"
                                : `${formatDoctorName(
                                    doctorFilter
                                )}'s Live Queue`
                            }

                        </h2>


                        <p className="welcome-sub">

                            {doctorFilter === "ALL"
                                ? "Monitor today's queue status across all doctors."
                                : `Monitor patients waiting for ${formatDoctorName(
                                    doctorFilter
                                )}.`
                            }

                        </p>

                    </div>


                    {/* =================================================
                        FOUR SUMMARY CARDS
                    ================================================= */}

                    <div className="queue-summary-grid">


                        {/* ACTIVE */}

                        <div className="queue-summary-card summary-active">

                            <div className="queue-summary-circle"></div>

                            <div className="queue-summary-content">

                                <div className="queue-summary-label">
                                    Active Queue
                                </div>

                                <div className="queue-summary-value">
                                    {activeCount}
                                </div>

                            </div>

                        </div>


                        {/* WAITING */}

                        <div className="queue-summary-card summary-waiting">

                            <div className="queue-summary-circle"></div>

                            <div className="queue-summary-content">

                                <div className="queue-summary-label">
                                    Waiting in Queue
                                </div>

                                <div className="queue-summary-value">
                                    {waitingCount}
                                </div>

                            </div>

                        </div>


                        {/* CONSULTATION */}

                        <div className="queue-summary-card summary-consultation">

                            <div className="queue-summary-circle"></div>

                            <div className="queue-summary-content">

                                <div className="queue-summary-label">
                                    In Consultation
                                </div>

                                <div className="queue-summary-value">
                                    {consultationCount}
                                </div>

                            </div>

                        </div>


                        {/* COMPLETED */}

                        <div className="queue-summary-card summary-completed">

                            <div className="queue-summary-circle"></div>

                            <div className="queue-summary-content">

                                <div className="queue-summary-label">
                                    Completed Today
                                </div>

                                <div className="queue-summary-value">
                                    {completedCount}
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        DOCTOR SELECTOR
                    ================================================= */}

                    <div className="queue-doctor-selector-card">

                        <div>

                            <div className="queue-selector-title">
                                Doctor Queue
                            </div>

                            <div className="queue-selector-subtitle">

                                {doctorFilter === "ALL"
                                    ? "Select a doctor to view their detailed live queue."
                                    : "Viewing the selected doctor's live queue."
                                }

                            </div>

                        </div>


                        <div className="queue-selector-actions">

                            <select
                                className="queue-filter-select doctor-select"
                                value={doctorFilter}
                                onChange={(e) => {

                                    setDoctorFilter(
                                        e.target.value
                                    );

                                    setSearchText("");

                                    setStatusFilter("ALL");

                                }}
                            >

                                <option value="ALL">
                                    All Doctors
                                </option>


                                {doctors.map(
                                    (doctor) => (

                                        <option
                                            key={doctor.name}
                                            value={doctor.name}
                                        >
                                            {formatDoctorName(
                                                doctor.name
                                            )}

                                            {doctor.department
                                                ? ` — ${doctor.department}`
                                                : ""
                                            }

                                        </option>

                                    )
                                )}

                            </select>


                            {doctorFilter !== "ALL" && (

                                <button
                                    className="queue-back-btn"
                                    onClick={() => {

                                        setDoctorFilter("ALL");

                                        setSearchText("");

                                        setStatusFilter("ALL");

                                    }}
                                >
                                    ← All Doctors
                                </button>

                            )}

                        </div>

                    </div>


                    {/* =================================================
                        ALL DOCTORS OVERVIEW
                    ================================================= */}

                    {doctorFilter === "ALL" && (

                        <div className="doctor-overview-section">

                            <div className="section-heading-row">

                                <div>

                                    <h3 className="section-title">
                                        Doctor Queue Overview
                                    </h3>

                                    <p className="section-subtitle">
                                        Select a doctor to see their complete live queue.
                                    </p>

                                </div>

                            </div>


                            {loading ? (

                                <div className="table-card queue-loading">

                                    <div className="queue-loading-icon">
                                        ⏳
                                    </div>

                                    Loading doctor queues...

                                </div>

                            ) : doctorOverview.length === 0 ? (

                                <div className="table-card queue-empty">

                                    <div className="queue-empty-icon">
                                        👨‍⚕️
                                    </div>

                                    <h3>
                                        No Doctors Found
                                    </h3>

                                    <p>
                                        No appointments are available for today.
                                    </p>

                                </div>

                            ) : (

                                <div className="doctor-overview-grid">

                                    {doctorOverview.map(
                                        (doctor) => (

                                            <div
                                                className="doctor-overview-card"
                                                key={doctor.name}
                                            >


                                                {/* DOCTOR HEADER */}

                                                <div className="doctor-card-header">

                                                    <div>

                                                        <h3 className="doctor-card-name">

                                                            {formatDoctorName(
                                                                doctor.name
                                                            )}

                                                        </h3>

                                                        {doctor.department && (

                                                            <p className="doctor-card-department">
                                                                {doctor.department}
                                                            </p>

                                                        )}

                                                    </div>


                                                    <span className="doctor-active-badge">

                                                        {doctor.activeCount}
                                                        {" "}
                                                        Active

                                                    </span>

                                                </div>


                                                {/* CURRENT SERVING */}

                                                <div className="doctor-current-box">

                                                    <div className="doctor-current-label">
                                                        Currently Serving
                                                    </div>


                                                    {doctor.currentServing ? (

                                                        <div className="doctor-current-info">

                                                            <span className="doctor-token">

                                                                {getToken(
                                                                    doctor.currentServing
                                                                )}

                                                            </span>

                                                            <span className="doctor-current-patient">

                                                                {getPatientName(
                                                                    doctor.currentServing
                                                                )}

                                                            </span>

                                                        </div>

                                                    ) : (

                                                        <div className="doctor-no-current">

                                                            No patient in consultation

                                                        </div>

                                                    )}

                                                </div>


                                                {/* STATS */}

                                                <div className="doctor-card-stats">


                                                    <div className="doctor-stat">

                                                        <span className="doctor-stat-label">
                                                            Waiting
                                                        </span>

                                                        <strong className="doctor-stat-value waiting-value">
                                                            {doctor.waitingCount}
                                                        </strong>

                                                    </div>


                                                    <div className="doctor-stat">

                                                        <span className="doctor-stat-label">
                                                            Consultation
                                                        </span>

                                                        <strong className="doctor-stat-value consultation-value">
                                                            {doctor.consultationCount}
                                                        </strong>

                                                    </div>


                                                    <div className="doctor-stat">

                                                        <span className="doctor-stat-label">
                                                            Completed
                                                        </span>

                                                        <strong className="doctor-stat-value completed-value">
                                                            {doctor.completedCount}
                                                        </strong>

                                                    </div>

                                                </div>


                                                {/* NEXT PATIENT */}

                                                {doctor.nextPatient && (

                                                    <div className="doctor-next-patient">

                                                        <span>
                                                            Next:
                                                        </span>

                                                        <strong>
                                                            {getToken(
                                                                doctor.nextPatient
                                                            )}
                                                        </strong>

                                                        <span>
                                                            {getPatientName(
                                                                doctor.nextPatient
                                                            )}
                                                        </span>

                                                    </div>

                                                )}


                                                {/* VIEW QUEUE */}

                                                <button
                                                    className="doctor-view-btn"
                                                    onClick={() => {

                                                        setDoctorFilter(
                                                            doctor.name
                                                        );

                                                        setSearchText("");

                                                        setStatusFilter("ALL");

                                                    }}
                                                >

                                                    View Queue
                                                    <span>
                                                        →
                                                    </span>

                                                </button>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    )}


                    {/* =================================================
                        SELECTED DOCTOR DETAIL
                    ================================================= */}

                    {doctorFilter !== "ALL" && (

                        <div className="doctor-detail-section">


                            {/* =================================================
                                SELECTED DOCTOR HEADER
                            ================================================= */}

                            <div className="selected-doctor-banner">

                                <div>

                                    <h3>
                                        {formatDoctorName(
                                            doctorFilter
                                        )}
                                    </h3>

                                    {selectedDoctor?.department && (

                                        <p>
                                            {selectedDoctor.department}
                                        </p>

                                    )}

                                </div>


                                <div className="selected-doctor-active">

                                    <span>
                                        Active Patients
                                    </span>

                                    <strong>
                                        {activeCount}
                                    </strong>

                                </div>

                            </div>


                            {/* =================================================
                                CURRENT SERVING + NEXT PATIENT
                            ================================================= */}

                            <div className="queue-highlight-grid">


                                {/* CURRENTLY SERVING */}

                                <div className="queue-highlight-card current-serving-card">

                                    <div className="queue-highlight-content">

                                        <div className="queue-highlight-title current-title">
                                            🔵 CURRENTLY SERVING
                                        </div>


                                        {currentServing ? (

                                            <div className="queue-highlight-row">

                                                <div>

                                                    <div className="queue-token-large">
                                                        {getToken(
                                                            currentServing
                                                        )}
                                                    </div>

                                                    <div className="queue-patient-name">
                                                        {getPatientName(
                                                            currentServing
                                                        )}
                                                    </div>

                                                    <div className="queue-doctor-name">
                                                        {formatDoctorName(
                                                            getDoctorName(
                                                                currentServing
                                                            )
                                                        )}
                                                    </div>

                                                </div>


                                                <span className="status-badge status-consultation">
                                                    IN CONSULTATION
                                                </span>

                                            </div>

                                        ) : (

                                            <div className="queue-no-patient">

                                                No patient is currently
                                                in consultation.

                                            </div>

                                        )}

                                    </div>

                                </div>


                                {/* NEXT PATIENT */}

                                <div className="queue-highlight-card next-patient-card">

                                    <div className="queue-highlight-content">

                                        <div className="queue-highlight-title next-title">
                                            🟡 NEXT PATIENT
                                        </div>


                                        {nextPatient ? (

                                            <div className="queue-highlight-row">

                                                <div>

                                                    <div className="queue-next-token-row">

                                                        <span className="queue-token-large">

                                                            {getToken(
                                                                nextPatient
                                                            )}

                                                        </span>

                                                        <span className="queue-position-badge">

                                                            Position #1

                                                        </span>

                                                    </div>


                                                    <div className="queue-patient-name">

                                                        {getPatientName(
                                                            nextPatient
                                                        )}

                                                    </div>


                                                    <div className="queue-doctor-name">

                                                        {formatDoctorName(
                                                            getDoctorName(
                                                                nextPatient
                                                            )
                                                        )}

                                                    </div>

                                                </div>


                                                <div className="queue-wait-box">

                                                    <div className="queue-wait-label">
                                                        Estimated Wait
                                                    </div>

                                                    <div className="queue-wait-value">
                                                        ~15 min
                                                    </div>

                                                </div>

                                            </div>

                                        ) : (

                                            <div className="queue-no-patient">

                                                No waiting patient.

                                            </div>

                                        )}

                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                SEARCH + STATUS
                            ================================================= */}

                            <div className="queue-filter-bar">


                                <input
                                    type="text"
                                    className="queue-search-input"
                                    placeholder="Search patient or token..."
                                    value={searchText}
                                    onChange={(e) =>
                                        setSearchText(
                                            e.target.value
                                        )
                                    }
                                />


                                <select
                                    className="queue-filter-select"
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="ALL">
                                        All Active
                                    </option>

                                    <option value="WAITING">
                                        Waiting
                                    </option>

                                    <option value="IN_CONSULTATION">
                                        In Consultation
                                    </option>

                                </select>


                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="action-btn"
                                >

                                    {refreshing
                                        ? "Refreshing..."
                                        : "🔄 Refresh"
                                    }

                                </button>

                            </div>


                            {/* =================================================
                                LAST UPDATED
                            ================================================= */}

                            <div className="queue-last-updated">

                                Last updated:{" "}

                                <strong>
                                    {getLastUpdatedText()}
                                </strong>

                                <span className="auto-refresh-text">

                                    • Auto-refresh every 5 seconds

                                </span>

                            </div>


                            {/* =================================================
                                ERROR
                            ================================================= */}

                            {error && (

                                <div className="queue-error">

                                    ⚠️ {error}

                                    <button
                                        onClick={() =>
                                            fetchQueue(true)
                                        }
                                    >
                                        Try Again
                                    </button>

                                </div>

                            )}


                            {/* =================================================
                                DETAIL TABLE
                            ================================================= */}

                            <div className="table-card">


                                {loading ? (

                                    <div className="queue-loading">

                                        <div className="queue-loading-icon">
                                            ⏳
                                        </div>

                                        Loading live queue...

                                    </div>

                                ) : filteredQueue.length === 0 ? (

                                    <div className="queue-empty">

                                        <div className="queue-empty-icon">
                                            🎫
                                        </div>

                                        <h3>
                                            No Active Patients
                                        </h3>

                                        <p>
                                            No patients currently match
                                            your selected filter or search.
                                        </p>

                                    </div>

                                ) : (

                                    <div className="queue-table-wrapper">

                                        <table className="custom-table">

                                            <thead>

                                            <tr>

                                                <th>
                                                    Position
                                                </th>

                                                <th>
                                                    Token
                                                </th>

                                                <th>
                                                    Patient
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                <th>
                                                    Est. Wait
                                                </th>

                                            </tr>

                                            </thead>


                                            <tbody>

                                            {filteredQueue.map(
                                                (appointment) => {

                                                    const status =
                                                        getStatus(
                                                            appointment
                                                        );


                                                    return (

                                                        <tr
                                                            key={
                                                                appointment.id
                                                            }
                                                        >


                                                            {/* POSITION */}

                                                            <td className="queue-position-cell">

                                                                {status ===
                                                                "WAITING"
                                                                    ? getQueuePosition(
                                                                        appointment
                                                                    )
                                                                    : "—"
                                                                }

                                                            </td>


                                                            {/* TOKEN */}

                                                            <td className="queue-token-cell">

                                                                {getToken(
                                                                    appointment
                                                                )}

                                                            </td>


                                                            {/* PATIENT */}

                                                            <td>

                                                                <div className="queue-table-patient">

                                                                    <div className="queue-table-patient-name">

                                                                        {getPatientName(
                                                                            appointment
                                                                        )}

                                                                    </div>


                                                                    {appointment.patientPhone && (

                                                                        <div className="queue-table-phone">

                                                                            📞{" "}
                                                                            {
                                                                                appointment.patientPhone
                                                                            }

                                                                        </div>

                                                                    )}

                                                                </div>

                                                            </td>


                                                            {/* STATUS */}

                                                            <td>

                                                                <span
                                                                    className={`status-badge ${
                                                                        status === "WAITING"
                                                                            ? "status-waiting"
                                                                            : status === "IN_CONSULTATION"
                                                                                ? "status-consultation"
                                                                                : status === "COMPLETED"
                                                                                    ? "status-completed"
                                                                                    : status === "CANCELLED"
                                                                                        ? "status-cancelled"
                                                                                        : "status-missed"
                                                                    }`}
                                                                >

                                                                    {getStatusLabel(
                                                                        status
                                                                    )}

                                                                </span>

                                                            </td>


                                                            {/* WAIT */}

                                                            <td
                                                                className={
                                                                    status ===
                                                                    "WAITING"
                                                                        ? "queue-wait-cell"
                                                                        : "queue-no-wait-cell"
                                                                }
                                                            >

                                                                {status ===
                                                                "WAITING"
                                                                    ? getWaitTime(
                                                                        appointment
                                                                    )
                                                                    : "—"
                                                                }

                                                            </td>

                                                        </tr>

                                                    );

                                                }
                                            )}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        GLOBAL ERROR
                    ================================================= */}

                    {error &&
                        doctorFilter === "ALL" && (

                            <div className="queue-error">

                                ⚠️ {error}

                                <button
                                    onClick={() =>
                                        fetchQueue(true)
                                    }
                                >
                                    Try Again
                                </button>

                            </div>

                        )}

                </div>

            </main>


            {/* =================================================
                LOGOUT OVERLAY
            ================================================= */}

            {isLoggingOut && (

                <div className="logout-overlay">

                    <div className="logout-modal">

                        <div className="logout-spinner"></div>

                        <h3>
                            Logging out securely...
                        </h3>

                    </div>

                </div>

            )}

        </div>
    );
};


export default ReceptionistQueue;