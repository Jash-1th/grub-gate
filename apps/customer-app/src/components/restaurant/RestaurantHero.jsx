import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StarRating from '../shared/StarRating';
import RestaurantReviewsModal from '../reviews/RestaurantReviewsModal';

const RestaurantHero = ({ 
  restaurant, 
  pageTitle, 
  pageDescription, 
  onBack,
  isSelected = false 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isReviewsOpen, setIsReviewsOpen] = React.useState(false);

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
          <div className="w-full h-full bg-gradient-to-br from-grub-red via-grub-red to-grub-red">
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
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-white/80 hover:text-white mb-3 sm:mb-4 transition-all duration-300 hover:translate-x-1 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-lg text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('restaurantDetail.backToRestaurants')}
          </button>
          
          <div className="bg-grub-red/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-red-400/30 shadow-lg">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 leading-tight">
              {pageTitle}
            </h1>
            <p className="text-white/95 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 leading-relaxed">
              {pageDescription}
            </p>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-white">
              <button
                type="button"
                onClick={() => setIsReviewsOpen(true)}
                className="flex items-center bg-white/25 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <StarRating value={restaurant.rating || 0} size={18} className="" />
              </button>
              
              {restaurant.cuisine && (
                <div className="flex items-center bg-white/25 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-semibold text-xs sm:text-sm">{restaurant.cuisine}</span>
                </div>
              )}
              
              {restaurant.deliveryTime && (
                <div className="flex items-center bg-white/25 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-xs sm:text-sm">{restaurant.deliveryTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <RestaurantReviewsModal
        isOpen={isReviewsOpen}
        onClose={() => setIsReviewsOpen(false)}
        restaurantId={restaurant?.id || restaurant?._id}
        restaurantName={restaurant?.name}
      />
    </section>
  );
};

export default RestaurantHero;
