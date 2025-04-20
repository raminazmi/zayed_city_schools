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
import countriesData from '../../../../countries.json';

export default function TeacherAddStudentPage({ auth, classes, classId }) {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        student_number: '',
        class_id: classId,
        parent_whatsapp: '',
        country_code: '+965',
    });

    const [countries] = React.useState(countriesData);
    const [filteredCountries] = React.useState(countriesData);

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '').replace(/^0/, '');
        setData('parent_whatsapp', value);
    };

    const handleCountryCodeChange = (e) => {
        setData('country_code', e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.parent_whatsapp) {
            return alert('يرجى إدخال رقم واتساب ولي الأمر');
        }

        post('/teacher/dashboard/students', {
            preserveScroll: true,
            onError: (errors) => {
                console.log(errors);
            },
        });
    };

    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];
    const classroom = classes.find(cls => cls.id == classId) || {};
    const breadcrumbItems = [
        { label: t['student_management'], href: '/teacher/dashboard/students' },
        { label: classroom.name ? `${classroom.name} / ${classroom.path} / شعبة ${classroom.section_number}` : t['add_student'] },
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
                                    <div className='flex justify-between gap-4'>
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
                                    <div className='flex justify-between gap-6 flex-wrap'>
                                        <div className='w-full'>
                                            <InputLabel value={t['select_class']} />
                                            <select
                                                id="class_id"
                                                name="class_id"
                                                className={`w-[100%] focus:border-primaryColor focus:ring-primaryColor rounded-md shadow-sm border-none h-[45px] mt-3 ${isDark ? 'bg-DarkBG1 text-TextLight' : 'bg-LightBG1 text-TextDark border-gray-400 border-[0.1px]'}`}
                                                value={data.class_id}
                                                onChange={(e) => setData('class_id', e.target.value)}
                                            >
                                                <option value="" disabled>{t['select_class']}</option>
                                                {classes
                                                    .sort((a, b) => {
                                                        const getGradeNumber = (name) => {
                                                            const gradeOrder = [
                                                                "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر"
                                                            ];
                                                            return gradeOrder.findIndex(grade => name.includes(grade));
                                                        };
                                                        return getGradeNumber(a.name) - getGradeNumber(b.name);
                                                    })
                                                    .map((classItem) => (
                                                        <option key={classItem.id} value={classItem.id}>
                                                            {`${classItem.name} [${classItem.path}] / ${classItem.section_number}`}
                                                        </option>
                                                    ))}
                                            </select>
                                            {errors.class_id && <InputError message={errors.class_id} className="mt-2" />}
                                        </div>
                                        <div className='w-full'>
                                            <InputLabel value={t['parent_whatsapp']} />
                                            <div className="flex items-center gap-4">
                                                <select
                                                    name="countryCode"
                                                    value={data.country_code}
                                                    onChange={handleCountryCodeChange}
                                                    className={`w-1/3  focus:border-primaryColor focus:ring-primaryColor rounded-md shadow-sm border-none h-[45px] mt-3 ${isDark ? 'bg-DarkBG1 text-TextLight' : 'bg-LightBG1 text-TextDark border-gray-400 border-[0.1px]'}`}
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
                                                        className={`w-full ${isDark ? 'bg-DarkBG1' : 'bg-TextLight'}`}
                                                    />
                                                </div>
                                            </div>
                                            {errors.parent_whatsapp && <InputError message={errors.parent_whatsapp} className="mt-2" />}
                                            {errors.country_code && <InputError message={errors.country_code} className="mt-2" />}
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