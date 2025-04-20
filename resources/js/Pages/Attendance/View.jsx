import React from 'react';
import { useSelector } from "react-redux";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import DataTable from '@/Components/DataTable/DataTable';
import { translations } from '@translations';
import { Head } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import { router } from '@inertiajs/react';
import { getStatusMessage } from '@/utils/messageTemplates';
import { MessageCircleReply } from 'lucide-react';
import moment from 'moment';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AttendanceViewPage({ auth, classroom, attendance, date }) {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];
    const [sendingStatus, setSendingStatus] = React.useState({});

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

    const columns = [
        { key: 'student_name', label: t.student_name, sortable: true },
        { key: 'status', label: t.attendance_status, sortable: true },
        { key: 'notes', label: t.notes, sortable: false },
        { key: 'parent_whatsapp', label: t.parent_whatsapp, sortable: false },
    ];

    const getStatusClass = (status) => {
        switch (status) {
            case 'present':
                return 'bg-green-500 text-white';
            case 'late':
                return 'bg-yellow-500 text-white';
            case 'absent':
                return 'bg-red-500 text-white';
            case 'not_taken':
                return 'bg-gray-400 text-white';
            default:
                return '';
        }
    };

    const handleDateSubmit = () => {
        router.visit(`/admin/dashboard/attendance/${classroom.id}/attendance?date=${formattedDate}`);
    };

    const handleExportSubmit = () => {
        window.location.href = `/admin/dashboard/attendance/${classroom.id}/export?date=${formattedDate}`;
    };

    const tableData = attendance.map(record => ({
        id: record.student_id,
        student_name: record.student_name || t.unknown_student,
        status: (
            <span className={`px-2 py-1 rounded ${getStatusClass(record.status)}`}>
                {record.status === 'not_taken' ? t.attendance_not_taken : t[record.status]}
            </span>
        ),
        notes: record.notes || '-',
        parent_whatsapp: record.parent_whatsapp || '',
    }));
    const sortedTableData = [...tableData].sort((a, b) =>
        a.student_name.localeCompare(b.student_name, 'ar')
    );
    const breadcrumbItems = [
        { label: t.attendance, href: '/admin/dashboard/attendance' },
        { label: classroom.name + ' / ' + classroom.path + ' / ' + 'شعبة ' + classroom.section_number },
    ];

    const generateAndSendBehavioralReport = async (studentId) => {
        try {
            setSendingStatus(prev => ({ ...prev, [studentId]: true }));
            const response = await axios.get(`/admin/dashboard/attendance/generate-and-send-behavioral-report/${studentId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                timeout: 20000
            });

            if (response.data.status) {
                toast.success(response.data.message || 'تم إنشاء التقرير وإرساله بنجاح');
            } else {
                throw new Error(response.data.message || 'فشل في إنشاء التقرير وإرساله');
            }
        } catch (error) {
            let errorMsg = 'حدث خطأ غير متوقع';
            if (error.response) {
                errorMsg = error.response.data.message ||
                    (error.response.data.error ? JSON.stringify(error.response.data.error) : errorMsg);
            } else if (error.message) {
                errorMsg = error.message;
            }
            toast.error(`حدث خطأ: ${errorMsg}`);
            console.error('Error details:', error);
        } finally {
            setSendingStatus(prev => ({ ...prev, [studentId]: false }));
        }
    };

    const sendNotification = async (row) => {
        if (!row.parent_whatsapp) {
            toast.error('لا يوجد رقم هاتف مسجل لولي الأمر');
            return;
        }

        let phone = row.parent_whatsapp.trim();

        if (phone.startsWith('0')) {
            phone = '970' + phone.substring(1);
        } else if (!phone.startsWith('+') && !phone.startsWith('00') && !phone.startsWith('970')) {
            if (/^(5|59)/.test(phone)) {
                phone = `970${phone}`;
            }
        }

        const statusText = React.Children.toArray(row.status.props.children).join(' ');
        const message = getStatusMessage(statusText, row.student_name, formattedDate, row.notes);

        try {
            setSendingStatus(prev => ({ ...prev, [row.id]: true }));

            const response = await axios.post('/admin/dashboard/attendance/send-whatsapp-notification', {
                phone: phone,
                message: message
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                timeout: 10000
            });

            if (response.data.status) {
                toast.success('تم إرسال التنبيه بنجاح');
            } else {
                throw new Error(response.data.message || 'فشل في إرسال التنبيه');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message ||
                error.message ||
                'حدث خطأ غير متوقع أثناء الإرسال';
            toast.error(`حدث خطأ أثناء إرسال التنبيه: ${errorMsg}`);
            console.error('Error details:', error);
        } finally {
            setSendingStatus(prev => ({ ...prev, [row.id]: false }));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${dayName} - ${formattedDate}`} />
            <ToastContainer />
            <div className="flex" style={{ height: "calc(100vh - 66px)" }}>
                <main className="flex-1 overflow-y-auto">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-14">
                            <Breadcrumb items={breadcrumbItems} />
                            <div className='flex justify-between gap-2 px-4'>
                                <h1 className={`text-2xl sm:text-3xl mt-3 font-bold ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>
                                    {`${dayName} (${formattedDate})`}
                                </h1>
                                <div className='flex gap-3'>
                                    <PrimaryButton
                                        className="mt-4 !bg-green-500 text-white px-4 py-2 rounded !ring-green-500"
                                        onClick={handleExportSubmit}
                                    >
                                        {t.export_to_Excel}
                                    </PrimaryButton>
                                    <PrimaryButton
                                        className="mt-4 text-white px-4 py-2 rounded"
                                        onClick={handleDateSubmit}
                                    >
                                        {t.edit_attendance}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </div>
                        <div className="mx-auto px-4 sm:px-6 md:px-14 mt-6">
                            <DataTable
                                columns={columns}
                                data={sortedTableData}
                                searchable={false}
                                filterable={false}
                                selectable={false}
                                actions={false}
                                buttons={[
                                    {
                                        label: t['send_whatsapp'],
                                        onClick: (row) => sendNotification(row),
                                        icon: <MessageCircleReply className="w-4 h-4 mx-1" />,
                                        bgColor: 'bg-green-500',
                                        hoverColor: 'bg-green-500',
                                        ringColor: 'ring-green-500',
                                        show: (row) => ![t.attendance_not_taken, t.present].includes(row.status.props.children),
                                        loading: (row) => sendingStatus[row.id],
                                    },
                                    // {
                                    //     label: t['generate_and_send_report'],
                                    //     onClick: (row) => generateAndSendBehavioralReport(row.id),
                                    //     bgColor: 'bg-blue-500',
                                    //     hoverColor: 'bg-blue-500',
                                    //     ringColor: 'ring-blue-500',
                                    //     show: (row) => true,
                                    //     loading: (row) => sendingStatus[row.id],
                                    //     disabled: (row) => sendingStatus[row.id],
                                    // }
                                ]}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}