import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, ArrowRightOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { navigation } from '../../data';
import NavIcon from './NavIcon';
import AuthButtons from './AuthButtons';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useModal } from '../../context/ModalContext';

/**
 * Mobile menu component that slides in from the right
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the menu is open
 * @param {Function} props.onClose - Function to close the menu
 */
const MobileMenu = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { openSignupModal, toggleLoginModal } = useModal();

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
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} aria-hidden="true" />
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto mobile-menu-panel">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{t('menu')}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-grub-red"
            >
              <span className="sr-only">{t('close')}</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Language and Auth Section - Main Content */}
          <div className="flex-1 flex flex-col p-6 space-y-8 justify-center">
            {/* Language Switcher */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-grub-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {t('language')}
              </h3>
              <div className="flex justify-center">
                <LanguageSwitcher />
              </div>
            </div>
            
            {/* Auth Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  openSignupModal();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-grub-red to-red-600 text-white text-base font-semibold rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
              >
                <UserPlusIcon className="w-5 h-3" />
                <span>{t('signup.button')}</span>
              </button>
              
              <button
                onClick={() => {
                  toggleLoginModal(true);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 text-gray-800 text-base font-semibold rounded-xl hover:bg-gray-50 transition-all transform hover:scale-[1.02] active:scale-95 shadow-md"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>{t('login.button')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
