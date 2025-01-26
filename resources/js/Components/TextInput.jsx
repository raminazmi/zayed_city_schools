import { forwardRef, useEffect, useRef, useState } from 'react';
import { useSelector } from "react-redux";
import { PhoneIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { translations } from '@translations';

export default forwardRef(function TextInput({ type = 'text', value, className = '', isFocused = false, ...props }, ref) {
    const input = ref ? ref : useRef();
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="relative">
            <input
                {...props}
                type={type === "password" && showPassword ? "text" : type}
                value={value}
                className={
                    `focus:border-primaryColor focus:ring-primaryColor rounded-md shadow-sm border-none h-[45px] mt-3 ${type === "email" || type === "password" ? 'pe-10' : ''} ${type === "tel" && language === 'ar' ? 'ps-10' : ''} ${type === "tel" && language === 'en' ? 'pe-10' : ''} ` +
                    `${isDark ? 'bg-DarkBG1 text-TextLight' : 'bg-LightBG2 text-TextDark border-gray-400 border-[0.1px]'} ` +
                    className
                }
                ref={input}
            />
            {type === "tel" ? (
                <div className={`absolute inset-y-0 ${language === 'ar' ? 'left-0 pl-3 ' : 'right-0 pr-3 '} flex items-center`}>
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
            ) : type === "email" ? (
                <div className={`absolute inset-y-0 ${language === 'ar' ? 'left-0 pl-3 ' : 'right-0 pr-3 '} flex items-center`}>
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
            ) : type === "password" ? (
                <div className={`absolute inset-y-0 ${language === 'ar' ? 'left-0 pl-3 ' : 'right-0 pr-3 '} flex items-center cursor-pointer`} onClick={toggleShowPassword}>
                    {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                </div>
            ) : null}
        </div>
    );
});