import React from 'react';
import PrimaryButton from '../PrimaryButton';

export default function AttendanceHeader({ title, onReset, onSave, translations, isDark }) {
    return (
        <div className="flex justify-between items-center">
            <h1 className={`text-2xl sm:text-3xl  mt-3 font-bold text-primaryColor ${isDark ? 'text-TextLight' : 'text-TextDark'
                }`}>
                {title}
            </h1>
            <div className="flex justify-between gap-4 px-4 ">
                <PrimaryButton
                    onClick={onReset}
                    className="!bg-gray-400 hover:!bg-gray-500"
                >
                    {translations.reset_attendance}
                </PrimaryButton>
                <PrimaryButton onClick={onSave}>
                    {translations.save_attendance}
                </PrimaryButton>
            </div>
        </div>
    );
}