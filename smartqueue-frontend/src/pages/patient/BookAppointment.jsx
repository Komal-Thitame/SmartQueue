import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../styles/PatientDashboard.css";

const BookAppointment = () => {
    const navigate = useNavigate();

    // Dynamic user state from localStorage
    const [patientName, setPatientName] = useState('Patient');
    const [patientId, setPatientId] = useState(null);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        const storedId = localStorage.getItem("userId");

        if (storedName) {
            setPatientName(storedName);
        }

        if (storedId) {
            setPatientId(storedId);
        }
    }, []);

    // Logout Popup state
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = () => {
        setIsLoggingOut(true);

        setTimeout(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
        }, 2500);
    };

    // Doctors state
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [reason, setReason] = useState('');

    // Fetch doctors
    useEffect(() => {

        axios.get('http://localhost:8081/api/admin/doctors')

            .then(response => {

                // Only ACTIVE doctors will be shown to patient
                const activeDoctors = response.data.filter(
                    doc => doc.active !== false
                );

                setDoctors(activeDoctors);

            })

            .catch(error => {

                console.error(
                    "Error fetching doctors from database:",
                    error
                );

            });

    }, []);

    // Booking
    const handleBookingSubmit = async (e) => {

        e.preventDefault();

        if (!selectedDoctor || !appointmentDate) {

            alert(
                "Please select a doctor and appointment date."
            );

            return;
        }

        try {

            const bookingData = {

                appointmentDate: appointmentDate,

                symptoms: reason,

                patientId: patientId || null

            };

            const response = await axios.post(
                `http://localhost:8081/api/appointments/book/${selectedDoctor.id}`,
                bookingData
            );

            alert(
                `Appointment successfully booked! Your Token Number is: ${response.data.tokenNumber}`
            );

            navigate('/patient/mytokens');

        } catch (error) {

            console.error(
                "Error booking appointment:",
                error
            );

            alert(
                "Failed to book appointment. Please try again."
            );
        }
    };

    return (

        <div className="patient-dashboard-container">

            {/* Sidebar Navigation */}

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
                            className="patient-nav-btn active"
                        >
                            📅 Book Appointment
                        </button>

                        <button
                            onClick={() =>
                                navigate('/patient/mytokens')
                            }
                            className="patient-nav-btn"
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

            {/* Main Content */}

            <main className="patient-main">

                <header className="patient-header">

                    <h1 className="patient-header-title">
                        Book Appointment
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
                                    .charAt(0)
                                    .toUpperCase()}

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

                <div
                    className="patient-body"
                    style={{
                        maxWidth: '800px'
                    }}
                >

                    <div
                        className="mb-6"
                        style={{
                            marginBottom: '24px'
                        }}
                    >

                        <h2 className="patient-welcome-title">
                            Select a Doctor & Schedule
                        </h2>

                        <p className="patient-welcome-sub">
                            Choose your preferred doctor and book your queue token instantly.
                        </p>

                    </div>

                    <form
                        onSubmit={handleBookingSubmit}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px'
                        }}
                    >

                        {/* Doctors List */}

                        <div>

                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '12px'
                                }}
                            >
                                Available Doctors (From Database)
                            </label>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                        'repeat(auto-fit, minmax(220px, 1fr))',
                                    gap: '16px'
                                }}
                            >

                                {doctors.length > 0 ? (

                                    doctors.map((doc) => (

                                        <div
                                            key={doc.id}
                                            onClick={() =>
                                                setSelectedDoctor(doc)
                                            }
                                            style={{
                                                padding: '16px',
                                                borderRadius: '12px',
                                                border:
                                                    selectedDoctor?.id === doc.id
                                                        ? '2px solid #059669'
                                                        : '1px solid #e5e7eb',
                                                backgroundColor:
                                                    selectedDoctor?.id === doc.id
                                                        ? '#ecfdf5'
                                                        : '#ffffff',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >

                                            <h3
                                                style={{
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    color: '#1f2937'
                                                }}
                                            >
                                                {doc.name}
                                            </h3>

                                            <p
                                                style={{
                                                    fontSize: '13px',
                                                    color: '#059669',
                                                    fontWeight: '500',
                                                    marginTop: '2px'
                                                }}
                                            >
                                                {doc.department ||
                                                    doc.specialization}
                                            </p>

                                            <p
                                                style={{
                                                    fontSize: '12px',
                                                    color: '#6b7280',
                                                    marginTop: '8px'
                                                }}
                                            >
                                                Fee: ₹
                                                {doc.consultationFee}
                                            </p>

                                            <p
                                                style={{
                                                    fontSize: '12px',
                                                    color: '#6b7280',
                                                    marginTop: '2px'
                                                }}
                                            >
                                                Timing: {doc.availableTime}
                                            </p>

                                        </div>

                                    ))

                                ) : (

                                    <p
                                        style={{
                                            color: '#6b7280',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Loading doctors or no doctors available...
                                    </p>

                                )}

                            </div>

                        </div>

                        {/* Date and Reason */}

                        <div
                            style={{
                                backgroundColor: '#ffffff',
                                padding: '24px',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb'
                            }}
                        >

                            <div
                                style={{
                                    marginBottom: '16px'
                                }}
                            >

                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}
                                >
                                    Appointment Date
                                </label>

                                <input
                                    type="date"
                                    value={appointmentDate}
                                    onChange={(e) =>
                                        setAppointmentDate(
                                            e.target.value
                                        )
                                    }
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />

                            </div>

                            <div
                                style={{
                                    marginBottom: '20px'
                                }}
                            >

                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}
                                >
                                    Reason for Visit (Symptoms / Issue)
                                </label>

                                <textarea
                                    rows="3"
                                    placeholder="Briefly describe your symptoms..."
                                    value={reason}
                                    onChange={(e) =>
                                        setReason(e.target.value)
                                    }
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db',
                                        fontSize: '14px',
                                        outline: 'none',
                                        resize: 'vertical'
                                    }}
                                />

                            </div>

                            <button
                                type="submit"
                                className="patient-primary-btn"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '15px'
                                }}
                            >
                                Confirm Booking & Get Token
                            </button>

                        </div>

                    </form>

                </div>

            </main>

            {/* Logout Popup */}

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

export default BookAppointment;