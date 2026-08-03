import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DoctorsManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('ALL');

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8081/api/admin/doctors');
            setDoctors(response.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter((doc) => {
        const matchesName = (doc.user?.name || doc.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDept === 'ALL' || doc.specialization === selectedDept;
        return matchesName && matchesDept;
    });

    return (
        <div className="section-card">

            {/* SEARCH & FILTERS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Doctors Directory</h3>
                    <p className="text-xs text-slate-500">Manage hospital medical staff, departments, and availability</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="🔍 Search doctor by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs w-full md:w-56 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />

                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700"
                    >
                        <option value="ALL">All Departments</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="General OPD">General OPD</option>
                    </select>
                </div>
            </div>

            {/* TABLE */}
            {loading ? (
                <p className="text-xs text-slate-500 py-4">Loading medical directory...</p>
            ) : filteredDoctors.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                        <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider border-b border-slate-200">
                            <th className="p-3">Doctor</th>
                            <th className="p-3">Department</th>
                            <th className="p-3">License No</th>
                            <th className="p-3">Today's Load</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {filteredDoctors.map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-50 transition">
                                <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                                        {(doc.user?.name || doc.name || 'D')[0]}
                                    </div>
                                    <span>{doc.user?.name || doc.name}</span>
                                </td>
                                <td className="p-3 text-teal-700 font-medium">{doc.specialization}</td>
                                <td className="p-3 text-slate-500 font-mono">{doc.license_number || doc.licenseNumber || 'MED-2026-X'}</td>
                                <td className="p-3 text-slate-700 font-medium">8 Patients</td>
                                <td className="p-3">
                                    <span className="status-badge available">🟢 Available</span>
                                </td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button className="text-teal-700 hover:underline font-semibold">View</button>
                                        <button className="text-amber-600 hover:underline font-semibold">Disable</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10">
                    <div className="text-3xl mb-2">👨‍⚕️</div>
                    <h4 className="text-sm font-bold text-slate-800">No Doctors Found</h4>
                    <p className="text-xs text-slate-500 mt-1">Start by adding your first doctor or adjust search filters.</p>
                </div>
            )}
        </div>
    );
};

export default DoctorsManagement;