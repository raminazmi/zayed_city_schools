import React from 'react';
import { useSelector } from 'react-redux';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { translations } from '@translations';

export default function TableHeader({
  columns,
  selectable,
  sortConfig,
  onSort,
  onSelectAll,
  selectedRows,
  totalRows,
}) {
  const isDark = useSelector((state) => state.theme.darkMode === "dark");
  const language = useSelector((state) => state.language.current);
  const t = translations[language];

  return (
    <thead className={` ${isDark ? 'bg-DarkBG3 text-TextLight' : 'bg-LightBG2 text-TextDark'} `}>
      <tr className={` ${language === "en" ? '!text-left' : '!text-right'}`}>
        {selectable && (
          <th scope="col" className="relative px-6 py-3">
            <input
              type="checkbox"
              className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-LightBG3 text-primaryColor focus:ring-primaryColor"
              checked={selectedRows.size === totalRows && totalRows > 0}
              onChange={(e) => onSelectAll(e.target.checked)}
            />
          </th>
        )}
        {columns.map((column) => (
          <th
            key={column.key}
            scope="col"
            className={`px-2 py-3 text-xs font-medium uppercase tracking-wider`}
          >
            {column.sortable ? (
              <button
                className="group inline-flex items-center space-x-1"
                onClick={() => onSort(column.key)}
              >
                <span>{column.label}</span>
                <span className="flex-none rounded">
                  {sortConfig?.key === column.key ? (
                    sortConfig.direction === 'asc' ? (
                      <ChevronUpIcon className="h-4 w-4 text-IconColor" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 text-IconColor" />
                    )
                  ) : (
                    <ChevronUpIcon className="h-4 w-4 opacity-0 group-hover:opacity-50 text-IconColor" />
                  )}
                </span>
              </button>
            ) : (
              column.label
            )}
          </th>
        ))}
        <th
          scope="col"
          className={`px-6 py-3 text-xs font-medium uppercase tracking-wider`}
        >
        </th>
      </tr>
    </thead>
  );
}