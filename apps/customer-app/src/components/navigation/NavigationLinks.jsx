// FILE: apps/customer-app/src/components/navigation/NavigationLinks.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faUtensils,
  faMapMarkerAlt,
  faShoppingCart,
  faUser,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

/**
 * Navigation Links Component
 * Updated to include new address and checkout routes
 */
const NavigationLinks = ({ className = '', onLinkClick }) => {
  const location = useLocation();

  const navigationItems = [
    {
      path: '/',
      label: 'Home',
      icon: faHome
    },
    {
      path: '/plan',
      label: 'Plan Meals',
      icon: faCalendarAlt
    },
    {
      path: '/weekly-menu',
      label: 'My Menu',
      icon: faUtensils,
      protected: true
    },
    {
      path: '/addresses',
      label: 'Addresses',
      icon: faMapMarkerAlt,
      protected: true
    },
    {
      path: '/subscription',
      label: 'Subscription',
      icon: faUser,
      protected: true
    }
  ];

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={className}>
      <ul className="space-y-2">
        {navigationItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              onClick={onLinkClick}
              className={`
                flex items-center px-4 py-3 rounded-lg transition-all duration-200
                ${isActivePath(item.path)
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }
              `}
            >
              <FontAwesomeIcon 
                icon={item.icon} 
                className={`mr-3 w-5 h-5 ${
                  isActivePath(item.path) ? 'text-blue-600' : 'text-gray-400'
                }`} 
              />
              <span className="font-medium">{item.label}</span>
              {item.protected && (
                <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Account
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavigationLinks;
