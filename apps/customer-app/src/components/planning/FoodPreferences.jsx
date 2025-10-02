import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FoodPreferences = ({ selectedPreferences = [], onPreferencesChange }) => {
  const { t } = useTranslation();

  const preferences = [
    { id: 'vegetarian', name: 'Vegetarian', icon: '🥗', description: 'No meat, fish, or poultry' },
    { id: 'vegan', name: 'Vegan', icon: '🌱', description: 'No animal products' },
    { id: 'gluten-free', name: 'Gluten Free', icon: '🌾', description: 'No wheat, barley, or rye' },
    { id: 'dairy-free', name: 'Dairy Free', icon: '🥛', description: 'No milk or dairy products' },
    { id: 'keto', name: 'Keto', icon: '🥑', description: 'Low carb, high fat' },
    { id: 'halal', name: 'Halal', icon: '🕌', description: 'Islamic dietary laws' },
    { id: 'kosher', name: 'Kosher', icon: '✡️', description: 'Jewish dietary laws' },
    { id: 'paleo', name: 'Paleo', icon: '🦴', description: 'Stone age diet' },
    { id: 'low-sodium', name: 'Low Sodium', icon: '🧂', description: 'Reduced salt content' },
    { id: 'nut-free', name: 'Nut Free', icon: '🥜', description: 'No nuts or nut products' }
  ];

  const handlePreferenceToggle = (preferenceId) => {
    const newPreferences = selectedPreferences.includes(preferenceId)
      ? selectedPreferences.filter(p => p !== preferenceId)
      : [...selectedPreferences, preferenceId];
    
    if (onPreferencesChange) {
      onPreferencesChange(newPreferences);
    }
  };

  return (
    <div className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Dietary Preferences
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select your dietary preferences to get personalized restaurant recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {preferences.map((preference) => (
            <button
              key={preference.id}
              onClick={() => handlePreferenceToggle(preference.id)}
              className={`p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg transform hover:scale-105 ${
                selectedPreferences.includes(preference.id)
                  ? 'border-grub-red bg-red-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-4">
                <span className="text-3xl">{preference.icon}</span>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    selectedPreferences.includes(preference.id)
                      ? 'text-grub-red'
                      : 'text-gray-900'
                  }`}>
                    {preference.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {preference.description}
                  </p>
                </div>
                {selectedPreferences.includes(preference.id) && (
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-grub-red" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {selectedPreferences.length > 0 && (
          <div className="mt-12 p-6 bg-green-50 border border-green-200 rounded-xl">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Great! You've selected {selectedPreferences.length} preference{selectedPreferences.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-green-700">
                We'll use these to recommend the best restaurants and dishes for you
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {selectedPreferences.map((prefId) => {
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
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodPreferences;
