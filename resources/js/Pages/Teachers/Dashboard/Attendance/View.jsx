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

export default function TeacherAttendanceViewPage({ auth, classroom, attendance, date }) {
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
        router.visit(`/teacher/dashboard/attendance/${classroom.id}/attendance?date=${formattedDate}`);
    };

    const handleExportSubmit = () => {
        window.location.href = `/teacher/dashboard/attendance/${classroom.id}/export?date=${formattedDate}`;
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

    const breadcrumbItems = [
        { label: t.attendance, href: '/teacher/dashboard/attendance' },
        { label: classroom.name },
    ];

    const generateWhatsAppLink = (row) => {
        const statusText = React.Children.toArray(row.status.props.children).join(' ');
        if (row.parent_whatsapp) {
            const message = getStatusMessage(statusText, row.student_name, formattedDate, row.notes); // استخدم statusText بدلاً من row.status
            return `https://api.whatsapp.com/send?phone=${row.parent_whatsapp}&text=${encodeURIComponent(message)}`;
        }
        return '#';
    };

    // const sendWhatsAppMessage = async (row) => {
    //     const statusText = React.Children.toArray(row.status.props.children).join(' ');
    //     const message = getStatusMessage(statusText, row.student_name, formattedDate, row.notes);

    //     if (row.parent_whatsapp) {
    //         try {
    //             const response = await axios.post('/teacher/send-whatsapp', {
    //                 to: row.parent_whatsapp,
    //                 message,
    //             }, {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //             });

    //             if (response.data.success) {
    //                 toast.success('تم إرسال الرسالة بنجاح!', {
    //                     position: "top-right",
    //                     autoClose: 3000,
    //                     hideProgressBar: false,
    //                     closeOnClick: true,
    //                     pauseOnHover: true,
    //                     draggable: true,
    //                 });
    //             } else {
    //                 throw new Error(response.data.message);
    //             }
    //         } catch (error) {
    //             toast.error('فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.', {
    //                 position: "top-right",
    //                 autoClose: 3000,
    //                 hideProgressBar: false,
    //                 closeOnClick: true,
    //                 pauseOnHover: true,
    //                 draggable: true,
    //             });
    //         }
    //     } else {
    //         toast.warning('لا يوجد رقم واتساب لولي الأمر.', {
    //             position: "top-right",
    //             autoClose: 3000,
    //             hideProgressBar: false,
    //             closeOnClick: true,
    //             pauseOnHover: true,
    //             draggable: true,
    //         });
    //     }
    // };

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
                                <h1 className="text-2xl sm:text-3xl  mt-3 font-bold text-primaryColor">
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
                                data={tableData}
                                searchable={false}
                                filterable={false}
                                selectable={false}
                                actions={false}
                                buttons={[{
                                    label: t['send_whatsapp'],
                                    onClick: (row) => {
                                        const url = generateWhatsAppLink(row);
                                        window.open(url, '_blank');
                                    },
                                    icon: <MessageCircleReply className="w-4 h-4 mx-1" />,
                                    bgColor: 'bg-green-500',
                                    hoverColor: 'bg-green-500',
                                    ringColor: 'ring-green-500',
                                    show: (row) => ![t.attendance_not_taken, t.present].includes(row.status.props.children),
                                }]}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}