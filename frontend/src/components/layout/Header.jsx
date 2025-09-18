import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { navigation, siteInfo } from '../../data';
// Use public path for SSR compatibility
const logoImage = '/icons/logo192.png';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useModal } from '../../context/ModalContext';
import { useResponsiveNavigation } from '../../hooks/useResponsiveNavigation';
import './Header.css';
const howItWorksImage = '/images/HowItWorks.png';

// Reuse the same icons used in the mobile bottom nav
const getNavIcon = (key) => {
  switch (key) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
          <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" />
        </svg>
      );
    case 'about':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
          <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0H5z" />
        </svg>
      );
    case 'howItWorks':
      return (
        <div className="flex items-center justify-center">
          <img 
            src={howItWorksImage} 
            alt="How It Works" 
            className="w-3 h-3 md:w-4 md:h-4 object-contain"
            loading="lazy"
            width={12}
            height={12}
          />
        </div>
      );
    case 'contact':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 84.04" className="w-4 h-4 md:w-5 md:h-5" fill="currentColor"><path d="M34.11,3h83a5.8,5.8,0,0,1,5.79,5.79V70.27a5.76,5.76,0,0,1-1,3.25,2.32,2.32,0,0,1-.55.82,2.2,2.2,0,0,1-.54.38,5.78,5.78,0,0,1-3.7,1.35H68a15.44,15.44,0,0,0,.42-4.45h47.22L84.8,39.23,74.62,47.91h0a2.22,2.22,0,0,1-2.84,0L61.1,39.23h0l-9.69,9.71A12.4,12.4,0,0,0,47,47.07L57.64,36.41,37.91,20.32a14,14,0,0,0-.68-3.42l-.79-3.49L73.15,43.34,115.26,7.46H35.11L34.11,3ZM17.46,31a61.46,61.46,0,0,0,4.73,14.91A51.89,51.89,0,0,0,32.61,60.48a1.47,1.47,0,0,0,1.17.45,5.31,5.31,0,0,0,2-.67,17.91,17.91,0,0,0,2.1-1.36c3.14-2.18,7-4.89,10.29-1.85.08.07.12.14.2.2L58.84,68.78a1.13,1.13,0,0,1,.1.13,6.09,6.09,0,0,1,.79,5.77,14.31,14.31,0,0,1-3.94,5.76,13.76,13.76,0,0,1-7.94,3.46,29.8,29.8,0,0,1-8.28-.4,27.16,27.16,0,0,1-11.31-4.73,54.16,54.16,0,0,1-9.86-9.43l-.24-.29c-1.52-1.8-3.16-3.73-4.69-5.88A78.72,78.72,0,0,1,1,34.34C-.72,25.59-.37,16.85,3.33,9.62c2-4,5.06-7.2,9-8.69,3.44-1.32,7.51-1.34,12.13.63a1.67,1.67,0,0,1,1,1.24l3.73,16.58a4.57,4.57,0,0,1-.82,4.88,9.43,9.43,0,0,1-4.29,2.5c-.56.24-1.21.45-1.9.67-2.27.74-4.86,1.61-4.73,3.65v0Zm70.72,5.33,30.26,31.73V10.58L88.18,36.36Z"/></svg>
      );
    case 'faq':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm2.07-7.75l-.9.92A3.5 3.5 0 0013 13h-2v-.5c0-.83.67-1.5 1.5-1.5.56 0 1.07-.31 1.34-.8l.37-.74a2 2 0 10-3.58-1.86l-.89.45A3.5 3.5 0 1115.07 9.25z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
};

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { openSignupModal, toggleLoginModal } = useModal();
  const { isMobile, isClient } = useResponsiveNavigation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center h-20 sm:h-22 md:h-24">
          {/* Logo - Leftmost positioned */}
          <div className="flex-shrink-0 order-1">
            <Link to="/" className="flex items-center">
            <div className="flex items-center">
  {/* Logo Image - Larger & Fully Responsive */}
  <img
    src={logoImage}
    alt={siteInfo.logoText}
    className="
      h-14 w-28     
      sm:h-16 sm:w-32  
      md:h-20 md:w-100  
      object-contain  
      ml-2.5         
      rounded-lg     
      transition-all duration-300 ease-in-out
    "
    
  />
          </div>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center space-x-6 order-2 flex-1 justify-center">
            {navigation.main.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'} // Use exact matching for home
                className={({ isActive }) => {
                  // Special case for home to match exactly
                  const isActiveLink = item.href === '/' 
                    ? isActive 
                    : isActive && (typeof window !== 'undefined' && window.location.pathname === item.href);
                  
                  return `flex items-center gap-2 hover:text-grub-red px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActiveLink ? 'text-grub-red' : 'text-gray-700'
                  }`;
                }}
              >
                <span className="inline-flex items-center justify-center flex-shrink-0">{getNavIcon(item.name)}</span>
                <span className="truncate max-w-[10rem]" title={t(`nav.${item.name}`)}>{t(`nav.${item.name}`)}</span>
              </NavLink>
            ))}
          </nav>

          {/* Desktop Auth Buttons & Language Switcher - Rightmost */}
          <div className="hidden md:flex items-center space-x-4 order-3 shrink-10">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Auth Buttons */}
            {navigation.auth.map((item) => {
              if (item.name === 'signup') {
                return (
                  <button
                    key={item.name}
                    onClick={openSignupModal}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red text-grub-red bg-white border-2 border-grub-red hover:bg-red-700 hover:text-white"
                  >
                    {t('signup.button')}
                  </button>
                );
              }
              
              if (item.name === 'login') {
                return (
                  <button
                    key={item.name}
                    onClick={() => toggleLoginModal(true)}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red text-grub-red bg-white border-2 border-grub-red hover:bg-red-700 hover:text-white"
                  >
                    {t('login.button')}
                  </button>
                );
              }
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red ${
                      isActive
                        ? 'bg-grub-red text-white'  
                        : item.variant === 'primary'
                          ? 'bg-grub-red text-white hover:bg-red-700' // Style for INACTIVE primary link
                          : 'text-grub-red bg-white border-2 border-grub-red hover:bg-red-700 hover:text-white'// Style for INACTIVE secondary link
                    }`
                  }
                >
                  {t(item.name)}
                </NavLink>
              );
            })}
          </div>

          {/* Mobile Menu Toggle - Only show menu button on mobile */}
          {isClient && isMobile && (
            <div className="md:hidden order-3">
              <button
                onClick={toggleMobileMenu}
                className="mobile-menu-toggle p-2 text-gray-700 hover:text-grub-red hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-grub-red"
                aria-label="Toggle mobile menu"
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
          )}

          {/* Desktop Mobile Menu Button - Only show on desktop for now */}
          {isClient && !isMobile && (
            <div className="md:hidden order-3">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-700 hover:text-grub-red focus:outline-none focus:text-grub-red"
                aria-label="Toggle mobile menu"
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
          )}
        </div>

        {/* Mobile Navigation - Show on mobile when menu is open */}
        {isClient && isMobile && isMobileMenuOpen && (
          <div className="md:hidden mobile-nav-dropdown">
            <div className="px-4 pt-4 pb-4 bg-white border-t border-gray-200">
              {/* Language Switcher Section */}
              <div className="mobile-menu-language mb-6">
                <LanguageSwitcher />
              </div>
              
              {/* Auth Buttons */}
              <div className="mobile-menu-auth">
                {navigation.auth.map((item) => {
                  if (item.name === 'signup') {
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          openSignupModal();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 text-grub-red border border-grub-red hover:bg-grub-red hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red mb-3"
                      >
                        {t('signup.button')}
                      </button>
                    );
                  }
                  
                  if (item.name === 'login') {
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          toggleLoginModal();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 text-grub-red border border-grub-red hover:bg-grub-red hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red"
                      >
                        {t('login.button')}
                      </button>
                    );
                  }
                  
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className="w-full px-4 py-3 text-sm font-medium rounded-md text-center transition-all duration-200 text-grub-red border border-grub-red hover:bg-grub-red hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t(item.name)}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Desktop Mobile Navigation - Show on desktop when menu is open */}
        {isClient && !isMobile && isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigation.main.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/'} // Use exact matching for home
                  className={({ isActive }) => {
                    // Special case for home to match exactly
                    const isActiveLink = item.href === '/' 
                      ? isActive 
                      : isActive && (typeof window !== 'undefined' && window.location.pathname === item.href);
                    
                    return `block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                      isActiveLink
                        ? 'text-grub-red bg-red-50'
                        : 'text-gray-700 hover:text-grub-red hover:bg-gray-50'
                    }`;
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(`nav.${item.name}`)}
                </NavLink>
              ))}
              <div className="pt-4 pb-3 border-t border-gray-200">
                {/* Mobile Language Switcher */}
                <div className="flex justify-center mb-4">
                  <LanguageSwitcher />
                </div>
                
                <div className="flex flex-col space-y-2">
                  {navigation.auth.map((item) => {
                    if (item.name === 'signup') {
                      return (
                        <button
                          key={item.name}
                          onClick={() => {
                            openSignupModal();
                            setIsMobileMenuOpen(false);
                          }}
                          className="px-4 py-2 text-sm font-medium rounded-lg text-center transition-all duration-200 text-grub-red bg-white border-2 border-grub-red hover:bg-grub-red hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red"
                        >
                          {t('signup.button')}
                        </button>
                      );
                    }
                    
                    if (item.name === 'login') {
                      return (
                        <button
                          key={item.name}
                          onClick={() => {
                            toggleLoginModal(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="px-4 py-2 text-sm font-medium rounded-lg text-center transition-all duration-200 text-grub-red bg-white border-2 border-grub-red hover:bg-grub-red hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red"
                        >
                          {t('login.button')}
                        </button>
                      );
                    }
                    
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={`px-4 py-2 text-sm font-medium rounded-lg text-center transition-all duration-200 ${
                          item.variant === 'primary'
                            ? 'bg-grub-red text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red'
                            : 'text-grub-red bg-white border-2 border-grub-red hover:bg-grub-red hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t(item.name)}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
