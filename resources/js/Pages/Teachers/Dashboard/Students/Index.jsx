import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useSelector } from "react-redux";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import DataTable from '@/Components/DataTable/DataTable';
import { translations } from '@translations';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

export default function TeacherStudentsPage({ auth, classes, pagination }) {
    const [expandedTeachers, setExpandedTeachers] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);

    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];

    const breadcrumbItems = [
        { label: t['student_management'], href: '/teacher/dashboard/students' },
        { label: t['classes'], href: '/teacher/dashboard/students' },
        { label: t['list'] }
    ];

    const shortenTeacherName = (teacherName) => {
        const names = teacherName.trim().split(' ');
        if (names.length < 2) return teacherName;
        return `${names[0]} ${names[1].substring(0, 4)}..`;
    };

    const toggleTeacherNames = (classId) => {
        setExpandedTeachers(prev => ({
            ...prev,
            [classId]: !prev[classId]
        }));
    };

    const columns = [
        { key: 'class_name', label: t['class_name'], sortable: true },
        { key: 'section', label: t['section'], sortable: true },
        { key: 'students_count', label: t['numbers_of_students'], sortable: true },
        {
            key: 'teacher_names',
            label: t['teachers'],
            sortable: true,
            render: (value, row) => {
                const isExpanded = expandedTeachers[row.id];
                const displayText = isExpanded ? row.teacher_names_full : row.teacher_names_short;

                return (
                    <span
                        onClick={() => toggleTeacherNames(row.id)}
                        className="cursor-pointer text-blue-500 hover:underline"
                    >
                        {displayText}
                    </span>
                );
            }
        },
    ];

    const tableData = classes.map(classItem => {
        const teacherNames = classItem.teacher_name?.split(',').map(n => n.trim()) || [];
        const shortenedNames = teacherNames.map(shortenTeacherName).join(', ');
        const fullNames = teacherNames.join(', ') || '-';

        return {
            id: classItem.id,
            section: classItem.section,
            class_name: classItem.class_name,
            students_count: classItem.students_count,
            teacher_names_short: shortenedNames,
            teacher_names_full: fullNames
        };
    });

    const handleView = (row) => {
        router.visit(`/teacher/dashboard/students/${row.id}/view`);
    };

    const handleSearch = async () => {
        if (!searchQuery) return;

        try {
            const response = await axios.get('/teacher/dashboard/students/search', {
                params: { query: searchQuery }
            });

            if (response.data.class_id) {
                router.visit(`/teacher/dashboard/students/${response.data.class_id}/view?query=${encodeURIComponent(searchQuery)}`);
            } else {
                setError(t['student_not_found'] || 'Student not found');
            }
        } catch (error) {
            setError(t['search_error']);
            console.error('Search error:', error);
        }
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
                                <h1 className="text-2xl sm:text-3xl mt-3 font-bold text-primaryColor">
                                    {t['classes']}
                                </h1>
                            </div>
                        </div>
                        <div className="mx-auto px-4 sm:px-6 md:px-8 mt-4">
                            <div className="flex items-center mx-1 sm:mx-4">
                                <div className='w-[100%] md:w-[33%]'>
                                    <p className="my-2 text-sm text-gray-600">
                                        {t['search_student']}
                                    </p>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="block w-full pl-10 pr-3 py-2 border rounded-md leading-5 bg-white border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder={t['search']}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <button onClick={handleSearch} className="text-gray-400 hover:text-gray-500">
                                                <MagnifyingGlassIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                                </div>
                            </div>
                            <DataTable
                                columns={columns}
                                data={tableData}
                                searchable={true}
                                filterable={false}
                                selectable={false}
                                actions={false}
                                buttons={[{
                                    label: t['veiw'],
                                    onClick: handleView,
                                    bgColor: 'bg-blue-500',
                                    hoverColor: 'hover:bg-blue-600',
                                    ringColor: 'ring-blue-500',
                                    show: (row) => !!row,
                                }]}
                                pagination={pagination}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}