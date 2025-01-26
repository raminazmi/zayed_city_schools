import { useState, useEffect } from 'react';
import { ExportService } from './ExportService';

export const useAttendanceReport = (initialPeriod = 'monthly') => {
    const [period, setPeriod] = useState(initialPeriod);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/reports/attendance?period=${period}`);
            const data = await response.json();
            setReportData(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch report data');
        } finally {
            setLoading(false);
        }
    };

    const exportReport = async (format) => {
        if (!reportData) return;

        try {
            const filename = `attendance_report_${period}_${new Date().toISOString().split('T')[0]}`;

            if (format === 'pdf') {
                await ExportService.exportToPDF(reportData, filename);
            } else if (format === 'csv') {
                await ExportService.exportToCSV(reportData, filename);
            }
        } catch (err) {
            setError(`Failed to export report as ${format.toUpperCase()}`);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [period]);

    return {
        period,
        setPeriod,
        reportData,
        loading,
        error,
        exportReport,
        refreshReport: fetchReportData
    };
};