'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  BriefcaseIcon, 
  SparklesIcon,
  ClockIcon,
  FolderIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'My Resumes', href: '/dashboard/resumes', icon: FolderIcon },
  { name: 'Upload Resume', href: '/dashboard/upload', icon: DocumentTextIcon },
  { name: 'Job Descriptions', href: '/dashboard/jobs', icon: BriefcaseIcon },
  { name: 'Tailor Resume', href: '/dashboard/tailor', icon: SparklesIcon },
  { name: 'History', href: '/dashboard/history', icon: ClockIcon },
];

export function Sidebar() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  return (
    <div className="w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 h-full relative flex flex-col">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo/Brand area */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">ResumeAI</h2>
              <p className="text-xs text-slate-400">Smart Resume Builder</p>
            </div>
          </div>
        </div>

        {/* Navigation - takes up available space */}
        <nav className="flex-1 mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                      ${isActive 
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-blue-400 rounded-r-full" />
                    )}
                    
                    <item.icon
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200
                        ${isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400'}
                      `}
                    />
                    {item.name}
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section - properly positioned at bottom */}
        <div className="p-4 border-t border-slate-700/50 mt-auto">
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-slate-600/50 hover:from-slate-800/70 hover:to-slate-700/70 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center flex-shrink-0">
                <UserCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  </p>
                <p className="text-xs text-slate-400">Premium User</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
