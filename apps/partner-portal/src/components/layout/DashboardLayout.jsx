import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Menu as MenuIcon, 
  ShoppingBag, 
  BarChart3, 
  Users, 
  Settings, 
  HelpCircle,
  LogOut,
  Globe,
  X,
  ChevronLeft
} from 'lucide-react';
import { Logo, Button } from '@grub-gate/ui';
import MobileBottomNav from './MobileBottomNav';

const DashboardLayout = ({ onLanguageChange }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
    onLanguageChange?.(newLang);
  };

  const navigation = [
    { name: t('dashboard.navigation.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('dashboard.navigation.menu'), href: '/dashboard/menu', icon: MenuIcon },
    { name: t('dashboard.navigation.orders'), href: '/dashboard/orders', icon: ShoppingBag },
    { name: t('dashboard.navigation.analytics'), href: '/dashboard/analytics', icon: BarChart3 },
    { name: t('dashboard.navigation.customers'), href: '/dashboard/customers', icon: Users },
    { name: t('dashboard.navigation.settings'), href: '/dashboard/settings', icon: Settings },
    { name: t('dashboard.navigation.support'), href: '/dashboard/support', icon: HelpCircle },
  ];

  const isCurrentPath = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    // In a real app, this would clear authentication state
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <NavLink to="/" aria-label="Go to landing page" className="inline-flex">
              <Logo size="md" />
            </NavLink>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isCurrentPath(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`group w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors border-l-4 ${
                    active
                      ? 'bg-red-50 text-grub-red border-grub-red'
                      : 'text-gray-700 hover:bg-gray-50 border-transparent'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${active ? 'text-grub-red' : 'text-gray-500 group-hover:text-grub-red'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-grub-red rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">B</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Bistro Montreal
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Partner Account
                </p>
              </div>
            </div>

            {/* Language switcher */}
            <button
              onClick={handleLanguageToggle}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mb-2"
            >
              <Globe className="h-4 w-4" />
              <span className="font-medium uppercase">
                {i18n.language}
              </span>
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('dashboard.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
          <div className="mx-auto w-full max-w-7xl flex items-center justify-between h-14 lg:h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Open sidebar"
              >
                <MenuIcon className="h-6 w-6" />
              </button>

              <div className="flex items-center">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {navigation.find(item => isCurrentPath(item.href))?.name || t('dashboard.overview')}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Language switcher - mobile */}
              <button
                onClick={handleLanguageToggle}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={t('common.language')}
              >
                <Globe className="h-5 w-5" />
              </button>
              
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="h-6 w-6 relative">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5-5 5h5zM9 7l5 5 5-5H9z" />
                  </svg>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;





