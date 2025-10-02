import React, { useState } from 'react';

const PreferencesFilterModal = ({
  isOpen,
  onClose,
  selectedPreferences,
  onPreferencesChange,
  onApply
}) => {
  const [localPreferences, setLocalPreferences] = useState(selectedPreferences || []);


  if (!isOpen) return null;

  const preferences = [
    { id: 'vegetarian', name: 'Vegetarian', icon: '🥗' },
    { id: 'vegan', name: 'Vegan', icon: '🌱' },
    { id: 'gluten-free', name: 'Gluten Free', icon: '🌾' },
    { id: 'dairy-free', name: 'Dairy Free', icon: '🥛' },
    { id: 'keto', name: 'Keto', icon: '🥑' },
    { id: 'halal', name: 'Halal', icon: '🕌' },
    { id: 'kosher', name: 'Kosher', icon: '✡️' }
  ];

  const handlePreferenceToggle = (preferenceId) => {
    const newPreferences = localPreferences.includes(preferenceId)
      ? localPreferences.filter(p => p !== preferenceId)
      : [...localPreferences, preferenceId];
    setLocalPreferences(newPreferences);
  };

  const handleApply = () => {
    onPreferencesChange(localPreferences);
    onApply(localPreferences);
    onClose();
  };

  const handleCancel = () => {
    setLocalPreferences(selectedPreferences || []);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4" role="dialog" data-modal="preferences-filter">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Food Preferences</span>
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Select your dietary preferences to filter menu items:
          </p>

          {/* Preferences Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {preferences.map((preference) => {
              const isSelected = localPreferences.includes(preference.id);
              
              return (
                <button
                  key={preference.id}
                  onClick={() => handlePreferenceToggle(preference.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                    isSelected
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{preference.icon}</span>
                  <span className="font-medium">{preference.name}</span>
                  {isSelected && (
                    <svg className="w-5 h-5 text-green-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Summary */}
          {localPreferences.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-3">Selected Preferences:</h4>
              <div className="flex flex-wrap gap-2">
                {localPreferences.map((prefId) => {
                  const pref = preferences.find(p => p.id === prefId);
                  return pref ? (
                    <span
                      key={prefId}
                      className="inline-flex items-center space-x-1 bg-white border border-green-300 rounded-full px-3 py-1 text-sm text-green-800"
                    >
                      <span>{pref.icon}</span>
                      <span>{pref.name}</span>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Apply {localPreferences.length > 0 ? `(${localPreferences.length})` : ''}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesFilterModal;
