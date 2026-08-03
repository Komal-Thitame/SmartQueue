import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { time: '09 AM', appointments: 4, waiting: 2 },
    { time: '11 AM', appointments: 12, waiting: 5 },
    { time: '01 PM', appointments: 8, waiting: 3 },
    { time: '03 PM', appointments: 16, waiting: 8 },
    { time: '05 PM', appointments: 10, waiting: 4 },
];

const AnalyticsChart = () => {
    return (
        <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0f766e" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="appointments" stroke="#0f766e" fillOpacity={1} fill="url(#colorApp)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AnalyticsChart;