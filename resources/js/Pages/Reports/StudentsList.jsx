import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import DataTable from '@/Components/DataTable/DataTable';
import { translations } from '@translations';

export default function StudentsList({ auth, classroom, students }) {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language] || translations['en'];
    const { props } = usePage();
    const searchQuery = props.query || '';

    const breadcrumbItems = [
        { label: t['reports'] || 'Reports', href: '/admin/dashboard/reports' },
        { label: classroom.name + ' / ' + classroom.path + ' / ' + (t['section'] || 'Section') + ' ' + classroom.section_number },
    ];

    const columns = [
        {
            key: 'student_name',
            label: t['student_name'] || 'Student Name',
            sortable: true,
            render: (value) => {
                if (!searchQuery) return value;
                const lowerValue = value.toLowerCase();
                const lowerQuery = searchQuery.toLowerCase();
                const index = lowerValue.indexOf(lowerQuery);
                if (index === -1) return value;
                const before = value.substring(0, index);
                const match = value.substring(index, index + searchQuery.length);
                const after = value.substring(index + searchQuery.length);
                return (
                    <span>
                        {before}
                        <span className={`${isDark ? 'bg-gray-600 text-TextLight' : 'bg-gray-500 text-white'} px-1 rounded`}>{match}</span>
                        {after}
                    </span>
                );
            }
        },
        {
            key: 'student_number',
            label: t['student_number'] || 'Student Number',
            sortable: true,
            render: (value) => {
                if (!searchQuery) return value;
                const lowerValue = value.toLowerCase();
                const lowerQuery = searchQuery.toLowerCase();
                const index = lowerValue.indexOf(lowerQuery);
                if (index === -1) return value;
                const before = value.substring(0, index);
                const match = value.substring(index, index + searchQuery.length);
                const after = value.substring(index + searchQuery.length);
                return (
                    <span>
                        {before}
                        <span className={`${isDark ? 'bg-gray-600 text-TextLight' : 'bg-gray-500 text-white'} px-1 rounded`}>{match}</span>
                        {after}
                    </span>
                );
            }
        },
    ];

    const tableData = students.map(student => ({
        id: student.id,
        student_name: student.name,
        student_number: student.student_number,
    }));

    const sortedTableData = [...tableData].sort((a, b) =>
        a.student_name.localeCompare(b.student_name, 'ar')
    );

    const handleGenerateReport = (row) => {
        router.get(`/admin/dashboard/reports/view?student_id=${row.id}`);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t['students'] || 'Students'} />
            <div className="flex" style={{ height: "calc(100vh - 66px)" }}>
                <main className="flex-1 overflow-y-auto">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-14">
                            <Breadcrumb items={breadcrumbItems} />
                            <h1 className="text-2xl sm:text-3xl mt-3 font-bold text-primaryColor">
                                {t['students'] || 'Students'}
                            </h1>
                        </div>
                        <div className="mx-auto px-4 sm:px-6 md:px-8 mt-6">
                            <DataTable
                                columns={columns}
                                data={sortedTableData}
                                searchable={true}
                                filterable={false}
                                selectable={false}
                                actions={false}
                                buttons={[
                                    {
                                        label: t['generate_report'] || 'Generate Report',
                                        onClick: handleGenerateReport,
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
        </AuthenticatedLayout>
    );
}