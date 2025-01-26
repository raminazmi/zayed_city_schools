import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/20/solid';
import { useSelector } from 'react-redux';

export default function Breadcrumb({ items }) {
    const Language = useSelector((state) => state.language.current);

  return (
    <nav className="flex mb-1" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              Language === "en" ?
              <ChevronRightIcon 
                className="h-5 w-5 text-gray-500 flex-shrink-0" 
                aria-hidden="true" 
                />
                :
               <ChevronLeftIcon 
                className="h-5 w-5 text-gray-500 flex-shrink-0" 
                aria-hidden="true" 
                /> 
            )}
            {item.href ? (
              <Link
                href={item.href}
                className={`text-sm font-medium ${
                  index === items.length - 1
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-400'
                }`}
              >
                {item.label}
              </Link>
            ) : (
                <span className={`text-sm font-medium text-gray-400`}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}