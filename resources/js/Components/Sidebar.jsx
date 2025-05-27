import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import {
  HomeIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  UsersIcon,
  BuildingLibraryIcon,
  UserCircleIcon,
  ArrowLeftEndOnRectangleIcon,
  DocumentTextIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import ThemeToggle from '@/Components/ThemeToggle';
import LanguageToggle from '@/Components/LanguageToggle';

export default function Sidebar({ role, className, showingDropdown, setShowingDropdown, user, isDark, language, t }) {
  const { url } = usePage();

  const navigation = role === "teacher"
    ? [
      { name: t['dashboard'], href: '/teacher/dashboard/home', icon: HomeIcon },
      { name: t['attendance'], href: '/teacher/dashboard/attendance', icon: ClipboardDocumentCheckIcon },
      { name: t['reports'], href: '/teacher/dashboard/reports', icon: DocumentTextIcon },
      { name: t['student_management'], href: '/teacher/dashboard/students', icon: UserGroupIcon },
    ]
    : [
      { name: t['dashboard'], href: '/admin/dashboard/home', icon: HomeIcon },
      { name: t['attendance'], href: '/admin/dashboard/attendance', icon: ClipboardDocumentCheckIcon },
      { name: t['reports'], href: '/admin/dashboard/reports', icon: DocumentTextIcon },
      { name: t['teachers_management'], href: '/admin/dashboard/teachers', icon: UsersIcon },
      { name: t['classroom_management'], href: '/admin/dashboard/classes', icon: BuildingLibraryIcon },
      { name: t['student_management'], href: '/admin/dashboard/students', icon: UserGroupIcon },
      { name: t['messages'], href: '/admin/dashboard/messages', icon: EnvelopeIcon },
    ];

  const firstLetter = user?.name?.charAt(0).toUpperCase();

  return (
    <div className={`flex flex-col justify-between min-w-[100%] sm:min-w-[230px] ${className} ${isDark ? 'bg-DarkBG2' : 'bg-LightBG2'} border-gray-200`} style={{ height: "calc(100vh - 66px)" }}>
      <nav className="flex-1 px-2 py-6 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md
              ${url.startsWith(item.href) ? `text-primaryColor font-bold ${isDark ? 'bg-DarkBG1' : 'bg-LightBG3'}` : isDark ? 'text-TextLight hover:bg-DarkBG1' : 'text-TextDark hover:bg-LightBG3'}`}
          >
            <item.icon
              className={`${language === 'en' ? 'mr-3' : 'ml-3'} h-6 w-6 
                ${url.startsWith(item.href) ? 'text-primaryColor' : 'text-IconColor'}`}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="sm:hidden mt-auto relative pb-2">
        <button
          onClick={() => setShowingDropdown(!showingDropdown)}
          className={`w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md ${isDark ? 'text-TextLight hover:bg-DarkBG1' : 'text-TextDark hover:bg-LightBG3'}`}
        >
          <div className="flex items-center gap-3">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="User"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primaryColor text-white text-lg font-bold">
                {firstLetter}
              </span>
            )}
            <div className={`${isDark ? 'text-TextLight' : 'text-TextDark'}`}>
              {user.name.length >= 18 ? `${user.name.slice(0, 18)}...` : user.name}
            </div>
          </div>
        </button>

        {showingDropdown && (
          <div className={`absolute bottom-full left-0 w-full shadow-lg z-10 ${isDark ? 'bg-DarkBG3' : 'bg-LightBG1'}`} >
            <Link
              href={user.role === "admin" ? '/admin/profile/edit' : '/employee/profile/edit'}
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isDark ? 'text-TextLight hover:bg-DarkBG2' : 'text-TextDark hover:bg-LightBG3'}`}
            >
              <UserCircleIcon
                className={`${language === 'en' ? 'mr-3' : 'ml-3'} h-6 w-6 text-IconColor`}
                aria-hidden="true"
              />
              {t['profile']}
            </Link>
            <div className='flex justify-center items-center gap-1'>
              <div className="flex items-center px-2 py-2">
                <ThemeToggle />
              </div>
              <div className="flex items-center px-2 py-2">
                <LanguageToggle />
              </div>
            </div>
            <Link
              href="/logout"
              method="post"
              as="button"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isDark ? 'text-TextLight hover:bg-DarkBG2' : 'text-TextDark hover:bg-LightBG3'}`}
            >
              <ArrowLeftEndOnRectangleIcon
                className={`${language === 'en' ? 'mr-3' : 'ml-3'} h-5 w-5 text-IconColor`}
                aria-hidden="true"
              />
              {t['logout']}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}