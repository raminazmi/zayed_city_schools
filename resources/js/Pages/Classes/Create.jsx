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
import Select from 'react-select';

export default function AddClassPage({ auth, teachers }) {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        section: '',
        teacher_ids: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/dashboard/classes', {
            preserveScroll: true,
            onError: (errors) => {
                console.log(errors);
            },
        });
    };

    const handleTeacherChange = (selectedOptions) => {
        const selectedTeacherIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setData('teacher_ids', selectedTeacherIds);
    };

    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];
    const breadcrumbItems = [
        { label: t['classroom_management'], href: '/admin/dashboard/classes' },
        { label: t['add_class'] }
    ];

    const teacherOptions = teachers.map(teacher => ({
        value: teacher.id,
        label: teacher.name,
    }));

    const customStyles = {
        control: (provided) => ({
            ...provided,
            backgroundColor: isDark ? '#2D2D2D' : '#ffffff',
            borderColor: isDark ? '#4B4B4B' : '#F5F5F5',
            color: isDark ? '#E5E7EB' : '#1F2937',
            padding: '5px 0px',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#0EA5E9',
            },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#0EA5E9'
                : state.isFocused
                    ? isDark ? '#4B4B4B' : '#E5E7EB'
                    : isDark ? '#2D2D2D' : '#FFFFFF',
            color: isDark ? '#E5E7EB' : '#1F2937',
            '&:active': {
                backgroundColor: '#0EA5E9',
            },
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: isDark ? '#4B4B4B' : '#E5E7EB',
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: isDark ? '#E5E7EB' : '#1F2937',
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: isDark ? '#E5E7EB' : '#1F2937',
            '&:hover': {
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
            },
        }),
        placeholder: (provided) => ({
            ...provided,
            color: isDark ? '#9CA3AF' : '#6B7280',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: isDark ? '#E5E7EB' : '#1F2937',
        }),
    };

    const selectedTeachers = teacherOptions.filter(option => data.teacher_ids.includes(option.value));

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t['add_class']} />
            <div className="flex" style={{ height: "calc(100vh - 66px)" }}>
                <main className="flex-1 overflow-y-auto">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-14">
                            <Breadcrumb items={breadcrumbItems} />
                            <h1 className="text-2xl sm:text-3xl mt-3 font-bold text-primaryColor">
                                {t['add_class']}
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
                                                placeholder="e.g., 05[Adv-3rdLanguage]/1"
                                                className={`mt-1 block w-full ${isDark ? 'bg-DarkBG1' : 'bg-TextLight'}`}
                                                value={data.section}
                                                onChange={(e) => setData('section', e.target.value)}
                                            />
                                            {errors.section && <InputError message={errors.section} className="mt-2" />}
                                        </div>
                                    </div>
                                    <div>
                                        <InputLabel value={t['select_teachers']} />
                                        <Select
                                            id="teacher_ids"
                                            name="teacher_ids"
                                            isMulti
                                            options={teacherOptions}
                                            value={selectedTeachers}
                                            onChange={handleTeacherChange}
                                            styles={customStyles}
                                            className="mt-3"
                                            classNamePrefix="select"
                                            placeholder={t['select_teachers_placeholder']}
                                            noOptionsMessage={() => t['no_teachers_available']}
                                        />
                                        {errors.teacher_ids && <InputError message={errors.teacher_ids} className="mt-2" />}
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