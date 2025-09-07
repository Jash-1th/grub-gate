import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language || 'en';

  return (
    <div className="flex items-center bg-gray-100 rounded-full p-1">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
          currentLanguage === 'en'
            ? 'bg-grub-red text-white shadow-sm'
            : 'text-gray-600 hover:text-grub-red hover:bg-white'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('fr')}
        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
          currentLanguage === 'fr'
            ? 'bg-grub-red text-white shadow-sm'
            : 'text-gray-600 hover:text-grub-red hover:bg-white'
        }`}
        aria-label="Switch to French"
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
