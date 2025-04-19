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
import { FiPhone } from 'react-icons/fi';
import countriesData from '../../countries.json';

export default function AddStudentPage({ auth, classes, classId }) {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        student_number: '',
        class_id: classId,
        parent_whatsapp: '',
        country_code: '+971', // إضافة حقل للمقدمة
        class_description: 0,
        section_number: '',
        path: 'general',
    });

    const [countries] = React.useState(countriesData);
    const [filteredCountries] = React.useState(countriesData);

    const handlePhoneChange = (e) => {
        // السماح بالأرقام فقط وإزالة الصفر الأول
        const value = e.target.value.replace(/[^0-9]/g, '').replace(/^0/, '');
        setData('parent_whatsapp', value);
    };

    const handleCountryCodeChange = (e) => {
        setData('country_code', e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // تحقق من أن parent_whatsapp غير فارغ
        if (!data.parent_whatsapp) {
            return alert('يرجى إدخال رقم واتساب ولي الأمر');
        }

        // إرسال البيانات مع country_code و parent_whatsapp منفصلين
        post('/admin/dashboard/students', {
            preserveScroll: true,
            onError: (errors) => {
                console.log(errors);
            },
        });
    };

    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];
    const classroom = classes.find(cls => cls.id == classId);
    const breadcrumbItems = [
        { label: t['student_management'], href: '/admin/dashboard/students' },
        { label: classroom.name + ' / ' + classroom.path + ' / ' + 'شعبة ' + classroom.section_number },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t['add_student']} />
            <div className="flex" style={{ height: "calc(100vh - 66px)" }}>
                <main className="flex-1 overflow-y-auto">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-14">
                            <Breadcrumb items={breadcrumbItems} />
                            <h1 className="text-2xl sm:text-3xl mt-3 font-bold text-primaryColor">
                                {t['add_student']}
                            </h1>
                        </div>
                        <div className="mx-auto px-4 sm:px-6 md:px-16 mt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className='flex justify-between gap-6'>
                                        <div className='w-full'>
                                            <InputLabel value={t['student_name']} />
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
                                            <InputLabel value={t['student_number']} />
                                            <TextInput
                                                id="student_number"
                                                type="text"
                                                name="student_number"
                                                className={`mt-1 block w-full ${isDark ? 'bg-DarkBG1' : 'bg-TextLight'}`}
                                                value={data.student_number}
                                                onChange={(e) => setData('student_number', e.target.value)}
                                            />
                                            {errors.student_number && <InputError message={errors.student_number} className="mt-2" />}
                                        </div>
                                    </div>
                                    <div className='flex justify-between gap-6'>
                                        <div className='w-full'>
                                            <InputLabel value={t['select_class']} />
                                            <select
                                                id="class_id"
                                                name="class_id"
                                                disabled
                                                className={`w-[100%] focus:border-primaryColor focus:ring-primaryColor rounded-md shadow-sm border-none h-[45px] mt-3 ${isDark ? 'bg-DarkBG1 text-TextLight' : 'bg-LightBG1 text-TextDark border-gray-400 border-[0.1px]'}`}
                                                value={data.class_id}
                                                onChange={(e) => setData('class_id', e.target.value)}
                                            >
                                                <option value="" disabled>{t['select_class']}</option>
                                                {classes.map((classItem) => (
                                                    <option key={classItem.id} value={classItem.id}>
                                                        {classItem.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.class_id && <InputError message={errors.class_id} className="mt-2" />}
                                        </div>
                                        <div className='w-full'>
                                            <InputLabel value={t['parent_whatsapp']} />
                                            <div className="relative flex items-center gap-2 mt-3 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                                                <select
                                                    name="countryCode"
                                                    value={data.country_code}
                                                    onChange={handleCountryCodeChange}
                                                    className="w-1/3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-600 py-2.5 pl-1 pr-2 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200"
                                                >
                                                    {filteredCountries.map((country) => (
                                                        <option key={country.code} value={country.code}>
                                                            {country.code} ({country.arabicName})
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="w-2/3 relative">
                                                    <TextInput
                                                        type="tel"
                                                        name="parent_whatsapp"
                                                        placeholder="123456789"
                                                        value={data.parent_whatsapp}
                                                        onChange={handlePhoneChange}
                                                        className={`w-full mt-0 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent py-1 pl-3 pr-10 text-gray-900 dark:text-white outline-none focus:border-primary focus-visible:shadow-md dark:focus:border-indigo-400 transition-all duration-200 ${isDark ? 'bg-DarkBG1' : 'bg-TextLight'}`}
                                                    />
                                                    <span className="absolute right-3 top-2.5">
                                                        <FiPhone className="text-xl text-gray-500 dark:text-gray-400" />
                                                    </span>
                                                </div>
                                            </div>
                                            {errors.parent_whatsapp && <InputError message={errors.parent_whatsapp} className="mt-2" />}
                                            {errors.country_code && <InputError message={errors.country_code} className="mt-2" />}
                                        </div>
                                    </div>
                                    <div className='flex justify-between gap-6'>
                                        <div className='w-full'>
                                            <InputLabel value={t['class_description']} />
                                            <TextInput
                                                id="class_description"
                                                name="class_description"
                                                type="number"
                                                className={`mt-1 block w-full ${isDark ? 'bg-DarkBG1' : 'bg-TextLight'}`}
                                                value={data.class_description}
                                                onChange={(e) => setData('class_description', e.target.value)}
                                            />
                                            {errors.class_description && <InputError message={errors.class_description} className="mt-2" />}
                                        </div>
                                        <div className='w-full'>
                                            <InputLabel value={t['section_number']} />
                                            <TextInput
                                                id="section_number"
                                                type="text"
                                                name="section_number"
                                                className={`mt-1 block w-full ${isDark ? 'bg-DarkBG1' : 'bg-TextLight'}`}
                                                value={data.section_number}
                                                onChange={(e) => setData('section_number', e.target.value)}
                                            />
                                            {errors.section_number && <InputError message={errors.section_number} className="mt-2" />}
                                        </div>
                                    </div>
                                    <div className='flex justify-between gap-6'>
                                        <div className='w-full'>
                                            <InputLabel value={t['path']} />
                                            <TextInput
                                                id="path"
                                                type="text"
                                                name="path"
                                                className={`mt-1 block w-full ${isDark ? 'bg-DarkBG1' : 'bg-TextLight'}`}
                                                value={data.path}
                                                onChange={(e) => setData('path', e.target.value)}
                                            />
                                            {errors.path && <InputError message={errors.path} className="mt-2" />}
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
        </AuthenticatedLayout>
    );
}