import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { nearbyRestaurants } from '../../data';
import './NearbyRestaurants.css';

// Use public path for SSR compatibility
const restaurantImage = '/images/grub-gate-default-restaurant-img.jpg';

const NearbyRestaurants = () => {
  const { t } = useTranslation();
  
  // Triple the restaurants for seamless infinite scroll
  const duplicatedRestaurants = [...nearbyRestaurants, ...nearbyRestaurants, ...nearbyRestaurants];
  
  // State for carousel behavior
  const [isPaused, setIsPaused] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [dragVisualState, setDragVisualState] = useState(false);
  
  // Refs for carousel control (using refs for drag state to avoid re-render issues)
  const carouselRef = useRef(null);
  const animationIdRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0, startTime: 0 });
  const scrollSpeedRef = useRef(0.5); // pixels per frame
  const lastTimeRef = useRef(0);
  const momentumRef = useRef({ velocity: 0, lastX: 0, lastTime: 0 });
  const resumeTimeoutRef = useRef(null);
  
  // SSR-safe client initialization
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Smooth auto-scroll animation using requestAnimationFrame
  const animate = useCallback((currentTime) => {
    if (!carouselRef.current || isPaused || isDraggingRef.current) {
      animationIdRef.current = requestAnimationFrame(animate);
      return;
    }
    
    // Throttle animation to ~60fps
    if (currentTime - lastTimeRef.current >= 16) {
      const carousel = carouselRef.current;
      const maxScroll = carousel.scrollWidth / 3; // One third of total width (original content)
      
      // Smooth continuous scroll
      carousel.scrollLeft += scrollSpeedRef.current;
      
      // Improved infinite loop reset - avoid visible jumps
      if (carousel.scrollLeft >= maxScroll) {
        // Use smooth reset to avoid jarring experience
        carousel.scrollTo({
          left: 0,
          behavior: 'instant'
        });
      }
      
      lastTimeRef.current = currentTime;
    }
    
    animationIdRef.current = requestAnimationFrame(animate);
  }, [isPaused]);
  
  // Start animation loop (SSR-safe)
  useEffect(() => {
    if (!isClient) return;
    
    animationIdRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isClient, animate]);
  
  // Clear resume timeout helper
  const clearResumeTimeout = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  // Unified event handler for both mouse and touch move events
  const handleInteractionMove = useCallback((e) => {
    if (!isDraggingRef.current || !carouselRef.current) return;
    
    // Prevent default to avoid scrolling the page
    e.preventDefault();
    
    const currentTime = performance.now();
    // Get the correct clientX whether it's a touch or mouse event
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const deltaX = dragStartRef.current.x - clientX;
    const newScrollLeft = dragStartRef.current.scrollLeft + deltaX;
    
    // Track momentum for smooth release
    const timeDelta = currentTime - momentumRef.current.lastTime;
    if (timeDelta > 0) {
      momentumRef.current.velocity = (clientX - momentumRef.current.lastX) / timeDelta;
      momentumRef.current.lastX = clientX;
      momentumRef.current.lastTime = currentTime;
    }
    
    // Handle infinite scroll boundaries during drag
    const carousel = carouselRef.current;
    const maxScroll = carousel.scrollWidth / 3;
    
    if (newScrollLeft < 0) {
      // Dragging past the start - loop to end
      carousel.scrollLeft = maxScroll + newScrollLeft;
      dragStartRef.current.scrollLeft = maxScroll;
      dragStartRef.current.x = clientX;
    } else if (newScrollLeft > maxScroll * 2) {
      // Dragging past the end - loop to start
      carousel.scrollLeft = newScrollLeft - maxScroll;
      dragStartRef.current.scrollLeft = -maxScroll;
      dragStartRef.current.x = clientX;
    } else {
      // Normal drag within bounds
      carousel.scrollLeft = newScrollLeft;
    }
  }, []);
  
  const handleInteractionEnd = useCallback(() => {
    if (!carouselRef.current || !isDraggingRef.current) return;
    
    const carousel = carouselRef.current;
    const velocity = momentumRef.current.velocity;
    
    // Apply momentum if significant velocity
    if (Math.abs(velocity) > 0.5) {
      const momentumDistance = velocity * 100; // Adjust multiplier for desired momentum
      const targetScroll = carousel.scrollLeft - momentumDistance;
      
      carousel.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
    
    // Reset states
    isDraggingRef.current = false;
    setDragVisualState(false);
    
    // Clear any existing resume timeout
    clearResumeTimeout();
    
    // Resume auto-scroll after momentum finishes
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, Math.abs(velocity) > 0.5 ? 800 : 300);
    
    // Reset momentum
    momentumRef.current = { velocity: 0, lastX: 0, lastTime: 0 };
    
    // Remove event listeners
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousemove', handleInteractionMove);
      document.removeEventListener('mouseup', handleInteractionEnd);
      document.removeEventListener('touchmove', handleInteractionMove);
      document.removeEventListener('touchend', handleInteractionEnd);
    }
  }, [handleInteractionMove, clearResumeTimeout]);
  
  const handleInteractionStart = useCallback((e) => {
    if (!carouselRef.current) return;
    
    // Prevent default to avoid text selection and image dragging
    e.preventDefault();
    
    // Clear any pending resume timeout
    clearResumeTimeout();
    
    // Pause auto-scroll and set dragging state
    setIsPaused(true);
    isDraggingRef.current = true;
    setDragVisualState(true);
    
    const currentTime = performance.now();
    // Get the correct clientX whether it's a touch or mouse event
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    
    // Update drag start reference
    dragStartRef.current = {
      x: clientX,
      scrollLeft: carouselRef.current.scrollLeft,
      startTime: currentTime
    };
    
    // Initialize momentum tracking
    momentumRef.current = {
      velocity: 0,
      lastX: clientX,
      lastTime: currentTime
    };
    
    // Add appropriate event listeners based on event type
    if (typeof document !== 'undefined') {
      const isTouch = e.type === 'touchstart';
      
      if (isTouch) {
        // For touch devices, listen to touch events
        document.addEventListener('touchmove', handleInteractionMove, { 
          passive: false 
        });
        document.addEventListener('touchend', handleInteractionEnd, { 
          passive: false 
        });
        // Also listen for touch cancel events
        document.addEventListener('touchcancel', handleInteractionEnd, { 
          passive: false 
        });
        document.addEventListener('touchcancel', handleInteractionEnd, { passive: false });
      } else {
        document.addEventListener('mousemove', handleInteractionMove);
        document.addEventListener('mouseup', handleInteractionEnd);
        // Handle mouse leave to end drag if user drags outside window
        document.addEventListener('mouseleave', handleInteractionEnd);
      }
    }
  }, [handleInteractionMove, handleInteractionEnd, clearResumeTimeout]);
  
  // Hover handlers for desktop
  const handleMouseEnter = useCallback(() => {
    if (!isDraggingRef.current) {
      clearResumeTimeout();
      setIsPaused(true);
    }
  }, [clearResumeTimeout]);
  
  const handleMouseLeave = useCallback(() => {
    if (!isDraggingRef.current) {
      // Short delay before resuming to prevent flicker
      resumeTimeoutRef.current = setTimeout(() => {
        setIsPaused(false);
      }, 200);
    }
  }, []);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
      // Clean up all possible event listeners
      document.removeEventListener('mousemove', handleInteractionMove);
      document.removeEventListener('mouseup', handleInteractionEnd);
      document.removeEventListener('mouseleave', handleInteractionEnd);
      document.removeEventListener('touchmove', handleInteractionMove);
      document.removeEventListener('touchend', handleInteractionEnd);
      document.removeEventListener('touchcancel', handleInteractionEnd);
    };
  }, [handleInteractionMove, handleInteractionEnd]);

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

  // Detect if we're on mobile/tablet
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    if (!isClient) return;
    
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [isClient]);

  // Mobile component with draggable carousel
  const MobileRestaurantView = () => (
    <div className="carousel-wrapper">
      <div 
        className={`unified-carousel mobile-carousel ${
          dragVisualState ? 'dragging' : ''
        } ${
          isPaused ? 'paused' : ''
        }`}
        ref={carouselRef}
        // Touch events for mobile
        onTouchStart={handleInteractionStart}
        onTouchMove={(e) => {
          // Only prevent default if we're dragging to avoid interfering with scrolling
          if (isDraggingRef.current) {
            e.preventDefault();
          }
        }}
        onTouchEnd={handleInteractionEnd}
        // Mouse events for desktop
        onMouseDown={handleInteractionStart}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        // Prevent image drag
        onDragStart={(e) => e.preventDefault()}
        // Prevent text selection during drag
        style={{
          WebkitUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {duplicatedRestaurants.map((restaurant, index) => (
          <div className="restaurant-card-mobile" key={`${restaurant.id}-${index}`}>
            <div className="relative overflow-hidden">
              <img 
                src={restaurantImage} 
                alt={restaurant.name}
                className="w-full h-40 object-cover transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 shadow-md">
                <div className="flex items-center">
                  {renderStars(restaurant.rating)}
                  <span className="ml-1 text-xs font-semibold text-gray-700">
                    {restaurant.rating}
                  </span>
                </div>
              </div>
              <div className="absolute top-3 left-3">
                <span className="bg-grub-red text-white px-2 py-1 rounded-full text-xs font-semibold">
                  {restaurant.deliveryTime}
                </span>
              </div>
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {restaurant.name}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
                {restaurant.description}
              </p>
              
              <div className="space-y-1 text-xs text-gray-500 mb-3">
                <div className="flex justify-between">
                  <span>{t('nearbyRestaurants.cuisine')}:</span>
                  <span className="font-medium">{restaurant.cuisine}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('nearbyRestaurants.deliveryFee')}:</span>
                  <span className="font-medium">{restaurant.deliveryFee}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {restaurant.tags.slice(0, 2).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto">
                <button className="w-full bg-grub-red text-white py-2 px-4 rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors duration-200">
                  {t('nearbyRestaurants.orderNow')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Desktop component with carousel
  const DesktopCarouselView = () => (
    <div className="carousel-wrapper">
      <div 
        className={`unified-carousel ${
          dragVisualState ? 'dragging' : ''
        } ${
          isPaused ? 'paused' : ''
        }`}
        ref={carouselRef}
        // Touch events for mobile (even in desktop view for touchscreen laptops)
        onTouchStart={handleInteractionStart}
        onTouchMove={(e) => {
          if (isDraggingRef.current) {
            e.preventDefault();
          }
        }}
        onTouchEnd={handleInteractionEnd}
        // Mouse events for desktop
        onMouseDown={handleInteractionStart}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        // Prevent image drag
        onDragStart={(e) => e.preventDefault()}
        // Prevent text selection during drag
        style={{
          WebkitUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
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
    </div>
  );

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

        {/* Conditional rendering based on device type */}
        {isMobile ? <MobileRestaurantView /> : <DesktopCarouselView />}

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
