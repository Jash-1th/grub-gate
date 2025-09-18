import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { navigation, siteInfo } from '../../data';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useResponsiveNavigation } from '../../hooks/useResponsiveNavigation';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { isMobile } = useResponsiveNavigation();

  // Close mobile menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center h-20 sm:h-22 md:h-24 px-4">
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
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.main.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center gap-2 hover:text-grub-red px-3 py-2 text-sm font-medium transition-colors duration-200 text-gray-700"
              >
                <span className="inline-flex items-center justify-center flex-shrink-0">
                  <NavIcon name={item.name} />
                </span>
                <span className="truncate max-w-[10rem]" title={t(`nav.${item.name}`)}>
                  {t(`nav.${item.name}`)}
                </span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons & Language Switcher */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            <AuthButtons />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
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
