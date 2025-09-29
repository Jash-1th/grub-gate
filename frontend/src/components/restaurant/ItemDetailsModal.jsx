import React from 'react';
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

          {/* Day and Meal Selection - Normal Users Only, Hidden when coming from MenuSelectionStep */}
          {userType === 'normal' && !isFromMenuSelection && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Select Day & Meal:</h4>
            
              {/* Day Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Day:</label>
                <select 
                  value={activeDay} 
                  onChange={(e) => onDayChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.id} value={day.id}>{day.name}</option>
                  ))}
                </select>
              </div>

              {/* Meal Type Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal:</label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => onMealTypeChange('lunch')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                      selectedMealType === 'lunch'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>🌅</span>
                    <span>Lunch</span>
                  </button>
                  <button
                    onClick={() => onMealTypeChange('dinner')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                      selectedMealType === 'dinner'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>🌙</span>
                    <span>Dinner</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pro User Info - Show current day/meal selection */}
          {isPro && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Adding to:</h4>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  <span>📅</span>
                  <span>{DAYS_OF_WEEK.find(d => d.id === activeDay)?.name}</span>
                </div>
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                  selectedMealType === 'lunch' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  <span>{selectedMealType === 'lunch' ? '🌅' : '🌙'}</span>
                  <span className="capitalize">{selectedMealType}</span>
                </div>
              </div>
            </div>
          )}

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
                  : 'Add to Meal Plan'
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
