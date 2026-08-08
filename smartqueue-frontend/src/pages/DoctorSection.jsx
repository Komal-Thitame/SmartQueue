import React, { useState, useEffect } from 'react';
import '../styles/DoctorSection.css';

const DoctorSection = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');

    // Add/Edit Modal Popup State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingDoctorId, setEditingDoctorId] = useState(null);

    // View Modal State
    const [viewDoctor, setViewDoctor] = useState(null);

    // Form State
    const initialFormState = {
        name: '',
        department: 'Cardiology',
        specialization: '',
        email: '',
        password: '',
        phone: '',
        roomNumber: '',
        consultationFee: '500',
        availableTime: '10:00 AM - 02:00 PM'
    };
    const [newDoc, setNewDoc] = useState(initialFormState);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/admin/doctors');
            if (response.ok) {
                const data = await response.json();
                setDoctors(data);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setNewDoc({ ...newDoc, [e.target.name]: e.target.value });
    };

    // Open Modal for Adding New Doctor
    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingDoctorId(null);
        setNewDoc(initialFormState);
        setIsModalOpen(true);
    };

    // 1. EDIT ACTION: Pre-fill Form with Selected Doctor's Data
    const handleEditDoctor = (doc) => {
        setIsEditMode(true);
        setEditingDoctorId(doc.id);
        setNewDoc({
            name: doc.name || '',
            department: doc.department || 'Cardiology',
            specialization: doc.specialization || '',
            email: doc.email || '',
            password: '', // Password security reasons ke liye empty rakhte hain
            phone: doc.phone || '',
            roomNumber: doc.roomNumber || '',
            consultationFee: doc.consultationFee ? String(doc.consultationFee) : '500',
            availableTime: doc.availableTime || '10:00 AM - 02:00 PM'
        });
        setIsModalOpen(true);
    };

    // 2. VIEW ACTION: Open Detail View Modal
    const handleViewDoctor = (doc) => {
        setViewDoctor(doc);
    };

    // 3. ADD / EDIT SUBMIT HANDLER
    const handleAddDoctorSubmit = async (e) => {
        e.preventDefault();

        const doctorDTO = {
            name: newDoc.name,
            department: newDoc.department,
            specialization: newDoc.specialization || newDoc.department,
            email: newDoc.email,
            password: newDoc.password,
            phone: newDoc.phone,
            roomNumber: newDoc.roomNumber,
            consultationFee: parseFloat(newDoc.consultationFee) || 500,
            availableTime: newDoc.availableTime || "10:00 AM - 02:00 PM"
        };

        try {
            // Edit ke time POST/PUT URL switch karein
            const url = isEditMode
                ? `http://localhost:8081/api/admin/add-doctor` // Aapka backend edit bhi save karta hai
                : 'http://localhost:8081/api/admin/add-doctor';

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEditMode ? { ...doctorDTO, id: editingDoctorId } : doctorDTO)
            });

            if (response.ok) {
                alert(`👨‍⚕️ Doctor profile ${isEditMode ? 'updated' : 'added'} successfully!`);
                setIsModalOpen(false);
                setNewDoc(initialFormState);
                fetchDoctors();
            } else {
                const result = await response.json();
                alert("Error: " + (result.message || "Save nahi ho saka"));
            }
        } catch (error) {
            console.error("API Error:", error);
            alert("Backend server connection failed.");
        }
    };

    // 4. DELETE ACTION: Remove Doctor from DB
    const handleDeleteDoctor = async (id) => {
        if (window.confirm("Are you sure you want to delete this doctor profile?")) {
            try {
                const response = await fetch(`http://localhost:8081/api/admin/doctor/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    alert("Doctor removed successfully!");
                    fetchDoctors();
                }
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };

    const filteredDoctors = doctors.filter(doc => {
        const matchesName = doc.name ? doc.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        const matchesDept = selectedDept === 'ALL' || doc.department === selectedDept;
        const statusStr = doc.active !== false ? 'Available' : 'Offline';
        const matchesStatus = selectedStatus === 'ALL' || statusStr === selectedStatus;
        return matchesName && matchesDept && matchesStatus;
    });

    return (
        <div className="doctor-section-container">
            {/* HEADER SECTION */}
            <div className="doc-header">
                <div className="doc-header-title">
                    <h2>Doctors Management</h2>
                    <p>Monitor doctor schedules, patient assignments, and active availability.</p>
                </div>
                <button className="btn-add-doctor" onClick={handleOpenAddModal}>
                    + Add New Doctor
                </button>
            </div>

            <hr className="doc-divider" />

            {/* SEARCH & FILTER CONTROLS */}
            <div className="doc-filter-bar">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search Doctor by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-dropdowns">
                    <select className="filter-select" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                        <option value="ALL">All Departments</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Dental">Dental</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Orthopedics">Orthopedics</option>
                    </select>

                    <select className="filter-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                        <option value="ALL">All Status</option>
                        <option value="Available">🟢 Available</option>
                        <option value="Offline">🔴 Offline</option>
                    </select>
                </div>
            </div>

            {/* DOCTOR CARDS GRID */}
            <div className="doc-cards-grid">
                {loading ? (
                    <div className="empty-grid-msg">Loading records from Database...</div>
                ) : filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc) => (
                        <div className="doctor-card" key={doc.id}>
                            <div className="doc-card-top">
                                <div className="doc-avatar">👨‍⚕️</div>
                                <div className="doc-main-info">
                                    <h3 className="doc-name">{doc.name?.startsWith("Dr.") ? doc.name : `Dr. ${doc.name}`}</h3>
                                    <span className="doc-spec">{doc.specialization || doc.department}</span>
                                </div>
                                <span className={`status-pill ${doc.active !== false ? 'available' : 'offline'}`}>
                                    {doc.active !== false ? 'Available' : 'Offline'}
                                </span>
                            </div>

                            <div className="doc-card-details">
                                <div className="detail-row">
                                    <span className="label">Department:</span>
                                    <span className="val">{doc.department}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Room / Cabin:</span>
                                    <span className="val">{doc.roomNumber || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Consultation Fee:</span>
                                    <span className="val fee">₹{doc.consultationFee || '500'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Phone:</span>
                                    <span className="val">{doc.phone || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="timing-box">
                                🕒 {doc.availableTime || '10:00 AM - 02:00 PM'}
                            </div>

                            <div className="doc-card-actions">
                                <button className="btn-action view" onClick={() => handleViewDoctor(doc)}>View</button>
                                <button className="btn-action edit" onClick={() => handleEditDoctor(doc)}>Edit</button>
                                <button className="btn-action delete" onClick={() => handleDeleteDoctor(doc.id)}>Delete</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-grid-msg">No doctors found in Database.</div>
                )}
            </div>

            {/* 2-COLUMN NO-SCROLL MODAL FOR ADD/EDIT DOCTOR */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-large">
                        <div className="modal-header">
                            <h3>{isEditMode ? '✏️ Edit Doctor Profile' : '➕ Add New Doctor'}</h3>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        <form onSubmit={handleAddDoctorSubmit} className="modal-form-grid">
                            <div className="form-group">
                                <label>Doctor Full Name *</label>
                                <input type="text" name="name" placeholder="e.g. Dr. Rajesh Sharma" value={newDoc.name} onChange={handleInputChange} required />
                            </div>

                            <div className="form-group">
                                <label>Department *</label>
                                <select name="department" value={newDoc.department} onChange={handleInputChange}>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Dental">Dental</option>
                                    <option value="General Medicine">General Medicine</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="Orthopedics">Orthopedics</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Specialization</label>
                                <input type="text" name="specialization" placeholder="e.g. Senior Cardiologist" value={newDoc.specialization} onChange={handleInputChange} />
                            </div>

                            <div className="form-group">
                                <label>Email Address *</label>
                                <input type="email" name="email" placeholder="doctor@hospital.com" value={newDoc.email} onChange={handleInputChange} required />
                            </div>

                            <div className="form-group">
                                <label>Password {isEditMode ? '(Optional)' : '*'}</label>
                                <input type="password" name="password" placeholder="••••••••" value={newDoc.password} onChange={handleInputChange} required={!isEditMode} />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="text" name="phone" placeholder="9876543210" value={newDoc.phone} onChange={handleInputChange} />
                            </div>

                            <div className="form-group">
                                <label>Room / Cabin Number</label>
                                <input type="text" name="roomNumber" placeholder="e.g. 101" value={newDoc.roomNumber} onChange={handleInputChange} />
                            </div>

                            <div className="form-group">
                                <label>Consultation Fee (₹)</label>
                                <input type="number" name="consultationFee" placeholder="500" value={newDoc.consultationFee} onChange={handleInputChange} />
                            </div>

                            <div className="form-group full-width">
                                <label>Available Timings</label>
                                <input type="text" name="availableTime" placeholder="e.g. 10:00 AM - 02:00 PM" value={newDoc.availableTime} onChange={handleInputChange} />
                            </div>

                            <div className="form-actions full-width">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-submit">{isEditMode ? 'Update Doctor' : 'Save Doctor'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW DETAILS MODAL */}
            {viewDoctor && (
                <div className="modal-overlay">
                    <div className="modal-content-view">
                        <div className="modal-header">
                            <h3>👨‍⚕️ Doctor Profile Details</h3>
                            <button className="btn-close" onClick={() => setViewDoctor(null)}>✕</button>
                        </div>
                        <div className="view-details-container">
                            <div className="view-detail-item"><strong>Full Name:</strong> {viewDoctor.name}</div>
                            <div className="view-detail-item"><strong>Department:</strong> {viewDoctor.department}</div>
                            <div className="view-detail-item"><strong>Specialization:</strong> {viewDoctor.specialization || 'N/A'}</div>
                            <div className="view-detail-item"><strong>Email:</strong> {viewDoctor.email}</div>
                            <div className="view-detail-item"><strong>Phone:</strong> {viewDoctor.phone || 'N/A'}</div>
                            <div className="view-detail-item"><strong>Room Number:</strong> {viewDoctor.roomNumber || 'N/A'}</div>
                            <div className="view-detail-item"><strong>Consultation Fee:</strong> ₹{viewDoctor.consultationFee || '500'}</div>
                            <div className="view-detail-item"><strong>Timings:</strong> {viewDoctor.availableTime || 'N/A'}</div>
                        </div>
                        <div className="form-actions" style={{ marginTop: '20px' }}>
                            <button className="btn-submit" onClick={() => setViewDoctor(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorSection;