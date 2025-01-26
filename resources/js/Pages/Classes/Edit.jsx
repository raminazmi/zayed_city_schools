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

export default function EditClassPage({ auth, classRoom, teachers }) {
    const { data, setData, put, errors, processing } = useForm({
        name: classRoom.name || '',
        section: classRoom.section || '',
        teacher_id: classRoom.teacher_id || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/admin/dashboard/classes/${classRoom.id}`, {
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
        { label: t['classroom_management'], href: '/admin/dashboard/classes' },
        { label: t['edit_class'] }
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t['edit_class']} />
            <div className="flex" style={{ height: "calc(100vh - 66px)" }}>
                <main className="flex-1 overflow-y-auto">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-14">
                            <Breadcrumb items={breadcrumbItems} />
                            <h1 className="text-2xl sm:text-3xl  mt-3 font-bold text-primaryColor">
                                {t['edit_class']}
                            </h1>
                        </div>
                        <div className="mx-auto px-4 sm:px-6 md:px-16 mt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className='flex justify-between gap-6'>
                                        <div className='w-full'>
                                            <InputLabel value={t['class_name']} />
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
                                            <InputLabel value={t['section']} />
                                            <TextInput
                                                id="section"
                                                type="text"
                                                name="section"
                                                className={`mt-1 block w-full ${isDark ? 'bg-DarkBG1' : 'bg-TextLight'}`}
                                                value={data.section}
                                                onChange={(e) => setData('section', e.target.value)}
                                            />
                                            {errors.section && <InputError message={errors.section} className="mt-2" />}
                                        </div>
                                    </div>
                                    <div>
                                        <InputLabel value={t['select_teacher']} />
                                        <select
                                            id="teacher_id"
                                            name="teacher_id"
                                            className={`w-[100%] focus:border-primaryColor focus:ring-primaryColor rounded-md shadow-sm border-none h-[45px] mt-3 ${isDark ? 'bg-DarkBG1 text-TextLight' : 'bg-LightBG1 text-TextDark border-gray-400 border-[0.1px]'} `}
                                            value={data.teacher_id}
                                            onChange={(e) => setData('teacher_id', e.target.value)}
                                        >
                                            <option value="" disabled>{t['select_teacher']}</option>
                                            {teachers.map((teacher) => (
                                                <option key={teacher.id} value={teacher.id}>
                                                    {teacher.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.teacher_id && <InputError message={errors.teacher_id} className="mt-2" />}
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
        </AuthenticatedLayout>
    );
}