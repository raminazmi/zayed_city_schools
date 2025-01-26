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

export default function AddTeacherPage({ auth }) {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        email: '',
        phone: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/dashboard/teachers', {
            preserveScroll: true,
            onError: (errors) => {
                console.log(errors);
            },
        });
    };

    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];
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
                            <h1 className="text-2xl sm:text-3xl  mt-3 font-bold text-primaryColor">
                                {t['add_teacher']}
                            </h1>
                        </div>
                        <div className="mx-auto px-4 sm:px-6 md:px-16 mt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
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
                                <div>
                                    <InputLabel value={t['phone']} />
                                    <TextInput
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        className={`mt-1 block w-full ${isDark ? 'bg-DarkBG1' : 'bg-TextLight'}`}
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    {errors.phone && <InputError message={errors.phone} className="mt-2" />}
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
        </AuthenticatedLayout>
    );
}