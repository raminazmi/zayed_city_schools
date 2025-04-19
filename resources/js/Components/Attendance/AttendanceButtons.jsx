import React, { useState } from 'react';
import { useSelector } from 'react-redux';

export default function AttendanceButtons({ studentId, currentStatus, onChange, translations }) {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const [lateTime, setLateTime] = useState('');

    const statuses = [
        { value: 'present', colorClass: 'bg-green-500 hover:bg-green-600' },
        { value: 'absent', colorClass: 'bg-red-500 hover:bg-red-600' },
        { value: 'late', colorClass: 'bg-yellow-500 hover:bg-yellow-600' }
    ];

    const handleStatusChange = (status) => {
        if (status === 'late') {
            onChange(studentId, { status, lateTime: lateTime || '00:00' });
        } else {
            onChange(studentId, status);
        }
    };

    const handleLateTimeChange = (e) => {
        const time = e.target.value;
        setLateTime(time);
        onChange(studentId, { status: 'late', lateTime: time });
    };

    const getButtonClass = (statusValue) => {
        const isSelected = typeof currentStatus === 'object'
            ? currentStatus.status === statusValue
            : currentStatus === statusValue;

        const status = statuses.find(s => s.value === statusValue);

        return `px-3 py-1 rounded transition-colors ${isSelected
            ? status.colorClass + ' text-white'
            : `${isDark ? 'bg-[#343438]' : 'bg-gray-200 hover:bg-gray-300'}`
            }`;
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-4">
                {statuses.map(({ value }) => (
                    <button
                        key={value}
                        className={getButtonClass(value)}
                        onClick={() => handleStatusChange(value)}
                    >
                        {translations[value]}
                    </button>
                ))}
            </div>
            {(typeof currentStatus === 'object' && currentStatus?.status === 'late') && (
                <input
                    type="time"
                    placeholder={translations.enter_late_time}
                    value={lateTime}
                    onChange={handleLateTimeChange}
                    className={`${isDark ? 'bg-[#343438]' : ''} mt-2 px-3 py-1 border rounded`}
                />
            )}
        </div>
    );
}