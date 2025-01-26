import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '@redux/languageSlice';

export default function LanguageToggle() {
  const dispatch = useDispatch();
  const currentLanguage = useSelector((state) => state.language.current);
const isDark = useSelector((state) => state.theme.darkMode === "dark");
  const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';

  return (
    <div className={`flex justify-start gap-1 rounded-xl p-[5px] w-fit ${isDark ? 'bg-DarkBG2' : 'bg-LightBG2'}`}>
      <button
        onClick={() => dispatch(setLanguage(newLanguage))}
        className={`p-2 rounded-lg transition-all text-[13px] ${currentLanguage === 'en'
            ? isDark
              ? 'text-primaryColor bg-DarkBG3'
              : 'text-primaryColor bg-LightBG3'
            : isDark
              ? 'text-TextLight hover:bg-DarkBG3'
              : 'text-TextDark hover:bg-LightBG3'
          }`}
      >
        EN
      </button>
      <button
        onClick={() => dispatch(setLanguage('ar'))}
        className={`p-2 rounded-lg transition-all text-[13px] ${currentLanguage === 'ar'
            ? isDark
              ? 'text-primaryColor bg-DarkBG3'
              : 'text-primaryColor bg-LightBG3'
            : isDark
              ? 'text-TextLight hover:bg-DarkBG3'
              : 'text-TextDark hover:bg-LightBG3'
          }`}
      >
        AR
      </button>
    </div>
  );
}
