import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlanning } from '../../contexts/PlanningContext';

const HeroPlan = ({ onNext }) => {
  const { t } = useTranslation();
  const { postalCode, setPostalCode, selectedPreferences, setSelectedPreferences } = usePlanning();
  const [localPostalCode, setLocalPostalCode] = useState(postalCode || '');
  const [showPreferences, setShowPreferences] = useState(false);

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
    const newPreferences = selectedPreferences.includes(preferenceId)
      ? selectedPreferences.filter(p => p !== preferenceId)
      : [...selectedPreferences, preferenceId];
    setSelectedPreferences(newPreferences);
  };

  const handleContinue = () => {
    if (localPostalCode.trim()) {
      setPostalCode(localPostalCode.trim());
      onNext();
    }
  };

  return (
    <div className="bg-gradient-to-br from-grub-red via-red-600 to-red-700 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Plan Your Perfect Week
          </h1>
          <p className="text-xl lg:text-2xl text-red-100 mb-8">
            Discover amazing restaurants and plan your meals for the entire week
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-gray-900">
            <h2 className="text-2xl font-bold mb-6 text-center">Get Started</h2>
            
            {/* Postal Code Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your postal code
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={localPostalCode}
                  onChange={(e) => setLocalPostalCode(e.target.value)}
                  placeholder="e.g., H3A 1A1"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red text-lg"
                />
              </div>
            </div>

            {/* Preferences Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Dietary Preferences (Optional)
                </label>
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="text-grub-red hover:text-red-600 text-sm font-medium"
                >
                  {showPreferences ? 'Hide' : 'Show'} Preferences
                </button>
              </div>

              {showPreferences && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {preferences.map((preference) => (
                    <button
                      key={preference.id}
                      onClick={() => handlePreferenceToggle(preference.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-2 ${
                        selectedPreferences.includes(preference.id)
                          ? 'border-grub-red bg-red-50 text-grub-red'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{preference.icon}</span>
                      <span className="text-sm font-medium">{preference.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedPreferences.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">{selectedPreferences.length}</span> dietary preferences selected
                  </p>
                </div>
              )}
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!localPostalCode.trim()}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                localPostalCode.trim()
                  ? 'bg-grub-red text-white hover:bg-red-600 transform hover:scale-[1.02]'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Find Restaurants Near Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroPlan;
