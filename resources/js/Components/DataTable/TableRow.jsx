import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { translations } from '@translations';

export default function TableRow({
    row,
    columns,
    selectable,
    actions,
    selected,
    onSelect,
    onEdit,
    onDelete,
    onView,
    onGenerateReport, // إضافة الخاصية الجديدة
    customActions,
    buttons,
    t,
}) {
    const isDark = useSelector((state) => state.theme.darkMode === 'dark');
    const language = useSelector((state) => state.language.current);
    const [showActions, setShowActions] = useState(false);
    const actionsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionsRef.current && !actionsRef.current.contains(event.target)) {
                setShowActions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const renderActions = () => {
        const actionItems = [];

        if (customActions) {
            actionItems.push(
                <button
                    key="custom"
                    onClick={() => {
                        customActions(row);
                        setShowActions(false);
                    }}
                    className={`block w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-sm ${isDark ? 'hover:bg-DarkBG3 text-TextLight' : 'hover:bg-LightBG3 text-TextDark'}`}
                >
                    {t['mark_attendance'] || 'Mark Attendance'}
                </button>
            );
        }

        if (onView) {
            actionItems.push(
                <button
                    key="view"
                    onClick={() => {
                        onView(row);
                        setShowActions(false);
                    }}
                    className={`block w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-sm ${isDark ? 'hover:bg-DarkBG3 text-TextLight' : 'hover:bg-LightBG3 text-TextDark'}`}
                >
                    {t['view'] || 'View'}
                </button>
            );
        }

        if (onEdit) {
            actionItems.push(
                <button
                    key="edit"
                    onClick={() => {
                        onEdit(row);
                        setShowActions(false);
                    }}
                    className={`block w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-sm ${isDark ? 'hover:bg-DarkBG3 text-TextLight' : 'hover:bg-LightBG3 text-TextDark'}`}
                >
                    {t['edit'] || 'Edit'}
                </button>
            );
        }

        if (onDelete) {
            actionItems.push(
                <button
                    key="delete"
                    onClick={() => {
                        onDelete(row);
                        setShowActions(false);
                    }}
                    className={`block w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-sm text-red-500 ${isDark ? 'hover:bg-DarkBG3' : 'hover:bg-LightBG3'}`}
                >
                    {t['delete'] || 'Delete'}
                </button>
            );
        }

        if (onGenerateReport) {
            actionItems.push(
                <button
                    key="generate_report"
                    onClick={() => {
                        onGenerateReport(row);
                        setShowActions(false);
                    }}
                    className={`block w-full ${language === 'en' ? 'text-left' : 'text-right'} px-4 py-2 text-sm text-green-600 ${isDark ? 'hover:bg-DarkBG3' : 'hover:bg-LightBG3'}`}
                >
                    {t['generate_report'] || 'Generate Report'}
                </button>
            );
        }

        return actionItems.length > 0 ? (
            <div
                className={`absolute ${language === 'en' ? 'right-6' : 'left-6'} mt-2 w-36 rounded-md shadow-lg ring-1 ring-opacity-5 z-50 ${isDark ? 'bg-DarkBG1 ring-LightBG3' : 'bg-LightBG1 ring-LightBG3'}`}
                ref={actionsRef}
            >
                <div className="py-1">{actionItems}</div>
            </div>
        ) : null;
    };

    return (
        <tr
            className={`${selected
                ? isDark
                    ? `m-2 bg-DarkBG3 border-primaryColor ${language === 'en' ? 'border-l-2' : 'border-r-2'}`
                    : `bg-LightBG2 border-primaryColor ${language === 'en' ? 'border-l-2' : 'border-r-2'}`
                : ''
                } ${isDark ? 'text-TextLight hover:bg-DarkBG3' : 'text-TextDark hover:bg-LightBG3'} transition-colors`}
        >
            {selectable && (
                <td className="relative px-6 py-4 sm:px-2 sm:py-2">
                    <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-DarkBG3 text-primaryColor focus:ring-primaryColor"
                        checked={selected}
                        onChange={onSelect}
                    />
                </td>
            )}
            {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm sm:px-2 sm:py-1 max-sm:text-[14px]">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
            ))}
            <div className="flex justify-between items-start flex-wrap">
                {buttons &&
                    buttons.map((button, index) =>
                        button.show && button.show(row) && (
                            <button
                                key={index}
                                onClick={() => button.onClick(row)}
                                className={`m-1 px-2 py-2 flex ${button.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${button.bgColor} border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:${button.hoverColor} focus:outline-none focus:ring-2 focus:${button.ringColor} focus:ring-offset-2 transition ease-in-out duration-150`}
                            >
                                {button.icon}
                                {button.label}
                            </button>
                        )
                    )}
            </div>
            {(actions || customActions) && (
                <td
                    className={`px-6 py-2 ${language === 'en' ? 'text-right' : 'text-left'} whitespace-nowrap text-sm font-medium`}
                >
                    <div className="relative" ref={actionsRef}>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowActions((prev) => !prev);
                            }}
                            className={`p-1 rounded-full ${isDark ? 'hover:bg-DarkBG2' : 'hover:bg-LightBG2'} ${showActions ? (isDark ? 'bg-DarkBG2' : 'bg-LightBG2') : ''}`}
                        >
                            <EllipsisVerticalIcon className="h-5 w-5 text-IconColor" />
                        </button>
                        {showActions && renderActions()}
                    </div>
                </td>
            )}
        </tr>
    );
}