import React from 'react';
import { useNavigate } from 'react-router-dom';

const RestaurantCard = ({ restaurant, selectedPreferences = [], onExplore }) => {
  const navigate = useNavigate();
  
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
    <div className="group relative h-full">
      {/* Glowing background effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
      
      <div className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 h-full flex flex-col">
        {/* Restaurant Image */}
        <div className="relative h-48 sm:h-56 overflow-hidden flex-shrink-0">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              console.log(`Failed to load image: ${restaurant.image}`);
              e.target.src = '/images/grub-gate-default-img.jpg';
              e.target.onerror = null; // Prevent infinite loop if default image also fails
            }}
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Popular/Top Rated Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {restaurant.isPopular && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
                Popular
              </span>
            )}
            {restaurant.isTopRated && (
              <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full shadow-lg">
                Top Rated
              </span>
            )}
          </div>
          
          {/* Reviews Info */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg">
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-medium text-gray-700">{restaurant.rating}</span>
            </div>
            <div className="text-xs text-gray-500">({restaurant.reviewCount})</div>
          </div>
        </div>
        
        {/* Restaurant Info - Flexible content area */}
        <div className="p-4 sm:p-6 flex flex-col flex-1">
          {/* Restaurant Name and Cuisine */}
          <div className="mb-3">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors duration-300">
              {restaurant.name}
            </h3>
            <p className="text-sm text-gray-500 font-medium">{restaurant.cuisine}</p>
          </div>
          
          {/* Description - Fixed height container */}
          <div className="mb-4 min-h-[2.5rem] flex items-start">
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {restaurant.description}
            </p>
          </div>
          
          {/* Rating and Reviews */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {renderStars(restaurant.rating)}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {restaurant.rating}
              </span>
              <span className="text-sm text-gray-500">
                ({restaurant.reviewCount})
              </span>
            </div>
          </div>
          
          {/* Preferences Tags - Fixed height container */}
          <div className="mb-6 min-h-[2rem] flex items-start">
            <div className="flex flex-wrap gap-1">
              {restaurant.preferences.slice(0, 3).map((preference, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize"
                >
                  {preference.replace('-', ' ')}
                </span>
              ))}
              {restaurant.preferences.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{restaurant.preferences.length - 3} more
                </span>
              )}
            </div>
          </div>
          
          {/* Explore Restaurant Button - Pushed to bottom */}
          <div className="mt-auto">
            <button 
              onClick={handleExploreRestaurant}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>Explore Restaurant</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
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
  );
};

export default RestaurantCard;
