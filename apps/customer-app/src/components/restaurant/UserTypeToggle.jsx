import React from 'react';
import { useTranslation } from 'react-i18next';

const UserTypeToggle = ({ userType, onUserTypeChange, disableProOption = false }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="flex items-center justify-center">
          <div className="relative bg-gray-100 rounded-2xl p-1 shadow-inner w-full max-w-md sm:w-auto">
            <div className="flex flex-nowrap">
              {/* Normal User Button */}
              <button
                onClick={() => onUserTypeChange('normal')}
                className={`relative flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 transform ${
                  userType === 'normal'
                    ? 'bg-white text-gray-900 shadow-md scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                <div className="flex items-center justify-center space-x-1 sm:space-x-2 whitespace-nowrap">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{t('restaurantDetail.dispersedMenu')}</span>
                </div>
                {userType === 'normal' && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
                )}
              </button>

              {/* Pro User Button */}
              <button
                onClick={disableProOption ? undefined : () => onUserTypeChange('pro')}
                disabled={disableProOption}
                className={`relative flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 transform ${
                  disableProOption
                    ? 'text-gray-400 bg-gray-200 cursor-not-allowed opacity-50'
                    : userType === 'pro'
                    ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white shadow-xl scale-105 ring-2 ring-purple-300/50'
                    : 'text-gray-600 hover:text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-1 sm:space-x-2 whitespace-nowrap">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span>{t('restaurantDetail.constraintMenu')}</span>
                </div>
                {userType === 'pro' && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-pulse"></div>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* User Type Description */}
        <div className="text-center mt-3 sm:mt-4">
          {userType === 'normal' ? (
            <div>
              <p className="text-gray-600 text-xs sm:text-sm px-4">
                {t('restaurantDetail.dispersedMenuDescription')}
              </p>
              {disableProOption && (
                <p className="text-gray-500 text-xs mt-2 px-4">
                  {t('restaurantDetail.proFeaturesUnavailable')}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 sm:p-4 mx-2 sm:mx-0 border border-purple-100">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <span className="text-lg">✨</span>
                <p className="text-purple-700 text-xs sm:text-sm font-semibold">
                  {t('restaurantDetail.constraintFeaturesUnlocked')}
                </p>
              </div>
              <p className="text-purple-600 text-xs leading-relaxed">
                {t('restaurantDetail.constraintMenuDescription')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTypeToggle;
