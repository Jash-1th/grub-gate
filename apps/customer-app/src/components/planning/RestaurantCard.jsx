import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapLocationDot } from '@fortawesome/free-solid-svg-icons';

// Lazy load the map modal to prevent SSR crash from Leaflet
const RestaurantMapModal = React.lazy(() => import('../modals/RestaurantMapModal'));

const RestaurantCard = ({ restaurant, selectedPreferences = [], onExplore, isSelected = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // SSR Safety: Only set isClient to true on client-side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Extract coordinates from restaurant data
  const getRestaurantCoordinates = () => {
    // Try different possible data structures
    if (restaurant.coordinates) {
      return {
        lat: restaurant.coordinates.latitude || restaurant.coordinates.lat,
        lng: restaurant.coordinates.longitude || restaurant.coordinates.lng || restaurant.coordinates.lon
      };
    }
    if (restaurant.location?.coordinates) {
      return {
        lat: restaurant.location.coordinates[1],
        lng: restaurant.location.coordinates[0]
      };
    }
    if (restaurant.lat && restaurant.lng) {
      return { lat: restaurant.lat, lng: restaurant.lng };
    }
    if (restaurant.latitude && restaurant.longitude) {
      return { lat: restaurant.latitude, lng: restaurant.longitude };
    }
    return null;
  };
  
  const coordinates = getRestaurantCoordinates();
  const hasValidCoordinates = coordinates && 
    !isNaN(parseFloat(coordinates.lat)) && 
    !isNaN(parseFloat(coordinates.lng));
  
  // Debug logging
  console.log('🏪 RestaurantCard Debug:', {
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    isSelected: isSelected,
    isSelectedType: typeof isSelected
  });

  
  const handleOpenMap = (e) => {
    e.stopPropagation();
    if (hasValidCoordinates) {
      setIsMapModalOpen(true);
    }
  };

  const handleCloseMap = () => {
    setIsMapModalOpen(false);
  };

  const handleExploreRestaurant = () => {
    // If custom onExplore handler is provided, use it
    if (onExplore) {
      onExplore(restaurant);
      return;
    }
    
    // Default behavior: Create URL with preferences as search parameters
    const searchParams = new URLSearchParams();
    if (selectedPreferences && selectedPreferences.length > 0) {
      searchParams.set('preferences', selectedPreferences.join(','));
    }
    
    const url = `/restaurant/${restaurant.id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    navigate(url);
  };
  
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
            <linearGradient id="half-fill">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half-fill)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
    <>
      <div className="group relative h-full">
      {/* Glowing background effect */}
      <div className={`absolute -inset-1 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500 ${
        isSelected
          ? 'bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400' 
          : 'bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400'
      }`}></div>
      
      <div className={`relative rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border h-full flex flex-col ${
        isSelected
          ? 'bg-green-50 border-green-200 border-2' 
          : 'bg-white border-gray-100'
      }`}>
        {/* Restaurant Image */}
        <div className="relative h-28 sm:h-40 overflow-hidden flex-shrink-0">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-110 group-hover:translate-x-2"
            onError={(e) => {
              console.log(`Failed to load image: ${restaurant.image}`);
              e.target.src = '/images/grub-gate-default-img.jpg';
              e.target.onerror = null; // Prevent infinite loop if default image also fails
            }}
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Selected Restaurant Badge */}
          {isSelected && (
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex justify-center z-10">
              <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-xl border-2 border-white flex items-center space-x-1 animate-pulse">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="hidden xs:inline">✅ {t('restaurantCard.selected')}</span>
                <span className="inline xs:hidden">✅</span>
              </span>
            </div>
          )}

          {/* Selected Restaurant Border Glow */}
          {isSelected && (
            <div className="absolute inset-0 rounded-xl border-2 border-green-400 shadow-lg shadow-green-400/50 animate-pulse"></div>
          )}

          {/* Map Icon - Only show if coordinates available */}
          {hasValidCoordinates && (
            <button
              onClick={handleOpenMap}
              className="absolute bottom-3 left-3 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 hover:scale-110 transition-all duration-300 z-20"
              title="View on map"
              aria-label="View restaurant location on map"
            >
              <FontAwesomeIcon icon={faMapLocationDot} className="text-red-500 text-lg" />
            </button>
          )}

          {/* Popular/Top Rated Badges */}
          {!isSelected && (
            <div className="absolute top-3 left-3 flex gap-2">
              {restaurant.isPopular && (
                <span className="px-2 py-1 bg-grub-red text-white text-xs font-semibold rounded-full shadow-lg gg-badge-pulse">
                  {t('restaurantCard.popular')}
                </span>
              )}
              {restaurant.isTopRated && (
                <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full shadow-lg">
                  {t('restaurantCard.topRated')}
                </span>
              )}
            </div>
          )}
          
          {/* Reviews Info */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg">
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 text-yellow-400 fill-current gg-star-twinkle" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-medium text-gray-700">{restaurant.rating}</span>
            </div>
            <div className="text-xs text-gray-500">({restaurant.reviewCount})</div>
          </div>
        </div>
        
        {/* Restaurant Info - Flexible content area */}
        <div className="p-2.5 sm:p-4 flex flex-col flex-1">
          {/* Restaurant Name and Cuisine */}
          <div className="mb-1.5 sm:mb-2">
            <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1 group-hover:text-grub-red transition-colors duration-300 line-clamp-1">
              {restaurant.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">{restaurant.cuisine}</p>
          </div>
          
          {/* Description - Fixed height container */}
          <div className="mb-2 sm:mb-3 min-h-[1.5rem] sm:min-h-[2rem] flex items-start">
            <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
              {restaurant.description}
            </p>
          </div>
          
          {/* Rating and Reviews */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {renderStars(restaurant.rating)}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">
                {restaurant.rating}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                ({restaurant.reviewCount})
              </span>
            </div>
          </div>
          
          {/* Preferences Tags - Fixed height container */}
          <div className="mb-2.5 sm:mb-4 min-h-[1.5rem] flex items-start">
            <div className="flex flex-wrap gap-1">
              {(restaurant.preferences || []).slice(0, 3).map((preference, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize"
                >
                  {preference.replace('-', ' ')}
                </span>
              ))}
              {(restaurant.preferences || []).length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{(restaurant.preferences || []).length - 3} {t('restaurantCard.more')}
                </span>
              )}
            </div>
          </div>
          
          {/* Explore Restaurant Button - Pushed to bottom */}
          <div className="mt-auto">
            <button 
              onClick={handleExploreRestaurant}
              className={`gg-cta relative overflow-hidden w-full font-semibold py-1.5 sm:py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl text-sm sm:text-base ${
                isSelected
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white focus:ring-green-500' 
                  : 'bg-gradient-to-r from-grub-red via-grub-red to-grub-red text-white focus:ring-grub-red'
              }`}
            >
              <span aria-hidden="true" className="gg-btn-fill" />
              <div className="relative z-10 flex items-center justify-center space-x-2">
                {(() => {
                  console.log(`🔍 Button rendering for ${restaurant.name}:`, { isSelected });
                  return isSelected ? (
                    <>
                      <svg className="w-4 h-4 gg-cta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{t('restaurantCard.viewMenu')}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 gg-cta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{t('restaurantCard.viewMenu')}</span>
                    </>
                  );
                })()}
              </div>
            </button>
          </div>
        </div>
        
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      </div>
    </div>
      
      {/* Map Modal - Only render on client-side to prevent SSR crash */}
      {isClient && hasValidCoordinates && (
        <Suspense fallback={null}>
          <RestaurantMapModal
            isOpen={isMapModalOpen}
            onClose={handleCloseMap}
            restaurantName={restaurant.name}
            lat={coordinates.lat}
            lng={coordinates.lng}
          />
        </Suspense>
      )}
    </>
  );
};

export default RestaurantCard;
