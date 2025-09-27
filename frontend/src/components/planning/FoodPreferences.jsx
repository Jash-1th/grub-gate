import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

// Food preference options data - can be moved to backend later
const foodPreferences = [
  {
    id: 'vegetarian',
    key: 'vegetarian'
  },
  {
    id: 'vegan',
    key: 'vegan'
  },
  {
    id: 'gluten-free',
    key: 'glutenFree'
  },
  {
    id: 'dairy-free',
    key: 'dairyFree'
  },
  {
    id: 'keto',
    key: 'keto'
  },
  {
    id: 'halal',
    key: 'halal'
  },
  {
    id: 'kosher',
    key: 'kosher'
  },
  {
    id: 'low-carb',
    key: 'lowCarb'
  },
  {
    id: 'paleo',
    key: 'paleo'
  },
  {
    id: 'spicy',
    key: 'spicy'
  },
  {
    id: 'organic',
    key: 'organic'
  },
  {
    id: 'sugar-free',
    key: 'sugarFree'
  },
  {
    id: 'nut-free',
    key: 'nutFree'
  },
  {
    id: 'soy-free',
    key: 'soyFree'
  },
  {
    id: 'raw-food',
    key: 'rawFood'
  },
  {
    id: 'mediterranean',
    key: 'mediterranean'
  },
  {
    id: 'low-sodium',
    key: 'lowSodium'
  },
  {
    id: 'high-protein',
    key: 'highProtein'
  },
  {
    id: 'whole30',
    key: 'whole30'
  },
  {
    id: 'pescatarian',
    key: 'pescatarian'
  }
];

// Individual preference option component
const PreferenceOption = ({ preference, isSelected, onToggle }) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={() => onToggle(preference.id)}
      className={`
        inline-flex items-center justify-center px-4 py-2 rounded-lg border-2
        hover:scale-105 focus:outline-none whitespace-nowrap
        transition-transform duration-300
        ${isSelected 
          ? 'border-grub-red bg-grub-red text-white shadow-lg' 
          : 'border-gray-300 bg-white text-gray-700 hover:border-grub-red hover:bg-grub-red/5 hover:shadow-sm focus:border-gray-400'
        }
      `}
      aria-pressed={isSelected}
      aria-label={t(`mealPlanning.preferences.options.${preference.key}.label`)}
    >
      <span className="text-sm font-medium">
        {t(`mealPlanning.preferences.options.${preference.key}.name`)}
      </span>
    </button>
  );
};

const FoodPreferences = ({ onPreferencesChange }) => {
  const { t } = useTranslation();
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handlePreferenceToggle = (preferenceId) => {
    setSelectedPreferences(prev => {
      const newPreferences = prev.includes(preferenceId)
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId];
      
      // Notify parent component of preference changes
      if (onPreferencesChange) {
        onPreferencesChange(newPreferences);
      }
      
      return newPreferences;
    });
  };

  const clearAllPreferences = () => {
    setSelectedPreferences([]);
    // Notify parent component of cleared preferences
    if (onPreferencesChange) {
      onPreferencesChange([]);
    }
  };

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  React.useEffect(() => {
    checkScrollButtons();
    const handleResize = () => checkScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={sectionRef}
          className={`scroll-animate ${isVisible ? 'is-visible' : ''}`}
        >
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {t('mealPlanning.preferences.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('mealPlanning.preferences.subtitle')}
            </p>
          </div>

          {/* Preferences Horizontal Scroll */}
          <div className="relative mb-6">
            {/* Left Arrow */}
            <button
              onClick={scrollLeft}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full shadow-xl border-2 flex items-center justify-center transition-all duration-300 ${
                canScrollLeft 
                  ? 'bg-grub-red border-grub-red text-white hover:bg-red-600 hover:border-red-600 hover:shadow-2xl hover:scale-110' 
                  : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed text-gray-400'
              }`}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Scrollable Container */}
            <div 
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide px-12"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={checkScrollButtons}
            >
              {foodPreferences.map((preference) => (
                <div key={preference.id} className="flex-shrink-0">
                  <PreferenceOption
                    preference={preference}
                    isSelected={selectedPreferences.includes(preference.id)}
                    onToggle={handlePreferenceToggle}
                  />
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={scrollRight}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full shadow-xl border-2 flex items-center justify-center transition-all duration-300 ${
                canScrollRight 
                  ? 'bg-grub-red border-grub-red text-white hover:bg-red-600 hover:border-red-600 hover:shadow-2xl hover:scale-110' 
                  : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed text-gray-400'
              }`}
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {selectedPreferences.length > 0 && (
              <button
                onClick={clearAllPreferences}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 hover:text-gray-900 text-sm font-medium rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-200 hover:shadow-md active:scale-95"
              >
                {t('mealPlanning.preferences.clearAll')}
              </button>
            )}
            
            <div className="text-sm text-gray-500">
              {selectedPreferences.length > 0 ? (
                t('mealPlanning.preferences.selectedCount', { count: selectedPreferences.length })
              ) : (
                t('mealPlanning.preferences.selectPrompt')
              )}
            </div>
          </div>

          {/* Selected Preferences Summary (for mobile) */}
          {selectedPreferences.length > 0 && (
            <div className="mt-6 p-4 bg-grub-red/5 rounded-lg border border-grub-red/20 sm:hidden">
              <h3 className="text-sm font-semibold text-grub-red mb-2">
                {t('mealPlanning.preferences.selectedTitle')}:
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedPreferences.map(prefId => {
                  const pref = foodPreferences.find(p => p.id === prefId);
                  return (
                    <span key={prefId} className="inline-flex items-center px-2 py-1 bg-white rounded-md text-xs">
                      {t(`mealPlanning.preferences.options.${pref?.key}.name`)}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FoodPreferences;
