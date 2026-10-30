import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { navigation, siteInfo } from '../../data';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useResponsiveNavigation } from '../../hooks/useResponsiveNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { useModal } from '../../context/ModalContext';
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
  const { openUserProfileModal } = useModal();

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
        <div className="flex justify-between items-center h-14 sm:h-[3.75rem] md:h-16 px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mx-auto max-w-[1920px]">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src={logoImage}
                alt={siteInfo.logoText}
                className="h-10 w-20 xs:h-11 xs:w-[5.5rem] sm:h-12 sm:w-24 md:h-[3.25rem] md:w-[6.5rem] object-contain rounded-lg transition-all duration-300 ease-in-out"
                loading="lazy"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
            {navigation.main
              .filter(item => !item.protected || isAuthenticated)
              .map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm xl:text-base font-medium transition-colors duration-200 rounded-md
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
                    <span className="truncate max-w-[8rem] lg:max-w-[10rem] xl:max-w-[12rem]" title={t(`nav.${item.name}`)}>
                      {t(`nav.${item.name}`)}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Auth Buttons & Language Switcher */}
          <div className="hidden xl:flex items-center space-x-3 lg:space-x-4 xl:space-x-6">
            <div className="border-r border-gray-200 pr-3 lg:pr-4 xl:pr-6 h-8 flex items-center">
              <LanguageSwitcher />
            </div>
            <div className="flex items-center space-x-2 lg:space-x-3">
              <AuthButtons />
            </div>
          </div>

          {/* Mobile User Greeting & Menu Button */}
          <div className="xl:hidden flex items-center space-x-2 xs:space-x-3">
            {/* Mobile User Greeting */}
            {isAuthenticated && user && (
              <div className="flex items-center space-x-1.5 xs:space-x-2 max-w-[140px] xs:max-w-[180px] sm:max-w-none">
                <button
                  type="button"
                  onClick={openUserProfileModal}
                  className="w-7 h-7 xs:w-8 xs:h-8 bg-gradient-to-r from-grub-red via-grub-red to-grub-red rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red"
                  aria-label="Open profile"
                  title="Profile"
                >
                  <span className="text-white text-xs xs:text-sm font-semibold">
                    {(user.firstName || user.name || user.email.split('@')[0]).charAt(0).toUpperCase()}
                  </span>
                </button>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-1.5 xs:p-2 text-gray-700 hover:text-grub-red hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-grub-red"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="h-5 w-5 xs:h-6 xs:w-6"
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
