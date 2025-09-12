import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { nearbyRestaurants } from '../../data';
import './NearbyRestaurants.css';
// Use public path for SSR compatibility
const restaurantImage = '/images/grub-gate-default-restaurant-img.jpg';

const NearbyRestaurants = () => {
  const { t } = useTranslation();
  
  // Duplicate restaurants for seamless infinite scroll
  const duplicatedRestaurants = [...nearbyRestaurants, ...nearbyRestaurants];
  
  // Mobile-specific state (SSR safe - initialized client-side only)
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchCurrent, setTouchCurrent] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  
  // Refs for mobile interaction
  const carouselRef = useRef(null);
  const startTimeRef = useRef(0);
  
  // SSR-safe mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      const detected = isMobileDevice || (isSmallScreen && hasTouchScreen);
      setIsMobile(detected);
      console.log('📱 Mobile Detection:', {
        isMobileDevice,
        isSmallScreen,
        hasTouchScreen,
        finalDecision: detected
      });
      console.log('✅ All fixes applied: Images, HMR, PWA, Mobile Interactions');
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Touch event handlers (mobile only)
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    
    setIsTouch(true);
    setTouchStart(e.touches[0].clientX);
    setTouchCurrent(e.touches[0].clientX);
    setIsAnimationPaused(true); // Pause CSS animation
    startTimeRef.current = Date.now();
    
    // Add event listeners for touch move and end
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };
  
  const handleTouchMove = (e) => {
    if (!isMobile || !isTouch) return;
    
    e.preventDefault(); // Prevent scrolling
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    
    setTouchCurrent(currentTouch);
    setScrollOffset(diff);
  };
  
  const handleTouchEnd = () => {
    if (!isMobile) return;
    
    const touchDuration = Date.now() - startTimeRef.current;
    
    // If it was a quick swipe, add momentum
    const swipeDistance = Math.abs(touchStart - touchCurrent);
    const isSwipe = swipeDistance > 50 && touchDuration < 300;
    
    if (isSwipe) {
      // Add some momentum scrolling
      const momentum = (touchStart - touchCurrent) * 0.5;
      setScrollOffset(momentum);
      
      // Gradually return to normal position
      setTimeout(() => {
        setScrollOffset(0);
      }, 300);
    } else {
      // Snap back to normal position
      setScrollOffset(0);
    }
    
    setIsTouch(false);
    setIsAnimationPaused(false); // Resume CSS animation
    
    // Remove event listeners
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };
  
  // Long press detection for pause functionality
  const handleLongPressStart = () => {
    if (!isMobile) return;
    
    startTimeRef.current = Date.now();
    setTimeout(() => {
      const pressDuration = Date.now() - startTimeRef.current;
      if (pressDuration >= 800 && !isTouch) {
        setIsAnimationPaused(true);
      }
    }, 800);
  };
  
  const handleLongPressEnd = () => {
    if (!isMobile) return;
    setIsAnimationPaused(false);
  };
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-sm ${
          index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <section className="nearby-restaurants">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-grub-red mb-4">
            {t('nearbyRestaurants.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('nearbyRestaurants.subtitle')}
          </p>
        </div>

        <div 
          className={`restaurant-carousel ${
            isMobile ? 'mobile-interactive' : 'desktop-animation'
          } ${
            isAnimationPaused ? 'animation-paused' : ''
          }`}
          ref={carouselRef}
          style={{
            transform: isMobile && isTouch ? `translateX(-${scrollOffset}px)` : undefined,
            transition: isMobile && isTouch ? 'none' : undefined
          }}
          onTouchStart={isMobile ? (e) => {
            handleTouchStart(e);
            handleLongPressStart();
          } : undefined}
          onTouchEnd={isMobile ? handleLongPressEnd : undefined}
        >
          {duplicatedRestaurants.map((restaurant, index) => (
            <div className="restaurant-card" key={`${restaurant.id}-${index}`}>
              <div className="relative overflow-hidden">
                <img 
                  src={restaurantImage} 
                  alt={restaurant.name}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-lg">
                  <div className="flex items-center">
                    {renderStars(restaurant.rating)}
                    <span className="ml-1 text-sm font-semibold text-gray-700">
                      {restaurant.rating}
                    </span>
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-grub-red text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {restaurant.deliveryTime}
                  </span>
                </div>
              </div>
              
              <div className="card-content" style={{flex:"3"}}>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {restaurant.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {restaurant.description}
                </p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>{t('nearbyRestaurants.cuisine')}:</span>
                    <span className="font-medium">{restaurant.cuisine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('nearbyRestaurants.deliveryFee')}:</span>
                    <span className="font-medium">{restaurant.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('nearbyRestaurants.minOrder')}:</span>
                    <span className="font-medium">{restaurant.minOrder}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {restaurant.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button className="w-full mt-4 bg-grub-red text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200">
                  {t('nearbyRestaurants.orderNow')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            {t('nearbyRestaurants.additionalInfo')}
          </p>
          <button className="bg-grub-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200">
            {t('nearbyRestaurants.viewAll')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default NearbyRestaurants;
