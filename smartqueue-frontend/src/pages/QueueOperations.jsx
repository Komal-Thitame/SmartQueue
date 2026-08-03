import React, { useState, useEffect } from 'react';
//import './QueueOperations.css'; // Optional styling ke liye

const QueueOperations = () => {
    // Filters State
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [doctorFilter, setDoctorFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Dummy / State Data for Queue Operations
    const [queues, setQueues] = useState([
        {
            department: 'Cardiology',
            doctor: 'Dr. Sharma',
            nowServing: 'A-25',
            waitingQueue: ['A-26', 'A-27', 'A-28', 'A-29'],
            completedToday: 24,
            avgWait: '14 min'
        },
        {
            department: 'Orthopedics',
            doctor: 'Dr. Joshi',
            nowServing: 'B-12',
            waitingQueue: ['B-13', 'B-14'],
            completedToday: 18,
            avgWait: '10 min'
        }
    ]);

    const [timeline, setTimeline] = useState([
        { time: '09:10 AM', event: 'A-24 Completed' },
        { time: '09:12 AM', event: 'A-25 Started' },
        { time: '09:15 AM', event: 'A-26 Added to Waiting' }
    ]);

    const [summary, setSummary] = useState({
        waiting: 18,
        inProgress: 2,
        completed: 94,
        cancelled: 3
    });

    return (
        <div className="queue-operations-container" style={{ padding: '24px', fontFamily: 'Inter, sans-serif' }}>

            {/* Header */}
            <div className="header-section" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#0F172A' }}>
                    🎫 Queue Operations
                </h2>
                <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
                    Monitor and manage all hospital queues in real time.
                </p>
            </div>

            {/* Section 1: Filters */}
            <div className="filters-card" style={{
                background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px',
                border: '1px solid #E2E8F0', display: 'flex', gap: '16px', alignItems: 'center',
                flexWrap: 'wrap', marginBottom: '24px'
            }}>
                {/* Department Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Department</label>
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                    >
                        <option value="All">All Departments</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                    </select>
                </div>

                {/* Doctor Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Doctor</label>
                    <select
                        value={doctorFilter}
                        onChange={(e) => setDoctorFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                    >
                        <option value="All">All Doctors</option>
                        <option value="Dr. Sharma">Dr. Sharma</option>
                        <option value="Dr. Joshi">Dr. Joshi</option>
                    </select>
                </div>

                {/* Status Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Waiting">Waiting</option>
                        <option value="Serving">Serving</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                {/* Search Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Search Token</label>
                    <input
                        type="text"
                        placeholder="🔍 Search Token (e.g., A-25)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                    />
                </div>
            </div>

            {/* Main Grid: Live Queue & Sidebar Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

                {/* Section 2: Live Queue Cards */}
                <div className="live-queue-section">
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1E293B' }}>
                        Live Queue Status
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {queues.map((item, index) => (
                            <div key={index} style={{
                                background: '#FFFFFF', padding: '20px', borderRadius: '12px',
                                border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                {/* Dept & Doctor Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', pb: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '18px', color: '#0F172A' }}>{item.department}</h4>
                                        <span style={{ fontSize: '13px', color: '#64748B' }}>Doctor: {item.doctor}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '12px', color: '#64748B' }}>Avg Wait</span>
                                        <p style={{ margin: 0, fontWeight: 'bold', color: '#0F172A' }}>{item.avgWait}</p>
                                    </div>
                                </div>

                                {/* Serving & Waiting Tokens */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', alignItems: 'center' }}>

                                    {/* Now Serving */}
                                    <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                                        <span style={{ fontSize: '11px', color: '#047857', fontWeight: 'bold', textTransform: 'uppercase' }}>Now Serving</span>
                                        <h2 style={{ margin: '4px 0 0 0', color: '#065F46', fontSize: '28px' }}>{item.nowServing}</h2>
                                    </div>

                                    {/* Waiting Tokens */}
                                    <div>
                                        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Waiting Queue ({item.waitingQueue.length})</span>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                                            {item.waitingQueue.map((tok, tIdx) => (
                                                <span key={tIdx} style={{
                                                    background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '4px 10px',
                                                    borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#334155'
                                                }}>
                          {tok}
                        </span>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Section 3 Timeline & Section 4 Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Section 4: Queue Summary Cards */}
                    <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1E293B' }}>
                            Queue Summary
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ background: '#EFF6FF', padding: '12px', borderRadius: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#1D4ED8' }}>Waiting</span>
                                <h3 style={{ margin: 0, color: '#1E40AF' }}>{summary.waiting}</h3>
                            </div>
                            <div style={{ background: '#FEF3C7', padding: '12px', borderRadius: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#B45309' }}>In Progress</span>
                                <h3 style={{ margin: 0, color: '#92400E' }}>{summary.inProgress}</h3>
                            </div>
                            <div style={{ background: '#DCFCE7', padding: '12px', borderRadius: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#15803D' }}>Completed</span>
                                <h3 style={{ margin: 0, color: '#166534' }}>{summary.completed}</h3>
                            </div>
                            <div style={{ background: '#FEE2E2', padding: '12px', borderRadius: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#B91C1C' }}>Cancelled</span>
                                <h3 style={{ margin: 0, color: '#991B1B' }}>{summary.cancelled}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Queue Timeline */}
                    <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1E293B' }}>
                            Queue Timeline
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {timeline.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px' }}>
                                    <span style={{ fontWeight: 'bold', color: '#64748B', minWidth: '60px' }}>{item.time}</span>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }}></div>
                                    <span style={{ color: '#334155' }}>{item.event}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
};

export default QueueOperations;