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

export default function StudentsViewPage({ auth, students, classes, classId }) {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];
    const classroom = classes.find(cls => cls.id);
    const breadcrumbItems = [
        { label: t['student_management'], href: '/admin/dashboard/students' },
        { label: classroom.name + ' / ' + classroom.path + ' / ' + 'شعبة ' + classroom.section_number },
    ];

    const columns = [
        { key: 'student_number', label: t['student_number'], sortable: true },
        { key: 'student_name', label: t['student_name'], sortable: true },
        { key: 'parent_whatsapp', label: t['parent_whatsapp'], sortable: true },
        { key: 'class_description', label: t['class'], sortable: true },
    ];

    const tableData = students.data.map(student => {
        const classItem = classes.find(cls => cls.id === student.class_id);
        return {
            id: student.id,
            student_number: student.student_number,
            student_name: student.name,
            parent_whatsapp: student.parent_whatsapp,
            class_description: student.section_number + ' / ' + '[' + student.path + ']' + ' / ' + student.class_description,
            section_number: student.section_number,
            path: student.path,
        };
    });

    const sortedTableData = [...tableData].sort((a, b) =>
        a.student_name.localeCompare(b.student_name, 'ar')
    );

    const handleEdit = (row) => {
        router.get(`/admin/dashboard/students/${row.id}/edit`);
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const handleDelete = (row) => {
        setSelectedStudent(row);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(`/admin/dashboard/students/${selectedStudent.id}`, {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedStudent(null);
            }
        });
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setSelectedStudent(null);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t['students']} />
            <div className="flex" style={{ height: "calc(100vh - 66px)" }}>
                <main className="flex-1 overflow-y-auto">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-14">
                            <Breadcrumb items={breadcrumbItems} />
                            <div className='flex justify-between items-center'>
                                <h1 className="text-2xl sm:text-3xl  mt-3 font-bold text-primaryColor">
                                    {t['students']}
                                </h1>
                                <PrimaryButton children={t['add_student']} link={`/admin/dashboard/students/add-new-student?id=${classId}`} />
                            </div>
                        </div>

                        <div className="mx-auto px-4 sm:px-6 md:px-8 mt-6">
                            <DataTable
                                columns={columns}
                                data={sortedTableData}
                                searchable={true}
                                filterable={true}
                                selectable={true}
                                actions={true}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
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
                        {t['delete_student_confirmation']}
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