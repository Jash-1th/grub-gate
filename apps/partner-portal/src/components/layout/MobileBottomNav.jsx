import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Menu as MenuIcon, 
  ShoppingBag, 
  BarChart3, 
  Users, 
  Settings
} from 'lucide-react';

/**
 * Mobile Bottom Navigation Component for Partner Portal Dashboard
 * Shows on mobile devices only and provides quick access to main dashboard sections
 */
const MobileBottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Main navigation items for mobile (limited to 5 for better UX)
  const mobileNavigation = [
    { 
      name: 'dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      label: t('dashboard.navigation.dashboard')
    },
    { 
      name: 'menu', 
      href: '/dashboard/menu', 
      icon: MenuIcon,
      label: t('dashboard.navigation.menu')
    },
    { 
      name: 'orders', 
      href: '/dashboard/orders', 
      icon: ShoppingBag,
      label: t('dashboard.navigation.orders')
    },
    { 
      name: 'analytics', 
      href: '/dashboard/analytics', 
      icon: BarChart3,
      label: t('dashboard.navigation.analytics')
    },
    { 
      name: 'settings', 
      href: '/dashboard/settings', 
      icon: Settings,
      label: t('dashboard.navigation.settings')
    }
  ];

  const isCurrentPath = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // Only show on dashboard routes
  if (!location.pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[max(env(safe-area-inset-bottom),0px)]">
      {/* Main Navigation */}
      <ul className="flex items-stretch justify-between px-2 py-2">
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = isCurrentPath(item.href);
          
          return (
            <li key={item.name} className="flex-1 min-w-0">
              <NavLink
                to={item.href}
                end={item.href === '/dashboard'}
                className={`flex flex-col items-center justify-center h-14 text-[11px] leading-tight font-medium transition-all duration-200 rounded-lg mx-0.5 ${
                  isActive 
                    ? 'text-grub-red bg-red-50' 
                    : 'text-gray-600 hover:text-grub-red hover:bg-gray-50'
                }`}
                aria-label={item.label}
              >
                <div className="flex items-center justify-center h-6 w-6 mb-1 flex-shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-center h-4 text-center min-w-0 w-full px-0.5">
                  <span 
                    className="block w-full overflow-hidden text-ellipsis whitespace-nowrap" 
                    title={item.label}
                  >
                    {item.label}
                  </span>
                </div>
              </NavLink>
            </li>
          );
        })}
      </ul>
      
      {/* Optional notification indicator */}
      <div className="absolute top-2 right-4">
        <div className="h-2 w-2 bg-red-500 rounded-full opacity-0 transition-opacity duration-200" id="mobile-nav-notification" />
      </div>
    </nav>
  );
};

export default MobileBottomNav;