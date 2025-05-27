import React from 'react';
import { Head } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import SendMessage from '@/Components/SendMessage';
import { translations } from '@translations';

export default function MessagesPage({ auth, classes }) {
    const isDark = useSelector((state) => state.theme.darkMode === 'dark');
    const language = useSelector((state) => state.language.current);
    const t = translations[language] || translations['en'];

    const breadcrumbItems = [
        { label: t['messages'], href: '/admin/dashboard/messages' },
        { label: t['send_message'] },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t['send_message']} />
            <div className="flex h-[calc(100vh-66px)]">
                <main className="flex-1 overflow-y-auto">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-14">
                            <Breadcrumb items={breadcrumbItems} />
                        </div>
                        <div className="mx-auto px-4 sm:px-6 md:px-16 mt-6">
                            <SendMessage t={t} classes={classes} />
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}