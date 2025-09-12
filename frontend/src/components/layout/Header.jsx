import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { navigation, siteInfo } from '../../data';
// Use public path for SSR compatibility
const logoImage = '/icons/logo192.png';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useModal } from '../../context/ModalContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { openSignupModal, toggleLoginModal } = useModal();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Leftmost positioned */}
          <div className="flex-shrink-0 order-1">
            <Link to="/" className="flex items-center">
              <div className="flex items-center">
                {/* Logo Image */}
                <img 
                  src={logoImage} 
                  alt={siteInfo.logoText}
                  className="h-8 w-auto sm:h-10 md:h-12 object-contain"
                  style={{ boxShadow: "0px 4px 8px 0 black" , borderRadius:"10%" , marginLeft:"10px"}}
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center space-x-8 order-2 flex-1 justify-center">
            {navigation.main.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `text-gray-700 hover:text-grub-red px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive ? 'text-grub-red' : ''
                  }`
                }
              >
                {t(`nav.${item.name}`)}
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

          {/* Mobile menu button - Rightmost on mobile */}
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
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigation.main.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'text-grub-red bg-red-50'
                        : 'text-gray-700 hover:text-grub-red hover:bg-gray-50'
                    }`
                  }
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
