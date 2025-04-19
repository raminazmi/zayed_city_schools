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
import { useDropzone } from 'react-dropzone';

export default function TeachersPage({ auth, teachers }) {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const [uploading, setUploading] = useState(false);
    const t = translations[language];
    const breadcrumbItems = [
        { label: t['teachers_management'], href: '/admin/dashboard/teachers' },
        { label: t['list'] }
    ];
    const columns = [
        { key: 'teacher_name', label: t['teacher_name'], sortable: true },
        { key: 'email', label: t['email'], sortable: true },
        { key: 'position', label: t['position'], sortable: true },
        { key: 'classes', label: t['classes'], sortable: true },
    ];

    const tableData = teachers.data.map(item => ({
        id: item.id,
        teacher_name: item.name,
        email: item.email,
        position: item.role,
        classes: item.grades,
    }));

    const sortedTableData = [...tableData].sort((a, b) =>
        a.teacher_name.localeCompare(b.teacher_name, 'ar')
    );

    const handleEdit = (row) => {
        router.get(`/admin/dashboard/teachers/${row.id}/edit`);
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const handleDelete = (row) => {
        setSelectedTeacher(row);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(`/admin/dashboard/teachers/${selectedTeacher.id}`, {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedTeacher(null);
            }
        });
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setSelectedTeacher(null);
    };

    const handleExport = (format) => {
        console.log(`Exporting report as ${format}`);
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: '.xlsx, .xls',
        disabled: uploading,
        onDrop: (acceptedFiles) => {
            setUploading(true);
            const file = acceptedFiles[0];
            const formData = new FormData();
            formData.append('file', file);
            router.post('/admin/dashboard/teachers/import', formData, {
                onSuccess: () => {
                    setUploading(false);
                    window.location.reload();
                },
                onError: (errors) => {
                    setUploading(false);
                },
                onFinish: () => {
                    setUploading(false);
                }
            });
        }
    });

    return (
        <AuthenticatedLayout user={auth}>
            <Head title={t['teachers']} />
            <div className="flex" style={{ height: "calc(100vh - 66px)" }}>
                <main className="flex-1 overflow-y-auto">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-14">
                            <Breadcrumb items={breadcrumbItems} />
                            <div className='flex justify-between items-center'>
                                <h1 className="text-2xl sm:text-3xl  mt-3 font-bold text-primaryColor">
                                    {t['teachers']}
                                </h1>
                                <div className="flex gap-2">
                                    <PrimaryButton children={t['add_teacher']} link="/admin/dashboard/teachers/add-new-teacher" />
                                    <div {...getRootProps()} className="cursor-pointer">
                                        <input {...getInputProps()} />
                                        <PrimaryButton children={uploading ? 'جاري الرفع...' : t['import_teachers']} disabled={uploading} />
                                    </div>
                                </div>
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
                        {t['delete_teacher_confirmation']}
                    </p>
                    <div className=" mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={cancelDelete} className='mx-2 !bg-blue-500 hover:!bg-blue-600 focus:!ring-blue-600 text-white focus:ring-blue-500'>
                            {t['cancel']}
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 focus:!ring-red-600">
                            {t['delete']}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}