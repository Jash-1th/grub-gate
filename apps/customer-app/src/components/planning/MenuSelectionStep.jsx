import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { usePlanning } from '../../contexts/PlanningContext';
import { useMealPlan } from '../../contexts/MealPlanContext_SSR_FIXED';
import RestaurantCard from './RestaurantCard';
import { getRestaurantsByPostalCode, getRestaurants } from '../../services/restaurantService';

const MenuSelectionStep = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [searchParams] = useSearchParams();
  const { postalCode, selectedPreferences, isClient } = usePlanning();
  const { addItemToPlan, removeItemFromPlan, getMealItems, isRestaurantSelected, getSelectedRestaurants } = useMealPlan();
  
  // Debug selected restaurants
  const selectedRestaurants = getSelectedRestaurants();
  console.log('🎯 Current selected restaurants:', selectedRestaurants);
  console.log('🎯 Selected restaurants length:', selectedRestaurants.length);
  console.log('🎯 Selected restaurant IDs:', selectedRestaurants.map(r => r.restaurantId));
  
  // Get URL parameters
  const day = searchParams.get('day') || 'monday';
  const slot = searchParams.get('slot') || 'lunch';
  const week = searchParams.get('week') || '0';
  const urlPostalCode = searchParams.get('postal');
  const source = searchParams.get('source');
  
  // Use postal code from URL if available, otherwise use context postal code
  const effectivePostalCode = urlPostalCode || postalCode;
  
  // Determine context
  const isFromWeeklyMenu = source === 'weekly-menu';
  const isFromPlan = source === 'plan';
  
  // Modal state for preventing action bar interference
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Handle modal events
  useEffect(() => {
    const handleModalOpen = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);
    
    // Create intersection observer for modal detection
    const observer = new IntersectionObserver((entries) => {
      // Modal detection logic can be added here if needed
    });
    
    // Listen for modal events
    document.addEventListener('modal:open', handleModalOpen);
    document.addEventListener('modal:close', handleModalClose);
    
    return () => {
      observer.disconnect();
      document.removeEventListener('modal:open', handleModalOpen);
      document.removeEventListener('modal:close', handleModalClose);
    };
  }, []);

  // State for nearby restaurants
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);

  // Debug nearby restaurants state (after state declaration)
  console.log('🏪 Nearby restaurants count:', nearbyRestaurants?.length || 0);
  console.log('🏪 Nearby restaurants loading:', restaurantsLoading);
  console.log('🏪 Effective postal code:', effectivePostalCode);

  // Fetch nearby restaurants
  useEffect(() => {
    const fetchNearbyRestaurants = async () => {
      if (!isClient) return;
      
      setRestaurantsLoading(true);
      
      try {
        let result;
        if (effectivePostalCode && effectivePostalCode.length >= 3) {
          console.log('🔍 Fetching restaurants for postal code:', effectivePostalCode);
          result = await getRestaurantsByPostalCode(effectivePostalCode);
        } else {
          console.log('🔍 Fetching all restaurants (no postal code)');
          result = await getRestaurants();
        }
        
        const restaurants = result.success ? result.data : [];
        console.log('✅ Restaurants fetched:', restaurants?.length || 0);
        setNearbyRestaurants(restaurants || []);
      } catch (error) {
        console.error('❌ Error fetching restaurants:', error);
        setNearbyRestaurants([]);
      } finally {
        setRestaurantsLoading(false);
      }
    };

    fetchNearbyRestaurants();
  }, [effectivePostalCode, isClient]);

  // Utility function to capitalize first letter
  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Handle restaurant click
  const handleRestaurantClick = (restaurant) => {
    const searchParams = new URLSearchParams();
    
    // Add context parameters based on source
    if (isFromWeeklyMenu) {
      searchParams.set('day', day);
      searchParams.set('slot', slot);
      searchParams.set('week', week);
      searchParams.set('source', 'weekly-menu');
    } else if (isFromPlan) {
      searchParams.set('source', 'plan');
    }
    
    // Add preferences if they exist
    if (selectedPreferences && selectedPreferences.length > 0) {
      searchParams.set('preferences', selectedPreferences.join(','));
    }
    
    const url = `/restaurant/${restaurant.id}?${searchParams.toString()}`;
    navigate(url);
  };

  // Render nearby restaurants section
  const renderNearbyRestaurants = () => {
    if (restaurantsLoading) {
      return (
        <div className="mb-12">
          {/* Postal Code Header */}
          {effectivePostalCode && (
            <div className="mb-6 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-blue-800 font-medium">{t('menuSelection.findingRestaurantsNear', { postalCode: effectivePostalCode })}</span>
              </div>
            </div>
          )}
          
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (nearbyRestaurants.length === 0) {
      console.log('🏪 No nearby restaurants found, returning null');
      return null;
    }

    // All restaurants are available now (no restrictions)
    const availableRestaurants = nearbyRestaurants;
    console.log('🏪 Rendering restaurants grid with', availableRestaurants.length, 'restaurants');

    return (
      <div className="mb-12">
        {/* Postal Code Header */}
        {effectivePostalCode && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-blue-800 font-medium">{t('menuSelection.restaurantsNear', { postalCode: effectivePostalCode })}</span>
            </div>
          </div>
        )}
        
        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {availableRestaurants.map((restaurant, index) => {
            const isSelected = isRestaurantSelected(restaurant.id);
            console.log('🔍 MenuSelectionStep Debug:', {
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
              isSelected: isSelected,
              isSelectedType: typeof isSelected,
              selectedRestaurantIds: selectedRestaurants.map(r => r.restaurantId),
              isRestaurantSelectedFunction: typeof isRestaurantSelected
            });
            
            return (
              <motion.div
                key={restaurant.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={shouldReduceMotion ? undefined : { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 * index }}
              >
                <RestaurantCard 
                  restaurant={restaurant}
                  selectedPreferences={selectedPreferences}
                  onExplore={handleRestaurantClick}
                  isSelected={isSelected}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-12 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 sm:pb-40">
      {/* Header */}
      <div className="bg-gradient-to-r from-grub-red to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="text-center">
            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 leading-tight px-2 sm:px-0">
              {isFromPlan ? (
                <>
                  <span className="block sm:inline">{t('menuSelection.restaurantsNear', { postalCode: '' })}</span>
                  <span className="block sm:inline font-black text-red-200"> {effectivePostalCode?.toUpperCase() || t('menuSelection.you')}</span>
                </>
              ) : (
                <>
                  <span className="block text-base sm:text-2xl">{t('menuSelection.topMealsFor')}</span>
                  <span className="block text-lg sm:text-3xl font-black">{capitalizeFirst(day)}'s {capitalizeFirst(slot)}</span>
                </>
              )}
            </h1>
            <p className="text-red-100 text-xs sm:text-base lg:text-lg mb-4 sm:mb-8 px-4 sm:px-0 max-w-lg mx-auto">
              {isFromPlan 
                ? t('menuSelection.highlyRatedRestaurants')
                : t('menuSelection.bestOptionsAvailable', { slot })
              }
            </p>
            
            {/* Location and Context Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {effectivePostalCode && (
                <div className="inline-flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">{effectivePostalCode.toUpperCase()}</span>
                </div>
              )}
              
              {isFromWeeklyMenu && (
                <div className="inline-flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{week === '0' ? t('menuSelection.thisWeek') : t('menuSelection.nextWeek')} • {capitalizeFirst(day)} {capitalizeFirst(slot)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-center space-x-2 sm:space-x-8">
            <div className="flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-gray-900">{t('menuSelection.location')}</span>
            </div>
            
            <div className="w-4 sm:w-8 h-0.5 bg-gray-300"></div>
            
            <div className="flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-grub-red rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">2</span>
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-gray-900">
                {isFromPlan ? t('menuSelection.restaurants') : t('menuSelection.menuSelection')}
              </span>
            </div>
            
            <div className="w-4 sm:w-8 h-0.5 bg-gray-300"></div>
            
            <div className="flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-xs sm:text-sm font-bold">3</span>
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-gray-500">{t('menuSelection.subscribe')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Show Restaurant Grid using RestaurantCard components */}
        {renderNearbyRestaurants()}
      </div>

      {/* Bottom Action Bar - Hidden when modals are open */}
      {!isModalOpen && (
        <div className="bg-white border-t shadow-lg fixed bottom-16 sm:bottom-0 left-0 right-0 z-10 pb-safe">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left side - Optional summary or info */}
              <div className="hidden lg:flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('menuSelection.readyToContinue')}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4 w-full sm:w-auto">
                {/* Back Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isFromWeeklyMenu) {
                      navigate(`/weekly-menu?week=${week}`);
                    } else {
                      navigate('/plan');
                    }
                  }}
                  className="group px-4 sm:px-6 lg:px-8 py-2 lg:py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base lg:min-w-[160px] shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="font-semibold">
                    {isFromWeeklyMenu ? t('menuSelection.backToWeeklyMenu') : t('menuSelection.changeLocation')}
                  </span>
                </button>

                {/* Continue Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isFromWeeklyMenu) {
                      navigate(`/weekly-menu?week=${week}`);
                    } else {
                      navigate('/weekly-menu');
                    }
                  }}
                  className="group relative px-6 sm:px-8 lg:px-10 py-2 lg:py-2.5 bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-700 hover:via-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm sm:text-base lg:min-w-[220px] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 hidden lg:block"></div>
                  
                  <span className="relative z-10">
                    {isFromWeeklyMenu ? (
                      <>
                        <span className="hidden sm:inline">{t('menuSelection.backToWeeklyMenu')}</span>
                        <span className="sm:hidden">{t('menuSelection.backToMenu')}</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">{t('menuSelection.continueToWeeklyMenu')}</span>
                        <span className="sm:hidden">{t('menuSelection.continue')}</span>
                      </>
                    )}
                  </span>
                  <svg className="relative z-10 w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m0-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuSelectionStep;
