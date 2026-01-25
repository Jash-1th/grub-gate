import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMealPlan } from '../../contexts/MealPlanContext_SSR_FIXED';

const FoodItemCard = ({ 
  item, 
  onAddToPlan, 
  onRemoveFromPlan,
  selectedDay, 
  selectedMealType, 
  restaurantName, 
  showClickHint = false,
  hideAddButton = false,
  isInPlan = false,
  planEntries = [],
  onItemClick,
  isFromWeeklyMenu = false, // New prop to detect weekly menu source
  isMealPlanningEnabled = true,
  week = 0 // Add week parameter for week-aware meal plan checks
}) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const mealPlanContext = useMealPlan();
  
  // Safely extract functions with fallbacks during loading
  const getItemQuantityInPlan = mealPlanContext?.getItemQuantityInPlan;
  const checkItemInPlan = mealPlanContext?.isItemInPlan;
  
  // Get current quantity of this item in the meal plan for specific day/meal (week-aware)
  // Add null checks to prevent errors during loading
  const currentQuantity = getItemQuantityInPlan ? getItemQuantityInPlan(item.id, selectedDay, selectedMealType, week) : 0;
  const isInSpecificSlot = checkItemInPlan ? checkItemInPlan(item.id, selectedDay, selectedMealType, week) : false;
  
  // Use passed props for general meal plan status
  const itemIsInPlan = isInPlan || isInSpecificSlot;
  const renderStars = (rating, sizeClassName = 'w-4 h-4') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className={`${sizeClassName} text-yellow-400 fill-current`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className={`${sizeClassName} text-yellow-400`} viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`half-fill-${item.id}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill={`url(#half-fill-${item.id})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className={`${sizeClassName} text-gray-300`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };

  const handleCardClick = (e) => {
    // Only trigger if clicking on the card itself, not on buttons
    if (e.target === e.currentTarget || e.target.closest('button') === null) {
      // If coming from weekly menu and meal planning is enabled, don't open modal on card click
      if (isFromWeeklyMenu && isMealPlanningEnabled) {
        return;
      }
      onItemClick && onItemClick(item);
    }
  };

  // Direct add handler for weekly menu flow
  const handleDirectAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToPlan && onAddToPlan(item, restaurantName);
  };

  // Direct remove handler for weekly menu flow
  const handleDirectRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveFromPlan && onRemoveFromPlan(item);
  };

  const cardClassName = `group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 h-full flex flex-col cursor-pointer${
    isFromWeeklyMenu ? '' : ' transform hover:-translate-y-2 hover:scale-[1.02]'
  }`;

  return (
    <div 
      className={cardClassName}
      onClick={handleCardClick}
    >
      {/* Popular Badge */}
      {item.isPopular && (
        <div className="absolute top-2 left-2 z-10">
          <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
            Popular
          </span>
        </div>
      )}

      {/* Weekly Menu Flow: Quantity Controls in top-right corner */}
      {isFromWeeklyMenu && isMealPlanningEnabled && (
        <div className="absolute top-2 right-2 z-10">
          {currentQuantity === 0 ? (
            // Show only + button when quantity is 0
            <button 
              onClick={handleDirectAdd}
              className="flex items-center justify-center w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          ) : (
            // Show quantity controls when quantity > 0
            <div className="flex items-center space-x-1 bg-white rounded-full shadow-lg border border-gray-200 px-1 py-1">
              <button 
                onClick={handleDirectRemove}
                className="flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 active:scale-95"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <div className="flex items-center justify-center min-w-[1.5rem] h-6 px-2">
                <span className="text-sm font-bold text-gray-800">{currentQuantity}</span>
              </div>
              
              <button 
                onClick={handleDirectAdd}
                className="flex items-center justify-center w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 active:scale-95"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Already Added Badge - Only show for non-weekly-menu flow */}
      {!isFromWeeklyMenu && itemIsInPlan && (
        <div className={`absolute top-2 z-10 ${item.isPopular ? 'right-2' : 'left-2'}`}>
          <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Added</span>
          </span>
        </div>
      )}
      
      {/* Food Image - Modern responsive design */}
      <div className={`relative ${isFromWeeklyMenu ? 'h-36 sm:h-40' : 'h-40 sm:h-44 md:h-48'} overflow-hidden rounded-t-2xl`}>
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = '/images/grub-gate-default-img.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {isFromWeeklyMenu && (
          <>
            <div className="absolute bottom-2 left-2">
              <div className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-full shadow-md border border-white/30">
                <span className="text-sm font-extrabold text-gray-900">
                  ${item.price}
                </span>
              </div>
            </div>
            <div className="absolute bottom-2 right-2">
              <div className="bg-white/85 backdrop-blur px-2 py-1 rounded-full shadow-md border border-white/30 flex items-center">
                {renderStars(item.rating || 0, 'w-3 h-3')}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Food Info - Clean and modern */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300 line-clamp-2 leading-tight">
            {item.name}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-medium capitalize truncate bg-gray-100 px-2 py-1 rounded-full">{item.category}</span>
            {item.cuisine && (
              <span className="font-medium capitalize truncate bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{item.cuisine}</span>
            )}
          </div>
          {item.totalOrders > 0 && (
            <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
              <svg className="w-3 h-3 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="font-medium">{item.totalOrders} orders</span>
            </div>
          )}
        </div>
        
        {!isFromWeeklyMenu && (
          <>
            {/* Rating, Reviews, and Price */}
            <div className="flex items-center justify-between mb-3 bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {renderStars(item.rating)}
                </div>
                <span className="text-xs font-bold text-gray-800">
                  {item.rating}
                </span>
                {item.reviewCount > 0 && (
                  <span className="text-xs text-gray-500">({item.reviewCount})</span>
                )}
              </div>
              <div className="bg-red-500 text-white px-3 py-1 rounded-full">
                <span className="text-sm sm:text-base font-bold">
                  ${item.price}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Servings and Spice Level */}
        {(item.servings || item.spiceLevel > 0) && (
          <div className="flex items-center justify-between mb-3">
            {item.servings && (
              <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Serves {item.servings}
              </div>
            )}
            {item.spiceLevel > 0 && (
              <div className="flex items-center bg-red-50 px-2 py-1 rounded-full">
                {Array.from({ length: item.spiceLevel }, (_, i) => (
                  <span key={i} className="text-red-500 text-sm">🌶️</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Calories and Nutrition Info */}
        {item.nutritionInfo?.calories && (
          <div className="mb-2 text-xs text-gray-600">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {item.nutritionInfo.calories} cal
              {item.nutritionInfo.protein && (
                <span className="ml-2">• P: {item.nutritionInfo.protein}</span>
              )}
              {item.nutritionInfo.carbs && (
                <span className="ml-1">C: {item.nutritionInfo.carbs}</span>
              )}
              {item.nutritionInfo.fat && (
                <span className="ml-1">F: {item.nutritionInfo.fat}</span>
              )}
            </span>
          </div>
        )}

        
        {/* Dietary Preferences - Simplified */}
        {(item.dietaryPreferences || item.preferences || []).length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {(item.dietaryPreferences || item.preferences || []).slice(0, 2).map((preference, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium capitalize"
                >
                  {preference.replace('-', ' ')}
                </span>
              ))}
              {(item.dietaryPreferences || item.preferences || []).length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                  +{(item.dietaryPreferences || item.preferences || []).length - 2} more
                </span>
              )}
            </div>
          </div>
        )}


        {/* Availability Status */}
        {item.status && item.status !== 'available' && (
          <div className="mb-2">
            <div className={`flex items-center text-xs px-2 py-1 rounded ${
              item.status === 'out-of-stock' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="capitalize">{item.status.replace('-', ' ')}</span>
            </div>
          </div>
        )}
        
        {/* Meal Plan Status - Only show for non-weekly-menu flow */}
        {!isFromWeeklyMenu && itemIsInPlan && planEntries.length > 0 && (
          <div className="mb-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-800">
                    In your meal plan
                  </span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {currentQuantity} in this slot
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {planEntries.slice(0, 2).map((entry, index) => (
                  <span key={index} className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                    {(entry.dayId || entry.day || '').charAt(0).toUpperCase() + (entry.dayId || entry.day || '').slice(1)} {entry.mealType}
                  </span>
                ))}
                {planEntries.length > 2 && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                    +{planEntries.length - 2} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Specific Slot Quantity Badge - Only show for non-weekly-menu flow */}
        {!isFromWeeklyMenu && isInSpecificSlot && currentQuantity > 0 && (
          <div className="mb-3 flex items-center justify-center">
            <div className="bg-blue-100 border-2 border-blue-300 rounded-lg px-2 py-1.5 flex items-center space-x-1">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-700 font-semibold text-xs">
                {currentQuantity} in this slot
              </span>
            </div>
          </div>
        )}

        {/* Flexible spacer to push button to bottom */}
        <div className="flex-1"></div>

        {/* Action Buttons - Only show for non-weekly-menu flow */}
        {!hideAddButton && !isFromWeeklyMenu && (
          <>
            {itemIsInPlan ? (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveFromPlan && onRemoveFromPlan(item);
                }}
                className="w-full font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl text-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-500 touch-manipulation active:scale-95"
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="whitespace-nowrap">Remove</span>
                </div>
              </button>
            ) : (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToPlan && onAddToPlan(item, restaurantName);
                }}
                className="w-full font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white focus:ring-green-500 touch-manipulation active:scale-95"
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="whitespace-nowrap">View Details</span>
                </div>
              </button>
            )}
          </>
        )}

        {/* Click Hint for Normal Users */}
        {showClickHint && hideAddButton && (
          <div className="text-center py-2">
            <span className="text-xs text-gray-500 italic">{t('foodItemCard.clickToViewDetails')}</span>
          </div>
        )}
      </div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </div>
  );
};

export default FoodItemCard;
