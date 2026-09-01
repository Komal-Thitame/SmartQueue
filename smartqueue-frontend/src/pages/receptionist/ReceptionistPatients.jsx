import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/ReceptionistDashboard.css";

const ReceptionistPatients = () => {

    const navigate = useNavigate();

    const [receptionistName, setReceptionistName] =
        useState('Receptionist');

    const [isLoggingOut, setIsLoggingOut] =
        useState(false);

    const [showAddModal, setShowAddModal] =
        useState(false);

    const [patientsList, setPatientsList] =
        useState([]);

    const [searchName, setSearchName] =
        useState('');

    const [loading, setLoading] =
        useState(false);

    const [registering, setRegistering] =
        useState(false);

    const [error, setError] =
        useState('');

    const [successMessage, setSuccessMessage] =
        useState('');


    // =====================================================
    // NEW PATIENT FORM
    // =====================================================

    const [newPatient, setNewPatient] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        age: '',
        gender: 'Male',
        address: ''
    });


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
    // LOAD PATIENTS
    // =====================================================

    useEffect(() => {

        fetchPatients();

    }, []);


    // =====================================================
    // FETCH ALL PATIENTS
    // =====================================================

    const fetchPatients = async () => {

        try {

            setLoading(true);
            setError('');

            const response = await fetch(
                'http://localhost:8081/api/receptionist/patients'
            );

            if (!response.ok) {

                throw new Error(
                    'Failed to fetch patients'
                );
            }

            const data =
                await response.json();

            setPatientsList(data);

        } catch (error) {

            console.error(
                'Fetch patients error:',
                error
            );

            setError(
                'Unable to load patients. Please check backend.'
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // SEARCH PATIENT
    // =====================================================

    const handleSearch = async () => {

        if (!searchName.trim()) {

            fetchPatients();

            return;
        }

        try {

            setLoading(true);
            setError('');

            const response = await fetch(
                `http://localhost:8081/api/receptionist/patients/search?name=${encodeURIComponent(searchName)}`
            );

            if (!response.ok) {

                throw new Error(
                    'Search failed'
                );
            }

            const data =
                await response.json();

            setPatientsList(data);

        } catch (error) {

            console.error(
                'Search error:',
                error
            );

            setError(
                'Unable to search patients.'
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // CLEAR SEARCH
    // =====================================================

    const handleClearSearch = () => {

        setSearchName('');

        fetchPatients();

    };


    // =====================================================
    // INPUT CHANGE
    // =====================================================

    const handleInputChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setNewPatient({
            ...newPatient,
            [name]: value
        });

    };


    // =====================================================
    // REGISTER NEW PATIENT
    // =====================================================

    const handleRegisterPatient = async (e) => {

        e.preventDefault();

        try {

            setError('');
            setSuccessMessage('');
            setRegistering(true);


            // =================================================
            // VALIDATION
            // =================================================

            if (!newPatient.name.trim()) {

                throw new Error(
                    'Please enter patient name.'
                );
            }

            if (!newPatient.email.trim()) {

                throw new Error(
                    'Please enter patient email.'
                );
            }

            if (!newPatient.password.trim()) {

                throw new Error(
                    'Please enter patient password.'
                );
            }

            if (!newPatient.phone.trim()) {

                throw new Error(
                    'Please enter patient phone.'
                );
            }

            if (!newPatient.age) {

                throw new Error(
                    'Please enter patient age.'
                );
            }


            // =================================================
            // PATIENT DATA
            // =================================================

            const patientData = {

                name: newPatient.name,

                email: newPatient.email,

                password: newPatient.password,

                phone: newPatient.phone,

                age: Number(newPatient.age),

                gender: newPatient.gender,

                address: newPatient.address,

                role: "PATIENT",

                active: true
            };


            console.log(
                "Sending patient data:",
                patientData
            );


            // =================================================
            // POST API
            // IMPORTANT:
            // Backend endpoint is /patients
            // =================================================

            const response = await fetch(
                'http://localhost:8081/api/receptionist/patients',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify(
                        patientData
                    )
                }
            );


            const data =
                await response.json();


            // =================================================
            // ERROR RESPONSE
            // =================================================

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    'Patient registration failed.'
                );
            }


            // =================================================
            // SUCCESS
            // =================================================

            setSuccessMessage(
                'Patient registered successfully!'
            );


            // Close modal
            setShowAddModal(false);


            // Reset form
            setNewPatient({
                name: '',
                email: '',
                password: '',
                phone: '',
                age: '',
                gender: 'Male',
                address: ''
            });


            // Refresh patient list
            await fetchPatients();


            // Remove success message
            setTimeout(() => {

                setSuccessMessage('');

            }, 3000);


        } catch (error) {

            console.error(
                'Registration error:',
                error
            );

            setError(
                error.message ||
                'Unable to register patient.'
            );

        } finally {

            setRegistering(false);

        }
    };


    // =====================================================
    // OPEN REGISTER MODAL
    // =====================================================

    const openRegisterModal = () => {

        setError('');
        setSuccessMessage('');

        setNewPatient({
            name: '',
            email: '',
            password: '',
            phone: '',
            age: '',
            gender: 'Male',
            address: ''
        });

        setShowAddModal(true);

    };


    // =====================================================
    // CLOSE REGISTER MODAL
    // =====================================================

    const closeRegisterModal = () => {

        setShowAddModal(false);

        setError('');

        setNewPatient({
            name: '',
            email: '',
            password: '',
            phone: '',
            age: '',
            gender: 'Male',
            address: ''
        });

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

        }, 1500);

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
                                    '/receptionist/dashboard'
                                )
                            }
                            className="nav-btn"
                        >
                            📊 Dashboard
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    '/receptionist/appointments'
                                )
                            }
                            className="nav-btn"
                        >
                            📅 Appointments
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    '/receptionist/queue'
                                )
                            }
                            className="nav-btn"
                        >
                            🎫 Live Queue
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    '/receptionist/patients'
                                )
                            }
                            className="nav-btn active"
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
                MAIN CONTENT
            ================================================= */}

            <main className="receptionist-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="receptionist-header">

                    <h1 className="header-title">
                        Patients Directory
                    </h1>


                    <div className="header-right">

                        <span
                            style={{
                                cursor: 'pointer',
                                fontSize: '18px'
                            }}
                        >
                            🔔
                        </span>


                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >

                            <div className="user-avatar">

                                {receptionistName
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
                        TITLE
                    ================================================= */}

                    <div
                        className="mb-6"
                        style={{
                            display: 'flex',
                            justifyContent:
                                'space-between',
                            alignItems:
                                'center'
                        }}
                    >

                        <div>

                            <h2 className="welcome-title">
                                Registered Patients
                            </h2>

                            <p className="welcome-sub">
                                View patient profiles or
                                register new walk-in patients.
                            </p>

                        </div>


                        <button
                            onClick={
                                openRegisterModal
                            }
                            style={{
                                backgroundColor:
                                    '#059669',
                                color:
                                    '#fff',
                                border:
                                    'none',
                                padding:
                                    '10px 16px',
                                borderRadius:
                                    '8px',
                                cursor:
                                    'pointer',
                                fontWeight:
                                    '600',
                                fontSize:
                                    '14px'
                            }}
                        >
                            + Register Patient
                        </button>

                    </div>


                    {/* =================================================
                        SUCCESS MESSAGE
                    ================================================= */}

                    {successMessage && (

                        <div
                            style={{
                                background:
                                    '#dcfce7',
                                color:
                                    '#166534',
                                padding:
                                    '12px 16px',
                                borderRadius:
                                    '8px',
                                marginBottom:
                                    '15px',
                                border:
                                    '1px solid #bbf7d0'
                            }}
                        >
                            ✅ {successMessage}
                        </div>

                    )}


                    {/* =================================================
                        ERROR MESSAGE
                    ================================================= */}

                    {error && (

                        <div
                            style={{
                                background:
                                    '#fee2e2',
                                color:
                                    '#991b1b',
                                padding:
                                    '12px 16px',
                                borderRadius:
                                    '8px',
                                marginBottom:
                                    '15px',
                                border:
                                    '1px solid #fecaca'
                            }}
                        >
                            ❌ {error}
                        </div>

                    )}


                    {/* =================================================
                        SEARCH
                    ================================================= */}

                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            marginBottom: '20px'
                        }}
                    >

                        <input
                            type="text"
                            placeholder="Search patient by name..."
                            value={searchName}
                            onChange={(e) =>
                                setSearchName(
                                    e.target.value
                                )
                            }
                            onKeyDown={(e) => {

                                if (
                                    e.key === 'Enter'
                                ) {

                                    handleSearch();

                                }

                            }}
                            style={{
                                flex: 1,
                                padding:
                                    '10px 12px',
                                border:
                                    '1px solid #d1d5db',
                                borderRadius:
                                    '8px',
                                fontSize:
                                    '14px'
                            }}
                        />


                        <button
                            onClick={
                                handleSearch
                            }
                            style={{
                                background:
                                    '#2563eb',
                                color:
                                    '#fff',
                                border:
                                    'none',
                                padding:
                                    '10px 18px',
                                borderRadius:
                                    '8px',
                                cursor:
                                    'pointer',
                                fontWeight:
                                    '600'
                            }}
                        >
                            🔍 Search
                        </button>


                        <button
                            onClick={
                                handleClearSearch
                            }
                            style={{
                                background:
                                    '#e5e7eb',
                                color:
                                    '#374151',
                                border:
                                    'none',
                                padding:
                                    '10px 18px',
                                borderRadius:
                                    '8px',
                                cursor:
                                    'pointer',
                                fontWeight:
                                    '600'
                            }}
                        >
                            Clear
                        </button>

                    </div>


                    {/* =================================================
                        PATIENT TABLE
                    ================================================= */}

                    <div className="table-card">

                        {loading ? (

                            <div
                                style={{
                                    textAlign:
                                        'center',
                                    padding:
                                        '40px',
                                    color:
                                        '#6b7280'
                                }}
                            >
                                Loading patients...
                            </div>

                        ) : patientsList.length === 0 ? (

                            <div
                                style={{
                                    textAlign:
                                        'center',
                                    padding:
                                        '40px',
                                    color:
                                        '#6b7280'
                                }}
                            >
                                No patients found.
                            </div>

                        ) : (

                            <table
                                className="custom-table"
                            >

                                <thead>

                                <tr>

                                    <th>
                                        Patient Name
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Phone
                                    </th>

                                    <th>
                                        Age
                                    </th>

                                    <th>
                                        Gender
                                    </th>

                                    <th>
                                        Address
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                                </thead>


                                <tbody>

                                {patientsList.map(
                                    (patient) => (

                                        <tr
                                            key={
                                                patient.id
                                            }
                                        >

                                            <td
                                                style={{
                                                    fontWeight:
                                                        '600',
                                                    color:
                                                        '#1f2937'
                                                }}
                                            >
                                                {
                                                    patient.name
                                                }
                                            </td>


                                            <td>
                                                {
                                                    patient.email
                                                }
                                            </td>


                                            <td>
                                                {
                                                    patient.phone ||
                                                    '-'
                                                }
                                            </td>


                                            <td>
                                                {
                                                    patient.age ||
                                                    '-'
                                                }
                                            </td>


                                            <td>
                                                {
                                                    patient.gender ||
                                                    '-'
                                                }
                                            </td>


                                            <td>
                                                {
                                                    patient.address ||
                                                    '-'
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    style={{
                                                        padding:
                                                            '4px 10px',
                                                        borderRadius:
                                                            '20px',
                                                        fontSize:
                                                            '12px',
                                                        fontWeight:
                                                            '600',
                                                        background:
                                                            patient.active
                                                                ? '#dcfce7'
                                                                : '#fee2e2',
                                                        color:
                                                            patient.active
                                                                ? '#166534'
                                                                : '#991b1b'
                                                    }}
                                                >

                                                    {patient.active
                                                        ? 'Active'
                                                        : 'Inactive'}

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

            </main>


            {/* =================================================
                REGISTER PATIENT MODAL
            ================================================= */}

            {showAddModal && (

                <div
                    className="logout-overlay"
                    style={{
                        background:
                            'rgba(0,0,0,0.5)'
                    }}
                >

                    <div
                        style={{
                            background:
                                '#fff',
                            padding:
                                '30px',
                            borderRadius:
                                '12px',
                            width:
                                '500px',
                            maxWidth:
                                '90%',
                            maxHeight:
                                '90vh',
                            overflowY:
                                'auto',
                            boxShadow:
                                '0 4px 20px rgba(0,0,0,0.15)'
                        }}
                    >


                        <h3
                            style={{
                                marginBottom:
                                    '20px',
                                color:
                                    '#1f2937',
                                fontSize:
                                    '20px',
                                fontWeight:
                                    '600'
                            }}
                        >
                            Register New Patient
                        </h3>


                        <form
                            onSubmit={
                                handleRegisterPatient
                            }
                        >


                            {/* NAME */}

                            <div
                                style={{
                                    marginBottom:
                                        '12px'
                                }}
                            >

                                <label
                                    style={{
                                        fontSize:
                                            '12px',
                                        color:
                                            '#4b5563',
                                        display:
                                            'block',
                                        marginBottom:
                                            '4px'
                                    }}
                                >
                                    Full Name
                                </label>


                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter full name"
                                    value={
                                        newPatient.name
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                    style={{
                                        width:
                                            '100%',
                                        padding:
                                            '9px',
                                        borderRadius:
                                            '6px',
                                        border:
                                            '1px solid #d1d5db'
                                    }}
                                />

                            </div>


                            {/* EMAIL */}

                            <div
                                style={{
                                    marginBottom:
                                        '12px'
                                }}
                            >

                                <label
                                    style={{
                                        fontSize:
                                            '12px',
                                        color:
                                            '#4b5563',
                                        display:
                                            'block',
                                        marginBottom:
                                            '4px'
                                    }}
                                >
                                    Email
                                </label>


                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email address"
                                    value={
                                        newPatient.email
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                    style={{
                                        width:
                                            '100%',
                                        padding:
                                            '9px',
                                        borderRadius:
                                            '6px',
                                        border:
                                            '1px solid #d1d5db'
                                    }}
                                />

                            </div>


                            {/* PASSWORD */}

                            <div
                                style={{
                                    marginBottom:
                                        '12px'
                                }}
                            >

                                <label
                                    style={{
                                        fontSize:
                                            '12px',
                                        color:
                                            '#4b5563',
                                        display:
                                            'block',
                                        marginBottom:
                                            '4px'
                                    }}
                                >
                                    Password
                                </label>


                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter password"
                                    value={
                                        newPatient.password
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                    style={{
                                        width:
                                            '100%',
                                        padding:
                                            '9px',
                                        borderRadius:
                                            '6px',
                                        border:
                                            '1px solid #d1d5db'
                                    }}
                                />

                            </div>


                            {/* PHONE */}

                            <div
                                style={{
                                    marginBottom:
                                        '12px'
                                }}
                            >

                                <label
                                    style={{
                                        fontSize:
                                            '12px',
                                        color:
                                            '#4b5563',
                                        display:
                                            'block',
                                        marginBottom:
                                            '4px'
                                    }}
                                >
                                    Phone Number
                                </label>


                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone number"
                                    value={
                                        newPatient.phone
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                    style={{
                                        width:
                                            '100%',
                                        padding:
                                            '9px',
                                        borderRadius:
                                            '6px',
                                        border:
                                            '1px solid #d1d5db'
                                    }}
                                />

                            </div>


                            {/* AGE + GENDER */}

                            <div
                                style={{
                                    display:
                                        'flex',
                                    gap:
                                        '10px',
                                    marginBottom:
                                        '12px'
                                }}
                            >


                                {/* AGE */}

                                <div
                                    style={{
                                        flex:
                                            1
                                    }}
                                >

                                    <label
                                        style={{
                                            fontSize:
                                                '12px',
                                            color:
                                                '#4b5563',
                                            display:
                                                'block',
                                            marginBottom:
                                                '4px'
                                        }}
                                    >
                                        Age
                                    </label>


                                    <input
                                        type="number"
                                        name="age"
                                        placeholder="Age"
                                        min="1"
                                        max="120"
                                        value={
                                            newPatient.age
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                        style={{
                                            width:
                                                '100%',
                                            padding:
                                                '9px',
                                            borderRadius:
                                                '6px',
                                            border:
                                                '1px solid #d1d5db'
                                        }}
                                    />

                                </div>


                                {/* GENDER */}

                                <div
                                    style={{
                                        flex:
                                            1
                                    }}
                                >

                                    <label
                                        style={{
                                            fontSize:
                                                '12px',
                                            color:
                                                '#4b5563',
                                            display:
                                                'block',
                                            marginBottom:
                                                '4px'
                                        }}
                                    >
                                        Gender
                                    </label>


                                    <select
                                        name="gender"
                                        value={
                                            newPatient.gender
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        style={{
                                            width:
                                                '100%',
                                            padding:
                                                '9px',
                                            borderRadius:
                                                '6px',
                                            border:
                                                '1px solid #d1d5db'
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
                                    marginBottom:
                                        '20px'
                                }}
                            >

                                <label
                                    style={{
                                        fontSize:
                                            '12px',
                                        color:
                                            '#4b5563',
                                        display:
                                            'block',
                                        marginBottom:
                                            '4px'
                                    }}
                                >
                                    Address
                                </label>


                                <textarea
                                    name="address"
                                    placeholder="Enter address"
                                    value={
                                        newPatient.address
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    rows="3"
                                    style={{
                                        width:
                                            '100%',
                                        padding:
                                            '9px',
                                        borderRadius:
                                            '6px',
                                        border:
                                            '1px solid #d1d5db',
                                        resize:
                                            'vertical'
                                    }}
                                />

                            </div>


                            {/* BUTTONS */}

                            <div
                                style={{
                                    display:
                                        'flex',
                                    justifyContent:
                                        'flex-end',
                                    gap:
                                        '10px'
                                }}
                            >


                                <button
                                    type="button"
                                    onClick={
                                        closeRegisterModal
                                    }
                                    disabled={
                                        registering
                                    }
                                    style={{
                                        padding:
                                            '9px 16px',
                                        background:
                                            '#e5e7eb',
                                        border:
                                            'none',
                                        borderRadius:
                                            '6px',
                                        cursor:
                                            'pointer',
                                        fontWeight:
                                            '500'
                                    }}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        registering
                                    }
                                    style={{
                                        padding:
                                            '9px 16px',
                                        background:
                                            registering
                                                ? '#9ca3af'
                                                : '#059669',
                                        color:
                                            '#fff',
                                        border:
                                            'none',
                                        borderRadius:
                                            '6px',
                                        cursor:
                                            registering
                                                ? 'not-allowed'
                                                : 'pointer',
                                        fontWeight:
                                            '500'
                                    }}
                                >

                                    {registering
                                        ? 'Registering...'
                                        : 'Register Patient'}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                LOGOUT OVERLAY
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


export default ReceptionistPatients;