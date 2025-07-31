'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { 
  SparklesIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications] = useState(3); // Mock notification count

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Redirect to homepage instead of /auth
    router.push('/');
  };

  const getPageTitle = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    switch (lastSegment) {
      case 'dashboard': return 'Dashboard';
      case 'resumes': return 'My Resumes';
      case 'upload': return 'Upload Resume';
      case 'jobs': return 'Job Descriptions';
      case 'tailor': return 'Tailor Resume';
      case 'history': return 'History';
      case 'settings': return 'Settings';
      default: return 'Resume AI';
    }
  };

  const breadcrumbs = pathname.split('/').filter(Boolean).map((segment, index, array) => {
    const path = '/' + array.slice(0, index + 1).join('/');
    const name = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { name, path };
  });

  return (
    <header className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 h-16 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Resume AI
              </span>
            </Link>

            {/* Breadcrumbs - Hidden on mobile */}
            <nav className="hidden md:flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && <span className="text-slate-500">/</span>}
                  <Link
                    href={crumb.path}
                    className={`transition-colors ${
                      index === breadcrumbs.length - 1
                        ? 'text-white font-medium'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {crumb.name}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Center Section - Page Title on mobile */}
          <div className="md:hidden">
            <h1 className="text-lg font-semibold text-white">{getPageTitle()}</h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications - Hidden on mobile */}
            <div className="hidden sm:block relative">
              <Button
                variant="outline"
                size="sm"
                className="relative border-slate-600/50 text-slate-300 hover:bg-slate-700/50 p-2"
              >
                <BellIcon className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                  <UserCircleIcon className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block text-left min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Muhammad Ali'}
                  </p>
                  <p className="text-xs text-slate-400">Premium User</p>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <Card className="absolute right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-xl border-slate-700/50 shadow-xl z-20">
                    <div className="p-4 border-b border-slate-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                          <UserCircleIcon className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Muhammad Ali'}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {user?.email || 'ali@example.com'}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 mt-1">
                            Premium
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                        <div
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-500 cursor-default rounded-lg"
                        >
                        <Cog6ToothIcon className="h-4 w-4" />
                        <span>Settings</span>
                        </div>
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          router.push('/dashboard/resumes');
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors"
                      >
                        <SparklesIcon className="h-4 w-4" />
                        <span>My Resumes</span>
                      </button>
                      
                      <div className="border-t border-slate-700/50 my-2" />
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleSignOut();
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </Card>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 transition-colors"
            >
              {showMobileMenu ? (
                <XMarkIcon className="h-5 w-5 text-white" />
              ) : (
                <Bars3Icon className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-xl">
            <div className="p-4 space-y-3">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/upload">
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Upload Resume
                  </Button>
                </Link>
                <Link href="/dashboard/tailor">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Tailor Resume
                  </Button>
                </Link>
              </div>

              {/* Notifications on mobile */}
              <button className="w-full flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <BellIcon className="h-5 w-5 text-slate-400" />
                  <span className="text-sm text-slate-300">Notifications</span>
                </div>
                {notifications > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside handler for mobile menu */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/20 z-0 md:hidden" 
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </header>
  );
}