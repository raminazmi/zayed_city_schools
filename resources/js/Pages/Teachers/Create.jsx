import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { translations } from '@translations';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddTeacherPage({ auth }) {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        email: '',
        role: '',
        grades: '',
    });

    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await post('/admin/dashboard/teachers', { preserveScroll: true });
            toast.success(t['teacher_added_successfully'], {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: isDark ? 'dark' : 'light',
            });
        } catch (error) {
            toast.error(t['failed_to_add_teacher'], {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: isDark ? 'dark' : 'light',
            });
        }
    };

    const breadcrumbItems = [
        { label: t['teachers_management'], href: '/admin/dashboard/teachers' },
        { label: t['add_teacher'] }
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t['add_teacher']} />
            <div className="flex" style={{ height: "calc(100vh - 66px)" }}>
                <main className="flex-1 overflow-y-auto">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-14">
                            <Breadcrumb items={breadcrumbItems} />
                            <h1 className="text-2xl sm:text-3xl mt-3 font-bold text-primaryColor">
                                {t['add_teacher']}
                            </h1>
                        </div>
                        <div className="mx-auto px-4 sm:px-6 md:px-16 mt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className='space-y-4'>
                                    <div className='flex justify-between gap-6'>
                                        <div className='w-full'>
                                            <InputLabel value={t['teacher_name']} />
                                            <TextInput
                                                id="name"
                                                type="text"
                                                name="name"
                                                className={`mt-1 block w-full ${isDark ? 'bg-DarkBG1' : 'bg-TextLight'}`}
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                            />
                                            {errors.name && <InputError message={errors.name} className="mt-2" />}
                                        </div>
                                        <div className='w-full'>
                                            <InputLabel value={t['email']} />
                                            <TextInput
                                                id="email"
                                                type="email"
                                                name="email"
                                                className={`mt-1 block w-full ${isDark ? 'bg-DarkBG1' : 'bg-TextLight'}`}
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                            />
                                            {errors.email && <InputError message={errors.email} className="mt-2" />}
                                        </div>
                                    </div>
                                    <div className='flex justify-between gap-6'>
                                        <div className='w-full'>
                                            <InputLabel value={t['position']} />
                                            <TextInput
                                                id="role"
                                                type="text"
                                                name="role"
                                                className={`mt-1 block w-full ${isDark ? 'bg-DarkBG1' : 'bg-TextLight'}`}
                                                value={data.role}
                                                onChange={(e) => setData('role', e.target.value)}
                                            />
                                            {errors.role && <InputError message={errors.role} className="mt-2" />}
                                        </div>
                                        <div className='w-full'>
                                            <InputLabel value={t['classes']} />
                                            <TextInput
                                                id="grades"
                                                type="text"
                                                name="grades"
                                                placeholder="G5:G6"
                                                className={`mt-1 block w-full ${isDark ? 'bg-DarkBG1' : 'bg-TextLight'}`}
                                                value={data.grades}
                                                onChange={(e) => setData('grades', e.target.value)}
                                            />
                                            {errors.grades && <InputError message={errors.grades} className="mt-2" />}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <PrimaryButton type="submit" disabled={processing}>
                                        {t['save']}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
            <ToastContainer />
        </AuthenticatedLayout>
    );
}