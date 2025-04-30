import React, { useState } from 'react';
import { useSelector } from "react-redux";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import DataTable from '@/Components/DataTable/DataTable';
import { translations } from '@translations';
import { Head } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import { router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function AttendancePage({ auth, classes }) {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];

    const [showDateModal, setShowDateModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const breadcrumbItems = [
        { label: t['attendance'], href: '/admin/dashboard/attendance' },
        { label: t['list'] }
    ];

    const columns = [
        { key: 'class_name', label: t['class_name'], sortable: true },
        { key: 'students_count', label: t['numbers_of_students'], sortable: true },
        { key: 'section', label: t['section'], sortable: true },
        {
            key: 'has_attendance_today',
            label: t['attendance_today'],
            sortable: false,
            render: (value) => (
                <span
                    className={`inline-flex items-center px-2.5 py-1 gap-1 rounded-full text-xs font-medium transition-colors duration-200 ${value
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                >
                    {value ? (
                        <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    )}
                    {value ? t['taken'] : t['not_taken']}
                </span>
            )
        },
    ];

    const tableData = classes.map(classItem => ({
        id: classItem.id,
        class_name: classItem.class_name,
        students_count: classItem.students_count,
        section: classItem.section,
        has_attendance_today: classItem.has_attendance_today,
    }));

    const handleAttendance = (row) => {
        setSelectedClass(row);
        setShowDateModal(true);
    };

    const handleVeiw = (row) => {
        setSelectedClass(row);
        setShowViewModal(true);
    };

    const handleExport = (row) => {
        setSelectedClass(row);
        setShowExportModal(true);
    };

    const handleDateSubmit = () => {
        if (!selectedClass || !attendanceDate) return;
        router.visit(`/admin/dashboard/attendance/${selectedClass.id}/attendance?date=${attendanceDate}`);
        setShowDateModal(false);
        setAttendanceDate('');
    };

    const handleViewSubmit = () => {
        if (!selectedClass || !attendanceDate) return;
        router.visit(`/admin/dashboard/attendance/${selectedClass.id}/view?date=${attendanceDate}`);
        setShowViewModal(false);
        setAttendanceDate('');
    };

    const handleExportSubmit = () => {
        if (!selectedClass) {
            toast.error(t['class_required'], { position: "top-right", autoClose: 3000 });
            return;
        }
        const dateToExport = attendanceDate || new Date().toISOString().split('T')[0];
        window.location.href = `/admin/dashboard/attendance/${selectedClass.id}/export?date=${dateToExport}`;
        setShowExportModal(false);
        setAttendanceDate('');
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t['attendance']} />
            <div className="flex" style={{ height: "calc(100vh - 66px)" }}>
                <main className="flex-1 overflow-y-auto">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-14">
                            <Breadcrumb items={breadcrumbItems} />
                            <div className='flex justify-between items-center'>
                                <h1 className={`text-2xl sm:text-3xl mt-3 font-bold text-primaryColor`}>
                                    {t['attendance']}
                                </h1>
                            </div>
                        </div>
                        <div className="mx-auto px-4 sm:px-6 md:px-8 mt-6">
                            <DataTable
                                columns={columns}
                                data={tableData}
                                searchable={true}
                                filterable={false}
                                selectable={false}
                                actions={false}
                                buttons={[
                                    {
                                        label: t['veiw'],
                                        onClick: handleVeiw,
                                        bgColor: 'bg-blue-500',
                                        hoverColor: 'hover:bg-green-600',
                                        ringColor: 'ring-blue-500',
                                        show: (row) => row,
                                    },
                                    {
                                        label: t['mark_attendance'],
                                        onClick: handleAttendance,
                                        bgColor: 'bg-primaryColor',
                                        hoverColor: 'hover:bg-blue-600',
                                        ringColor: 'bg-primaryColor',
                                        show: (row) => row,
                                    },
                                    {
                                        label: t['export'],
                                        onClick: handleExport,
                                        bgColor: 'bg-green-500',
                                        hoverColor: 'hover:bg-green-600',
                                        ringColor: 'ring-green-500',
                                        show: (row) => row,
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </main>
            </div>

            <Modal show={showExportModal} onClose={() => setShowExportModal(false)}>
                <div className="p-6">
                    <InputLabel value={t['enter_attendance_date_to_export']} />
                    <TextInput
                        type="date"
                        value={attendanceDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="mt-2 p-2 border border-gray-300 rounded w-full"
                    />
                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setShowExportModal(false)} className='mx-2 !bg-gray-600 rounded-md hover:!bg-gray-700 focus:!bg-gray-700 text-white focus:!ring-gray-500'>
                            {t['cancel']}
                        </SecondaryButton>
                        <PrimaryButton onClick={handleExportSubmit} className="!bg-blue-600 rounded-md hover:!bg-blue-700 focus:!bg-blue-700 focus:!ring-blue-500">
                            {t['export_to_Excel']}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            <Modal show={showDateModal} onClose={() => setShowDateModal(false)}>
                <div className="p-6">
                    <InputLabel value={t['enter_attendance_date']} />
                    <TextInput
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="mt-2 p-2 border border-gray-300 rounded w-full"
                    />
                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setShowDateModal(false)} className='mx-2 !bg-gray-600 rounded-md hover:!bg-gray-700 focus:!bg-gray-700 text-white focus:!ring-gray-500'>
                            {t['cancel']}
                        </SecondaryButton>
                        <PrimaryButton onClick={handleDateSubmit} className="!bg-blue-600 rounded-md hover:!bg-blue-700 focus:!bg-blue-700 focus:!ring-blue-500">
                            {t['next']}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            <Modal show={showViewModal} onClose={() => setShowViewModal(false)}>
                <div className="p-6">
                    <InputLabel value={t['enter_attendance_date']} />
                    <TextInput
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="mt-2 p-2 border border-gray-300 rounded w-full"
                    />
                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setShowViewModal(false)} className='mx-2 !bg-gray-600 rounded-md hover:!bg-gray-700 focus:!bg-gray-700 text-white focus:!ring-gray-500'>
                            {t['cancel']}
                        </SecondaryButton>
                        <PrimaryButton onClick={handleViewSubmit} className="!bg-blue-600 rounded-md hover:!bg-blue-700 focus:!bg-blue-700 focus:!ring-blue-500">
                            {t['veiw']}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}