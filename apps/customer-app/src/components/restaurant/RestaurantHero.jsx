import React from 'react';
import { useNavigate } from 'react-router-dom';

const RestaurantHero = ({ 
  restaurant, 
  pageTitle, 
  pageDescription, 
  onBack 
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
    <section className="relative h-64 sm:h-80 overflow-hidden">
      <img
        src={restaurant.image}
        alt={restaurant.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = '/images/grub-gate-default-img.jpg';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
      
      {/* Restaurant Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Restaurants
          </button>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {pageTitle}
          </h1>
          <p className="text-white/90 text-lg mb-3">
            {pageDescription}
          </p>
          
          <div className="flex items-center space-x-4 text-white/80">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold">{restaurant.rating}</span>
              <span className="ml-1">({restaurant.reviewCount} reviews)</span>
            </div>
            <span>•</span>
            <span>{restaurant.cuisine}</span>
            <span>•</span>
            <span>{restaurant.deliveryTime}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantHero;
