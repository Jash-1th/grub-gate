import React, { useEffect, useRef } from 'react';
import { DAYS_OF_WEEK } from '../../utils/filteringAlgorithms';

const ItemDetailsModal = ({ 
  isOpen, 
  item, 
  userType, 
  activeDay, 
  selectedMealType, 
  isFromMenuSelection = false,
  hideAddButton = false,
  onClose, 
  onAddToPlan, 
  onDayChange, 
  onMealTypeChange 
}) => {
  const scrollPositionRef = useRef(0);
  const originalStylesRef = useRef({ body: '', html: '' });

  // Prevent background scrolling without position manipulation
  useEffect(() => {
    if (isOpen) {
      // Simply prevent scrolling without changing position
      const body = document.body;
      const originalOverflow = body.style.overflow;
      
      body.style.overflow = 'hidden';
      
      return () => {
        body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

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

  const isPro = userType === 'pro';


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-start sm:items-center justify-center p-2 sm:p-4 pt-4 pb-20 sm:pb-4" role="dialog" data-modal="item-details">
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-full sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          <img
            src={item.image || '/images/grub-gate-default-img.jpg'}
            alt={item.name}
            className="w-full h-40 sm:h-48 object-cover rounded-t-xl sm:rounded-t-2xl"
            onError={(e) => {
              e.target.src = '/images/grub-gate-default-img.jpg';
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black bg-opacity-50 text-white p-1.5 sm:p-2 rounded-full hover:bg-opacity-70 transition-all touch-manipulation"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 pb-6 sm:pb-6">
          {/* Title and Price */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2 sm:gap-0">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight">{item.name}</h2>
              <p className="text-gray-600 text-sm mb-2">{item.category}</p>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <div className="text-xl sm:text-2xl font-bold text-green-600">${item.price}</div>
              {item.preparationTime && (
                <div className="text-sm text-gray-500">⏱️ {item.preparationTime}</div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">
              {item.longDescription || item.description}
            </p>
          </div>

          {/* Dietary Preferences & Spice Level */}
          <div className="flex flex-wrap gap-2 mb-4">
            {item.dietaryPreferences?.map(pref => (
              <span key={pref} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {getPreferenceIcon(pref)} {pref}
              </span>
            ))}
            {item.spiceLevel > 0 && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                🌶️ Spice Level: {item.spiceLevel}/5
              </span>
            )}
          </div>

          {/* Ingredients */}
          {item.ingredients && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Ingredients:</h4>
              <div className="flex flex-wrap gap-1">
                {item.ingredients.map((ingredient, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition Info */}
          {item.nutritionInfo && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Nutrition Information:</h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-bold text-blue-900">{item.nutritionInfo.calories}</div>
                  <div className="text-xs text-blue-700">Calories</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-bold text-green-900">{item.nutritionInfo.protein}</div>
                  <div className="text-xs text-green-700">Protein</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="font-bold text-yellow-900">{item.nutritionInfo.carbs}</div>
                  <div className="text-xs text-yellow-700">Carbs</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="font-bold text-purple-900">{item.nutritionInfo.fat}</div>
                  <div className="text-xs text-purple-700">Fat</div>
                </div>
              </div>
            </div>
          )}

          {/* Meal Planning Section - Enhanced for both user types */}
          <div className="mb-6">
            {/* Show current selection for all users */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <span className="text-blue-600">📋</span>
                  <span>Adding to your meal plan</span>
                </h4>
                {isPro && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                    PRO
                  </span>
                )}
              </div>
              
              {/* Current Selection Display */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center space-x-2 px-3 py-2 bg-white border border-blue-200 rounded-lg shadow-sm">
                  <span className="text-blue-600">📅</span>
                  <span className="font-medium text-gray-900">
                    {DAYS_OF_WEEK.find(d => d.id === activeDay)?.name || 'Select Day'}
                  </span>
                </div>
                
                <div className={`flex items-center space-x-2 px-3 py-2 border rounded-lg shadow-sm ${
                  selectedMealType === 'lunch' 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                    : 'bg-orange-50 border-orange-200 text-orange-800'
                }`}>
                  <span>{selectedMealType === 'lunch' ? '🌅' : '🌙'}</span>
                  <span className="font-medium capitalize">{selectedMealType}</span>
                </div>
                
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                  <span className="text-green-600">💰</span>
                  <span className="font-bold text-green-800">${item.price}</span>
                </div>
              </div>
            </div>

            {/* Day and Meal Selection - For Normal Users or when not from MenuSelection */}
            {(userType === 'normal' && !isFromMenuSelection) && (
              <div className="space-y-4">
                {/* Day Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Choose Day:</label>
                  <select 
                    value={activeDay} 
                    onChange={(e) => onDayChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.id} value={day.id}>{day.name}</option>
                    ))}
                  </select>
                </div>

                {/* Meal Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Choose Meal:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onMealTypeChange('lunch')}
                      className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 border-2 ${
                        selectedMealType === 'lunch'
                          ? 'bg-yellow-500 text-white border-yellow-500 shadow-lg transform scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                      }`}
                    >
                      <span className="text-lg">🌅</span>
                      <span>Lunch</span>
                    </button>
                    <button
                      onClick={() => onMealTypeChange('dinner')}
                      className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 border-2 ${
                        selectedMealType === 'dinner'
                          ? 'bg-orange-500 text-white border-orange-500 shadow-lg transform scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <span className="text-lg">🌙</span>
                      <span>Dinner</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Info message for users coming from weekly menu */}
            {isFromMenuSelection && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">ℹ️</span>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">This item will be added to your selected time slot</p>
                    <p className="text-blue-600 mt-1">
                      You can change the day and meal type from your weekly meal plan later.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add to Plan Button - Show unless explicitly hidden */}
          {!hideAddButton && (
             <button
              onClick={() => onAddToPlan(item)}
              className={`w-full font-semibold py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation ${
                isPro 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-center">
                {isPro 
                  ? `Add to ${DAYS_OF_WEEK.find(d => d.id === activeDay)?.name} ${selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}` 
                  : `Add to ${DAYS_OF_WEEK.find(d => d.id === activeDay)?.name} ${selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}`
                }
              </span>
            </button>
          )}
          
          {/* Extra spacing for mobile to ensure button is visible */}
          <div className="h-4 sm:h-0"></div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;
