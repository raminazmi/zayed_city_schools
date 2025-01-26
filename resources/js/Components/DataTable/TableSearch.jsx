import React from 'react';
import { useSelector } from 'react-redux';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { translations } from '@translations';

export default function TableSearch({
  value,
  onChange,
  placeholder = t['search'],
}) {
  const isDark = useSelector((state) => state.theme.darkMode === "dark");
  const language = useSelector((state) => state.language.current);
  const t = translations[language];

  return (
    <div className="relative flex-1 max-w-xs">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-IconColor" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full pl-10 pr-3 py-2 max-sm:py-1 border rounded-md leading-5 ${isDark ? 'bg-DarkBG3 border-2 border-DarkBG3 text-TextLight' : 'bg-LightBG1 border-2 border-LightBG2 text-TextDark'}  focus:outline-none focus:ring-1 focus:ring-primaryColor focus:border-primaryColor sm:text-sm max-sm:text-[15px]`}
        placeholder={placeholder}
      />
    </div>
  );
}