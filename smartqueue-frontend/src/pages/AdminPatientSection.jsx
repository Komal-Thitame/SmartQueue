import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminPatientSection.css';

const PatientSection = () => {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const getAuthHeaders = () => {
        const token =
            localStorage.getItem('token') ||
            localStorage.getItem('jwtToken') ||
            localStorage.getItem('accessToken');

        if (!token) {
            return {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8081/api/admin/patients', getAuthHeaders());
            setPatients(res.data);
        } catch (err) {
            console.error("Error fetching patients list:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewClick = async (patientId) => {
        try {
            const res = await axios.get(`http://localhost:8081/api/admin/patients/${patientId}/overview`, getAuthHeaders());
            setSelectedPatient(res.data);
            setIsViewOpen(true);
        } catch (err) {
            console.error("Error fetching patient overview:", err);
            alert("Patient details fetch karne me error aaya.");
        }
    };

    // Filter Logic: Name, Email, Phone aur Status par
    const filteredPatients = patients.filter((patient) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
            patient.name?.toLowerCase().includes(query) ||
            patient.email?.toLowerCase().includes(query) ||
            patient.phone?.includes(query);

        const matchesStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && patient.active) ||
            (statusFilter === 'INACTIVE' && !patient.active);

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="patient-section-container p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Patients</h2>
                    <p className="text-muted mb-0">View and monitor registered patients</p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="card shadow-sm border-0 mb-4 p-3 search-filter-card">
                <div className="row g-3 align-items-center">
                    <div className="col-md-7">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                🔎
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="d-flex gap-2">
                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                            <button className="btn btn-outline-secondary" onClick={fetchPatients}>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Patients Table */}
            <div className="card shadow-sm border-0 p-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                        <tr>
                            <th>Patient ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Registered On</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-muted">
                                    Loading registered patients...
                                </td>
                            </tr>
                        ) : filteredPatients.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-muted">
                                    No patients found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredPatients.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                            <span className="badge bg-light text-dark fw-bold border">
                                                {item.patientCustomId || `P-${String(item.id).padStart(3, '0')}`}
                                            </span>
                                    </td>
                                    <td className="text-capitalize fw-semibold">{item.name}</td>
                                    <td className="text-muted">{item.email}</td>
                                    <td>{item.phone || 'N/A'}</td>
                                    <td>
                                        {item.createdAt
                                            ? new Date(item.createdAt).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })
                                            : 'N/A'}
                                    </td>
                                    <td>
                                            <span className={item.active ? "badge bg-success" : "badge bg-secondary"}>
                                                {item.active ? "Active" : "Inactive"}
                                            </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleViewClick(item.id)}
                                        >
                                            👁️ View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Patient Details & Queue History Modal */}
            {isViewOpen && selectedPatient && (
                <div className="modal-overlay">
                    <div className="modal-card shadow-lg">
                        <div className="modal-header d-flex justify-content-between align-items-center pb-3 border-bottom">
                            <h4 className="fw-bold mb-0">Patient Profile</h4>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setIsViewOpen(false)}
                            ></button>
                        </div>

                        <div className="modal-body py-4">
                            {/* Profile Details Grid */}
                            <div className="patient-info-grid mb-4">
                                <div className="info-item">
                                    <span className="info-label">Patient ID</span>
                                    <span className="info-value text-primary fw-bold">
                                        {selectedPatient.patientCustomId || `P-${String(selectedPatient.id).padStart(3, '0')}`}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Name</span>
                                    <span className="info-value text-capitalize fw-semibold">{selectedPatient.name}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{selectedPatient.email}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Phone</span>
                                    <span className="info-value">{selectedPatient.phone || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Registration</span>
                                    <span className="info-value">
                                        {selectedPatient.createdAt
                                            ? new Date(selectedPatient.createdAt).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Status</span>
                                    <span className="info-value">
                                        <span className={selectedPatient.active ? "badge bg-success" : "badge bg-secondary"}>
                                            {selectedPatient.active ? "Active" : "Inactive"}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <hr className="my-3 text-muted" />

                            {/* Queue History Table */}
                            <h5 className="fw-bold text-dark mb-3">Appointment / Queue History</h5>
                            <div className="table-responsive history-table-container">
                                <table className="table table-sm table-bordered align-middle mb-0">
                                    <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Doctor</th>
                                        <th>Token</th>
                                        <th>Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {selectedPatient.queueHistory && selectedPatient.queueHistory.length > 0 ? (
                                        selectedPatient.queueHistory.map((q, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    {new Date(q.appointmentDate).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short'
                                                    })}
                                                </td>
                                                <td className="fw-semibold">{q.doctorName}</td>
                                                <td>
                                                    <span className="badge bg-primary px-2 py-1">{q.tokenNumber}</span>
                                                </td>
                                                <td>
                                                        <span
                                                            className={`badge ${
                                                                q.status === 'COMPLETED'
                                                                    ? 'bg-success'
                                                                    : q.status === 'WAITING'
                                                                        ? 'bg-warning text-dark'
                                                                        : 'bg-secondary'
                                                            }`}
                                                        >
                                                            {q.status}
                                                        </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-3 text-muted">
                                                No queue history available for this patient.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="modal-footer pt-3 border-top d-flex justify-content-end">
                            <button className="btn btn-secondary px-4" onClick={() => setIsViewOpen(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientSection;