import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AttendanceChart from './AttendanceChart';
import AttendanceReportHeader from './AttendanceReportHeader';
import AttendanceStats from './AttendanceStats';
import PeriodSelector from './PeriodSelector';
import { translations } from '@translations';
import Loading from '@/Components/Loading';
import { useSelector } from "react-redux";

export default function AttendanceReport({ onExport, role }) {
    const [data, setData] = useState({ stats: {}, chart: {} });
    const [period, setPeriod] = useState('daily');
    const [loading, setLoading] = useState(true);
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(role === 'admin' ?
                    `/admin/dashboard/attendance/attendance-stats?period=${period}`
                    :
                    `/teacher/dashboard/attendance/attendance-stats?period=${period}`
                );
                setData(response.data);
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [period]);

    const handlePeriodChange = (selectedPeriod) => {
        setPeriod(selectedPeriod);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className={`${isDark ? 'bg-DarkBG3 text-TextLight' : 'bg-LightBG1 text-TextDark'} p-6 rounded-lg shadow-md`}>
            <AttendanceReportHeader onExport={onExport} role={role} />
            <PeriodSelector period={period} onChange={handlePeriodChange} />
            <AttendanceStats data={data.stats} />
            <AttendanceChart data={data.chart} />
        </div>
    );
}
