import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReceptionistManagement = () => {
    const [receptionists, setReceptionists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [selectedName, setSelectedName] = useState('');

    // Fetch Receptionists List
    const fetchReceptionists = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8081/api/admin/receptionists');
            setReceptionists(response.data);
        } catch (error) {
            console.error('Error fetching receptionists:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReceptionists();
    }, []);

    // Delete Action
    const handleOpenDeleteModal = (id, name) => {
        setDeleteId(id);
        setSelectedName(name);
    };

    const confirmDeleteReceptionist = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`http://localhost:8081/api/admin/receptionist/${deleteId}`);
            setDeleteId(null);
            fetchReceptionists();
        } catch (error) {
            console.error('Error deleting receptionist:', error);
            alert('Failed to delete receptionist');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Receptionists Directory</h3>
            </div>

            {loading ? (
                <p className="text-slate-500 py-4">Loading receptionists list...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase text-xs tracking-wider">
                            <th className="p-3 border-b">Name</th>
                            <th className="p-3 border-b">Email</th>
                            <th className="p-3 border-b">Phone</th>
                            <th className="p-3 border-b text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                        {receptionists.length > 0 ? (
                            receptionists.map((rec) => (
                                <tr key={rec.id} className="hover:bg-slate-50 transition">
                                    <td className="p-3 font-semibold text-slate-900">{rec.user?.name || rec.name}</td>
                                    <td className="p-3 text-slate-600">{rec.user?.email || rec.email}</td>
                                    <td className="p-3 text-slate-600">{rec.user?.phone || rec.phone}</td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => handleOpenDeleteModal(rec.id, rec.user?.name || rec.name)}
                                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 px-3 py-1 rounded-md font-medium text-xs transition"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-6 text-center text-slate-400">
                                    No receptionists available in database.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
                        <h4 className="text-lg font-bold text-slate-900">Remove Receptionist?</h4>
                        <p className="text-slate-600 text-sm mt-2">
                            Are you sure you want to delete <strong className="text-slate-900">{selectedName}</strong>?
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteReceptionist}
                                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceptionistManagement;