import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { translations } from '@translations';
import { useSelector } from "react-redux";

export default function Login({ status, canResetPassword }) {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        role: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <GuestLayout>
            <Head title="Log in" />
            {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}
            <form onSubmit={submit}>
                <div className="my-4">
                    <InputLabel htmlFor="role" value={t['role']} />
                    <select
                        id="role"
                        name="role"
                        value={data.role}
                        className={`w-[100%] focus:border-primaryColor focus:ring-primaryColor rounded-md shadow-sm border-none h-[45px] mt-3 ${isDark ? 'bg-DarkBG1 text-TextLight' : 'bg-LightBG2 text-TextDark border-gray-400 border-[0.1px]'} `}
                        onChange={(e) => setData('role', e.target.value)}
                    >
                        <option value="" disabled>{t['select_role']}</option>
                        <option value="admin">{t['admin']}</option>
                        <option value="teacher">{t['teacher']}</option>
                    </select>
                    <InputError message={errors.role} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value={t['email']} />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value={t['password']} />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-center mt-8 mb-4">
                    <PrimaryButton className="" disabled={processing}>
                        {t['log_in']}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}