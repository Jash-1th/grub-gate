import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const RestaurantReplacementModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedRestaurants = [],
  newRestaurant,
  getItemCountForRestaurant,
  hideMaxMessage = false
}) => {
  const { t } = useTranslation();
  const [modalStep, setModalStep] = useState('remove'); // 'remove' or 'add'
  const [selectedRestaurantsToRemove, setSelectedRestaurantsToRemove] = useState([]);
  const [removedRestaurants, setRemovedRestaurants] = useState([]);
  const [isRemoving, setIsRemoving] = useState(false);

  // Reset selection when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedRestaurantsToRemove([]);
      setRemovedRestaurants([]);
      setModalStep('remove'); // Always start with remove step
      setIsRemoving(false);
    }
  }, [isOpen]);

  // Handle restaurant removal and move to add step
  const handleRemoveRestaurants = async () => {
    if (selectedRestaurantsToRemove.length > 0) {
      setIsRemoving(true);
      try {
        // Track removed restaurants
        setRemovedRestaurants(selectedRestaurantsToRemove);
        // Remove restaurants from the list (this may be async)
        await onConfirm(selectedRestaurantsToRemove, null); // Pass null for newRestaurant in remove step
        // Wait a moment for the deletion to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        // Move to add step
        setModalStep('add');
        setSelectedRestaurantsToRemove([]); // Clear selection for next step
      } catch (error) {
        console.error('Error removing restaurants:', error);
      } finally {
        setIsRemoving(false);
      }
    }
  };


  if (!isOpen || selectedRestaurants.length === 0) return null;


  const toggleRestaurantSelection = (restaurant) => {
    const restaurantId = restaurant.restaurantId || restaurant.id;
    setSelectedRestaurantsToRemove(prev => {
      const isCurrentlySelected = prev.some(r => (r.restaurantId || r.id) === restaurantId);
      if (isCurrentlySelected) {
        // Remove from selection
        return prev.filter(r => (r.restaurantId || r.id) !== restaurantId);
      } else {
        // Add to selection
        return [...prev, restaurant];
      }
    });
  };

  const getItemCount = (restaurant) => {
    if (getItemCountForRestaurant) {
      const restaurantId = restaurant.restaurantId || restaurant.id;
      return getItemCountForRestaurant(restaurantId);
    }
    return 0;
  };

  const useGridLayout = selectedRestaurants.length >= 2;
  const isManyRestaurants = selectedRestaurants.length >= 4;
  const modalWidthClass = useGridLayout ? 'max-w-5xl xl:max-w-6xl' : 'max-w-4xl';
  const restaurantsGridClass = useGridLayout
    ? `grid grid-cols-1 sm:grid-cols-2 ${isManyRestaurants ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-3 sm:gap-4`
    : 'grid grid-cols-1 gap-3 sm:gap-4';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className={`bg-white rounded-xl sm:rounded-2xl shadow-2xl ${modalWidthClass} w-full mx-2 sm:mx-4 overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="bg-grub-red text-white p-4 sm:p-6 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
            {modalStep === 'remove' ? t('restaurantModal.removeRestaurant') : t('restaurantModal.addNewRestaurant')}
          </h3>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
            {modalStep === 'remove' 
              ? t('restaurantModal.step1SelectRemove')
              : t('restaurantModal.step2ChooseNew')
            }
          </p>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6">
          {modalStep === 'remove' ? (
            // REMOVE STEP
            <>
              <div className="text-center mb-4 sm:mb-6">
                {!hideMaxMessage && (
                  <p className="text-gray-800 text-sm sm:text-base font-medium mb-2">
                    {t('restaurantModal.maxRestaurantsReached')}
                  </p>
                )}
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                  ☑️ <strong>{t('restaurantModal.checkRestaurantsBelow')}</strong> {t('restaurantModal.thatYouWantRemove')}:
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-400 bg-white rounded-sm flex-shrink-0"></div>
                    <span className="text-gray-500">{t('restaurantModal.notSelected')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-red-500 bg-red-500 rounded-sm flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-red-600 font-medium">{t('restaurantModal.selectedForRemoval')}</span>
                  </div>
                </div>
              </div>

              {/* Current Restaurants - Side by Side */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">{t('restaurantModal.currentRestaurants')}:</h4>
                <div className={restaurantsGridClass}>
                {selectedRestaurants.map((restaurant, index) => {
              const itemCount = getItemCount(restaurant);
              const restaurantId = restaurant.restaurantId || restaurant.id;
              const isSelected = selectedRestaurantsToRemove.some(r => (r.restaurantId || r.id) === restaurantId);
              
              
              return (
                <div
                  key={restaurant.restaurantId || restaurant.id}
                  onClick={() => toggleRestaurantSelection(restaurant)}
                  className={`relative p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 touch-manipulation ${
                    isSelected 
                      ? 'border-red-500 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg ring-2 ring-red-200' 
                      : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm active:scale-98'
                  }`}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                        isSelected 
                          ? 'border-red-500 bg-red-500 shadow-md' 
                          : 'border-gray-400 bg-white hover:border-blue-400'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      {/* Restaurant Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <h4 className={`font-bold text-sm sm:text-base transition-colors duration-200 truncate ${
                            isSelected ? 'text-red-700' : 'text-gray-900'
                          }`}>
                            {restaurant.restaurantName || restaurant.name}
                          </h4>
                          {isSelected && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full animate-pulse inline-block w-fit">
                              {t('restaurantModal.toRemove')}
                            </span>
                          )}
                        </div>
                        {restaurant.cuisine && (
                          <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 transition-colors duration-200 truncate ${
                            isSelected ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Item Count */}
                    <div className="flex items-center justify-between sm:block sm:text-right">
                      <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                        itemCount > 0 
                          ? isSelected 
                            ? 'bg-red-600 text-white shadow-md' 
                            : 'bg-red-100 text-red-700'
                          : isSelected
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {itemCount} {itemCount === 1 ? t('restaurantModal.meal') : t('restaurantModal.meals')}
                      </div>
                      {itemCount > 0 && isSelected && (
                        <p className="text-xs mt-0 sm:mt-1 font-medium text-red-700 transition-colors duration-200">
                          ⚠️ {t('restaurantModal.willBeDeleted')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Selected Restaurant Highlight */}
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-red-400 rounded-xl pointer-events-none opacity-30 animate-pulse"></div>
                  )}
                </div>
              );
                })}
                </div>
              </div>
            </>
          ) : (
            // ADD STEP
            <>
              <div className="text-center mb-6">
                <p className="text-gray-800 text-base font-medium mb-2">
                  {t('restaurantModal.restaurantRemovedSuccess')}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  🍽️ <strong>{t('restaurantModal.clickBelow')}</strong> {t('restaurantModal.toBrowseAndAdd')}:
                </p>
              </div>

              {/* Add Restaurant Button */}
              <div className="mb-6">
                <div 
                  onClick={() => {
                    // Close modal and navigate to restaurant selection
                    onClose();
                    const postalParam = window.location.search.includes('postal=') ? window.location.search.split('postal=')[1]?.split('&')[0] : '';
                    window.location.href = `/plan/restaurants?source=plan${postalParam ? `&postal=${postalParam}` : ''}`;
                  }}
                  className="w-full p-4 sm:p-6 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl cursor-pointer hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 touch-manipulation"
                >
                  <div className="flex items-center justify-between sm:justify-center sm:space-x-4">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div className="text-left sm:text-center">
                        <h4 className="text-base sm:text-xl font-bold mb-0.5 sm:mb-1">{t('restaurantModal.browseRestaurants')}</h4>
                        <p className="text-green-100 text-xs sm:text-sm">{t('restaurantModal.clickToExplore')}</p>
                      </div>
                    </div>
                    <div className="text-white flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Selected Restaurants Display */}
              {(() => {
                // Calculate remaining restaurants by filtering out removed ones
                const remainingRestaurants = selectedRestaurants.filter(restaurant => {
                  const restaurantId = restaurant.restaurantId || restaurant.id;
                  return !removedRestaurants.some(removed => (removed.restaurantId || removed.id) === restaurantId);
                });
                
                return remainingRestaurants && remainingRestaurants.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      {remainingRestaurants.length === 1 ? t('restaurantModal.yourRemainingRestaurant') : t('restaurantModal.yourRemainingRestaurants')}
                    </h4>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${remainingRestaurants.length >= 4 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4`}>
                      {remainingRestaurants.map((restaurant, index) => (
                      <div key={restaurant.restaurantId || restaurant.id} className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-green-800 text-lg">{restaurant.restaurantName || restaurant.name}</h5>
                            {restaurant.cuisine && (
                              <p className="text-sm text-green-600 mt-1">
                                {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}
                              </p>
                            )}
                            <div className="flex items-center mt-2">
                              <span className="px-2 py-1 text-xs font-medium bg-green-200 text-green-800 rounded-full">
                                ✅ {t('restaurantModal.activeInPlan')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}

        </div>

        {/* Actions */}
        <div className="px-3 sm:px-6 pb-3 sm:pb-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base touch-manipulation"
          >
            {t('restaurantModal.cancel')}
          </button>
          
          {modalStep === 'remove' ? (
            <button
              onClick={handleRemoveRestaurants}
              disabled={selectedRestaurantsToRemove.length === 0 || isRemoving}
              className={`flex-1 px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base touch-manipulation ${
                selectedRestaurantsToRemove.length > 0 && !isRemoving
                  ? 'bg-grub-red text-white hover:bg-grub-red shadow-lg active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isRemoving ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('restaurantModal.removing')}</span>
                </div>
              ) : selectedRestaurantsToRemove.length > 0 ? (
                t('restaurantModal.removeCount', { count: selectedRestaurantsToRemove.length })
              ) : (
                t('restaurantModal.selectToRemove')
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg text-sm sm:text-base touch-manipulation active:scale-95"
            >
              {t('restaurantModal.done')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantReplacementModal;
