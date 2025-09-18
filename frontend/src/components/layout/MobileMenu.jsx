import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { navigation } from '../../data';
import NavIcon from './NavIcon';
import AuthButtons from './AuthButtons';
import LanguageSwitcher from '../common/LanguageSwitcher';

/**
 * Mobile menu component that slides in from the right
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the menu is open
 * @param {Function} props.onClose - Function to close the menu
 */
const MobileMenu = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (event.target.closest('.mobile-menu-panel')) return;
      onClose();
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Slide-in panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="mobile-menu-panel w-screen max-w-xs bg-white shadow-xl">
          <div className="flex h-full flex-col overflow-y-auto">
            {/* Header with close button */}
            <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">{t('navigation.menu')}</h2>
              <button
                type="button"
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-grub-red"
                onClick={onClose}
              >
                <span className="sr-only">{t('common.close')}</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigation.main.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/'}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-3 text-base font-medium rounded-md ${
                      isActive ? 'bg-gray-100 text-grub-red' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  onClick={onClose}
                >
                  <span className="inline-flex items-center justify-center w-6 mr-3">
                    <NavIcon name={item.name} />
                  </span>
                  {t(`nav.${item.name}`)}
                </NavLink>
              ))}
            </nav>

            {/* Auth buttons */}
            <div className="border-t border-gray-200 p-4">
              <AuthButtons isMobile={true} className="space-y-3" />
            </div>

            {/* Language switcher */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-center">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
