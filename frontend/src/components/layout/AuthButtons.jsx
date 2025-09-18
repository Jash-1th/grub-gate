import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { navigation } from '../../data';

/**
 * Reusable authentication buttons component that can be used in both desktop and mobile views
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for the container
 * @param {boolean} [props.isMobile] - Whether the buttons are displayed in mobile view
 */
const AuthButtons = ({ className = '', isMobile = false }) => {
  const { t } = useTranslation();
  const { openSignupModal, toggleLoginModal } = useModal();

  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-4'} ${className}`}>
      {navigation.auth.map((item) => {
        if (item.name === 'signup') {
          return (
            <button
              key={item.name}
              onClick={openSignupModal}
              className="w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red text-grub-red bg-white border-2 border-grub-red hover:bg-red-700 hover:text-white"
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
              className="w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red text-white bg-grub-red border-2 border-transparent hover:bg-red-700"
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
              `w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red ${
                isActive
                  ? 'bg-grub-red text-white border-2 border-transparent'
                  : 'text-grub-red bg-white border-2 border-grub-red hover:bg-red-700 hover:text-white'
              }`
            }
          >
            {t(item.name)}
          </NavLink>
        );
      })}
    </div>
  );
};

export default AuthButtons;
