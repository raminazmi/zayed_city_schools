import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useAttendance(students, fetchUrl) {
    const [attendance, setAttendance] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const initialAttendance = {};
        students.forEach((student) => {
            initialAttendance[student.id] = 'present';
        });
        setAttendance(initialAttendance);
    }, [students]);

    const fetchAttendance = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(fetchUrl);
            if (response.data && response.data.attendance) {
                setAttendance(prev => {
                    const newAttendance = {...prev};
                    Object.keys(response.data.attendance).forEach(studentId => {
                        if (newAttendance.hasOwnProperty(studentId)) {
                            newAttendance[studentId] = response.data.attendance[studentId];
                        }
                    });
                    return newAttendance;
                });
                return response.data.attendance;
            }
            return null;
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleAttendanceChange = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const resetAttendance = () => {
        const reset = {};
        students.forEach(student => {
            reset[student.id] = 'present';
        });
        setAttendance(reset);
    };

    const pleaseFillAllAttendance = () => {
        return Object.values(attendance).every(status => status !== '');
    };

    return {
        attendance,
        handleAttendanceChange,
        resetAttendance,
        fetchAttendance,
        isLoading,
        pleaseFillAllAttendance
    };
}