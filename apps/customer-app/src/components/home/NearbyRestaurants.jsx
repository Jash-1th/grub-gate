import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { getPopularRestaurants } from '../../services/restaurantService';
import './NearbyRestaurants.css';

// Use public path for SSR compatibility
const restaurantImage = '/images/grub-gate-default-restaurant-img.jpg';

const NearbyRestaurants = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State for restaurants data
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Triple the restaurants for seamless infinite scroll
  const duplicatedRestaurants = restaurants.length > 0 ? [...restaurants, ...restaurants, ...restaurants] : [];
  
  // State for carousel behavior
  const [isPaused, setIsPaused] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [dragVisualState, setDragVisualState] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Fetch popular restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const result = await getPopularRestaurants(6); // Get 6 popular restaurants
        if (result.success && result.data.length > 0) {
          setRestaurants(result.data);
        } else {
          // If no popular restaurants, set empty array
          setRestaurants([]);
        }
      } catch (error) {
        console.error('Error fetching popular restaurants:', error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);
  
  // Refs for carousel control (using refs for drag state to avoid re-render issues)
  const carouselRef = useRef(null);
  const animationIdRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, startTime: 0 });
  const scrollSpeedRef = useRef(0.5); // pixels per frame
  const lastTimeRef = useRef(0);
  const momentumRef = useRef({ velocity: 0, lastX: 0, lastTime: 0 });
  const resumeTimeoutRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isDragIntentRef = useRef(false);
  
  // SSR-safe client initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Navigation handler for Make Your Plan button
  const handleMakeYourPlan = () => {
    navigate('/plan');
  };

  // Navigation handler for restaurant card clicks
  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };
  
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

  // Track centered card (for mobile snap+grow feel)
  useEffect(() => {
    if (!isClient || !carouselRef.current) return;
    const carousel = carouselRef.current;

    const computeActive = () => {
      const children = carousel.querySelectorAll('.restaurant-card-mobile');
      if (!children || children.length === 0) return;
      const center = carousel.scrollLeft + carousel.clientWidth / 2;

      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      children.forEach((el, idx) => {
        const elCenter = el.offsetLeft + el.offsetWidth / 2;
        const d = Math.abs(elCenter - center);
        if (d < bestDistance) {
          bestDistance = d;
          bestIndex = idx;
        }
      });

      setActiveIndex(bestIndex);
    };

    computeActive();
    carousel.addEventListener('scroll', computeActive, { passive: true });
    return () => carousel.removeEventListener('scroll', computeActive);
  }, [isClient]);
  
  // Clear resume timeout helper
  const clearResumeTimeout = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  // Unified event handler for both mouse and touch move events
  const handleInteractionMove = useCallback((e) => {
    if (!carouselRef.current) return;
    
    const currentTime = performance.now();
    // Get the correct clientX/Y whether it's a touch or mouse event
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    
    // For touch events, determine drag intent on first move
    if (e.type === 'touchmove' && !isDragIntentRef.current) {
      const deltaX = Math.abs(clientX - touchStartRef.current.x);
      const deltaY = Math.abs(clientY - touchStartRef.current.y);
      
      // Only start dragging if horizontal movement is greater than vertical
      if (deltaX > deltaY && deltaX > 10) {
        isDragIntentRef.current = true;
        isDraggingRef.current = true;
        setDragVisualState(true);
        setIsPaused(true);
      } else if (deltaY > deltaX && deltaY > 10) {
        // Vertical scroll detected - don't interfere
        return;
      } else {
        // Not enough movement to determine intent
        return;
      }
    }
    
    if (!isDraggingRef.current) return;
    
    // Prevent default only after we've determined horizontal drag intent
    e.preventDefault();
    
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
    if (!carouselRef.current) return;
    
    const carousel = carouselRef.current;
    const velocity = momentumRef.current.velocity;
    
    // Apply momentum if significant velocity and we were actually dragging
    if (isDraggingRef.current && Math.abs(velocity) > 0.5) {
      const momentumDistance = velocity * 100; // Adjust multiplier for desired momentum
      const targetScroll = carousel.scrollLeft - momentumDistance;
      
      carousel.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
    
    // Reset states
    isDraggingRef.current = false;
    isDragIntentRef.current = false;
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
    
    // Clear any pending resume timeout
    clearResumeTimeout();
    
    const currentTime = performance.now();
    // Get the correct clientX/Y whether it's a touch or mouse event
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    // Store touch start position for intent detection
    touchStartRef.current = { x: clientX, y: clientY };
    
    // For mouse events, start dragging immediately
    if (e.type === 'mousedown') {
      e.preventDefault();
      setIsPaused(true);
      isDraggingRef.current = true;
      setDragVisualState(true);
      isDragIntentRef.current = true;
    } else {
      // For touch events, wait for move to determine intent
      isDragIntentRef.current = false;
    }
    
    // Update drag start reference
    dragStartRef.current = {
      x: clientX,
      y: clientY,
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
          passive: false,
          capture: true 
        });
        document.addEventListener('touchend', handleInteractionEnd, { 
          passive: false,
          capture: true 
        });
        // Also listen for touch cancel events
        document.addEventListener('touchcancel', handleInteractionEnd, { 
          passive: false,
          capture: true 
        });
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
  
  // Add explicit passive: false event listeners for mobile touch handling
  useEffect(() => {
    if (!isClient || !carouselRef.current) return;
    
    const carousel = carouselRef.current;
    
    // Add passive: false listeners to ensure preventDefault works on mobile
    const addTouchListeners = () => {
      carousel.addEventListener('touchstart', handleInteractionStart, { passive: false });
      carousel.addEventListener('touchmove', handleInteractionMove, { passive: false });
      carousel.addEventListener('touchend', handleInteractionEnd, { passive: false });
      carousel.addEventListener('touchcancel', handleInteractionEnd, { passive: false });
    };
    
    const removeTouchListeners = () => {
      carousel.removeEventListener('touchstart', handleInteractionStart);
      carousel.removeEventListener('touchmove', handleInteractionMove);
      carousel.removeEventListener('touchend', handleInteractionEnd);
      carousel.removeEventListener('touchcancel', handleInteractionEnd);
    };
    
    addTouchListeners();
    
    return removeTouchListeners;
  }, [isClient, handleInteractionStart, handleInteractionMove, handleInteractionEnd]);
  
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
      if (typeof document !== 'undefined') {
        document.removeEventListener('mousemove', handleInteractionMove);
        document.removeEventListener('mouseup', handleInteractionEnd);
        document.removeEventListener('mouseleave', handleInteractionEnd);
        document.removeEventListener('touchmove', handleInteractionMove);
        document.removeEventListener('touchend', handleInteractionEnd);
        document.removeEventListener('touchcancel', handleInteractionEnd);
      }
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
        // Touch events handled by useEffect with passive: false
        // onTouchStart, onTouchMove, onTouchEnd are managed by explicit event listeners
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
          <div
            className={`restaurant-card-mobile ${
              shouldReduceMotion
                ? ''
                : index === activeIndex
                  ? 'is-active'
                  : 'is-inactive'
            }`}
            key={`${restaurant.id}-${index}`}
          >
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
                <div className="flex justify-between">
                  <span>{t('nearbyRestaurants.minOrder')}:</span>
                  <span className="font-medium">{restaurant.minOrder}</span>
                </div>
              </div>

              {/* <div className="flex flex-wrap gap-1 mb-3">
                {restaurant.tags.slice(0, 2).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div> */}

              <div className="mt-auto">
                <button 
                  onClick={() => handleRestaurantClick(restaurant.id)}
                  className="w-full bg-grub-red text-white py-2 px-4 rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors duration-200"
                >
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
        // Touch events handled by useEffect with passive: false
        // onTouchStart, onTouchMove, onTouchEnd are managed by explicit event listeners
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
                {/* <div className="flex justify-between">
                  <span>{t('nearbyRestaurants.cuisine')}:</span>
                  <span className="font-medium">{restaurant.cuisine}</span>
                </div> */}
                <div className="flex justify-between">
                  <span>{t('nearbyRestaurants.deliveryFee')}:</span>
                  <span className="font-medium">{restaurant.deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('nearbyRestaurants.minOrder')}:</span>
                  <span className="font-medium">{restaurant.minOrder}</span>
                </div>
              </div>

              {/* <div className="mt-4 flex flex-wrap gap-2">
                {restaurant.tags.slice(0, 3).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div> */}

              <button 
                onClick={() => handleRestaurantClick(restaurant.id)}
                className="w-full mt-4 bg-grub-red text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
              >
                {t('nearbyRestaurants.orderNow')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Show loading state
  if (loading) {
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
          
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
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
      </section>
    );
  }

  // Show empty state if no restaurants
  if (!loading && restaurants.length === 0) {
    return (
      <section className="nearby-restaurants">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-grub-red mb-4">
              {t('nearbyRestaurants.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              No restaurants available at the moment. Please check back later.
            </p>
          </div>
        </div>
      </section>
    );
  }

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
          <button 
            onClick={handleMakeYourPlan}
            className="bg-grub-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Make Your Plan</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default NearbyRestaurants;
