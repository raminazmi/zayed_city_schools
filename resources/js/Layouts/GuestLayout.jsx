import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { useSelector } from "react-redux";
import { translations } from '@translations';

export default function Guest({ children }) {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];
    return (
        <div className={`min-h-screen flex flex-col justify-center items-center pt-6 pt-0 px-4 ${isDark ? 'bg-DarkBG1' : 'bg-LightBG2'} `} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className={`w-full max-w-md mt-6 px-6 py-4 shadow-md overflow-hidden rounded-lg ${isDark ? 'bg-DarkBG3' : 'bg-LightBG1'}`} >
                <div className='flex justify-center'>
                    <Link href="/">
                        <ApplicationLogo width="120px" />
                    </Link>
                </div>
                {children}
            </div>
        </div>
    );
}
