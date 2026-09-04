import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import QueueOperations from './QueueOperations';
import DoctorSection from './DoctorSection';
import ReceptionistSection from './ReceptionistSection.jsx';
import PatientSection from './AdminPatientSection.jsx';
import AdminSettingsSection from './AdminSettingsSection.jsx';

import '../styles/AdminDashboard.css';

const API_BASE_URL = 'http://localhost:8081/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // =========================================================
    // TAB
    // =========================================================
    const [activeTab, setActiveTab] = useState('control');

    // =========================================================
    // QUEUE
    // =========================================================
    const [selectedDept, setSelectedDept] = useState('');
    const [currentToken, setCurrentToken] = useState(null);
    const [queueLoading, setQueueLoading] = useState(false);

    // =========================================================
    // PROFILE
    // =========================================================
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const [currentUser, setCurrentUser] = useState({
        name: 'Admin User',
        email: '',
        role: 'Super Admin',
        hospital: 'City Care Hospital',
        block: 'OPD Block A'
    });

    // =========================================================
    // DASHBOARD DATA
    // =========================================================
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [dashboardError, setDashboardError] = useState('');

    // =========================================================
    // LOAD USER
    // =========================================================
    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('role');

        let displayEmail = storedEmail || '';
        let displayName = 'Admin User';
        let displayRole = storedRole || 'Super Admin';

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);

                if (parsedUser.email) {
                    displayEmail = parsedUser.email;
                }

                if (parsedUser.name) {
                    displayName = parsedUser.name;
                }

                if (parsedUser.role) {
                    displayRole = parsedUser.role;
                }
            } catch (error) {
                console.error('User JSON parse error:', error);
            }
        }

        if (displayEmail && displayName === 'Admin User') {
            const nameFromEmail = displayEmail.split('@')[0];

            displayName =
                nameFromEmail.charAt(0).toUpperCase() +
                nameFromEmail.slice(1);
        }

        setCurrentUser((prev) => ({
            ...prev,
            email: displayEmail || 'admin@gmail.com',
            name: displayName,
            role: displayRole
        }));
    }, []);

    // =========================================================
    // CLICK OUTSIDE PROFILE
    // =========================================================
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener(
            'mousedown',
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
        };
    }, []);

    // =========================================================
    // NORMALIZE STATUS
    // =========================================================
    const normalizeStatus = (status) => {
        if (!status) {
            return 'WAITING';
        }

        const value = String(status)
            .toUpperCase()
            .trim()
            .replace(/-/g, '_')
            .replace(/ /g, '_');

        if (
            value === 'IN_CONSULTATION' ||
            value === 'IN_PROGRESS' ||
            value === 'SERVING'
        ) {
            return 'IN_CONSULTATION';
        }

        if (value === 'COMPLETED') {
            return 'COMPLETED';
        }

        if (
            value === 'CANCELLED' ||
            value === 'CANCELED'
        ) {
            return 'CANCELLED';
        }

        if (value === 'MISSED') {
            return 'MISSED';
        }

        return 'WAITING';
    };

    // =========================================================
    // TOKEN NUMBER HELPER
    // =========================================================
    const getNumericToken = (token) => {
        if (
            token === undefined ||
            token === null ||
            token === ''
        ) {
            return null;
        }

        if (typeof token === 'number') {
            return token;
        }

        const value = String(token).trim();

        const match = value.match(/\d+/);

        if (!match) {
            return null;
        }

        const number = parseInt(match[0], 10);

        return isNaN(number) ? null : number;
    };

    // =========================================================
    // FORMAT TOKEN
    // =========================================================
    const formatToken = (token) => {
        const number = getNumericToken(token);

        if (number === null) {
            return 'N/A';
        }

        return `A-${String(number).padStart(2, '0')}`;
    };

    // =========================================================
    // FETCH TODAY APPOINTMENTS
    // =========================================================
    const fetchAppointments = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/receptionist/appointments/today`
            );

            if (!response.ok) {
                throw new Error(
                    `Appointments API failed: ${response.status}`
                );
            }

            const data = await response.json();

            setAppointments(
                Array.isArray(data) ? data : []
            );
        } catch (error) {
            console.error(
                'Failed to fetch appointments:',
                error
            );
        }
    };

    // =========================================================
    // FETCH DOCTORS
    // =========================================================
    const fetchDoctors = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/doctors`
            );

            if (!response.ok) {
                throw new Error(
                    `Doctors API failed: ${response.status}`
                );
            }

            const data = await response.json();

            setDoctors(
                Array.isArray(data) ? data : []
            );
        } catch (error) {
            console.error(
                'Failed to fetch doctors:',
                error
            );

            setDoctors([]);
        }
    };

    // =========================================================
    // LOAD DASHBOARD DATA
    // =========================================================
    const loadDashboardData = async () => {
        try {
            setDashboardLoading(true);
            setDashboardError('');

            await Promise.all([
                fetchAppointments(),
                fetchDoctors()
            ]);
        } catch (error) {
            console.error(
                'Dashboard loading error:',
                error
            );

            setDashboardError(
                'Unable to load dashboard data.'
            );
        } finally {
            setDashboardLoading(false);
        }
    };

    // =========================================================
    // INITIAL DASHBOARD LOAD
    // =========================================================
    useEffect(() => {
        loadDashboardData();

        const interval = setInterval(() => {
            fetchAppointments();
            fetchDoctors();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // =========================================================
    // REAL DEPARTMENTS
    // =========================================================
    const realDepartments = useMemo(() => {
        const departmentSet = new Set();

        // Departments from doctors
        doctors.forEach((doctor) => {
            const department =
                doctor?.specialization ||
                doctor?.department;

            if (
                department &&
                String(department).trim()
            ) {
                departmentSet.add(
                    String(department).trim()
                );
            }
        });

        // Departments from appointments
        appointments.forEach((appointment) => {
            const department =
                appointment?.doctor?.specialization ||
                appointment?.doctor?.department ||
                appointment?.department;

            if (
                department &&
                String(department).trim()
            ) {
                departmentSet.add(
                    String(department).trim()
                );
            }
        });

        return Array.from(departmentSet).sort(
            (a, b) => a.localeCompare(b)
        );
    }, [doctors, appointments]);

    // =========================================================
    // SET FIRST REAL DEPARTMENT
    // =========================================================
    useEffect(() => {
        if (
            realDepartments.length > 0 &&
            !realDepartments.includes(selectedDept)
        ) {
            setSelectedDept(
                realDepartments[0]
            );
        }

        if (
            realDepartments.length === 0
        ) {
            setSelectedDept('');
        }
    }, [
        realDepartments,
        selectedDept
    ]);

    // =========================================================
    // GET APPOINTMENT DEPARTMENT
    // =========================================================
    const getAppointmentDepartment = (
        appointment
    ) => {
        return (
            appointment?.doctor?.specialization ||
            appointment?.doctor?.department ||
            appointment?.department ||
            ''
        );
    };

    // =========================================================
    // SELECTED DEPARTMENT APPOINTMENTS
    // =========================================================
    const selectedDepartmentAppointments =
        useMemo(() => {
            if (!selectedDept) {
                return [];
            }

            return appointments.filter(
                (appointment) => {
                    const department =
                        getAppointmentDepartment(
                            appointment
                        );

                    return (
                        String(department)
                            .trim()
                            .toLowerCase() ===
                        String(selectedDept)
                            .trim()
                            .toLowerCase()
                    );
                }
            );
        }, [
            appointments,
            selectedDept
        ]);

    // =========================================================
    // FETCH CURRENT TOKEN
    // =========================================================
    const fetchCurrentToken = async (
        department
    ) => {
        if (!department) {
            setCurrentToken(null);
            return;
        }

        try {
            setQueueLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/queue/current?department=${encodeURIComponent(
                    department
                )}`
            );

            if (!response.ok) {
                throw new Error(
                    `Queue API failed: ${response.status}`
                );
            }

            const data = await response.json();

            const currentServing =
                data?.currentServing;

            const number =
                getNumericToken(
                    currentServing
                );

            if (number !== null) {
                setCurrentToken(number);
            } else {
                setCurrentToken(null);
            }
        } catch (error) {
            console.error(
                'Failed to fetch current token:',
                error
            );

            setCurrentToken(null);
        } finally {
            setQueueLoading(false);
        }
    };

    // =========================================================
    // DEPARTMENT CHANGE
    // =========================================================
    useEffect(() => {
        if (selectedDept) {
            fetchCurrentToken(
                selectedDept
            );
        } else {
            setCurrentToken(null);
        }
    }, [selectedDept]);

    // =========================================================
    // REAL WAITING TOKENS
    // =========================================================
    const nextWaitingTokens = useMemo(() => {
        if (
            !selectedDept ||
            !selectedDepartmentAppointments
                .length
        ) {
            return [];
        }

        const currentNumber =
            currentToken ?? 0;

        return selectedDepartmentAppointments
            .filter((appointment) => {
                const status =
                    normalizeStatus(
                        appointment?.status
                    );

                const token =
                    getNumericToken(
                        appointment?.tokenNumber
                    );

                return (
                    status === 'WAITING' &&
                    token !== null &&
                    token > currentNumber
                );
            })
            .sort((a, b) => {
                const tokenA =
                    getNumericToken(
                        a?.tokenNumber
                    ) || 0;

                const tokenB =
                    getNumericToken(
                        b?.tokenNumber
                    ) || 0;

                return tokenA - tokenB;
            })
            .slice(0, 3);
    }, [
        selectedDept,
        selectedDepartmentAppointments,
        currentToken
    ]);

    // =========================================================
    // DEPARTMENT QUEUE STATS
    // =========================================================
    const departmentQueueStats = useMemo(() => {
        const waiting =
            selectedDepartmentAppointments.filter(
                (appointment) =>
                    normalizeStatus(
                        appointment?.status
                    ) === 'WAITING'
            ).length;

        const inConsultation =
            selectedDepartmentAppointments.filter(
                (appointment) =>
                    normalizeStatus(
                        appointment?.status
                    ) === 'IN_CONSULTATION'
            ).length;

        const completed =
            selectedDepartmentAppointments.filter(
                (appointment) =>
                    normalizeStatus(
                        appointment?.status
                    ) === 'COMPLETED'
            ).length;

        return {
            waiting,
            inConsultation,
            completed
        };
    }, [
        selectedDepartmentAppointments
    ]);

    // =========================================================
    // NEXT TOKEN
    // =========================================================
    const handleNextToken = async () => {
        if (!selectedDept) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/queue/next?department=${encodeURIComponent(
                    selectedDept
                )}`,
                {
                    method: 'POST'
                }
            );

            const data =
                await response.json();

            if (data.tokenNumber) {
                const number =
                    getNumericToken(
                        data.tokenNumber
                    );

                if (number !== null) {
                    setCurrentToken(number);
                }

                // Refresh appointments because
                // status may have changed
                await fetchAppointments();
            } else if (data.message) {
                alert(data.message);
            }
        } catch (error) {
            console.error(
                'Error calling next token:',
                error
            );
        }
    };

    // =========================================================
    // PREVIOUS TOKEN
    // =========================================================
    const handlePreviousToken = async () => {
        if (!selectedDept) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/queue/previous?department=${encodeURIComponent(
                    selectedDept
                )}`,
                {
                    method: 'POST'
                }
            );

            const data =
                await response.json();

            if (data.tokenNumber) {
                const number =
                    getNumericToken(
                        data.tokenNumber
                    );

                if (number !== null) {
                    setCurrentToken(number);
                }

                await fetchAppointments();
            } else if (data.message) {
                alert(data.message);
            }
        } catch (error) {
            console.error(
                'Error calling previous token:',
                error
            );
        }
    };

    // =========================================================
    // RECALL
    // =========================================================
    const handleRecallToken = async () => {
        if (!selectedDept) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/queue/recall?department=${encodeURIComponent(
                    selectedDept
                )}`,
                {
                    method: 'POST'
                }
            );

            const data =
                await response.json();

            if (data.message) {
                alert(
                    `🔔 ${data.message}`
                );
            } else if (
                currentToken !== null
            ) {
                alert(
                    `🔔 Recalling Token ${formatToken(
                        currentToken
                    )} to Cabin!`
                );
            }
        } catch (error) {
            console.error(
                'Error recalling token:',
                error
            );

            if (
                currentToken !== null
            ) {
                alert(
                    `🔔 Recalling Token ${formatToken(
                        currentToken
                    )} to Cabin!`
                );
            }
        }
    };

    // =========================================================
    // SKIP PATIENT
    // =========================================================
    const handleSkipToken = async () => {
        if (!selectedDept) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/queue/skip?department=${encodeURIComponent(
                    selectedDept
                )}`,
                {
                    method: 'POST'
                }
            );

            const data =
                await response.json();

            if (data.tokenNumber) {
                const number =
                    getNumericToken(
                        data.tokenNumber
                    );

                if (number !== null) {
                    setCurrentToken(number);
                }

                alert(
                    `⏭️ Patient Skipped! Now Serving: ${formatToken(
                        data.tokenNumber
                    )}`
                );

                await fetchAppointments();
            } else if (data.message) {
                alert(data.message);
            }
        } catch (error) {
            console.error(
                'Error skipping patient:',
                error
            );
        }
    };

    // =========================================================
    // DASHBOARD KPI
    // =========================================================
    const dashboardStats = useMemo(() => {
        const patientsToday =
            appointments.length;

        const waiting =
            appointments.filter(
                (appointment) =>
                    normalizeStatus(
                        appointment.status
                    ) === 'WAITING'
            ).length;

        const inConsultation =
            appointments.filter(
                (appointment) =>
                    normalizeStatus(
                        appointment.status
                    ) ===
                    'IN_CONSULTATION'
            ).length;

        const completed =
            appointments.filter(
                (appointment) =>
                    normalizeStatus(
                        appointment.status
                    ) === 'COMPLETED'
            ).length;

        const cancelled =
            appointments.filter(
                (appointment) =>
                    normalizeStatus(
                        appointment.status
                    ) === 'CANCELLED'
            ).length;

        const missed =
            appointments.filter(
                (appointment) =>
                    normalizeStatus(
                        appointment.status
                    ) === 'MISSED'
            ).length;

        return {
            patientsToday,
            waiting,
            inConsultation,
            completed,
            cancelled,
            missed
        };
    }, [appointments]);

    // =========================================================
    // ACTIVE DOCTORS
    // =========================================================
    const activeDoctors = useMemo(() => {
        return doctors.filter(
            (doctor) =>
                doctor?.active !== false
        );
    }, [doctors]);

    // =========================================================
    // AVERAGE WAIT TIME
    // =========================================================
    const averageWaitTime = useMemo(() => {
        if (
            departmentQueueStats.waiting === 0
        ) {
            return 0;
        }

        return (
            departmentQueueStats.waiting * 15
        );
    }, [
        departmentQueueStats.waiting
    ]);

    // =========================================================
    // RECENT APPOINTMENTS
    // =========================================================
    const recentAppointments = useMemo(() => {
        return [...appointments]
            .sort((a, b) => {
                const tokenA =
                    getNumericToken(
                        a?.tokenNumber
                    ) || 0;

                const tokenB =
                    getNumericToken(
                        b?.tokenNumber
                    ) || 0;

                return tokenB - tokenA;
            })
            .slice(0, 6);
    }, [appointments]);

    // =========================================================
    // DOCTOR STATUS
    // =========================================================
    const getDoctorStatus = (doctor) => {
        const doctorId =
            doctor?.id;

        const doctorAppointments =
            appointments.filter(
                (appointment) =>
                    appointment?.doctor?.id ===
                    doctorId ||
                    appointment?.doctorId ===
                    doctorId
            );

        const consultation =
            doctorAppointments.find(
                (appointment) =>
                    normalizeStatus(
                        appointment?.status
                    ) ===
                    'IN_CONSULTATION'
            );

        const waiting =
            doctorAppointments.filter(
                (appointment) =>
                    normalizeStatus(
                        appointment?.status
                    ) === 'WAITING'
            );

        if (consultation) {
            return {
                type: 'serving',
                label: `🟢 Serving ${formatToken(
                    consultation.tokenNumber
                )}`
            };
        }

        if (waiting.length > 0) {
            return {
                type: 'busy',
                label: '🟡 Waiting Queue'
            };
        }

        return {
            type: 'available',
            label: '🟢 Available'
        };
    };

    // =========================================================
    // DOCTOR NAME
    // =========================================================
    const getDoctorName = (doctor) => {
        const name =
            doctor?.name ||
            doctor?.doctorName ||
            'Unknown Doctor';

        if (
            String(name)
                .toLowerCase()
                .startsWith('dr.')
        ) {
            return name;
        }

        return `Dr. ${name}`;
    };

    // =========================================================
    // DOCTOR DEPARTMENT
    // =========================================================
    const getDoctorDepartment = (doctor) => {
        return (
            doctor?.specialization ||
            doctor?.department ||
            'General OPD'
        );
    };

    // =========================================================
    // PATIENT NAME
    // =========================================================
    const getPatientName = (
        appointment
    ) => {
        return (
            appointment?.patientName ||
            appointment?.patient?.name ||
            'Unknown Patient'
        );
    };

    // =========================================================
    // TOKEN
    // =========================================================
    const getToken = (
        appointment
    ) => {
        return formatToken(
            appointment?.tokenNumber
        );
    };

    // =========================================================
    // STATUS LABEL
    // =========================================================
    const getStatusLabel = (
        status
    ) => {
        const normalized =
            normalizeStatus(status);

        if (
            normalized ===
            'IN_CONSULTATION'
        ) {
            return 'IN CONSULTATION';
        }

        if (
            normalized ===
            'COMPLETED'
        ) {
            return 'COMPLETED';
        }

        if (
            normalized ===
            'CANCELLED'
        ) {
            return 'CANCELLED';
        }

        if (
            normalized === 'MISSED'
        ) {
            return 'MISSED';
        }

        return 'WAITING';
    };

    // =========================================================
    // STATUS CLASS
    // =========================================================
    const getStatusClass = (
        status
    ) => {
        const normalized =
            normalizeStatus(status);

        if (
            normalized ===
            'IN_CONSULTATION'
        ) {
            return 'status-pill serving';
        }

        if (
            normalized ===
            'COMPLETED'
        ) {
            return 'status-pill completed';
        }

        if (
            normalized ===
            'CANCELLED'
        ) {
            return 'status-pill offline';
        }

        if (
            normalized === 'MISSED'
        ) {
            return 'status-pill busy';
        }

        return 'status-pill waiting';
    };

    // =========================================================
    // LOGOUT
    // =========================================================
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('email');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userName');

        sessionStorage.clear();

        navigate('/login', {
            replace: true
        });
    };

    // =========================================================
    // USER INITIAL
    // =========================================================
    const getUserInitial = () => {
        if (
            currentUser.name &&
            currentUser.name.length > 0
        ) {
            return currentUser.name
                .charAt(0)
                .toUpperCase();
        }

        if (
            currentUser.email &&
            currentUser.email.length > 0
        ) {
            return currentUser.email
                .charAt(0)
                .toUpperCase();
        }

        return 'A';
    };

    // =========================================================
    // RENDER
    // =========================================================
    return (
        <div className="sq-saas-layout light-theme">

            {/* =====================================================
                SIDEBAR
            ===================================================== */}
            <aside className="sq-rail-sidebar">

                <div className="sq-rail-logo">
                    🏥
                </div>

                <nav className="sq-rail-nav">

                    <button
                        className={`rail-btn ${
                            activeTab === 'control'
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            setActiveTab(
                                'control'
                            )
                        }
                        title="Control Center"
                    >
                        <span className="rail-icon">
                            🎛️
                        </span>

                        <span className="rail-lbl">
                            Control
                        </span>
                    </button>

                    <button
                        className={`rail-btn ${
                            activeTab === 'queue'
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            setActiveTab(
                                'queue'
                            )
                        }
                        title="Queue Operations"
                    >
                        <span className="rail-icon">
                            🎫
                        </span>

                        <span className="rail-lbl">
                            Queue Ops
                        </span>
                    </button>

                    <button
                        className={`rail-btn ${
                            activeTab === 'doctors'
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            setActiveTab(
                                'doctors'
                            )
                        }
                        title="Doctor Matrix"
                    >
                        <span className="rail-icon">
                            👨‍⚕️
                        </span>

                        <span className="rail-lbl">
                            Doctors
                        </span>
                    </button>

                    <button
                        className={`rail-btn ${
                            activeTab === 'reception'
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            setActiveTab(
                                'reception'
                            )
                        }
                        title="Reception Desk"
                    >
                        <span className="rail-icon">
                            👩‍💼
                        </span>

                        <span className="rail-lbl">
                            Reception
                        </span>
                    </button>

                    <button
                        className={`rail-btn ${
                            activeTab === 'patients'
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            setActiveTab(
                                'patients'
                            )
                        }
                        title="Patient Logs"
                    >
                        <span className="rail-icon">
                            👥
                        </span>

                        <span className="rail-lbl">
                            Patients
                        </span>
                    </button>

                    <button
                        className={`rail-btn ${
                            activeTab === 'bookings'
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            setActiveTab(
                                'bookings'
                            )
                        }
                        title="Appointments"
                    >
                        <span className="rail-icon">
                            📅
                        </span>

                        <span className="rail-lbl">
                            Bookings
                        </span>
                    </button>

                </nav>

                <div className="sq-rail-footer">

                    <button
                        className={`rail-btn ${
                            activeTab === 'settings'
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            setActiveTab(
                                'settings'
                            )
                        }
                        title="Settings"
                    >
                        <span className="rail-icon">
                            ⚙️
                        </span>

                        <span className="rail-lbl">
                            Settings
                        </span>
                    </button>

                </div>

            </aside>

            {/* =====================================================
                MAIN WRAPPER
            ===================================================== */}
            <div className="sq-main-wrapper">

                {/* =================================================
                    HEADER
                ================================================= */}
                <header className="sq-saas-header">

                    <div className="header-title-zone">

                        <h2>
                            SmartQueue

                            <span className="ops-pill">
                                {activeTab.toUpperCase()} CENTER
                            </span>
                        </h2>

                        <span className="location-tag">
                            {currentUser.hospital}
                            {' • '}
                            {currentUser.block}
                        </span>

                    </div>

                    <div className="header-right-zone">

                        <div className="sq-pulse-indicator">
                            <span className="pulse-dot"></span>
                            Realtime Engine Active
                        </div>

                        <button
                            className="sq-bell-btn"
                            title="Emergency Alerts"
                        >
                            🔔
                            <span className="dot-alert"></span>
                        </button>

                        <div
                            className="profile-wrapper"
                            ref={dropdownRef}
                        >

                            <div
                                className={`sq-user-avatar ${
                                    showProfileMenu
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() =>
                                    setShowProfileMenu(
                                        (prev) =>
                                            !prev
                                    )
                                }
                            >

                                <span className="avatar-box">
                                    {getUserInitial()}
                                </span>

                                <div className="user-info">

                                    <strong>
                                        {currentUser.name}
                                    </strong>

                                    <small>
                                        {currentUser.role}

                                        <span className="caret-icon">
                                            {showProfileMenu
                                                ? '▲'
                                                : '▼'}
                                        </span>
                                    </small>

                                </div>

                            </div>

                            {showProfileMenu && (
                                <div className="profile-dropdown animate-fade-in">

                                    <div className="dropdown-header">

                                        <div className="dropdown-avatar">
                                            {getUserInitial()}
                                        </div>

                                        <div className="dropdown-user-details">

                                            <h4>
                                                {currentUser.name}
                                            </h4>

                                            <p>
                                                {currentUser.email}
                                            </p>

                                            <span className="role-badge">
                                                {currentUser.role}
                                            </span>

                                        </div>

                                    </div>

                                    <div className="dropdown-divider"></div>

                                    <div className="dropdown-info-list">

                                        <div className="info-item">
                                            <span className="info-lbl">
                                                Hospital
                                            </span>

                                            <span className="info-val">
                                                {currentUser.hospital}
                                            </span>
                                        </div>

                                        <div className="info-item">
                                            <span className="info-lbl">
                                                Location
                                            </span>

                                            <span className="info-val">
                                                {currentUser.block}
                                            </span>
                                        </div>

                                        <div className="info-item">
                                            <span className="info-lbl">
                                                Status
                                            </span>

                                            <span className="info-val text-teal">
                                                ● Active Session
                                            </span>
                                        </div>

                                    </div>

                                    <div className="dropdown-divider"></div>

                                    <button
                                        className="logout-btn"
                                        onClick={
                                            handleLogout
                                        }
                                    >
                                        <span className="logout-icon">
                                            🚪
                                        </span>

                                        Sign Out
                                    </button>

                                </div>
                            )}

                        </div>

                    </div>

                </header>

                {/* =================================================
                    CANVAS
                ================================================= */}
                <main className="sq-canvas">

                    {/* =================================================
                        CONTROL CENTER
                    ================================================= */}
                    {activeTab === 'control' && (
                        <>

                            {/* WELCOME BANNER */}
                            <div className="sq-glass-banner mb-3">

                                <div className="banner-content">

                                    <h3>
                                        Good Morning,{' '}
                                        {currentUser.name} 👋
                                    </h3>

                                    <p>
                                        Here is the current
                                        hospital-wide queue and
                                        appointment overview.
                                    </p>

                                </div>

                                <div className="banner-right-group">

                                    <div className="emergency-chip-alert">
                                        📊{' '}
                                        <strong>
                                            Live Hospital Overview
                                        </strong>
                                    </div>

                                    <div className="banner-badge">

                                        <span>
                                            ACTIVE DOCTORS
                                        </span>

                                        <h2>
                                            {dashboardLoading
                                                ? '—'
                                                : activeDoctors.length}
                                        </h2>

                                    </div>

                                </div>

                            </div>

                            {/* =================================================
                                KPI METRICS
                            ================================================= */}
                            <div className="sq-metrics-grid mb-3">

                                <div className="metric-card">

                                    <span className="m-lbl">
                                        PATIENTS TODAY
                                    </span>

                                    <div className="m-val-row">

                                        <span className="m-val">
                                            {dashboardLoading
                                                ? '—'
                                                : dashboardStats.patientsToday}
                                        </span>

                                        <span className="m-sub">
                                            Appointments
                                        </span>

                                    </div>

                                </div>

                                <div className="metric-card alert-card">

                                    <span className="m-lbl">
                                        WAITING NOW
                                    </span>

                                    <div className="m-val-row">

                                        <span className="m-val text-amber">
                                            {dashboardLoading
                                                ? '—'
                                                : dashboardStats.waiting}
                                        </span>

                                        <span className="m-sub">
                                            Patients
                                        </span>

                                    </div>

                                </div>

                                <div className="metric-card">

                                    <span className="m-lbl">
                                        ACTIVE DOCTORS
                                    </span>

                                    <div className="m-val-row">

                                        <span className="m-val text-teal">
                                            {dashboardLoading
                                                ? '—'
                                                : activeDoctors.length}
                                        </span>

                                        <span className="m-sub">
                                            Doctors
                                        </span>

                                    </div>

                                </div>

                                <div className="metric-card">

                                    <span className="m-lbl">
                                        COMPLETED TODAY
                                    </span>

                                    <div className="m-val-row">

                                        <span className="m-val text-teal">
                                            {dashboardLoading
                                                ? '—'
                                                : dashboardStats.completed}
                                        </span>

                                        <span className="m-sub">
                                            Consultations
                                        </span>

                                    </div>

                                </div>

                            </div>

                            {/* =================================================
                                SECONDARY KPI
                            ================================================= */}
                            <div className="sq-metrics-grid mb-3">

                                <div className="metric-card">

                                    <span className="m-lbl">
                                        IN CONSULTATION
                                    </span>

                                    <div className="m-val-row">

                                        <span className="m-val">
                                            {dashboardLoading
                                                ? '—'
                                                : dashboardStats.inConsultation}
                                        </span>

                                        <span className="m-sub">
                                            Now
                                        </span>

                                    </div>

                                </div>

                                <div className="metric-card">

                                    <span className="m-lbl">
                                        AVG WAIT TIME
                                    </span>

                                    <div className="m-val-row">

                                        <span className="m-val text-amber">
                                            {dashboardLoading
                                                ? '—'
                                                : `${averageWaitTime}m`}
                                        </span>

                                        <span className="m-sub">
                                            Estimate
                                        </span>

                                    </div>

                                </div>

                                <div className="metric-card">

                                    <span className="m-lbl">
                                        CANCELLED
                                    </span>

                                    <div className="m-val-row">

                                        <span className="m-val">
                                            {dashboardLoading
                                                ? '—'
                                                : dashboardStats.cancelled}
                                        </span>

                                        <span className="m-sub">
                                            Today
                                        </span>

                                    </div>

                                </div>

                                <div className="metric-card">

                                    <span className="m-lbl">
                                        MISSED
                                    </span>

                                    <div className="m-val-row">

                                        <span className="m-val">
                                            {dashboardLoading
                                                ? '—'
                                                : dashboardStats.missed}
                                        </span>

                                        <span className="m-sub">
                                            Today
                                        </span>

                                    </div>

                                </div>

                            </div>

                            {/* =================================================
                                QUEUE + DOCTORS
                            ================================================= */}
                            <div className="sq-matrix-grid mb-3">

                                {/* LIVE QUEUE */}
                                <div className="sq-glass-card hero-token-board">

                                    <div className="card-head">

                                        <div className="head-badge">
                                            <span className="live-dot-red">
                                                ●
                                            </span>

                                            LIVE QUEUE CONTROL
                                        </div>

                                        <div className="dept-select-wrapper">

                                            <select
                                                className="dept-dropdown"
                                                value={
                                                    selectedDept
                                                }
                                                onChange={(e) =>
                                                    setSelectedDept(
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    realDepartments.length ===
                                                    0
                                                }
                                            >

                                                {realDepartments.length ===
                                                0 ? (
                                                    <option value="">
                                                        No departments
                                                        available
                                                    </option>
                                                ) : (
                                                    realDepartments.map(
                                                        (
                                                            department
                                                        ) => (
                                                            <option
                                                                key={
                                                                    department
                                                                }
                                                                value={
                                                                    department
                                                                }
                                                            >
                                                                {
                                                                    department
                                                                }
                                                            </option>
                                                        )
                                                    )
                                                )}

                                            </select>

                                        </div>

                                    </div>

                                    <div className="token-display-center">

                                        <span className="now-serving-title">
                                            NOW SERVING
                                        </span>

                                        <div className="huge-token-badge">

                                            {queueLoading
                                                ? '...'
                                                : currentToken !==
                                                null
                                                    ? formatToken(
                                                        currentToken
                                                    )
                                                    : '—'}

                                        </div>

                                        <div className="next-queue-strip">

                                            <span className="next-title">
                                                NEXT IN LINE:
                                            </span>

                                            <div className="token-chips">

                                                {nextWaitingTokens.length ===
                                                0 ? (
                                                    <span className="chip">
                                                        No waiting
                                                        patients
                                                    </span>
                                                ) : (
                                                    nextWaitingTokens.map(
                                                        (
                                                            appointment,
                                                            index
                                                        ) => (
                                                            <span
                                                                key={
                                                                    appointment?.id ||
                                                                    appointment?.tokenNumber
                                                                }
                                                                className={`chip ${
                                                                    index ===
                                                                    0
                                                                        ? 'active'
                                                                        : ''
                                                                }`}
                                                            >
                                                                {getToken(
                                                                    appointment
                                                                )}
                                                            </span>
                                                        )
                                                    )
                                                )}

                                            </div>

                                        </div>

                                        <div className="queue-quick-actions">

                                            <button
                                                className="action-btn secondary"
                                                onClick={
                                                    handlePreviousToken
                                                }
                                                disabled={
                                                    !selectedDept ||
                                                    queueLoading
                                                }
                                            >
                                                ◀ Call Previous
                                            </button>

                                            <button
                                                className="action-btn primary"
                                                onClick={
                                                    handleNextToken
                                                }
                                                disabled={
                                                    !selectedDept ||
                                                    queueLoading
                                                }
                                            >
                                                ▶ Call Next
                                            </button>

                                            <button
                                                className="action-btn secondary"
                                                onClick={
                                                    handleRecallToken
                                                }
                                                disabled={
                                                    !selectedDept ||
                                                    currentToken ===
                                                    null
                                                }
                                            >
                                                🔔 Recall Token
                                            </button>

                                            <button
                                                className="action-btn danger"
                                                onClick={
                                                    handleSkipToken
                                                }
                                                disabled={
                                                    !selectedDept ||
                                                    currentToken ===
                                                    null
                                                }
                                            >
                                                ⏭️ Skip Patient
                                            </button>

                                        </div>

                                    </div>

                                    <div className="board-footer-meta">

                                        <span>
                                            ⏱️ Est. Wait Time:{' '}
                                            <strong>
                                                {
                                                    averageWaitTime
                                                } mins
                                            </strong>
                                        </span>

                                        <span>
                                            👥 Waiting:{' '}
                                            <strong>
                                                {
                                                    departmentQueueStats.waiting
                                                }
                                            </strong>
                                        </span>

                                        <span>
                                            📍 Department:{' '}
                                            <strong>
                                                {selectedDept ||
                                                    'No Department'}
                                            </strong>
                                        </span>

                                    </div>

                                </div>

                                {/* DOCTOR STATUS */}
                                <div className="sq-glass-card">

                                    <div className="card-head">

                                        <h4>
                                            👨‍⚕️ DOCTOR STATUS MATRIX
                                        </h4>

                                        <small>
                                            Live Availability
                                        </small>

                                    </div>

                                    <div className="doc-matrix-list">

                                        {dashboardLoading ? (
                                            <div className="queue-loading">
                                                Loading doctors...
                                            </div>
                                        ) : activeDoctors.length ===
                                        0 ? (
                                            <div className="queue-empty">
                                                No doctors found.
                                            </div>
                                        ) : (
                                            activeDoctors
                                                .slice(0, 6)
                                                .map(
                                                    (
                                                        doctor
                                                    ) => {

                                                        const status =
                                                            getDoctorStatus(
                                                                doctor
                                                            );

                                                        return (
                                                            <div
                                                                className="doc-row"
                                                                key={
                                                                    doctor?.id
                                                                }
                                                            >

                                                                <div className="doc-meta">

                                                                    <strong>
                                                                        {getDoctorName(
                                                                            doctor
                                                                        )}
                                                                    </strong>

                                                                    <small>
                                                                        {
                                                                            getDoctorDepartment(
                                                                                doctor
                                                                            )
                                                                        }

                                                                        {doctor?.cabinNumber
                                                                            ? ` • Cabin ${doctor.cabinNumber}`
                                                                            : ''}
                                                                    </small>

                                                                </div>

                                                                <span
                                                                    className={`status-pill ${status.type}`}
                                                                >
                                                                    {
                                                                        status.label
                                                                    }
                                                                </span>

                                                            </div>
                                                        );
                                                    }
                                                )
                                        )}

                                    </div>

                                </div>

                            </div>

                            {/* =================================================
                                RECENT APPOINTMENTS
                            ================================================= */}
                            <div className="sq-glass-card mb-3">

                                <div className="card-head">

                                    <div>
                                        <h4>
                                            📅 TODAY'S APPOINTMENTS
                                        </h4>

                                        <small>
                                            Latest hospital appointments
                                        </small>
                                    </div>

                                    <button
                                        className="action-btn secondary"
                                        onClick={() =>
                                            setActiveTab(
                                                'bookings'
                                            )
                                        }
                                    >
                                        View All
                                    </button>

                                </div>

                                <div className="queue-table-wrapper">

                                    {recentAppointments.length ===
                                    0 ? (
                                        <div className="queue-empty">

                                            <div className="queue-empty-icon">
                                                📅
                                            </div>

                                            <h3>
                                                No appointments today
                                            </h3>

                                            <p>
                                                Today's appointments
                                                will appear here.
                                            </p>

                                        </div>
                                    ) : (
                                        <table className="custom-table">

                                            <thead>
                                            <tr>
                                                <th>
                                                    Token
                                                </th>

                                                <th>
                                                    Patient
                                                </th>

                                                <th>
                                                    Doctor
                                                </th>

                                                <th>
                                                    Status
                                                </th>
                                            </tr>
                                            </thead>

                                            <tbody>

                                            {recentAppointments.map(
                                                (
                                                    appointment
                                                ) => (
                                                    <tr
                                                        key={
                                                            appointment?.id
                                                        }
                                                    >

                                                        <td>
                                                            <strong>
                                                                {getToken(
                                                                    appointment
                                                                )}
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            {getPatientName(
                                                                appointment
                                                            )}
                                                        </td>

                                                        <td>
                                                            {appointment?.doctor?.name
                                                                ? getDoctorName(
                                                                    appointment.doctor
                                                                )
                                                                : appointment?.doctorName ||
                                                                'Unknown Doctor'}
                                                        </td>

                                                        <td>

                                                            <span
                                                                className={getStatusClass(
                                                                    appointment?.status
                                                                )}
                                                            >
                                                                {getStatusLabel(
                                                                    appointment?.status
                                                                )}
                                                            </span>

                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                            </tbody>

                                        </table>
                                    )}

                                </div>

                            </div>

                            {/* ERROR */}
                            {dashboardError && (
                                <div className="queue-error">
                                    ⚠️ {dashboardError}

                                    <button
                                        className="action-btn"
                                        onClick={
                                            loadDashboardData
                                        }
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                        </>
                    )}

                    {/* =================================================
                        QUEUE OPERATIONS
                    ================================================= */}
                    {activeTab === 'queue' && (
                        <QueueOperations />
                    )}

                    {/* =================================================
                        DOCTORS
                    ================================================= */}
                    {activeTab === 'doctors' && (
                        <DoctorSection />
                    )}

                    {/* =================================================
                        RECEPTION
                    ================================================= */}
                    {activeTab === 'reception' && (
                        <ReceptionistSection />
                    )}

                    {/* =================================================
                        PATIENTS
                    ================================================= */}
                    {activeTab === 'patients' && (
                        <PatientSection />
                    )}

                    {/* =================================================
                        SETTINGS
                    ================================================= */}
                    {activeTab === 'settings' && (
                        <AdminSettingsSection />
                    )}

                    {/* =================================================
                        BOOKINGS
                    ================================================= */}
                    {activeTab === 'bookings' && (
                        <div className="sq-glass-card">

                            <div className="card-head">

                                <div>
                                    <h4>
                                        📅 APPOINTMENTS
                                    </h4>

                                    <small>
                                        Today's hospital appointments
                                    </small>
                                </div>

                            </div>

                            <div className="queue-table-wrapper">

                                {appointments.length ===
                                0 ? (
                                    <div className="queue-empty">

                                        <div className="queue-empty-icon">
                                            📅
                                        </div>

                                        <h3>
                                            No appointments
                                        </h3>

                                        <p>
                                            There are no appointments
                                            available today.
                                        </p>

                                    </div>
                                ) : (
                                    <table className="custom-table">

                                        <thead>
                                        <tr>
                                            <th>
                                                Token
                                            </th>

                                            <th>
                                                Patient
                                            </th>

                                            <th>
                                                Doctor
                                            </th>

                                            <th>
                                                Status
                                            </th>
                                        </tr>
                                        </thead>

                                        <tbody>

                                        {appointments.map(
                                            (
                                                appointment
                                            ) => (
                                                <tr
                                                    key={
                                                        appointment?.id
                                                    }
                                                >

                                                    <td>
                                                        <strong>
                                                            {getToken(
                                                                appointment
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {getPatientName(
                                                            appointment
                                                        )}
                                                    </td>

                                                    <td>
                                                        {appointment?.doctor?.name
                                                            ? getDoctorName(
                                                                appointment.doctor
                                                            )
                                                            : appointment?.doctorName ||
                                                            'Unknown Doctor'}
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={getStatusClass(
                                                                appointment?.status
                                                            )}
                                                        >
                                                            {getStatusLabel(
                                                                appointment?.status
                                                            )}
                                                        </span>

                                                    </td>

                                                </tr>
                                            )
                                        )}

                                        </tbody>

                                    </table>
                                )}

                            </div>

                        </div>
                    )}

                </main>

            </div>

        </div>
    );
};

export default AdminDashboard;