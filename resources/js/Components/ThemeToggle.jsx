import React from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@redux/themeSlice';

export default function ThemeToggle() {
  const dispatch = useDispatch();
const isDark = useSelector((state) => state.theme.darkMode === "dark");

  return (
    <div className={`flex justify-start gap-1 rounded-xl p-[5px] w-fit ${isDark ? 'bg-DarkBG2' : 'bg-LightBG2'}`}>
      <button
        onClick={() => dispatch(toggleTheme("light"))}
        className={`p-2 rounded-lg ${
          isDark ? 'text-TextLight hover:bg-DarkBG3' :'hover:bg-LightBG3 text-primaryColor bg-LightBG3'
        } `}
      >
        <SunIcon className="h-[18px] w-[18px]" />
      </button>
      <button
        onClick={() => dispatch(toggleTheme("dark"))}
        className={`p-2 rounded-lg ${
          isDark ? 'text-primaryColor hover:bg-DarkBG3 bg-DarkBG3' :'hover:bg-LightBG3 text-TextDark'
        } `}
      >
        <MoonIcon className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
