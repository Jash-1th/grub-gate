import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { navigation, siteInfo } from '../../data';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useResponsiveNavigation } from '../../hooks/useResponsiveNavigation';
import { useAuth } from '../../contexts/AuthContext';
import AuthButtons from './AuthButtons';
import MobileMenu from './MobileMenu';
import NavIcon from './NavIcon';
import './Header.css';

// Use public path for SSR compatibility
const logoImage = '/icons/logo192.png';

/**
 * Header component that renders the main navigation bar
 * Handles both desktop and mobile views with a responsive design
 */
const Header = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { isMobile } = useResponsiveNavigation();
  const { isAuthenticated, user } = useAuth();

  // Set mounted state on client side
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (!isMounted) return;
    
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };

    window.addEventListener('popstate', handleRouteChange);
    
    // Cleanup function
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isMounted]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full">
        <div className="flex justify-between items-center h-18 m:h-18 md:h-17 px-4 mx-auto">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src={logoImage}
                alt={siteInfo.logoText}
                className="h-14 w-28 sm:h-16 sm:w-32 md:h-20 md:w-40 object-contain ml-2.5 rounded-lg transition-all duration-300 ease-in-out"
                loading="lazy"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigation.main.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => 
                  `flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md
                  ${isActive 
                    ? 'text-grub-red bg-red-50' 
                    : 'text-gray-700 hover:text-grub-red hover:bg-gray-50'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`inline-flex items-center justify-center flex-shrink-0 ${isActive ? 'text-grub-red' : 'text-gray-500'}`}>
                      <NavIcon name={item.name} />
                    </span>
                    <span className="truncate max-w-[10rem]" title={t(`nav.${item.name}`)}>
                      {t(`nav.${item.name}`)}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Auth Buttons & Language Switcher */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="border-r border-gray-200 pr-6 h-8 flex items-center">
              <LanguageSwitcher />
            </div>
            <div className="flex items-center space-x-3">
              <AuthButtons />
            </div>
          </div>

          {/* Mobile User Greeting & Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile User Greeting */}
            {isAuthenticated && user && (
              <div className="flex items-center space-x-2 max-w-[200px] sm:max-w-none">
                <div className="w-8 h-8 bg-gradient-to-r from-grub-red to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {(user.firstName || user.name || user.email.split('@')[0]).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    Hi, {user.firstName || user.name || user.email.split('@')[0]}! 👋
                  </span>
                </div>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-700 hover:text-grub-red hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-grub-red"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu isOpen={isMobileMenuOpen} onClose={toggleMobileMenu} />
      </div>
    </header>
  );
};

export default Header;
