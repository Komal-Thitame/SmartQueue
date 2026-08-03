import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientsList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await axios.get('http://localhost:8081/api/admin/patients');
                setPatients(res.data);
            } catch (err) {
                console.error("Error fetching patients", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Registered Patients Directory</h3>
            {loading ? (
                <p className="text-slate-500 py-4">Loading patients list...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase text-xs tracking-wider">
                            <th className="p-3 border-b">Patient Name</th>
                            <th className="p-3 border-b">Email</th>
                            <th className="p-3 border-b">Phone</th>
                            <th className="p-3 border-b">Age</th>
                            <th className="p-3 border-b">Blood Group</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                        {patients.length > 0 ? (
                            patients.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition">
                                    <td className="p-3 font-semibold text-slate-900">{p.user?.name || p.name}</td>
                                    <td className="p-3 text-slate-600">{p.user?.email || p.email}</td>
                                    <td className="p-3 text-slate-600">{p.user?.phone || p.phone}</td>
                                    <td className="p-3 text-slate-600">{p.age || 'N/A'}</td>
                                    <td className="p-3 text-indigo-600 font-bold">{p.blood_group || p.bloodGroup || 'N/A'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-slate-400">
                                    No registered patients found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PatientsList;