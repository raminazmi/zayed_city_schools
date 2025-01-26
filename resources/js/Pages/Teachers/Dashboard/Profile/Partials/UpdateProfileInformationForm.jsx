import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { useSelector } from "react-redux";
import { translations } from '@translations';

export default function TeacherUpdateProfileInformation({ mustVerifyEmail, status, className = '', profileUpdateUrl }) {
    const user = usePage().props.auth.user;
    const language = useSelector((state) => state.language.current);
    const t = translations[language];

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();

        patch(profileUpdateUrl);
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium">{t['profile_information']}</h2>
                <p className="mt-1 text-sm">
                    {t['update_profile_description']}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value={t['name']} />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value={t['email']} />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        disabled
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-sm mt-2">
                            {t['email_unverified']}
                            <Link href={route('admin.verification.send')} className="font-medium text-indigo-600 hover:text-indigo-500">
                                {t['resend_verification']}
                            </Link>
                        </p>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>{t['save']}</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">{t['saved']}</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
