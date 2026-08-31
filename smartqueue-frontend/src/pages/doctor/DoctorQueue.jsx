import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../styles/ReceptionistDashboard.css";

const DoctorQueue = () => {

    const navigate = useNavigate();

    const [doctorName, setDoctorName] = useState('Doctor');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [queueList, setQueueList] = useState([]);

    const [loading, setLoading] = useState(true);

    const [currentTime, setCurrentTime] =
        useState(new Date());

    const [updatingId, setUpdatingId] =
        useState(null);


    // =========================================================
    // IMPORTANT
    // EVERY PATIENT GETS 15 MINUTES
    // =========================================================

    const AVERAGE_CONSULTATION_TIME = 15;


    // =========================================================
    // LOAD DOCTOR
    // =========================================================

    useEffect(() => {

        const storedName =
            localStorage.getItem("userName");

        const userId =
            localStorage.getItem("userId");


        if (storedName) {

            setDoctorName(storedName);

        }


        if (userId) {

            fetchDoctorQueue(userId);

        } else {

            setLoading(false);

        }

    }, []);


    // =========================================================
    // LIVE CLOCK
    // =========================================================

    useEffect(() => {

        const timer =
            setInterval(() => {

                setCurrentTime(
                    new Date()
                );

            }, 1000);


        return () => clearInterval(timer);

    }, []);


    // =========================================================
    // AUTO REFRESH
    // =========================================================

    useEffect(() => {

        const userId =
            localStorage.getItem("userId");


        if (!userId) return;


        const interval =
            setInterval(() => {

                fetchDoctorQueue(
                    userId,
                    false
                );

            }, 30000);


        return () =>
            clearInterval(interval);

    }, []);


    // =========================================================
    // FETCH DOCTOR QUEUE
    // =========================================================

    const fetchDoctorQueue = async (
        userId,
        showLoading = true
    ) => {

        try {

            if (showLoading) {

                setLoading(true);

            }


            const response =
                await axios.get(
                    `http://localhost:8081/api/queue/doctor-queue/${userId}`
                );


            const data =
                Array.isArray(response.data)
                    ? response.data
                    : [];


            // =================================================
            // NORMALIZE DATA
            // =================================================

            const normalizedQueue =
                data.map(item => ({

                    ...item,

                    // Backend queueStatus is:
                    // WAITING
                    // IN-PROGRESS
                    // COMPLETED

                    status:
                        item.queueStatus ||
                        item.status,

                    tokenNumber:
                        item.tokenNumber ||
                        item.token,

                    patientName:
                        item.patientName ||
                        "N/A",

                    age:
                        item.age ?? null,

                    gender:
                        item.gender ?? null

                }));


            // =================================================
            // SORT
            //
            // Completed patients first/last is handled below.
            // Token number is used for normal queue order.
            // =================================================

            const sortedQueue =
                [...normalizedQueue].sort(
                    (a, b) => {

                        const tokenA =
                            parseInt(
                                String(
                                    a.tokenNumber ||
                                    ""
                                ).replace(
                                    /\D/g,
                                    ""
                                )
                            ) || 0;


                        const tokenB =
                            parseInt(
                                String(
                                    b.tokenNumber ||
                                    ""
                                ).replace(
                                    /\D/g,
                                    ""
                                )
                            ) || 0;


                        return tokenA - tokenB;

                    }
                );


            setQueueList(
                sortedQueue
            );

        } catch (error) {

            console.error(
                "Error fetching doctor queue:",
                error
            );

        } finally {

            if (showLoading) {

                setLoading(false);

            }

        }

    };


    // =========================================================
    // LOCAL STORAGE START TIME
    // FALLBACK ONLY
    // =========================================================

    const getStartTimeKey = (id) => {

        return `consultationStart_${id}`;

    };


    const saveConsultationStartTime = (id) => {

        localStorage.setItem(
            getStartTimeKey(id),
            new Date().toISOString()
        );

    };


    const getLocalConsultationStartTime = (id) => {

        const savedTime =
            localStorage.getItem(
                getStartTimeKey(id)
            );


        return savedTime
            ? new Date(savedTime)
            : null;

    };


    const removeConsultationStartTime = (id) => {

        localStorage.removeItem(
            getStartTimeKey(id)
        );

    };


    // =========================================================
    // GET START TIME
    //
    // Backend time first.
    // LocalStorage only fallback.
    // =========================================================

    const getConsultationStartTime = (item) => {

        if (
            item?.consultationStartTime
        ) {

            const backendTime =
                new Date(
                    item.consultationStartTime
                );


            if (
                !isNaN(
                    backendTime.getTime()
                )
            ) {

                return backendTime;

            }

        }


        return getLocalConsultationStartTime(
            item.id
        );

    };


    // =========================================================
    // ELAPSED MINUTES
    // =========================================================

    const getElapsedMinutes = (item) => {

        // -----------------------------------------------------
        // If backend already has actual completed duration
        // -----------------------------------------------------

        if (
            item?.status === "COMPLETED" &&
            item?.actualConsultationMinutes != null
        ) {

            return Number(
                item.actualConsultationMinutes
            );

        }


        const startTime =
            getConsultationStartTime(item);


        if (!startTime) {

            return 0;

        }


        const difference =
            currentTime.getTime() -
            startTime.getTime();


        return Math.max(
            0,
            Math.floor(
                difference / 60000
            )
        );

    };


    // =========================================================
    // FORMAT DURATION
    // =========================================================

    const formatDuration = (minutes) => {

        const safeMinutes =
            Number(minutes) || 0;


        if (safeMinutes < 1) {

            return "< 1 min";

        }


        if (safeMinutes < 60) {

            return `${safeMinutes} min`;

        }


        const hours =
            Math.floor(
                safeMinutes / 60
            );


        const remainingMinutes =
            safeMinutes % 60;


        return `${hours}h ${remainingMinutes}m`;

    };


    // =========================================================
    // FORMAT TIME
    // =========================================================

    const formatTime = (date) => {

        if (!date) {

            return "-";

        }


        return date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // =========================================================
    // CURRENT PATIENT
    // =========================================================

    const hasCurrentPatient =
        queueList.some(
            item =>
                item.status ===
                "IN-PROGRESS"
        );


    // =========================================================
    // CALCULATE QUEUE
    // =========================================================

    const calculatedQueue =
        useMemo(() => {

            // -------------------------------------------------
            // ACTIVE PATIENTS
            // -------------------------------------------------

            const activeQueue =
                queueList.filter(
                    item =>
                        item.status !==
                        "COMPLETED"
                );


            // -------------------------------------------------
            // COMPLETED PATIENTS
            // -------------------------------------------------

            const completedQueue =
                queueList.filter(
                    item =>
                        item.status ===
                        "COMPLETED"
                );


            // -------------------------------------------------
            // CURRENT PATIENT
            // -------------------------------------------------

            const currentPatient =
                activeQueue.find(
                    item =>
                        item.status ===
                        "IN-PROGRESS"
                );


            // -------------------------------------------------
            // WAITING PATIENTS
            // -------------------------------------------------

            const waitingPatients =
                activeQueue.filter(
                    item =>
                        item.status ===
                        "WAITING"
                );


            let result = [];


            // =================================================
            // COMPLETED PATIENTS
            // =================================================

            completedQueue.forEach(
                item => {

                    const actualMinutes =
                        item.actualConsultationMinutes;


                    result.push({

                        ...item,

                        queuePosition:
                            "-",

                        estimatedTurn:
                            "Completed",

                        waitingTime:
                            "-",

                        consultationTime:
                            actualMinutes != null
                                ? formatDuration(
                                    actualMinutes
                                )
                                : "Completed"

                    });

                }
            );


            // =================================================
            // START ESTIMATION
            //
            // IMPORTANT:
            // NO 5 MINUTES HERE
            // =================================================

            let estimatedStartTime =
                new Date(
                    currentTime
                );


            // =================================================
            // CURRENT PATIENT
            // =================================================

            if (currentPatient) {

                const elapsedMinutes =
                    getElapsedMinutes(
                        currentPatient
                    );


                const remainingMinutes =
                    Math.max(
                        0,
                        AVERAGE_CONSULTATION_TIME -
                        elapsedMinutes
                    );


                const delayMinutes =
                    Math.max(
                        0,
                        elapsedMinutes -
                        AVERAGE_CONSULTATION_TIME
                    );


                let consultationText;


                if (delayMinutes > 0) {

                    consultationText =
                        `${formatDuration(
                            elapsedMinutes
                        )} (Delayed ${delayMinutes} min)`;

                } else {

                    consultationText =
                        `${formatDuration(
                            elapsedMinutes
                        )} elapsed`;

                }


                result.push({

                    ...currentPatient,

                    queuePosition:
                        1,

                    estimatedTurn:
                        "Now",

                    waitingTime:
                        "In consultation",

                    consultationTime:
                    consultationText,

                    delayMinutes

                });


                // =================================================
                // NEXT PATIENT
                //
                // Current consultation remaining time.
                // =================================================

                estimatedStartTime =
                    new Date(
                        currentTime.getTime() +
                        remainingMinutes *
                        60000
                    );

            }


            // =================================================
            // WAITING PATIENTS
            //
            // EVERY PATIENT = 15 MINUTES
            //
            // Example:
            //
            // Current = now
            // Patient 37 = 11:15
            // Patient 38 = 11:30
            // Patient 39 = 11:45
            // =================================================

            waitingPatients.forEach(
                (item, index) => {

                    const position =
                        currentPatient
                            ? index + 2
                            : index + 1;


                    const estimatedTurnDate =
                        new Date(
                            estimatedStartTime
                        );


                    const waitMinutes =
                        Math.max(
                            0,
                            Math.ceil(
                                (
                                    estimatedTurnDate.getTime() -
                                    currentTime.getTime()
                                ) / 60000
                            )
                        );


                    result.push({

                        ...item,

                        queuePosition:
                        position,

                        estimatedTurn:
                            formatTime(
                                estimatedTurnDate
                            ),

                        waitingTime:
                            waitMinutes === 0
                                ? "Next"
                                : `~${waitMinutes} min`,

                        consultationTime:
                            "-"

                    });


                    // =================================================
                    // IMPORTANT
                    // ALWAYS ADD 15 MINUTES
                    // =================================================

                    estimatedStartTime =
                        new Date(
                            estimatedStartTime.getTime() +
                            AVERAGE_CONSULTATION_TIME *
                            60000
                        );

                }
            );


            return result;

        }, [
            queueList,
            currentTime
        ]);


    // =========================================================
    // LOGOUT
    // =========================================================

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

        }, 2000);

    };


    // =========================================================
    // UPDATE STATUS
    // =========================================================

    const updateStatus = async (
        item,
        newStatus
    ) => {

        try {

            setUpdatingId(
                item.id
            );


            // =================================================
            // PREVENT MULTIPLE ACTIVE PATIENTS
            // =================================================

            if (
                newStatus ===
                "IN-PROGRESS" &&
                hasCurrentPatient
            ) {

                alert(
                    "Please finish the current patient's consultation first."
                );


                setUpdatingId(null);

                return;

            }


            console.log(
                "Updating appointment:",
                item.id
            );


            console.log(
                "New status:",
                newStatus
            );


            // =================================================
            // BACKEND UPDATE
            // =================================================

            const response =
                await axios.put(

                    `http://localhost:8081/api/queue/update/${item.id}`,

                    {
                        status:
                        newStatus
                    }

                );


            console.log(
                "Status update response:",
                response.data
            );


            // =================================================
            // START CHECKUP
            // =================================================

            if (
                newStatus ===
                "IN-PROGRESS"
            ) {

                // Save fallback time
                saveConsultationStartTime(
                    item.id
                );

            }


            // =================================================
            // FINISH CHECKUP
            // =================================================

            if (
                newStatus ===
                "COMPLETED"
            ) {

                const backendMinutes =
                    response.data
                        ?.actualConsultationMinutes;


                const elapsedMinutes =
                    backendMinutes != null
                        ? Number(
                            backendMinutes
                        )
                        : getElapsedMinutes(
                            item
                        );


                removeConsultationStartTime(
                    item.id
                );


                alert(
                    `Consultation completed successfully.\n\n` +
                    `Actual consultation time: ` +
                    `${formatDuration(
                        elapsedMinutes
                    )}`
                );

            }


            // =================================================
            // UPDATE LOCAL STATE
            // =================================================

            setQueueList(
                previousQueue =>

                    previousQueue.map(
                        queueItem => {

                            if (
                                queueItem.id !==
                                item.id
                            ) {

                                return queueItem;

                            }


                            return {

                                ...queueItem,

                                status:
                                    response.data
                                        ?.queueStatus ||
                                    newStatus,

                                queueStatus:
                                    response.data
                                        ?.queueStatus ||
                                    newStatus,

                                consultationStartTime:
                                    response.data
                                        ?.consultationStartTime ??
                                    queueItem.consultationStartTime,

                                consultationEndTime:
                                    response.data
                                        ?.consultationEndTime ??
                                    queueItem.consultationEndTime,

                                actualConsultationMinutes:
                                    response.data
                                        ?.actualConsultationMinutes ??
                                    queueItem.actualConsultationMinutes

                            };

                        }
                    )
            );


            // =================================================
            // FETCH LATEST BACKEND DATA
            // =================================================

            const userId =
                localStorage.getItem(
                    "userId"
                );


            if (userId) {

                await fetchDoctorQueue(
                    userId,
                    false
                );

            }

        } catch (error) {

            console.error(
                "Error updating status:",
                error
            );


            console.error(
                "Backend response:",
                error.response?.data
            );


            alert(
                error.response?.data?.message ||
                "Failed to update patient status."
            );

        } finally {

            setUpdatingId(
                null
            );

        }

    };


    // =========================================================
    // COUNTS
    // =========================================================

    const waitingCount =
        queueList.filter(
            item =>
                item.status ===
                "WAITING"
        ).length;


    const completedCount =
        queueList.filter(
            item =>
                item.status ===
                "COMPLETED"
        ).length;


    const currentPatient =
        calculatedQueue.find(
            item =>
                item.status ===
                "IN-PROGRESS"
        );


    // =========================================================
    // UI
    // =========================================================

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
                                    '/doctor/dashboard'
                                )
                            }
                            className="nav-btn"
                        >
                            📊 Dashboard
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    '/doctor/queue'
                                )
                            }
                            className="nav-btn active"
                        >
                            🎫 My Queue
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    '/doctor/patients'
                                )
                            }
                            className="nav-btn"
                        >
                            👤 My Patients
                        </button>

                    </nav>

                </div>


                <div className="sidebar-bottom">

                    <button
                        onClick={
                            handleLogout
                        }
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


                {/* HEADER */}

                <header className="receptionist-header">

                    <h1 className="header-title">
                        Live Queue Management
                    </h1>


                    <div className="header-right">

                        <span
                            style={{
                                cursor:
                                    "pointer",
                                fontSize:
                                    "18px"
                            }}
                        >
                            🔔
                        </span>


                        <div
                            style={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap:
                                    "8px"
                            }}
                        >

                            <div className="user-avatar">

                                {doctorName
                                    .charAt(0)
                                    .toUpperCase()}

                            </div>


                            <span
                                style={{
                                    fontSize:
                                        "14px",
                                    fontWeight:
                                        "500",
                                    color:
                                        "#374151"
                                }}
                            >
                                {doctorName}
                            </span>

                        </div>

                    </div>

                </header>


                {/* BODY */}

                <div className="receptionist-body">


                    {/* PAGE TITLE */}

                    <div className="mb-6">

                        <h2 className="welcome-title">
                            My Assigned Queue
                        </h2>


                        <p className="welcome-sub">
                            Monitor live consultation progress and automatically updated patient waiting estimates.
                        </p>

                    </div>


                    {/* =================================================
                        SUMMARY CARDS
                    ================================================= */}

                    <div
                        style={{
                            display:
                                "grid",

                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(180px, 1fr))",

                            gap:
                                "16px",

                            marginBottom:
                                "20px"
                        }}
                    >


                        {/* CURRENT */}

                        <div className="table-card">

                            <p
                                style={{
                                    margin:
                                        0,
                                    fontSize:
                                        "13px",
                                    color:
                                        "#6b7280"
                                }}
                            >
                                CURRENT PATIENT
                            </p>


                            <h3
                                style={{
                                    margin:
                                        "8px 0 0",
                                    color:
                                        "#1f2937"
                                }}
                            >
                                {currentPatient
                                    ? currentPatient.tokenNumber ||
                                    currentPatient.token
                                    : "No active patient"}
                            </h3>

                        </div>


                        {/* WAITING */}

                        <div className="table-card">

                            <p
                                style={{
                                    margin:
                                        0,
                                    fontSize:
                                        "13px",
                                    color:
                                        "#6b7280"
                                }}
                            >
                                WAITING PATIENTS
                            </p>


                            <h3
                                style={{
                                    margin:
                                        "8px 0 0",
                                    color:
                                        "#d97706"
                                }}
                            >
                                {waitingCount}
                            </h3>

                        </div>


                        {/* COMPLETED */}

                        <div className="table-card">

                            <p
                                style={{
                                    margin:
                                        0,
                                    fontSize:
                                        "13px",
                                    color:
                                        "#6b7280"
                                }}
                            >
                                COMPLETED TODAY
                            </p>


                            <h3
                                style={{
                                    margin:
                                        "8px 0 0",
                                    color:
                                        "#059669"
                                }}
                            >
                                {completedCount}
                            </h3>

                        </div>


                        {/* AVG */}

                        <div className="table-card">

                            <p
                                style={{
                                    margin:
                                        0,
                                    fontSize:
                                        "13px",
                                    color:
                                        "#6b7280"
                                }}
                            >
                                AVG. CONSULTATION
                            </p>


                            <h3
                                style={{
                                    margin:
                                        "8px 0 0",
                                    color:
                                        "#2563eb"
                                }}
                            >
                                {AVERAGE_CONSULTATION_TIME} min
                            </h3>

                        </div>

                    </div>


                    {/* =================================================
                        TABLE
                    ================================================= */}

                    <div className="table-card">

                        {loading ? (

                            <p
                                style={{
                                    textAlign:
                                        "center",
                                    padding:
                                        "30px",
                                    color:
                                        "#6b7280"
                                }}
                            >
                                Loading live queue...
                            </p>

                        ) : calculatedQueue.length === 0 ? (

                            <p
                                style={{
                                    textAlign:
                                        "center",
                                    padding:
                                        "30px",
                                    color:
                                        "#6b7280"
                                }}
                            >
                                No patients in the queue right now.
                            </p>

                        ) : (

                            <div
                                style={{
                                    overflowX:
                                        "auto"
                                }}
                            >

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
                                            Patient Name
                                        </th>

                                        <th>
                                            Age / Gender
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Consultation
                                        </th>

                                        <th>
                                            Estimated Turn
                                        </th>

                                        <th>
                                            Waiting Time
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                    </thead>


                                    <tbody>

                                    {calculatedQueue.map(
                                        item => (

                                            <tr
                                                key={
                                                    item.id
                                                }
                                            >

                                                {/* POSITION */}

                                                <td
                                                    style={{
                                                        fontWeight:
                                                            "700",
                                                        color:
                                                            "#374151"
                                                    }}
                                                >
                                                    {
                                                        item.queuePosition
                                                    }
                                                </td>


                                                {/* TOKEN */}

                                                <td
                                                    style={{
                                                        fontWeight:
                                                            "700",
                                                        color:
                                                            "#059669"
                                                    }}
                                                >
                                                    {
                                                        item.tokenNumber ||
                                                        item.token
                                                    }
                                                </td>


                                                {/* NAME */}

                                                <td>
                                                    {
                                                        item.patientName
                                                    }
                                                </td>


                                                {/* AGE / GENDER */}

                                                <td>

                                                    {
                                                        item.age ??
                                                        "N/A"
                                                    }

                                                    {" "}yrs /{" "}

                                                    {
                                                        item.gender ||
                                                        "N/A"
                                                    }

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            `status-badge ${
                                                                (
                                                                    item.status ||
                                                                    ""
                                                                )
                                                                    .toLowerCase()
                                                                    .replace(
                                                                        "-",
                                                                        ""
                                                                    )
                                                            }`
                                                        }
                                                    >
                                                        {
                                                            item.status
                                                        }
                                                    </span>

                                                </td>


                                                {/* CONSULTATION */}

                                                <td
                                                    style={{
                                                        fontSize:
                                                            "13px",

                                                        fontWeight:
                                                            item.status ===
                                                            "IN-PROGRESS"
                                                                ? "600"
                                                                : "400",

                                                        color:
                                                            item.delayMinutes >
                                                            0
                                                                ? "#dc2626"
                                                                : "#4b5563"
                                                    }}
                                                >

                                                    {
                                                        item.consultationTime
                                                    }

                                                </td>


                                                {/* ESTIMATED TURN */}

                                                <td
                                                    style={{
                                                        fontWeight:
                                                            "600",
                                                        color:
                                                            "#374151"
                                                    }}
                                                >

                                                    {
                                                        item.estimatedTurn
                                                    }

                                                </td>


                                                {/* WAITING */}

                                                <td
                                                    style={{
                                                        color:
                                                            "#6b7280"
                                                    }}
                                                >

                                                    {
                                                        item.waitingTime
                                                    }

                                                </td>


                                                {/* ACTION */}

                                                <td>


                                                    {/* WAITING */}

                                                    {item.status ===
                                                        "WAITING" && (

                                                            <button
                                                                className="action-btn"

                                                                style={{
                                                                    background:
                                                                        hasCurrentPatient
                                                                            ? "#9ca3af"
                                                                            : "#3b82f6",

                                                                    color:
                                                                        "#fff",

                                                                    cursor:
                                                                        hasCurrentPatient
                                                                            ? "not-allowed"
                                                                            : "pointer"
                                                                }}

                                                                disabled={
                                                                    hasCurrentPatient ||
                                                                    updatingId ===
                                                                    item.id
                                                                }

                                                                onClick={() =>
                                                                    updateStatus(
                                                                        item,
                                                                        "IN-PROGRESS"
                                                                    )
                                                                }
                                                            >

                                                                {
                                                                    updatingId ===
                                                                    item.id
                                                                        ? "Starting..."
                                                                        : "Start Checkup"
                                                                }

                                                            </button>

                                                        )}


                                                    {/* IN-PROGRESS */}

                                                    {item.status ===
                                                        "IN-PROGRESS" && (

                                                            <button
                                                                className="action-btn"

                                                                style={{
                                                                    background:
                                                                        "#22c55e",

                                                                    color:
                                                                        "#fff"
                                                                }}

                                                                disabled={
                                                                    updatingId ===
                                                                    item.id
                                                                }

                                                                onClick={() =>
                                                                    updateStatus(
                                                                        item,
                                                                        "COMPLETED"
                                                                    )
                                                                }
                                                            >

                                                                {
                                                                    updatingId ===
                                                                    item.id
                                                                        ? "Finishing..."
                                                                        : "Finish"
                                                                }

                                                            </button>

                                                        )}


                                                    {/* COMPLETED */}

                                                    {item.status ===
                                                        "COMPLETED" && (

                                                            <span
                                                                style={{
                                                                    fontSize:
                                                                        "12px",

                                                                    color:
                                                                        "#059669",

                                                                    fontWeight:
                                                                        "600"
                                                                }}
                                                            >
                                                            ✓ Completed
                                                        </span>

                                                        )}

                                                </td>

                                            </tr>

                                        )
                                    )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </div>

            </main>


            {/* =================================================
                LOGOUT OVERLAY
            ================================================= */}

            {isLoggingOut && (

                <div className="logout-overlay">

                    <div className="logout-modal">

                        <div className="logout-spinner"></div>


                        <h3
                            style={{
                                fontSize:
                                    "18px",
                                fontWeight:
                                    "600",
                                color:
                                    "#1f2937",
                                margin:
                                    "0"
                            }}
                        >
                            Logging out securely...
                        </h3>


                        <p
                            style={{
                                fontSize:
                                    "14px",
                                color:
                                    "#6b7280",
                                margin:
                                    "0"
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


export default DoctorQueue;