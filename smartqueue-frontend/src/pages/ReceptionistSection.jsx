import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminReceptionistSection.css';

const ReceptionistSection = () => {
    const [receptionists, setReceptionists] = useState([]);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // New Modal States
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedReceptionist, setSelectedReceptionist] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        employeeId: '',
        counterNumber: '',
        shift: 'Morning',
        temporaryPassword: ''
    });

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
        fetchReceptionists();
    }, []);

    const fetchReceptionists = async () => {
        try {
            const res = await axios.get('http://localhost:8081/api/admin/receptionist-mgmt', getAuthHeaders());
            setReceptionists(res.data);
        } catch (err) {
            console.error("Error fetching receptionists:", err);
        }
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                fullName: formData.name,
                userName: formData.name,
                email: formData.email,
                phone: formData.phone,
                phoneNumber: formData.phone,
                employeeId: formData.employeeId,
                counterNumber: formData.counterNumber,
                shift: formData.shift,
                password: formData.temporaryPassword,
                temporaryPassword: formData.temporaryPassword
            };

            await axios.post('http://localhost:8081/api/admin/receptionist-mgmt/add', payload, getAuthHeaders());
            alert("Receptionist Account Created Successfully!");
            setIsAddOpen(false);
            setFormData({
                name: '',
                email: '',
                phone: '',
                employeeId: '',
                counterNumber: '',
                shift: 'Morning',
                temporaryPassword: ''
            });
            fetchReceptionists();
        } catch (err) {
            console.error("Error creating account full error:", err);

            const backendError = err.response?.data?.message ||
                (typeof err.response?.data === 'string' ? err.response?.data : JSON.stringify(err.response?.data));

            if (err.response && err.response.status === 403) {
                alert("Forbidden (403): Token invalid/expired hai ya admin access nahi hai.");
            } else if (err.response && err.response.status === 400) {
                alert(`Bad Request (400): ${backendError || 'Validation error or missing required fields.'}`);
            } else {
                alert("Error creating account. Check server connection.");
            }
        }
    };

    // Open View Modal
    const handleViewClick = (item) => {
        setSelectedReceptionist(item);
        setIsViewOpen(true);
    };

    // Open Edit Modal with Pre-filled Data
    const handleEditClick = (item) => {
        setSelectedReceptionist(item);
        setFormData({
            name: item.name || '',
            email: item.user?.email || '',
            phone: item.phone || '',
            employeeId: item.employeeId || '',
            counterNumber: item.counterNumber || '',
            shift: item.shift || 'Morning',
            temporaryPassword: ''
        });
        setIsEditOpen(true);
    };

    // Submit Updated Receptionist Info
    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                phone: formData.phone,
                counterNumber: formData.counterNumber,
                shift: formData.shift
            };

            await axios.put(
                `http://localhost:8081/api/admin/receptionist-mgmt/update/${selectedReceptionist.id}`,
                payload,
                getAuthHeaders()
            );

            alert("Receptionist Profile Updated Successfully!");
            setIsEditOpen(false);
            setSelectedReceptionist(null);
            fetchReceptionists();
        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Failed to update receptionist details.");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await axios.put(`http://localhost:8081/api/admin/receptionist-mgmt/${id}/toggle-status`, {}, getAuthHeaders());
            fetchReceptionists();
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Error updating status");
        }
    };

    const handleResetPassword = async (id) => {
        const newPass = prompt("Enter new temporary password:");
        if (newPass) {
            try {
                await axios.put(
                    `http://localhost:8081/api/admin/receptionist-mgmt/${id}/reset-password`,
                    { newPassword: newPass, password: newPass },
                    getAuthHeaders()
                );
                alert("Password updated successfully!");
            } catch (err) {
                console.error("Error resetting password:", err);
                alert("Error resetting password");
            }
        }
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Receptionist Management (Admin Panel)</h2>
                    <p className="text-muted">Manage receptionist credentials, counters, and shifts.</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        employeeId: '',
                        counterNumber: '',
                        shift: 'Morning',
                        temporaryPassword: ''
                    });
                    setIsAddOpen(true);
                }}>
                    + Add Receptionist
                </button>
            </div>

            <div className="card shadow-sm p-3">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                    <tr>
                        <th>Emp ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Counter</th>
                        <th>Shift</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {receptionists.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="text-center py-4">No Receptionists Added Yet</td>
                        </tr>
                    ) : (
                        receptionists.map((item) => (
                            <tr key={item.id}>
                                <td><strong>{item.employeeId}</strong></td>
                                <td className="text-capitalize">{item.name}</td>
                                <td>{item.user?.email || '-'}</td>
                                <td>{item.counterNumber}</td>
                                <td><span className="badge bg-info text-dark">{item.shift}</span></td>
                                <td>
                                    <span className={item.user?.active ? "badge bg-success" : "badge bg-secondary"}>
                                        {item.user?.active ? "Active" : "Disabled"}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline-info me-2"
                                        onClick={() => handleViewClick(item)}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-primary me-2"
                                        onClick={() => handleEditClick(item)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-secondary me-2"
                                        onClick={() => handleResetPassword(item.id)}
                                    >
                                        Reset Password
                                    </button>
                                    <button
                                        className={item.user?.active ? "btn btn-sm btn-outline-danger" : "btn btn-sm btn-outline-success"}
                                        onClick={() => handleToggleStatus(item.id)}
                                    >
                                        {item.user?.active ? "Deactivate" : "Activate"}
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* View Modal */}
            {isViewOpen && selectedReceptionist && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Receptionist Details</h3>
                        <div className="my-3 text-start">
                            <p><strong>Full Name:</strong> <span className="text-capitalize">{selectedReceptionist.name}</span></p>
                            <p><strong>Employee ID:</strong> {selectedReceptionist.employeeId}</p>
                            <p><strong>Email:</strong> {selectedReceptionist.user?.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> {selectedReceptionist.phone || 'N/A'}</p>
                            <p><strong>Counter Number:</strong> {selectedReceptionist.counterNumber}</p>
                            <p><strong>Shift:</strong> {selectedReceptionist.shift}</p>
                            <p>
                                <strong>Status:</strong>{" "}
                                <span className={selectedReceptionist.user?.active ? "badge bg-success" : "badge bg-secondary"}>
                                    {selectedReceptionist.user?.active ? "Active" : "Disabled"}
                                </span>
                            </p>
                            <p><strong>Role:</strong> RECEPTIONIST</p>
                            <p><strong>Account Created:</strong> {selectedReceptionist.user?.createdAt ? new Date(selectedReceptionist.user.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div className="d-flex justify-content-end">
                            <button className="btn btn-secondary" onClick={() => setIsViewOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && selectedReceptionist && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Edit Receptionist Profile</h3>
                        <form onSubmit={handleUpdateAccount}>
                            <div className="mb-2">
                                <label>Full Name</label>
                                <input
                                    className="form-control"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="mb-2">
                                <label>Phone</label>
                                <input
                                    className="form-control"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <div className="mb-2">
                                <label>Counter Number</label>
                                <input
                                    className="form-control"
                                    required
                                    value={formData.counterNumber}
                                    onChange={e => setFormData({...formData, counterNumber: e.target.value})}
                                />
                            </div>
                            <div className="mb-3">
                                <label>Shift</label>
                                <select
                                    className="form-select"
                                    value={formData.shift}
                                    onChange={e => setFormData({...formData, shift: e.target.value})}
                                >
                                    <option value="Morning">Morning Shift</option>
                                    <option value="Evening">Evening Shift</option>
                                    <option value="Night">Night Shift</option>
                                </select>
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {isAddOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>+ Add Receptionist Account</h3>
                        <form onSubmit={handleCreateAccount}>
                            <div className="mb-2">
                                <label>Full Name</label>
                                <input
                                    className="form-control"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="mb-2">
                                <label>Email Address</label>
                                <input
                                    className="form-control"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="mb-2">
                                <label>Phone</label>
                                <input
                                    className="form-control"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <div className="mb-2">
                                <label>Employee ID</label>
                                <input
                                    className="form-control"
                                    required
                                    value={formData.employeeId}
                                    onChange={e => setFormData({...formData, employeeId: e.target.value})}
                                />
                            </div>
                            <div className="mb-2">
                                <label>Counter Number</label>
                                <input
                                    className="form-control"
                                    required
                                    value={formData.counterNumber}
                                    onChange={e => setFormData({...formData, counterNumber: e.target.value})}
                                />
                            </div>
                            <div className="mb-2">
                                <label>Shift</label>
                                <select
                                    className="form-select"
                                    value={formData.shift}
                                    onChange={e => setFormData({...formData, shift: e.target.value})}
                                >
                                    <option value="Morning">Morning Shift</option>
                                    <option value="Evening">Evening Shift</option>
                                    <option value="Night">Night Shift</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label>Temporary Password</label>
                                <input
                                    className="form-control"
                                    type="password"
                                    required
                                    value={formData.temporaryPassword}
                                    onChange={e => setFormData({...formData, temporaryPassword: e.target.value})}
                                />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceptionistSection;