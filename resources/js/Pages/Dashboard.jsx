import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import {
    PresentationChartBarIcon,
    UsersIcon,
    RectangleStackIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { translations } from '@translations';
import AttendanceReport from '@/Components/Reports/AttendanceReport';

export default function Dashboard({ auth }) {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const [students_count, setStudentsCount] = useState(0);
    const [teachers_count, setTeachersCount] = useState(0);
    const [classes_count, setClassesCount] = useState(0);
    const [total_student_attendance, setTotalStudentAttendanceCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const t = translations[language];
    const handleExport = (format) => {
        console.log(`Exporting report as ${format}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/admin/dashboard/attendance/attendance-statistics');
                setStudentsCount(response.data.students_count);
                setTeachersCount(response.data.teachers_count);
                setClassesCount(response.data.classes_count);
                setTotalStudentAttendanceCount(response.data.total_student_attendance);
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title={t['dashboard']} />
            <div className="flex h-screen">
                <div className="py-2 w-full">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 max-sm:px-2">
                        <div className="grid grid-cols-1 gap-6 mb-6 p-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-wrap">
                                <div className={`${isDark ? 'bg-DarkBG3 text-TextLight' : 'bg-LightBG1 text-TextDark'} flex space-between gap-4 p-4 shadow rounded border-default`}>
                                    <div className="w-[100%]">
                                        <h3 className="text-md font-semibold">{t['students']}</h3>
                                        <p className="text-xl">{students_count}</p>
                                    </div>
                                    <UsersIcon
                                        className={`${language === 'en' ? 'mr-3' : 'ml-3'} h-6 w-6 `}
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className={`${isDark ? 'bg-DarkBG3 text-TextLight' : 'bg-LightBG1 text-TextDark'} flex space-between gap-4 p-4 shadow rounded border-default`}>
                                    <div className="w-[100%]">
                                        <h3 className="text-lg font-semibold">{t['classes']}</h3>
                                        <p className="text-xl">{classes_count}</p>
                                    </div>
                                    <RectangleStackIcon
                                        className={`${language === 'en' ? 'mr-3' : 'ml-3'} h-6 w-6 `}
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className={`${isDark ? 'bg-DarkBG3 text-TextLight' : 'bg-LightBG1 text-TextDark'} flex space-between gap-4 p-4 shadow rounded border-default`}>
                                    <div className="w-[100%]">
                                        <h3 className="text-md font-semibold">{t['teachers']}</h3>
                                        <p className="text-xl">{teachers_count}</p>
                                    </div>
                                    <PresentationChartBarIcon
                                        className={`${language === 'en' ? 'mr-3' : 'ml-3'} h-6 w-6 `}
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className={`${isDark ? 'bg-DarkBG3 text-TextLight' : 'bg-LightBG1 text-TextDark'} flex space-between gap-4 p-4 shadow rounded border-default`}>
                                    <div className="w-[100%]">
                                        <h3 className="text-md font-semibold">{t['total_student_attendance']}</h3>
                                        <p className="text-xl">{total_student_attendance}</p>
                                    </div>
                                    <CalendarDaysIcon
                                        className={`${language === 'en' ? 'mr-3' : 'ml-3'} h-6 w-6 `}
                                        aria-hidden="true"
                                    />
                                </div>
                            </div>
                            <AttendanceReport onExport={handleExport} role={auth.user.role} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
