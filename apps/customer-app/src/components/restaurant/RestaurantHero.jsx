import React from 'react';
import { useNavigate } from 'react-router-dom';

const RestaurantHero = ({ 
  restaurant, 
  pageTitle, 
  pageDescription, 
  onBack,
  isSelected = false 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <section className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
      {/* Restaurant Hero Image */}
      <div className="absolute inset-0">
        {restaurant.image || restaurant.imageUrl ? (
          <img
            src={restaurant.image || restaurant.imageUrl}
            alt={`${restaurant.name} restaurant`}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              console.log('Restaurant image failed to load, using fallback');
              e.target.src = '/images/grub-gate-default-img.jpg';
            }}
          />
        ) : (
          // Fallback gradient background when no image is available
          <div className="w-full h-full bg-gradient-to-br from-red-500 via-red-600 to-red-700">
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h2 className="text-2xl font-bold opacity-80">{restaurant.name}</h2>
                <p className="text-lg opacity-60">Restaurant</p>
              </div>
            </div>
          </div>
        )}
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>
        {/* Additional overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      
      {/* Restaurant Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-all duration-300 hover:translate-x-1 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Restaurants
          </button>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
              {pageTitle}
            </h1>
            <p className="text-white/90 text-lg sm:text-xl mb-4 leading-relaxed">
              {pageDescription}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center bg-white/20 px-3 py-2 rounded-full">
                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold text-lg">{restaurant.rating}</span>
                <span className="text-white/70 ml-1">rating</span>
              </div>
              
              {restaurant.cuisine && (
                <div className="flex items-center bg-white/20 px-3 py-2 rounded-full">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-semibold">{restaurant.cuisine}</span>
                </div>
              )}
              
              {restaurant.deliveryTime && (
                <div className="flex items-center bg-white/20 px-3 py-2 rounded-full">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">{restaurant.deliveryTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantHero;
