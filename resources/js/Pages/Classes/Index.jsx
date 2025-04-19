import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useSelector } from "react-redux";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import DataTable from '@/Components/DataTable/DataTable';
import { translations } from '@translations';
import PrimaryButton from '@/Components/PrimaryButton';
import { router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ClassesPage({ auth, classes }) {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [expandedTeachers, setExpandedTeachers] = useState({});

    const breadcrumbItems = [
        { label: t['classroom_management'], href: '/admin/dashboard/classes' },
        { label: t['list'] }
    ];

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

    const tableData = classes.data.map(classItem => {
        const teacherNames = classItem.teacher_names ? classItem.teacher_names.split(',').map(name => name.trim()) : [];
        const shortenedNames = teacherNames.map(name => shortenTeacherName(name)).join(', ');
        const fullNames = classItem.teacher_names || '-';

        return {
            id: classItem.id,
            class_name: classItem.name,
            section: classItem.section,
            teacher_names_short: shortenedNames || '-',
            teacher_names_full: fullNames,
            students_count: classItem.students_count ? classItem.students_count : '0',
        };
    });

    const toggleTeacherNames = (classId) => {
        setExpandedTeachers(prev => ({
            ...prev,
            [classId]: !prev[classId],
        }));
    };

    const handleEdit = (row) => {
        router.get(`/admin/dashboard/classes/${row.id}/edit`);
    };

    const handleDelete = (row) => {
        setSelectedClass(row);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(`/admin/dashboard/classes/${selectedClass.id}`, {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedClass(null);
            }
        });
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setSelectedClass(null);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t['classes']} />
            <div className="flex" style={{ height: "calc(100vh - 66px)" }}>
                <main className="flex-1 overflow-y-auto">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-14">
                            <Breadcrumb items={breadcrumbItems} />
                            <div className="flex justify-between items-center mt-3">
                                <h1 className={`text-2xl sm:text-3xl mt-3 font-bold text-primaryColor`}>
                                    {t['classes']}
                                </h1>
                                <div className="flex gap-2">
                                    <PrimaryButton children={t['add_class']} link="/admin/dashboard/classes/add-new-class" />
                                </div>
                            </div>
                        </div>
                        <div className="mx-auto px-4 sm:px-6 md:px-8 mt-6">
                            <DataTable
                                columns={columns}
                                data={tableData}
                                searchable={true}
                                filterable={false}
                                selectable={false}
                                actions={true}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                pagination={{
                                    current_page: classes.current_page,
                                    last_page: classes.last_page,
                                    per_page: classes.per_page,
                                    total: classes.total,
                                    links: classes.links,
                                }}
                            />
                        </div>
                    </div>
                </main>
            </div>

            <Modal show={showDeleteModal} onClose={cancelDelete}>
                <div className="p-6">
                    <h2 className={`text-lg font-medium ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>
                        {t['confirm_delete']}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        {t['delete_class_confirmation']}
                    </p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={cancelDelete} className='mx-2 bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'>
                            {t['cancel']}
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                            {t['delete']}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}