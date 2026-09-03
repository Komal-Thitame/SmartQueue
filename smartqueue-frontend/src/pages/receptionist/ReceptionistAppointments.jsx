import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "../../styles/ReceptionistDashboard.css";

const ReceptionistAppointments = () => {
    const navigate = useNavigate();

    // =====================================================
    // STATES
    // =====================================================

    const [receptionistName, setReceptionistName] =
        useState("Receptionist");

    const [isLoggingOut, setIsLoggingOut] =
        useState(false);

    const [showModal, setShowModal] =
        useState(false);

    const [patients, setPatients] =
        useState([]);

    const [doctors, setDoctors] =
        useState([]);

    const [appointments, setAppointments] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    // =====================================================
    // WALK-IN FORM
    // =====================================================

    const getTodayDate = () => {
        return new Date()
            .toISOString()
            .split("T")[0];
    };

    const getInitialForm = () => ({
        patientId: "",
        doctorId: "",
        appointmentDate: getTodayDate(),

        isNewPatient: false,

        newName: "",
        newEmail: "",
        newPhone: "",
        newAge: "",
        newGender: "Male",
        newAddress: ""
    });

    const [walkInForm, setWalkInForm] =
        useState(getInitialForm());

    // =====================================================
    // GET RECEPTIONIST NAME
    // =====================================================

    useEffect(() => {
        const storedName =
            localStorage.getItem("userName");

        if (storedName) {
            setReceptionistName(storedName);
        }
    }, []);

    // =====================================================
    // LOAD ALL DATA
    // =====================================================

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        await Promise.all([
            fetchPatients(),
            fetchDoctors(),
            fetchAppointments()
        ]);
    };

    // =====================================================
    // FETCH PATIENTS
    // =====================================================

    const fetchPatients = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/receptionist/patients`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load patients."
                );
            }

            const data = await response.json();

            setPatients(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {
            console.error(
                "Error loading patients:",
                error
            );
        }
    };

    // =====================================================
    // FETCH DOCTORS
    // =====================================================

    const fetchDoctors = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/doctors`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load doctors."
                );
            }

            const data = await response.json();

            setDoctors(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {
            console.error(
                "Error loading doctors:",
                error
            );
        }
    };

    // =====================================================
    // FETCH TODAY'S APPOINTMENTS
    // =====================================================

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/receptionist/appointments/today`
            );

            if (!response.ok) {
                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    "Failed to load appointments."
                );
            }

            const data =
                await response.json();

            setAppointments(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {
            console.error(
                "Error loading appointments:",
                error
            );

            setError(
                "Unable to load appointments. Please check backend API."
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // FORM INPUT CHANGE
    // =====================================================

    const handleInputChange = (e) => {
        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setWalkInForm((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));
    };

    // =====================================================
    // RESET FORM
    // =====================================================

    const resetForm = () => {
        setWalkInForm(
            getInitialForm()
        );
    };

    // =====================================================
    // OPEN MODAL
    // =====================================================

    const openModal = () => {
        setError("");
        setSuccessMessage("");

        resetForm();

        setShowModal(true);
    };

    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setError("");

        resetForm();
    };

    // =====================================================
    // CREATE WALK-IN APPOINTMENT
    // =====================================================

    const handleWalkInSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccessMessage("");

        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!walkInForm.doctorId) {
            setError(
                "Please select a doctor."
            );
            return;
        }

        if (!walkInForm.appointmentDate) {
            setError(
                "Please select appointment date."
            );
            return;
        }

        if (
            !walkInForm.isNewPatient &&
            !walkInForm.patientId
        ) {
            setError(
                "Please select an existing patient."
            );
            return;
        }

        if (
            walkInForm.isNewPatient &&
            !walkInForm.newName.trim()
        ) {
            setError(
                "Please enter patient name."
            );
            return;
        }

        if (
            walkInForm.isNewPatient &&
            !walkInForm.newPhone.trim()
        ) {
            setError(
                "Please enter patient phone."
            );
            return;
        }

        try {
            setSaving(true);

            // -------------------------------------------------
            // EXISTING PATIENT
            // -------------------------------------------------

            let selectedPatient = null;

            if (!walkInForm.isNewPatient) {
                selectedPatient =
                    patients.find(
                        (patient) =>
                            String(patient.id) ===
                            String(
                                walkInForm.patientId
                            )
                    );

                if (!selectedPatient) {
                    throw new Error(
                        "Selected patient not found."
                    );
                }
            }

            // -------------------------------------------------
            // PATIENT ID
            // -------------------------------------------------

            const patientId =
                walkInForm.isNewPatient
                    ? null
                    : Number(
                        walkInForm.patientId
                    );

            // -------------------------------------------------
            // PATIENT INFORMATION
            // -------------------------------------------------

            const patientName =
                walkInForm.isNewPatient
                    ? walkInForm.newName.trim()
                    : selectedPatient.name;

            const patientPhone =
                walkInForm.isNewPatient
                    ? walkInForm.newPhone.trim()
                    : selectedPatient.phone || "";

            const patientEmail =
                walkInForm.isNewPatient
                    ? walkInForm.newEmail.trim()
                    : selectedPatient.email || "";

            const patientAge =
                walkInForm.isNewPatient
                    ? walkInForm.newAge
                        ? Number(
                            walkInForm.newAge
                        )
                        : null
                    : selectedPatient.age ?? null;

            const patientGender =
                walkInForm.isNewPatient
                    ? walkInForm.newGender
                    : selectedPatient.gender || "";

            const patientAddress =
                walkInForm.isNewPatient
                    ? walkInForm.newAddress.trim()
                    : selectedPatient.address || "";

            // -------------------------------------------------
            // APPOINTMENT DATA
            // -------------------------------------------------

            const appointmentData = {
                doctorId:
                    Number(
                        walkInForm.doctorId
                    ),

                patientId:
                patientId,

                patientName:
                patientName,

                patientPhone:
                patientPhone,

                patientEmail:
                patientEmail,

                age:
                patientAge,

                gender:
                patientGender,

                address:
                patientAddress,

                appointmentDate:
                walkInForm.appointmentDate,

                bookingSource:
                    "RECEPTION"
            };

            console.log(
                "Creating appointment:",
                appointmentData
            );

            // -------------------------------------------------
            // API CALL
            // -------------------------------------------------

            const response = await fetch(
                `${API_BASE_URL}/receptionist/book-token`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        appointmentData
                    )
                }
            );

            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            let data = {};

            try {
                data =
                    await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Appointment creation failed."
                );
            }

            // -------------------------------------------------
            // TOKEN
            // -------------------------------------------------

            const tokenNumber =
                data.appointment?.tokenNumber ??
                data.tokenNumber ??
                null;

            // -------------------------------------------------
            // SUCCESS MESSAGE
            // -------------------------------------------------

            if (tokenNumber !== null) {
                setSuccessMessage(
                    `Appointment created successfully! Token: A-${String(
                        tokenNumber
                    ).padStart(2, "0")}`
                );
            } else {
                setSuccessMessage(
                    "Appointment created successfully!"
                );
            }

            // -------------------------------------------------
            // CLOSE MODAL
            // -------------------------------------------------

            setShowModal(false);

            resetForm();

            // -------------------------------------------------
            // REFRESH DATA
            // -------------------------------------------------

            await fetchAppointments();
            await fetchPatients();

            setTimeout(() => {
                setSuccessMessage("");
            }, 4000);

        } catch (error) {
            console.error(
                "Appointment creation error:",
                error
            );

            setError(
                error.message ||
                "Unable to create appointment."
            );

        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // CHECK-IN
    // =====================================================

    const handleCheckIn = async (
        appointmentId
    ) => {
        try {
            setError("");
            setSuccessMessage("");

            const response = await fetch(
                `${API_BASE_URL}/receptionist/check-in/${appointmentId}`,
                {
                    method: "PUT"
                }
            );

            let data = {};

            try {
                data =
                    await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Check-in failed."
                );
            }

            setSuccessMessage(
                "Patient checked-in successfully!"
            );

            await fetchAppointments();

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);

        } catch (error) {
            console.error(
                "Check-in error:",
                error
            );

            setError(
                error.message ||
                "Unable to check-in patient."
            );
        }
    };

    // =====================================================
    // CANCEL APPOINTMENT
    // =====================================================

    const handleCancel = async (
        appointmentId
    ) => {
        const confirmCancel =
            window.confirm(
                "Are you sure you want to cancel this appointment?"
            );

        if (!confirmCancel) {
            return;
        }

        try {
            setError("");
            setSuccessMessage("");

            const response = await fetch(
                `${API_BASE_URL}/receptionist/cancel/${appointmentId}`,
                {
                    method: "PUT"
                }
            );

            let data = {};

            try {
                data =
                    await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Cancellation failed."
                );
            }

            setSuccessMessage(
                "Appointment cancelled successfully!"
            );

            await fetchAppointments();

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);

        } catch (error) {
            console.error(
                "Cancel error:",
                error
            );

            setError(
                error.message ||
                "Unable to cancel appointment."
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
                "/login",
                {
                    replace: true
                }
            );
        }, 1500);
    };

    // =====================================================
    // GET DOCTOR NAME
    // =====================================================

    const getDoctorName = (
        appointment
    ) => {
        if (
            appointment.doctor &&
            typeof appointment.doctor === "object" &&
            appointment.doctor.name
        ) {
            return appointment.doctor.name;
        }

        if (appointment.doctorName) {
            return appointment.doctorName;
        }

        if (
            typeof appointment.doctor === "string"
        ) {
            return appointment.doctor;
        }

        return "-";
    };

    // =====================================================
    // GET DOCTOR DEPARTMENT
    // =====================================================

    const getDoctorDepartment = (
        appointment
    ) => {
        if (
            appointment.doctor &&
            typeof appointment.doctor === "object"
        ) {
            return (
                appointment.doctor.department ||
                appointment.doctor.specialization ||
                ""
            );
        }

        return (
            appointment.department ||
            appointment.specialization ||
            ""
        );
    };

    // =====================================================
    // GET PATIENT NAME
    // =====================================================

    const getPatientName = (
        appointment
    ) => {
        if (appointment.patientName) {
            return appointment.patientName;
        }

        if (
            appointment.patient &&
            appointment.patient.name
        ) {
            return appointment.patient.name;
        }

        return "-";
    };

    // =====================================================
    // GET PATIENT PHONE
    // =====================================================

    const getPatientPhone = (
        appointment
    ) => {
        if (appointment.patientPhone) {
            return appointment.patientPhone;
        }

        if (
            appointment.patient &&
            appointment.patient.phone
        ) {
            return appointment.patient.phone;
        }

        return "";
    };

    // =====================================================
    // GET TOKEN
    // =====================================================

    const getToken = (
        appointment
    ) => {
        if (
            appointment.tokenNumber !== null &&
            appointment.tokenNumber !== undefined
        ) {
            return `A-${String(
                appointment.tokenNumber
            ).padStart(2, "0")}`;
        }

        if (appointment.token) {
            return appointment.token;
        }

        return "-";
    };

    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (
        status
    ) => {
        return String(
            status || ""
        )
            .toLowerCase()
            .replace(/_/g, "-");
    };

    // =====================================================
    // ACTION BUTTONS
    // =====================================================

    const renderActions = (
        appointment
    ) => {
        const status =
            appointment.status;

        if (
            status === "WAITING" ||
            status === "BOOKED"
        ) {
            return (
                <div
                    style={{
                        display: "flex",
                        gap: "6px",
                        flexWrap: "wrap"
                    }}
                >
                    <button
                        className="action-btn"
                        onClick={() =>
                            handleCheckIn(
                                appointment.id
                            )
                        }
                    >
                        Check-In
                    </button>

                    <button
                        onClick={() =>
                            handleCancel(
                                appointment.id
                            )
                        }
                        style={{
                            background: "#fee2e2",
                            color: "#991b1b",
                            border: "none",
                            padding: "7px 10px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600"
                        }}
                    >
                        Cancel
                    </button>
                </div>
            );
        }

        if (status === "IN_PROGRESS") {
            return (
                <span
                    style={{
                        fontSize: "12px",
                        color: "#2563eb",
                        fontWeight: "600"
                    }}
                >
                    In Progress
                </span>
            );
        }

        if (status === "IN_CONSULTATION") {
            return (
                <span
                    style={{
                        fontSize: "12px",
                        color: "#7c3aed",
                        fontWeight: "600"
                    }}
                >
                    In Consultation
                </span>
            );
        }

        if (status === "COMPLETED") {
            return (
                <span
                    style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        fontWeight: "500"
                    }}
                >
                    Completed
                </span>
            );
        }

        if (status === "CANCELLED") {
            return (
                <span
                    style={{
                        fontSize: "12px",
                        color: "#dc2626",
                        fontWeight: "500"
                    }}
                >
                    Cancelled
                </span>
            );
        }

        if (status === "MISSED") {
            return (
                <span
                    style={{
                        fontSize: "12px",
                        color: "#d97706",
                        fontWeight: "500"
                    }}
                >
                    Missed
                </span>
            );
        }

        return "-";
    };

    // =====================================================
    // JSX
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
                            className="nav-btn active"
                        >
                            📅 Appointments
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/receptionist/queue"
                                )
                            }
                            className="nav-btn"
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
                        Manage Appointments
                    </h1>

                    <div className="header-right">

                        <span
                            style={{
                                cursor: "pointer",
                                fontSize: "18px"
                            }}
                        >
                            🔔
                        </span>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                        >

                            <div className="user-avatar">
                                {receptionistName
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <span
                                style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#374151"
                                }}
                            >
                                {receptionistName}
                            </span>

                        </div>

                    </div>

                </header>

                {/* =================================================
                    BODY
                ================================================= */}

                <div className="receptionist-body">

                    <div
                        className="mb-6"
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "center"
                        }}
                    >

                        <div>

                            <h2 className="welcome-title">
                                Today's Patient Appointments
                            </h2>

                            <p className="welcome-sub">
                                View online and walk-in
                                appointments and manage
                                patient check-in.
                            </p>

                        </div>

                        <button
                            onClick={openModal}
                            style={{
                                backgroundColor:
                                    "#059669",
                                color: "#fff",
                                border: "none",
                                padding: "10px 16px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "14px"
                            }}
                        >
                            + Walk-in Appointment
                        </button>

                    </div>

                    {/* =================================================
                        SUCCESS
                    ================================================= */}

                    {successMessage && (
                        <div
                            style={{
                                background: "#dcfce7",
                                color: "#166534",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                marginBottom: "15px",
                                border:
                                    "1px solid #bbf7d0"
                            }}
                        >
                            ✅ {successMessage}
                        </div>
                    )}

                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div
                            style={{
                                background: "#fee2e2",
                                color: "#991b1b",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                marginBottom: "15px",
                                border:
                                    "1px solid #fecaca"
                            }}
                        >
                            ❌ {error}
                        </div>
                    )}

                    {/* =================================================
                        APPOINTMENT TABLE
                    ================================================= */}

                    <div className="table-card">

                        {loading ? (

                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "40px",
                                    color: "#6b7280"
                                }}
                            >
                                Loading appointments...
                            </div>

                        ) : appointments.length === 0 ? (

                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "40px",
                                    color: "#6b7280"
                                }}
                            >
                                No appointments found for today.
                            </div>

                        ) : (

                            <div
                                style={{
                                    overflowX: "auto"
                                }}
                            >

                                <table className="custom-table">

                                    <thead>
                                    <tr>
                                        <th>Token</th>
                                        <th>Patient</th>
                                        <th>Phone</th>
                                        <th>Doctor</th>
                                        <th>Date</th>
                                        <th>Source</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>

                                    <tbody>

                                    {appointments.map(
                                        (appointment) => (
                                            <tr
                                                key={
                                                    appointment.id
                                                }
                                            >

                                                {/* TOKEN */}

                                                <td
                                                    style={{
                                                        fontWeight:
                                                            "600"
                                                    }}
                                                >
                                                    {
                                                        getToken(
                                                            appointment
                                                        )
                                                    }
                                                </td>

                                                {/* PATIENT */}

                                                <td>

                                                    <div
                                                        style={{
                                                            fontWeight:
                                                                "500"
                                                        }}
                                                    >
                                                        {
                                                            getPatientName(
                                                                appointment
                                                            )
                                                        }
                                                    </div>

                                                    {(appointment.age ||
                                                        appointment.gender) && (

                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    "11px",
                                                                color:
                                                                    "#6b7280",
                                                                marginTop:
                                                                    "3px"
                                                            }}
                                                        >

                                                            {appointment.age
                                                                ? `${appointment.age} years`
                                                                : ""}

                                                            {appointment.age &&
                                                            appointment.gender
                                                                ? " • "
                                                                : ""}

                                                            {appointment.gender ||
                                                                ""}

                                                        </div>

                                                    )}

                                                </td>

                                                {/* PHONE */}

                                                <td>
                                                    {
                                                        getPatientPhone(
                                                            appointment
                                                        ) || "-"
                                                    }
                                                </td>

                                                {/* DOCTOR */}

                                                <td>

                                                    <div
                                                        style={{
                                                            fontWeight:
                                                                "500"
                                                        }}
                                                    >
                                                        {
                                                            getDoctorName(
                                                                appointment
                                                            )
                                                        }
                                                    </div>

                                                    {getDoctorDepartment(
                                                        appointment
                                                    ) && (

                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    "11px",
                                                                color:
                                                                    "#059669",
                                                                marginTop:
                                                                    "3px"
                                                            }}
                                                        >
                                                            {
                                                                getDoctorDepartment(
                                                                    appointment
                                                                )
                                                            }
                                                        </div>

                                                    )}

                                                </td>

                                                {/* DATE */}

                                                <td>
                                                    {
                                                        appointment.appointmentDate ||
                                                        appointment.date ||
                                                        "-"
                                                    }
                                                </td>

                                                {/* SOURCE */}

                                                <td>

                                                        <span
                                                            style={{
                                                                fontSize:
                                                                    "11px",
                                                                fontWeight:
                                                                    "600",
                                                                padding:
                                                                    "4px 7px",
                                                                borderRadius:
                                                                    "5px",
                                                                background:
                                                                    appointment.bookingSource ===
                                                                    "RECEPTION"
                                                                        ? "#fef3c7"
                                                                        : "#dbeafe",
                                                                color:
                                                                    appointment.bookingSource ===
                                                                    "RECEPTION"
                                                                        ? "#92400e"
                                                                        : "#1e40af"
                                                            }}
                                                        >
                                                            {
                                                                appointment.bookingSource ===
                                                                "RECEPTION"
                                                                    ? "WALK-IN"
                                                                    : "ONLINE"
                                                            }
                                                        </span>

                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                        <span
                                                            className={`status-badge ${getStatusClass(
                                                                appointment.status
                                                            )}`}
                                                        >
                                                            {
                                                                appointment.status ||
                                                                "-"
                                                            }
                                                        </span>

                                                </td>

                                                {/* ACTION */}

                                                <td>
                                                    {renderActions(
                                                        appointment
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
                WALK-IN MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="logout-overlay"
                    style={{
                        background:
                            "rgba(0,0,0,0.5)"
                    }}
                >

                    <div
                        style={{
                            background: "#fff",
                            padding: "30px",
                            borderRadius: "12px",
                            width: "500px",
                            maxWidth: "90%",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            boxShadow:
                                "0 4px 20px rgba(0,0,0,0.15)"
                        }}
                    >

                        <h3
                            style={{
                                marginBottom: "20px",
                                color: "#1f2937",
                                fontSize: "20px",
                                fontWeight: "600"
                            }}
                        >
                            Create Walk-in Appointment
                        </h3>

                        <form
                            onSubmit={
                                handleWalkInSubmit
                            }
                        >

                            {/* =================================================
                                NEW PATIENT CHECKBOX
                            ================================================= */}

                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    marginBottom: "18px",
                                    fontWeight: "500"
                                }}
                            >

                                <input
                                    type="checkbox"
                                    name="isNewPatient"
                                    checked={
                                        walkInForm.isNewPatient
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                />

                                Register New Patient

                            </label>

                            {/* =================================================
                                EXISTING PATIENT
                            ================================================= */}

                            {!walkInForm.isNewPatient && (

                                <div
                                    style={{
                                        marginBottom: "15px"
                                    }}
                                >

                                    <label
                                        style={{
                                            fontSize: "12px",
                                            color: "#4b5563",
                                            display: "block",
                                            marginBottom: "5px"
                                        }}
                                    >
                                        Select Existing Patient
                                    </label>

                                    <select
                                        name="patientId"
                                        value={
                                            walkInForm.patientId
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "9px",
                                            borderRadius: "6px",
                                            border:
                                                "1px solid #d1d5db"
                                        }}
                                    >

                                        <option value="">
                                            Choose Patient
                                        </option>

                                        {patients.map(
                                            (patient) => (
                                                <option
                                                    key={
                                                        patient.id
                                                    }
                                                    value={
                                                        patient.id
                                                    }
                                                >
                                                    {patient.name}

                                                    {patient.phone
                                                        ? ` - ${patient.phone}`
                                                        : patient.email
                                                            ? ` - ${patient.email}`
                                                            : ""}
                                                </option>
                                            )
                                        )}

                                    </select>

                                    {patients.length === 0 && (
                                        <p
                                            style={{
                                                fontSize: "11px",
                                                color: "#dc2626",
                                                marginTop: "5px"
                                            }}
                                        >
                                            No patients found.
                                        </p>
                                    )}

                                </div>

                            )}

                            {/* =================================================
                                NEW PATIENT FORM
                            ================================================= */}

                            {walkInForm.isNewPatient && (
                                <>

                                    {/* NAME */}

                                    <div
                                        style={{
                                            marginBottom: "12px"
                                        }}
                                    >

                                        <label
                                            style={{
                                                fontSize: "12px",
                                                color: "#4b5563",
                                                display: "block",
                                                marginBottom: "5px"
                                            }}
                                        >
                                            Patient Name *
                                        </label>

                                        <input
                                            type="text"
                                            name="newName"
                                            placeholder="Enter full name"
                                            value={
                                                walkInForm.newName
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            style={{
                                                width: "100%",
                                                padding: "9px",
                                                borderRadius: "6px",
                                                border:
                                                    "1px solid #d1d5db"
                                            }}
                                        />

                                    </div>

                                    {/* PHONE */}

                                    <div
                                        style={{
                                            marginBottom: "12px"
                                        }}
                                    >

                                        <label
                                            style={{
                                                fontSize: "12px",
                                                color: "#4b5563",
                                                display: "block",
                                                marginBottom: "5px"
                                            }}
                                        >
                                            Phone Number *
                                        </label>

                                        <input
                                            type="tel"
                                            name="newPhone"
                                            placeholder="Phone number"
                                            value={
                                                walkInForm.newPhone
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            style={{
                                                width: "100%",
                                                padding: "9px",
                                                borderRadius: "6px",
                                                border:
                                                    "1px solid #d1d5db"
                                            }}
                                        />

                                    </div>

                                    {/* EMAIL */}

                                    <div
                                        style={{
                                            marginBottom: "12px"
                                        }}
                                    >

                                        <label
                                            style={{
                                                fontSize: "12px",
                                                color: "#4b5563",
                                                display: "block",
                                                marginBottom: "5px"
                                            }}
                                        >
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            name="newEmail"
                                            placeholder="Email address"
                                            value={
                                                walkInForm.newEmail
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            style={{
                                                width: "100%",
                                                padding: "9px",
                                                borderRadius: "6px",
                                                border:
                                                    "1px solid #d1d5db"
                                            }}
                                        />

                                    </div>

                                    {/* AGE + GENDER */}

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            marginBottom: "12px"
                                        }}
                                    >

                                        <div
                                            style={{
                                                flex: 1
                                            }}
                                        >

                                            <label
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#4b5563",
                                                    display: "block",
                                                    marginBottom: "5px"
                                                }}
                                            >
                                                Age
                                            </label>

                                            <input
                                                type="number"
                                                name="newAge"
                                                min="1"
                                                max="120"
                                                placeholder="Age"
                                                value={
                                                    walkInForm.newAge
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                style={{
                                                    width: "100%",
                                                    padding: "9px",
                                                    borderRadius: "6px",
                                                    border:
                                                        "1px solid #d1d5db"
                                                }}
                                            />

                                        </div>

                                        <div
                                            style={{
                                                flex: 1
                                            }}
                                        >

                                            <label
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#4b5563",
                                                    display: "block",
                                                    marginBottom: "5px"
                                                }}
                                            >
                                                Gender
                                            </label>

                                            <select
                                                name="newGender"
                                                value={
                                                    walkInForm.newGender
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                style={{
                                                    width: "100%",
                                                    padding: "9px",
                                                    borderRadius: "6px",
                                                    border:
                                                        "1px solid #d1d5db"
                                                }}
                                            >

                                                <option value="Male">
                                                    Male
                                                </option>

                                                <option value="Female">
                                                    Female
                                                </option>

                                                <option value="Other">
                                                    Other
                                                </option>

                                            </select>

                                        </div>

                                    </div>

                                    {/* ADDRESS */}

                                    <div
                                        style={{
                                            marginBottom: "15px"
                                        }}
                                    >

                                        <label
                                            style={{
                                                fontSize: "12px",
                                                color: "#4b5563",
                                                display: "block",
                                                marginBottom: "5px"
                                            }}
                                        >
                                            Address
                                        </label>

                                        <textarea
                                            name="newAddress"
                                            placeholder="Enter address"
                                            value={
                                                walkInForm.newAddress
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            rows="2"
                                            style={{
                                                width: "100%",
                                                padding: "9px",
                                                borderRadius: "6px",
                                                border:
                                                    "1px solid #d1d5db",
                                                resize: "vertical"
                                            }}
                                        />

                                    </div>

                                </>
                            )}

                            {/* =================================================
                                DOCTOR
                            ================================================= */}

                            <div
                                style={{
                                    marginBottom: "15px"
                                }}
                            >

                                <label
                                    style={{
                                        fontSize: "12px",
                                        color: "#4b5563",
                                        display: "block",
                                        marginBottom: "5px"
                                    }}
                                >
                                    Select Doctor *
                                </label>

                                <select
                                    name="doctorId"
                                    value={
                                        walkInForm.doctorId
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "9px",
                                        borderRadius: "6px",
                                        border:
                                            "1px solid #d1d5db"
                                    }}
                                >

                                    <option value="">
                                        Choose Doctor
                                    </option>

                                    {doctors.map(
                                        (doctor) => (
                                            <option
                                                key={
                                                    doctor.id
                                                }
                                                value={
                                                    doctor.id
                                                }
                                            >
                                                {doctor.name}

                                                {doctor.department
                                                    ? ` - ${doctor.department}`
                                                    : doctor.specialization
                                                        ? ` - ${doctor.specialization}`
                                                        : ""}
                                            </option>
                                        )
                                    )}

                                </select>

                                {doctors.length === 0 && (
                                    <p
                                        style={{
                                            fontSize: "11px",
                                            color: "#dc2626",
                                            marginTop: "5px"
                                        }}
                                    >
                                        No doctors found.
                                    </p>
                                )}

                            </div>

                            {/* =================================================
                                APPOINTMENT DATE
                            ================================================= */}

                            <div
                                style={{
                                    marginBottom: "20px"
                                }}
                            >

                                <label
                                    style={{
                                        fontSize: "12px",
                                        color: "#4b5563",
                                        display: "block",
                                        marginBottom: "5px"
                                    }}
                                >
                                    Appointment Date *
                                </label>

                                <input
                                    type="date"
                                    name="appointmentDate"
                                    value={
                                        walkInForm.appointmentDate
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    min={getTodayDate()}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "9px",
                                        borderRadius: "6px",
                                        border:
                                            "1px solid #d1d5db"
                                    }}
                                />

                            </div>

                            {/* =================================================
                                BUTTONS
                            ================================================= */}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "flex-end",
                                    gap: "10px"
                                }}
                            >

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    style={{
                                        padding:
                                            "9px 16px",
                                        background:
                                            "#e5e7eb",
                                        border: "none",
                                        borderRadius:
                                            "6px",
                                        cursor:
                                            saving
                                                ? "not-allowed"
                                                : "pointer",
                                        fontWeight:
                                            "500"
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        padding:
                                            "9px 16px",
                                        background:
                                            saving
                                                ? "#9ca3af"
                                                : "#059669",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius:
                                            "6px",
                                        cursor:
                                            saving
                                                ? "not-allowed"
                                                : "pointer",
                                        fontWeight:
                                            "600"
                                    }}
                                >
                                    {saving
                                        ? "Creating..."
                                        : "Create Appointment"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* =================================================
                LOGOUT MODAL
            ================================================= */}

            {isLoggingOut && (

                <div
                    className="logout-overlay"
                >

                    <div
                        className="logout-modal"
                    >

                        <div
                            className="logout-spinner"
                        ></div>

                        <h3>
                            Logging out securely...
                        </h3>

                    </div>

                </div>

            )}

        </div>
    );
};

export default ReceptionistAppointments;