'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  HomeIcon, 
  DocumentArrowUpIcon,
  DocumentTextIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Upload Resume', href: '/dashboard/upload', icon: DocumentArrowUpIcon },
  { name: 'Preview', href: '/dashboard/preview', icon: DocumentTextIcon },
  { name: 'History', href: '/dashboard/history', icon: ClockIcon },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col bg-white border-r h-screen">
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <item.icon
                  className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};