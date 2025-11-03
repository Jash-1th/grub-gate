import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, 
  faBars, 
  faShoppingBag, 
  faChartBar, 
  faUsers, 
  faCog, 
  faQuestionCircle,
  faSignOutAlt,
  faGlobe,
  faBell,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { Logo, Button } from '@grub-gate/ui';
import MobileBottomNav from './MobileBottomNav';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { useResponsive } from '../../hooks/useResponsive';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout = ({ onLanguageChange }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { getRestaurantName, getRestaurantInitial } = useRestaurant();
  const { isMobile, isTablet, isClient } = useResponsive();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
    onLanguageChange?.(newLang);
  };

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: faTachometerAlt },
    { name: 'Menu Management', href: '/dashboard/menu', icon: faBars },
    { name: 'Orders', href: '/dashboard/orders', icon: faShoppingBag },
    { name: 'Analytics', href: '/dashboard/analytics', icon: faChartBar },
    { name: 'Customers', href: '/dashboard/customers', icon: faUsers },
    { name: 'Settings', href: '/dashboard/settings', icon: faCog },
    { name: 'Support', href: '/dashboard/support', icon: faQuestionCircle },
    // { name: '🧪 Test Notifications', href: '/dashboard/test/notifications', icon: faBell },
  ];

  const isCurrentPath = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout fails
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isClient && (isMobile || isTablet) && sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center justify-between px-4 mb-4">
                <Logo size="lg" />
                <button
                  className="flex items-center justify-center h-8 w-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-5 px-2 space-y-1">
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
                      className={`group w-full flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        active
                          ? 'bg-red-50 text-grub-red'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <FontAwesomeIcon icon={Icon} className={`mr-4 h-6 w-6 ${
                        active ? 'text-grub-red' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      {item.name}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-grub-red rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{getRestaurantInitial()}</span>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                    {getRestaurantName()}
                  </p>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    Partner Account
                  </p>
                </div>
              </div>
              
              {/* Mobile Language switcher */}
              <button
                onClick={handleLanguageToggle}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mb-2"
              >
                <FontAwesomeIcon icon={faGlobe} className="h-4 w-4" />
                <span className="font-medium uppercase">
                  {i18n.language}
                </span>
              </button>
              
              {/* Mobile Logout button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
                <span>{t('dashboard.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:bg-white lg:shadow-lg lg:flex">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <NavLink to="/" aria-label="Go to landing page" className="inline-flex">
              <Logo size="lg" />
            </NavLink>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isCurrentPath(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`group w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors border-l-4 ${
                    active
                      ? 'bg-red-50 text-grub-red border-grub-red'
                      : 'text-gray-700 hover:bg-gray-50 border-transparent'
                  }`}
                >
                  <FontAwesomeIcon icon={Icon} className={`mr-3 h-5 w-5 ${active ? 'text-grub-red' : 'text-gray-500 group-hover:text-grub-red'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-grub-red rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{getRestaurantInitial()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getRestaurantName()}
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
              <FontAwesomeIcon icon={faGlobe} className="h-4 w-4" />
              <span className="font-medium uppercase">
                {i18n.language}
              </span>
            </button>
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
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
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-grub-red"
                onClick={() => setSidebarOpen(true)}
              >
                <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
              </button>
              
              {/* Mobile Logo */}
              <div className="lg:hidden ml-2 mr-4">
                <NavLink to="/" aria-label="Go to landing page" className="inline-flex">
                  <Logo size="lg" />
                </NavLink>
              </div>
              
              <div className="flex items-center">
                <h1 className="hidden sm:block text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">
                  {navigation.find(item => isCurrentPath(item.href))?.name || 'Overview'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
              {/* User avatar - mobile */}
              <div className="lg:hidden flex items-center">
                <div className="h-8 w-8 bg-grub-red rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">{getRestaurantInitial()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-3 sm:p-4 lg:p-6 xl:p-8 pb-24 sm:pb-28 lg:pb-8">
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








