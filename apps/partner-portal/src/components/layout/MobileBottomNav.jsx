import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, 
  faUtensils, 
  faShoppingBag, 
  faChartBar, 
  faUsers, 
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { useResponsive } from '../../hooks/useResponsive';

/**
 * Mobile Bottom Navigation Component for Partner Portal Dashboard
 * Shows on mobile devices only and provides quick access to main dashboard sections
 */
const MobileBottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isMobile } = useResponsive();

  // Main navigation items for mobile (limited to 5 for better UX)
  const mobileNavigation = [
    { 
      name: 'overview', 
      href: '/dashboard', 
      icon: faTachometerAlt,
      label: 'Overview'
    },
    { 
      name: 'menu', 
      href: '/dashboard/menu', 
      icon: faUtensils,
      label: 'Menu'
    },
    { 
      name: 'orders', 
      href: '/dashboard/orders', 
      icon: faShoppingBag,
      label: 'Orders'
    },
    { 
      name: 'analytics', 
      href: '/dashboard/analytics', 
      icon: faChartBar,
      label: 'Analytics'
    },
    { 
      name: 'settings', 
      href: '/dashboard/settings', 
      icon: faCog,
      label: 'Settings'
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] pb-[max(env(safe-area-inset-bottom),4px)] safe-area-inset-bottom">
      {/* Main Navigation */}
      <ul className="flex items-stretch justify-between px-1 py-1">
        {mobileNavigation.map((item) => {
          const iconDef = item.icon;
          const isActive = isCurrentPath(item.href);
          
          return (
            <li key={item.name} className="flex-1 min-w-0">
              <NavLink
                to={item.href}
                end={item.href === '/dashboard'}
                className={`flex flex-col items-center justify-center h-14 sm:h-16 text-[9px] sm:text-[10px] leading-tight font-medium transition-all duration-200 rounded-xl mx-0.5 sm:mx-1 ${
                  isActive 
                    ? 'text-grub-red bg-red-50 shadow-sm' 
                    : 'text-gray-600 hover:text-grub-red hover:bg-gray-50 active:bg-gray-100'
                }`}
                aria-label={item.label}
              >
                <div className="flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 mb-0.5 sm:mb-1 flex-shrink-0">
                  <FontAwesomeIcon icon={iconDef} className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                </div>
                <div className="flex items-center justify-center h-4 sm:h-5 text-center min-w-0 w-full px-0.5 sm:px-1">
                  <span 
                    className="block w-full overflow-hidden text-ellipsis whitespace-nowrap font-semibold" 
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
      <div className="absolute top-1 sm:top-2 right-2 sm:right-4">
        <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-500 rounded-full opacity-0 transition-opacity duration-200" id="mobile-nav-notification" />
      </div>
    </nav>
  );
};

export default MobileBottomNav;