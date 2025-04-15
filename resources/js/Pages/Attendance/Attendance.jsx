import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from "react-redux";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import DataTable from '@/Components/DataTable/DataTable';
import AttendanceHeader from '@/Components/Attendance/AttendanceHeader';
import AttendanceButtons from '@/Components/Attendance/AttendanceButtons';
import Modal from '@/Components/Modal';
import useAttendance from '@/hooks/useAttendance';
import { translations } from '@translations';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import moment from 'moment';

export default function AttendancePage({ auth, classroom, students, classId, date }) {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];
    const dayNames = {
        Sunday: t["Sunday"],
        Monday: t["Monday"],
        Tuesday: t["Tuesday"],
        Wednesday: t["Wednesday"],
        Thursday: t["Thursday"],
        Friday: t["Friday"],
        Saturday: t["Saturday"],
    };

    const formattedDate = moment(date).format("YYYY-MM-DD");
    const dayName = dayNames[moment(date).format("dddd")];
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { attendance, handleAttendanceChange, resetAttendance, fetchAttendance, pleaseFillAllAttendance } = useAttendance(students, `/admin/dashboard/attendance/${classroom.id}/view?date=${date}`);

    useEffect(() => {
        fetchAttendance().catch((error) => {
            console.error("Error fetching attendance:", error);
            toast.error("فشل في جلب بيانات الحضور.", {
                position: "top-right",
                autoClose: 3000,
            });
        });
    }, []);

    const handleSubmit = async () => {
        if (!pleaseFillAllAttendance()) {
            setError(t.please_fill_all_attendance);
            setShowModal(true);
            return;
        }

        setError(null);
        setShowModal(true);
    };

    const confirmSave = async () => {
        try {
            setIsSubmitting(true);

            if (!date || isNaN(new Date(date))) {
                toast.error("التاريخ المقدم غير صالح!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            const response = await axios.post(`/admin/dashboard/attendance/${classroom.id}/attendance`, {
                attendance,
                date: date,
            });

            if (response.data.message) {
                setShowModal(false);
                toast.success("تم حفظ الحضور بنجاح!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
            router.visit(`/admin/dashboard/attendance/${classId}/view?date=${date}`);
        } catch (error) {
            console.error("Error saving attendance:", error);
            toast.error(
                error.response?.data?.message || "فشل في حفظ الحضور",
                {
                    position: "top-right",
                    autoClose: 3000,
                }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        { key: 'student_name', label: t.student_name, sortable: false },
        {
            key: 'attendance_status',
            label: t.attendance_status,
            render: (_, row) => (
                <AttendanceButtons
                    studentId={row.id}
                    currentStatus={attendance[row.id]}
                    onChange={handleAttendanceChange}
                    translations={t}
                />
            ),
        },
    ];

    const tableData = students.map(student => ({
        id: student.id,
        student_name: student.name,
        attendance_status: attendance[student.id],
    }));

    const breadcrumbItems = [
        { label: t.attendance, href: '/admin/dashboard/attendance' },
        { label: classroom.name + ' / ' + classroom.path + ' / ' + 'شعبة ' + classroom.section_number },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${dayName} (${formattedDate})`} />
            <div className="flex" style={{ height: "calc(100vh - 66px)" }}>
                <main className="flex-1 overflow-y-auto">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-14">
                            <Breadcrumb items={breadcrumbItems} />
                            <AttendanceHeader
                                title={`${dayName} (${formattedDate})`}
                                onReset={resetAttendance}
                                onSave={handleSubmit}
                                translations={t}
                                isDark={isDark}
                            />
                        </div>
                        <div className="mx-auto px-4 sm:px-6 md:px-14 mt-6">
                            <DataTable
                                columns={columns}
                                data={tableData}
                                selectable={false}
                                searchable={false}
                                filterable={false}
                                actions={false}
                            />
                        </div>
                    </div>
                </main>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6">
                    <h2 className={`text-lg font-medium ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>
                        {error ? t.error : t.confirm_save_attendance}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        {error || t.confirm_save_attendance_message}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            onClick={() => setShowModal(false)}
                            disabled={isSubmitting}
                        >
                            {t.cancel}
                        </button>
                        {!error && (
                            <button
                                type="button"
                                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={confirmSave}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t.saving : t.save}
                            </button>
                        )}
                    </div>
                </div>
            </Modal>

            <ToastContainer />
        </AuthenticatedLayout>
    );
}