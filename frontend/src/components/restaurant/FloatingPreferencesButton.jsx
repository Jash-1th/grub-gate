import React from 'react';

const FloatingPreferencesButton = ({ 
  selectedPreferences, 
  onPreferencesClick,
  scrollToPreferences 
}) => {
  const handleClick = () => {
    onPreferencesClick(true);
    scrollToPreferences();
  };

  return (
    <div className="fixed top-20 right-4 z-50">
      <button
        onClick={handleClick}
        className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
        title="Filter by Preferences"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {selectedPreferences.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {selectedPreferences.length}
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingPreferencesButton;
