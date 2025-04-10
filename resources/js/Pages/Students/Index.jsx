import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useSelector } from "react-redux";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import DataTable from '@/Components/DataTable/DataTable';
import { translations } from '@translations';
import { router } from '@inertiajs/react';
import { useDropzone } from 'react-dropzone';

export default function StudentsPage({ auth, classes }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];

    const breadcrumbItems = [
        { label: t['student_management'], href: '/admin/dashboard/students' },
        { label: t['classes'], href: '/admin/dashboard/classes' },
        { label: t['list'] }
    ];

    const columns = [
        { key: 'class_name', label: t['class_name'], sortable: true },
        { key: 'students_count', label: t['numbers_of_students'], sortable: true },
        { key: 'teacher_name', label: t['teacher_name'], sortable: true },
    ];

    const tableData = classes.map(classItem => ({
        id: classItem.id,
        class_name: classItem.class_name,
        students_count: classItem.students_count,
        teacher_name: classItem.teacher_name,
    }));

    const handleView = (row) => {
        router.visit(`/admin/dashboard/students/${row.id}/view`);
    };

    const handleFileUpload = async (files) => {
        try {
            setUploading(true);
            setError(null);

            const file = files[0];
            const formData = new FormData();
            formData.append('file', file);

            router.post('/admin/dashboard/students/import', formData, {
                forceFormData: true,
                onSuccess: () => {
                    setUploading(false);
                    window.location.reload();
                },
                onError: (errors) => {
                    setUploading(false);
                    setError(errors.file || 'حدث خطأ أثناء رفع الملف');
                },
                onFinish: () => {
                    setUploading(false);
                }
            });
        } catch (error) {
            setUploading(false);
            setError('حدث خطأ غير متوقع');
            console.error('خطأ:', error);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        onDrop: handleFileUpload,
        multiple: false,
        disabled: uploading
    });

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
                                <div className="relative">
                                    <div
                                        {...getRootProps()}
                                        className={`cursor-pointer
                                            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                                            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        <input {...getInputProps()} />
                                        <button
                                            type="button"
                                            disabled={uploading}
                                            className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md
                                                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            {uploading ? 'جاري الرفع...' : t['import_students']}
                                        </button>
                                        {error && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {error}
                                            </p>
                                        )}
                                    </div>
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
                            />
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
