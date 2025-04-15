import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useSelector } from "react-redux";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import DataTable from '@/Components/DataTable/DataTable';
import { translations } from '@translations';
import { router } from '@inertiajs/react';

export default function TeacherStudentsPage({ auth, classes, pagination }) {
    const [expandedTeachers, setExpandedTeachers] = useState({});

    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];

    const breadcrumbItems = [
        { label: t['student_management'], href: '/teacher/dashboard/students' },
        { label: t['classes'], href: '/teacher/dashboard/students' },
        { label: t['list'] }
    ];

    const columns = [
        { key: 'class_name', label: t['class_name'], sortable: true },
        { key: 'section', label: t['section'], sortable: true },
        { key: 'students_count', label: t['numbers_of_students'], sortable: true },
        {
            key: 'teacher_name',
            label: t['teachers'],
            sortable: true,
            render: (value, row) => {
                const isExpanded = expandedTeachers[row.id];
                const displayText = isExpanded ? row.teacher_name_full : row.teacher_name_short;

                return (
                    <span
                        onClick={() => toggleTeacherNames(row.id)}
                        className="cursor-pointer text-blue-500 hover:underline"
                    >
                        {displayText}
                    </span>
                );
            },
        },
    ];

    const shortenTeacherName = (teacherName) => {
        const names = teacherName.trim().split(' ');
        if (names.length < 2) {
            return teacherName;
        }
        const firstName = names[0];
        const secondName = names[1].substring(0, 4);
        return `${firstName} ${secondName}..`;
    };

    const tableData = classes.map(classItem => {
        const teacherNames = classItem.teacher_name ? classItem.teacher_name.split(',').map(name => name.trim()) : [];
        const shortenedNames = teacherNames.map(name => shortenTeacherName(name)).join(', ');
        const fullNames = classItem.teacher_name || '-';

        return {
            id: classItem.id,
            section: classItem.section,
            class_name: classItem.class_name,
            students_count: classItem.students_count,
            teacher_name_short: shortenedNames || '-',
            teacher_name_full: fullNames,
        };
    });

    const toggleTeacherNames = (classId) => {
        setExpandedTeachers(prev => ({
            ...prev,
            [classId]: !prev[classId],
        }));
    };

    const handleView = (row) => {
        router.visit(`/teacher/dashboard/students/${row.id}/view`);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t['student_management']} />
            <div className="flex" style={{ height: "calc(100vh - 66px)" }}>
                <main className="flex-1 overflow-y-auto">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-14">
                            <Breadcrumb items={breadcrumbItems} />
                            <div className='flex justify-between items-center'>
                                <h1 className="text-2xl sm:text-3xl  mt-3 font-bold text-primaryColor">
                                    {t['classes']}
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
                                        onClick: handleView,
                                        bgColor: 'bg-blue-500',
                                        hoverColor: 'hover:bg-green-600',
                                        ringColor: 'ring-blue-500',
                                        show: (row) => row,
                                    },
                                ]}
                                pagination={pagination}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}