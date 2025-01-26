import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useAttendance(students, fetchUrl) {
    const [attendance, setAttendance] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // عند تحميل المكون: قم بتهيئة الحضور بالقيم الافتراضية
    useEffect(() => {
        const initialAttendance = {};
        students.forEach((student) => {
            initialAttendance[student.id] = '';
        });
        setAttendance(initialAttendance);
    }, [students]);

    // جلب بيانات الحضور من قاعدة البيانات
    const fetchAttendance = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(fetchUrl);
            if (response.data && response.data.attendance) {
                const attendanceData = {};
                students.forEach((student) => {
                    attendanceData[student.id] = response.data.attendance[student.id] || '';
                });
                setAttendance(attendanceData);
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // تحديث الحضور للطالب
    const handleAttendanceChange = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    // إعادة تعيين الحضور إلى القيم الافتراضية
    const resetAttendance = () => {
        const reset = {};
        students.forEach(student => {
            reset[student.id] = '';
        });
        setAttendance(reset);
    };

    // دالة للتحقق من الحضور الكامل
    const pleaseFillAllAttendance = () => {
        return Object.values(attendance).every(status => status !== '');
    };

    return {
        attendance,
        handleAttendanceChange,
        resetAttendance,
        fetchAttendance,
        isLoading,
        pleaseFillAllAttendance  // إعادة الدالة هنا لتتمكن من استخدامها في المكون
    };
}
