import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FunnelIcon } from '@heroicons/react/20/solid';
import { translations } from '@translations';

export default function TableFilter({
  columns,
  filters,
  onChange,
}) {
  const isDark = useSelector((state) => state.theme.darkMode === "dark");
  const [isOpen, setIsOpen] = useState(false);
  const language = useSelector((state) => state.language.current);
  const t = translations[language];
  const filterRef = useRef(null);

  const handleFilterChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-4 py-2 max-sm:py-1 max-sm:px-2 border rounded-md border-[2px] ${isDark
          ? 'bg-DarkBG3 border-DarkBG3 text-TextLight hover:bg-DarkBG1'
          : 'bg-LightBG1 border-LightBG2 text-TextDark hover:bg-LightBG2'
          }`}
      >
        <FunnelIcon className={`h-5 w-5 max-sm:h-4 max-sm:w-4 text-IconColor ${language === "en" ? 'mr-2 ' : 'ml-2 '}`} />
        {t['filters']}
      </button>

      {isOpen && (
        <div className={`absolute ${language === "en" ? 'right-0' : 'left-0'} mt-2 w-64 rounded-md shadow-lg ${isDark ? 'bg-DarkBG3' : 'bg-LightBG3'
          } ring-1 ring-black ring-opacity-5 z-10`}>
          <div className="p-4 space-y-4">
            {columns.map((column) => (
              <div key={column.key}>
                <label
                  htmlFor={column.key}
                  className={`block text-sm font-medium ${isDark ? 'text-TextLight' : 'text-TextDark'
                    }`}
                >
                  {column.label}
                </label>
                <input
                  type="text"
                  id={column.key}
                  value={filters[column.key] || ''}
                  onChange={(e) => handleFilterChange(column.key, e.target.value)}
                  className={`mt-1 block w-full rounded-md ${isDark
                    ? 'bg-DarkBG3 border-gray-700 text-gray-300'
                    : 'bg-white border-gray-300 text-gray-900'
                    } shadow-sm focus:ring-primaryColor focus:border-primaryColor sm:text-sm`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
