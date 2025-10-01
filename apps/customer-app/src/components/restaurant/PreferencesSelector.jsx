import React from 'react';
import { foodPreferences } from '../../utils/filteringHelpers';

const PreferencesSelector = ({
  selectedPreferences,
  onPreferencesChange,
  showPreferences,
  onTogglePreferences,
  userType = 'normal'
}) => {
  // Get icon for preference type
  const getPreferenceIcon = (preferenceId) => {
    const icons = {
      'vegetarian': '🥗',
      'vegan': '🌱',
      'gluten-free': '🌾',
      'dairy-free': '🥛',
      'keto': '🥑',
      'halal': '🕌',
      'kosher': '✡️'
    };
    return icons[preferenceId] || '🍽️';
  };

  const handlePreferenceToggle = (preferenceId) => {
    const newPreferences = selectedPreferences.includes(preferenceId)
      ? selectedPreferences.filter(id => id !== preferenceId)
      : [...selectedPreferences, preferenceId];
    onPreferencesChange(newPreferences);
  };

  const handleClearAll = () => {
    onPreferencesChange([]);
  };

  const isPro = userType === 'pro';

  if (!showPreferences) {
    return (
      <button
        onClick={() => onTogglePreferences(true)}
        className={`w-full bg-white rounded-xl shadow-lg border-2 p-4 sm:p-6 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-left ${
          isPro 
            ? 'border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:border-purple-400 hover:shadow-xl' 
            : 'border-gray-200 hover:bg-gray-50 hover:border-red-300 hover:shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
              isPro 
                ? 'bg-gradient-to-r from-purple-100 to-indigo-100' 
                : 'bg-gradient-to-r from-red-100 to-red-200'
            }`}>
              <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${isPro ? 'text-purple-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <h3 className={`text-base sm:text-lg font-bold text-gray-900 ${isPro ? 'text-purple-900' : ''}`}>
                  Food Preferences
                </h3>
                {isPro && (
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center">
                    <span className="mr-1">✨</span>PRO
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                {selectedPreferences.length > 0 
                  ? `${selectedPreferences.length} ${isPro ? 'preferences selected - Advanced filtering active' : 'dietary preferences selected'}` 
                  : `Tap to select your dietary preferences and ${isPro ? 'get smart recommendations' : 'filter menu items'}`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {selectedPreferences.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className={`bg-gradient-to-r from-${isPro ? 'purple' : 'red'}-500 to-${isPro ? 'purple' : 'red'}-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md`}>
                  {selectedPreferences.length}
                </span>
                <div className={`w-2 h-2 bg-${isPro ? 'yellow' : 'green'}-${isPro ? '400' : '500'} rounded-full animate-pulse`}></div>
              </div>
            )}
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-${isPro ? 'lg' : 'sm'} border border-${isPro ? 'purple' : 'gray'}-200 p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            Select your dietary preferences
            {isPro && (
              <span className="ml-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">PRO</span>
            )}
          </h3>
          <p className="text-sm text-gray-600">
            {isPro 
              ? 'Advanced filtering to show you the best-rated items that match your needs.'
              : "We'll show you menu items that match your needs."
            }
          </p>
        </div>
        <button
          onClick={() => onTogglePreferences(false)}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {foodPreferences.map((preference) => (
          <button
            key={preference.id}
            onClick={() => handlePreferenceToggle(preference.id)}
            className={`flex items-center space-x-2 py-3 px-3 rounded-lg border transition-all duration-200 ${
              selectedPreferences.includes(preference.id)
                ? `border-${isPro ? 'purple' : 'green'}-500 bg-${isPro ? 'purple' : 'green'}-50 text-${isPro ? 'purple' : 'green'}-800`
                : `border-gray-200 bg-white text-gray-700 hover:border-${isPro ? 'purple' : 'green'}-300 hover:bg-${isPro ? 'purple' : 'green'}-25`
            }`}
          >
            {selectedPreferences.includes(preference.id) && (
              <div className="flex-shrink-0">
                <svg className={`w-4 h-4 text-${isPro ? 'purple' : 'green'}-600`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className="flex items-center space-x-1 flex-1 min-w-0">
              <span className="text-base flex-shrink-0">{getPreferenceIcon(preference.id)}</span>
              <span className="font-medium truncate text-sm">{preference.name}</span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={handleClearAll}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Clear All
        </button>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500">
            {selectedPreferences.length > 0 
              ? `${selectedPreferences.length} preference${selectedPreferences.length > 1 ? 's' : ''} selected` 
              : 'No preferences selected'
            }
          </span>
          <button
            onClick={() => onTogglePreferences(false)}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedPreferences.length > 0
                ? `bg-${isPro ? 'purple' : 'green'}-500 hover:bg-${isPro ? 'purple' : 'green'}-600 text-white`
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            Apply {selectedPreferences.length > 0 ? `(${selectedPreferences.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSelector;
