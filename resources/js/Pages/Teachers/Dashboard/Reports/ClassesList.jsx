import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import DataTable from '@/Components/DataTable/DataTable';
import { translations } from '@translations';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import axios from 'axios';

export default function TeacherClassesList({ auth, classes }) {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language] || translations['en'];
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);
    const [expandedTeachers, setExpandedTeachers] = useState({});

    const breadcrumbItems = [
        { label: t['reports'] || 'Reports', href: '/teacher/dashboard/reports' },
        { label: t['classes'] || 'Classes' },
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

    const columns = [
        { key: 'class_name', label: t['class_name'] || 'Class Name', sortable: true },
        { key: 'section', label: t['section'] || 'Section', sortable: true },
        { key: 'students_count', label: t['numbers_of_students'] || 'Number of Students', sortable: true },
        {
            key: 'teacher_name',
            label: t['teacher_name'] || 'Teacher',
            sortable: true,
            render: (value, row) => {
                const isExpanded = expandedTeachers[row.id];
                const teacherNames = row.teacher_name.split(',').map(name => name.trim());
                const shortenedNames = teacherNames.map(name => shortenTeacherName(name)).join(', ');
                const fullNames = row.teacher_name || '-';

                const displayText = isExpanded ? fullNames : shortenedNames;

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

    const tableData = classes.map(classItem => {
        const teacherNames = classItem.teacher_name || '-';
        const teacherNamesArray = teacherNames.split(',').map(name => name.trim());
        const shortenedNames = teacherNamesArray.map(name => shortenTeacherName(name)).join(', ');

        return {
            id: classItem.id,
            class_name: classItem.class_name,
            section: classItem.section,
            students_count: classItem.students_count,
            teacher_name: teacherNames,
        };
    });

    const toggleTeacherNames = (classId) => {
        setExpandedTeachers(prev => ({
            ...prev,
            [classId]: !prev[classId],
        }));
    };

    const handleView = (row) => {
        router.get(`/teacher/dashboard/reports/students/${row.id}`);
    };

    const handleSearch = async () => {
        if (!searchQuery) {
            setError(t['enter_search_query'] || 'Please enter a search query');
            return;
        }

        try {
            setError(null);
            const response = await axios.get('/teacher/dashboard/students/search', {
                params: { query: searchQuery }
            });

            if (response.data.class_id) {
                router.visit(`/teacher/dashboard/reports/students/${response.data.class_id}?query=${encodeURIComponent(searchQuery)}`);
            } else {
                setError(t['student_not_found'] || 'Student not found');
            }
        } catch (error) {
            setError(t['search_error'] || 'An error occurred during search');
            console.error('Search error:', error);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t['reports'] || 'Reports'} />
            <div className="flex" style={{ height: "calc(100vh - 66px)" }}>
                <main className="flex-1 overflow-y-auto">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-14">
                            <Breadcrumb items={breadcrumbItems} />
                            <h1 className="text-2xl sm:text-3xl mt-3 font-bold text-primaryColor">
                                {t['classes'] || 'Classes'}
                            </h1>
                        </div>
                        <div className="mx-auto px-4 sm:px-6 md:px-8 mt-4">
                            <div className="flex items-center mx-1 sm:mx-4">
                                <div className='w-[100%] md:w-[33%]'>
                                    <p className={`my-2 text-sm ${isDark ? 'text-TextLight' : 'text-gray-600'}`}>
                                        {t['search_student'] || 'Search for a student'}
                                    </p>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 ${isDark ? 'bg-DarkBG3 text-TextLight border-DarkBG2 focus:ring-blue-500 focus:border-blue-500' : 'bg-white text-TextDark border-gray-300 focus:ring-blue-500 focus:border-blue-500'} focus:outline-none sm:text-sm`}
                                            placeholder={t['search'] || 'Search'}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <button onClick={handleSearch} className={`${isDark ? 'text-TextLight' : 'text-gray-400'} hover:text-gray-500`}>
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
                                buttons={[
                                    {
                                        label: t['view'] || 'View',
                                        onClick: handleView,
                                        bgColor: 'bg-blue-500',
                                        hoverColor: 'hover:bg-blue-600',
                                        ringColor: 'ring-blue-500',
                                        show: (row) => row,
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}