import React from 'react';
import { useMealPlan } from '../../contexts/MealPlanContext';

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
  planEntries = []
}) => {
  const { getItemQuantityInPlan, isItemInPlan: checkItemInPlan } = useMealPlan();
  
  // Get current quantity of this item in the meal plan for specific day/meal
  const currentQuantity = getItemQuantityInPlan(item.id, selectedDay, selectedMealType);
  const isInSpecificSlot = checkItemInPlan(item.id, selectedDay, selectedMealType);
  
  // Use passed props for general meal plan status
  const itemIsInPlan = isInPlan || isInSpecificSlot;
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
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
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 h-full flex flex-col">
      {/* Popular Badge */}
      {item.isPopular && (
        <div className="absolute top-2 left-2 z-10">
          <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
            Popular
          </span>
        </div>
      )}

      {/* Already Added Badge */}
      {itemIsInPlan && (
        <div className={`absolute top-2 z-10 ${item.isPopular ? 'right-2' : 'left-2'}`}>
          <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Added</span>
          </span>
        </div>
      )}
      
      {/* Food Image */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = '/images/grub-gate-default-img.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Food Info */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors duration-300 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{item.category}</p>
        </div>
        
        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        
        {/* Rating and Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <div className="flex">
              {renderStars(item.rating)}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 ml-1">
              {item.rating}
            </span>
          </div>
          <span className="text-base sm:text-lg font-bold text-red-600">
            ${item.price}
          </span>
        </div>
        
        {/* Preferences Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {(item.dietaryPreferences || item.preferences || []).slice(0, 2).map((preference, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full capitalize whitespace-nowrap"
            >
              {preference.replace('-', ' ')}
            </span>
          ))}
          {(item.dietaryPreferences || item.preferences || []).length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full whitespace-nowrap">
              +{(item.dietaryPreferences || item.preferences || []).length - 2}
            </span>
          )}
        </div>
        
        {/* Meal Plan Status */}
        {itemIsInPlan && planEntries.length > 0 && (
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
        
        {/* Specific Slot Quantity Badge (for pro users) */}
        {isInSpecificSlot && currentQuantity > 0 && (
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

        {/* Action Button - Add or Remove */}
        {!hideAddButton && (
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
            <span className="text-xs text-gray-500 italic">Click to view details</span>
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
