import React from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { translations } from '@translations';
import { useSelector } from "react-redux";

export default function Welcome({ auth, canLogin, canRegister }) {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];
    return (
        <div className={`min-h-screen  text-center flex flex-col items-center justify-center ${isDark ? 'bg-DarkBG1' : 'bg-LightBG2'} `}>
            <ApplicationLogo width="100px" />
            <h1 className={`mt-6 text-3xl text-center font-bold ${isDark ? 'text-TextLight' : 'text-TextDark'} `}>{t['Welcome']}</h1>
            <p className={`mt-4 text-lg text-center ${isDark ? 'text-TextLight' : 'text-TextDark'} `}>{t['easily_manage']}</p>
            <div className="mt-8">
                {auth && !auth.user ? (
                    <>
                        {canLogin && (
                            <Link href="/login" className={`${language === 'en' ? 'mr-4' : 'ml-4'}  px-4 py-2 bg-primaryColor hover:bg-SecondaryColor text-white font-bold py-2 px-4 rounded `}>
                                {t['log_in']}
                            </Link>
                        )}
                        {/* {canRegister && (
                            <Link href="/register" className="px-4 py-2 bg-primaryColor hover:bg-SecondaryColor text-white font-bold py-2 px-4 rounded ">
                                {t['register']}
                            </Link>
                        )} */}
                    </>
                ) : auth && auth.user ? (
                    <Link href={auth.user.role === "admin" ? "admin/dashboard/home" : "teacher/dashboard/home"} className="px-4 py-2 bg-primaryColor hover:bg-SecondaryColor text-white font-bold py-2 px-4 rounded ">
                        {t['go_to_dashboard']}
                    </Link>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
}
