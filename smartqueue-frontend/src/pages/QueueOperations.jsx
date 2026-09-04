import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

const QueueOperations = () => {

    // Filters
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [doctorFilter, setDoctorFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Real backend data
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch today's appointments
    const fetchAppointments = async () => {
        try {
            setError('');

            const response = await fetch(
                `${API_BASE_URL}/receptionist/appointments/today`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch queue data');
            }

            const data = await response.json();

            setAppointments(Array.isArray(data) ? data : []);

        } catch (err) {
            console.error('Queue Operations Error:', err);
            setError('Unable to load queue data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();

        // Auto refresh every 5 seconds
        const interval = setInterval(() => {
            fetchAppointments();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // -----------------------------
    // Helpers
    // -----------------------------

    const normalizeStatus = (status) => {
        if (!status) return 'WAITING';

        const value = String(status).toUpperCase();

        if (
            value === 'IN_PROGRESS' ||
            value === 'IN-PROGRESS' ||
            value === 'SERVING' ||
            value === 'IN_CONSULTATION'
        ) {
            return 'IN_CONSULTATION';
        }

        if (value === 'COMPLETED') return 'COMPLETED';
        if (value === 'CANCELLED') return 'CANCELLED';
        if (value === 'MISSED') return 'MISSED';

        return 'WAITING';
    };

    const getDoctorName = (appointment) => {
        if (appointment.doctor?.name) {
            return appointment.doctor.name;
        }

        if (appointment.doctor?.firstName) {
            return `Dr. ${appointment.doctor.firstName}`;
        }

        if (appointment.doctorName) {
            return appointment.doctorName;
        }

        return 'Unknown Doctor';
    };

    const getDepartment = (appointment) => {
        return (
            appointment.doctor?.department ||
            appointment.department ||
            'General'
        );
    };

    const getTokenNumber = (appointment) => {
        return Number(appointment.tokenNumber) || 0;
    };

    const getPatientName = (appointment) => {
        return (
            appointment.patientName ||
            appointment.patient?.name ||
            'Unknown Patient'
        );
    };

    // -----------------------------
    // Filter appointments
    // -----------------------------

    const filteredAppointments = appointments.filter((appointment) => {

        const department = getDepartment(appointment);
        const doctor = getDoctorName(appointment);
        const status = normalizeStatus(appointment.status);
        const token = String(appointment.tokenNumber || '');

        const departmentMatch =
            departmentFilter === 'All' ||
            department === departmentFilter;

        const doctorMatch =
            doctorFilter === 'All' ||
            doctor === doctorFilter;

        let statusMatch = true;

        if (statusFilter !== 'All') {

            if (statusFilter === 'Waiting') {
                statusMatch = status === 'WAITING';
            }

            if (statusFilter === 'Serving') {
                statusMatch = status === 'IN_CONSULTATION';
            }

            if (statusFilter === 'Completed') {
                statusMatch = status === 'COMPLETED';
            }
        }

        const searchMatch =
            token.toLowerCase().includes(searchQuery.toLowerCase()) ||
            getPatientName(appointment)
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

        return (
            departmentMatch &&
            doctorMatch &&
            statusMatch &&
            searchMatch
        );
    });

    // -----------------------------
    // Create Live Queue
    // -----------------------------

    const queues = [];

    const departments = [
        ...new Set(
            filteredAppointments.map((appointment) =>
                getDepartment(appointment)
            )
        )
    ];

    departments.forEach((department) => {

        const departmentAppointments = filteredAppointments.filter(
            (appointment) =>
                getDepartment(appointment) === department
        );

        const doctors = [
            ...new Set(
                departmentAppointments.map((appointment) =>
                    getDoctorName(appointment)
                )
            )
        ];

        doctors.forEach((doctor) => {

            const doctorAppointments = departmentAppointments
                .filter(
                    (appointment) =>
                        getDoctorName(appointment) === doctor
                )
                .sort(
                    (a, b) =>
                        getTokenNumber(a) -
                        getTokenNumber(b)
                );

            const serving = doctorAppointments.find(
                (appointment) =>
                    normalizeStatus(appointment.status) ===
                    'IN_CONSULTATION'
            );

            const waiting = doctorAppointments.filter(
                (appointment) =>
                    normalizeStatus(appointment.status) ===
                    'WAITING'
            );

            const completed = doctorAppointments.filter(
                (appointment) =>
                    normalizeStatus(appointment.status) ===
                    'COMPLETED'
            );

            queues.push({
                department,
                doctor,

                nowServing: serving
                    ? `#${getTokenNumber(serving)}`
                    : '--',

                nowServingPatient: serving
                    ? getPatientName(serving)
                    : '',

                waitingQueue: waiting.map(
                    (appointment) =>
                        `#${getTokenNumber(appointment)}`
                ),

                completedToday: completed.length,

                avgWait:
                    waiting.length > 0
                        ? `${waiting.length * 15} min`
                        : '0 min'
            });
        });
    });

    // -----------------------------
    // Summary
    // -----------------------------

    const summary = {
        waiting: appointments.filter(
            (a) =>
                normalizeStatus(a.status) === 'WAITING'
        ).length,

        inProgress: appointments.filter(
            (a) =>
                normalizeStatus(a.status) ===
                'IN_CONSULTATION'
        ).length,

        completed: appointments.filter(
            (a) =>
                normalizeStatus(a.status) === 'COMPLETED'
        ).length,

        cancelled: appointments.filter(
            (a) =>
                normalizeStatus(a.status) === 'CANCELLED'
        ).length
    };

    // -----------------------------
    // Departments
    // -----------------------------

    const departmentsList = [
        ...new Set(
            appointments.map((appointment) =>
                getDepartment(appointment)
            )
        )
    ];

    // -----------------------------
    // Doctors
    // -----------------------------

    const doctorsList = [
        ...new Set(
            appointments.map((appointment) =>
                getDoctorName(appointment)
            )
        )
    ];

    return (
        <div
            className="queue-operations-container"
            style={{
                padding: '24px',
                fontFamily: 'Inter, sans-serif'
            }}
        >

            {/* Header */}
            <div
                className="header-section"
                style={{ marginBottom: '24px' }}
            >
                <h2
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        margin: '0 0 6px 0',
                        color: '#0F172A'
                    }}
                >
                    🎫 Queue Operations
                </h2>

                <p
                    style={{
                        margin: 0,
                        color: '#64748B',
                        fontSize: '14px'
                    }}
                >
                    Monitor and manage all hospital queues in real time.
                </p>
            </div>

            {/* Loading */}
            {loading && (
                <div
                    style={{
                        background: '#FFFFFF',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        color: '#64748B'
                    }}
                >
                    Loading queue data...
                </div>
            )}

            {/* Error */}
            {error && (
                <div
                    style={{
                        background: '#FEF2F2',
                        color: '#B91C1C',
                        padding: '14px 18px',
                        borderRadius: '10px',
                        marginBottom: '20px'
                    }}
                >
                    {error}
                </div>
            )}

            {/* Filters */}
            <div
                className="filters-card"
                style={{
                    background: '#FFFFFF',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    marginBottom: '24px'
                }}
            >

                {/* Department */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }}
                >
                    <label
                        style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#475569'
                        }}
                    >
                        Department
                    </label>

                    <select
                        value={departmentFilter}
                        onChange={(e) =>
                            setDepartmentFilter(e.target.value)
                        }
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            outline: 'none'
                        }}
                    >
                        <option value="All">
                            All Departments
                        </option>

                        {departmentsList.map((department) => (
                            <option
                                key={department}
                                value={department}
                            >
                                {department}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Doctor */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }}
                >
                    <label
                        style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#475569'
                        }}
                    >
                        Doctor
                    </label>

                    <select
                        value={doctorFilter}
                        onChange={(e) =>
                            setDoctorFilter(e.target.value)
                        }
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            outline: 'none'
                        }}
                    >
                        <option value="All">
                            All Doctors
                        </option>

                        {doctorsList.map((doctor) => (
                            <option
                                key={doctor}
                                value={doctor}
                            >
                                {doctor}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }}
                >
                    <label
                        style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#475569'
                        }}
                    >
                        Status
                    </label>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            outline: 'none'
                        }}
                    >
                        <option value="All">
                            All Statuses
                        </option>

                        <option value="Waiting">
                            Waiting
                        </option>

                        <option value="Serving">
                            Serving
                        </option>

                        <option value="Completed">
                            Completed
                        </option>
                    </select>
                </div>

                {/* Search */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        flexGrow: 1
                    }}
                >
                    <label
                        style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#475569'
                        }}
                    >
                        Search Token
                    </label>

                    <input
                        type="text"
                        placeholder="🔍 Search Token or Patient..."
                        value={searchQuery}
                        onChange={(e) =>
                            setSearchQuery(e.target.value)
                        }
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Main Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '24px'
                }}
            >

                {/* Live Queue */}
                <div className="live-queue-section">

                    <h3
                        style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            marginBottom: '16px',
                            color: '#1E293B'
                        }}
                    >
                        Live Queue Status
                    </h3>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}
                    >

                        {queues.length === 0 ? (

                            <div
                                style={{
                                    background: '#FFFFFF',
                                    padding: '30px',
                                    borderRadius: '12px',
                                    border: '1px solid #E2E8F0',
                                    textAlign: 'center',
                                    color: '#64748B'
                                }}
                            >
                                No queue data available.
                            </div>

                        ) : (

                            queues.map((item, index) => (

                                <div
                                    key={`${item.doctor}-${index}`}
                                    style={{
                                        background: '#FFFFFF',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '1px solid #E2E8F0',
                                        boxShadow:
                                            '0 1px 3px rgba(0,0,0,0.05)'
                                    }}
                                >

                                    {/* Header */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            borderBottom:
                                                '1px solid #F1F5F9',
                                            paddingBottom: '12px',
                                            marginBottom: '12px'
                                        }}
                                    >

                                        <div>

                                            <h4
                                                style={{
                                                    margin: 0,
                                                    fontSize: '18px',
                                                    color: '#0F172A'
                                                }}
                                            >
                                                {item.department}
                                            </h4>

                                            <span
                                                style={{
                                                    fontSize: '13px',
                                                    color: '#64748B'
                                                }}
                                            >
                                                Doctor: {item.doctor}
                                            </span>

                                        </div>

                                        <div
                                            style={{
                                                textAlign: 'right'
                                            }}
                                        >

                                            <span
                                                style={{
                                                    fontSize: '12px',
                                                    color: '#64748B'
                                                }}
                                            >
                                                Avg Wait
                                            </span>

                                            <p
                                                style={{
                                                    margin: 0,
                                                    fontWeight: 'bold',
                                                    color: '#0F172A'
                                                }}
                                            >
                                                {item.avgWait}
                                            </p>

                                        </div>

                                    </div>

                                    {/* Serving & Waiting */}
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns:
                                                '1fr 2fr',
                                            gap: '16px',
                                            alignItems: 'center'
                                        }}
                                    >

                                        {/* Serving */}
                                        <div
                                            style={{
                                                background: '#ECFDF5',
                                                border:
                                                    '1px solid #A7F3D0',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                textAlign: 'center'
                                            }}
                                        >

                                            <span
                                                style={{
                                                    fontSize: '11px',
                                                    color: '#047857',
                                                    fontWeight: 'bold',
                                                    textTransform:
                                                        'uppercase'
                                                }}
                                            >
                                                Now Serving
                                            </span>

                                            <h2
                                                style={{
                                                    margin:
                                                        '4px 0 0 0',
                                                    color: '#065F46',
                                                    fontSize: '28px'
                                                }}
                                            >
                                                {item.nowServing}
                                            </h2>

                                            {item.nowServingPatient && (
                                                <div
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#047857',
                                                        marginTop: '4px'
                                                    }}
                                                >
                                                    {
                                                        item.nowServingPatient
                                                    }
                                                </div>
                                            )}

                                        </div>

                                        {/* Waiting */}
                                        <div>

                                            <span
                                                style={{
                                                    fontSize: '12px',
                                                    color: '#64748B',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                Waiting Queue (
                                                {
                                                    item.waitingQueue
                                                        .length
                                                }
                                                )
                                            </span>

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    marginTop: '6px',
                                                    flexWrap: 'wrap'
                                                }}
                                            >

                                                {item.waitingQueue
                                                    .length === 0 ? (

                                                    <span
                                                        style={{
                                                            color:
                                                                '#94A3B8',
                                                            fontSize:
                                                                '13px'
                                                        }}
                                                    >
                                                        No waiting
                                                        patients
                                                    </span>

                                                ) : (

                                                    item.waitingQueue.map(
                                                        (
                                                            token,
                                                            tokenIndex
                                                        ) => (

                                                            <span
                                                                key={
                                                                    tokenIndex
                                                                }
                                                                style={{
                                                                    background:
                                                                        '#F1F5F9',
                                                                    border:
                                                                        '1px solid #CBD5E1',
                                                                    padding:
                                                                        '4px 10px',
                                                                    borderRadius:
                                                                        '6px',
                                                                    fontSize:
                                                                        '13px',
                                                                    fontWeight:
                                                                        '600',
                                                                    color:
                                                                        '#334155'
                                                                }}
                                                            >
                                                                {token}
                                                            </span>
                                                        )
                                                    )
                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </div>
                            ))
                        )}

                    </div>
                </div>

                {/* Right Side */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px'
                    }}
                >

                    {/* Summary */}
                    <div
                        style={{
                            background: '#FFFFFF',
                            padding: '20px',
                            borderRadius: '12px',
                            border:
                                '1px solid #E2E8F0'
                        }}
                    >

                        <h3
                            style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                marginBottom: '16px',
                                color: '#1E293B'
                            }}
                        >
                            Queue Summary
                        </h3>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    '1fr 1fr',
                                gap: '12px'
                            }}
                        >

                            <div
                                style={{
                                    background: '#EFF6FF',
                                    padding: '12px',
                                    borderRadius: '8px'
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '12px',
                                        color: '#1D4ED8'
                                    }}
                                >
                                    Waiting
                                </span>

                                <h3
                                    style={{
                                        margin: 0,
                                        color: '#1E40AF'
                                    }}
                                >
                                    {summary.waiting}
                                </h3>
                            </div>

                            <div
                                style={{
                                    background: '#FEF3C7',
                                    padding: '12px',
                                    borderRadius: '8px'
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '12px',
                                        color: '#B45309'
                                    }}
                                >
                                    In Progress
                                </span>

                                <h3
                                    style={{
                                        margin: 0,
                                        color: '#92400E'
                                    }}
                                >
                                    {summary.inProgress}
                                </h3>
                            </div>

                            <div
                                style={{
                                    background: '#DCFCE7',
                                    padding: '12px',
                                    borderRadius: '8px'
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '12px',
                                        color: '#15803D'
                                    }}
                                >
                                    Completed
                                </span>

                                <h3
                                    style={{
                                        margin: 0,
                                        color: '#166534'
                                    }}
                                >
                                    {summary.completed}
                                </h3>
                            </div>

                            <div
                                style={{
                                    background: '#FEE2E2',
                                    padding: '12px',
                                    borderRadius: '8px'
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '12px',
                                        color: '#B91C1C'
                                    }}
                                >
                                    Cancelled
                                </span>

                                <h3
                                    style={{
                                        margin: 0,
                                        color: '#991B1B'
                                    }}
                                >
                                    {summary.cancelled}
                                </h3>
                            </div>

                        </div>
                    </div>

                    {/* Timeline */}
                    <div
                        style={{
                            background: '#FFFFFF',
                            padding: '20px',
                            borderRadius: '12px',
                            border:
                                '1px solid #E2E8F0'
                        }}
                    >

                        <h3
                            style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                marginBottom: '16px',
                                color: '#1E293B'
                            }}
                        >
                            Queue Timeline
                        </h3>

                        <div
                            style={{
                                color: '#64748B',
                                fontSize: '13px'
                            }}
                        >
                            Queue activity timeline will be connected
                            with backend history in the next step.
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default QueueOperations;