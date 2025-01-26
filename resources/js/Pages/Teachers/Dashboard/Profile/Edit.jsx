import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';
import { useSelector } from "react-redux";
import { translations } from '@translations';

export default function TeacherEdit({ auth, mustVerifyEmail, status, profileUpdateUrl, passwordUpdateUrl }) {
    const language = useSelector((state) => state.language.current);
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const t = translations[language];
    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title={t['profile']} />
            <div className="flex h-screen">
                <main className="flex-1 overflow-y-auto">
                    <div className={`py-6 ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <h1 className="text-2xl font-semibold">{t['profile']}</h1>
                        </div>
                        <div className="py-12">
                            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                                <div className={`${isDark ? 'bg-DarkBG3' : 'bg-LightBG1'} p-4 sm:p-8 shadow sm:rounded-lg`}>
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                        profileUpdateUrl={profileUpdateUrl}
                                    />
                                </div>

                                <div className={`${isDark ? 'bg-DarkBG3' : 'bg-LightBG1'} p-4 sm:p-8  shadow sm:rounded-lg`}>
                                    <UpdatePasswordForm className="" passwordUpdateUrl={passwordUpdateUrl} />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
