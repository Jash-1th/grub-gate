import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { useModal } from '../../context/ModalContext';
import { usePlanning } from '../../contexts/PlanningContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getRestaurantsByPostalCode } from '../../services/restaurantService';
import HowItWorksPlan from './HowItWorksPlan';
import ScheduleDemo from './ScheduleDemo';

const LocationStep = ({ onNext }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openLoginModal, openOTPAuthModal } = useModal();
  const { updatePostalCode, updatePreferences } = usePlanning();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const [postalCode, setPostalCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isPostalFocused, setIsPostalFocused] = useState(false);
  const [isPostalHover, setIsPostalHover] = useState(false);

  const glowOpacity = isPostalFocused ? 0.6 : isPostalHover ? 0.45 : 0.25;

  const foodTiles = useMemo(
    () => [
      {
        id: 'noodles',
        src: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        fallback: '/images/grub-gate-default-img.jpg',
        glow: 'from-orange-400 to-red-400',
        alt: 'Delicious ramen bowl with soft-boiled eggs and vegetables',
        entrance: { x: 0, y: 36 },
        float: { y: [0, -7, 0], duration: 4.7, delay: 0.1 }
      },
      {
        id: 'burger',
        src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        fallback: '/images/grub-gate-default-img.jpg',
        glow: 'from-yellow-400 to-orange-400',
        alt: 'Gourmet burger with fresh ingredients and fries',
        entrance: { x: 36, y: 0 },
        float: { y: [0, -9, 0], duration: 5.3, delay: 0.7 },
        tooltip: 'American Cuisine · 50+ Options'
      },
      {
        id: 'sushi',
        src: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        fallback: '/images/grub-gate-default-img.jpg',
        glow: 'from-green-400 to-teal-400',
        alt: 'Fresh sushi platter with various rolls and sashimi',
        entrance: { x: -36, y: 0 },
        float: { y: [0, -6, 0], duration: 4.2, delay: 0.35 }
      },
      {
        id: 'salad',
        src: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        fallback: '/images/grub-gate-default-img.jpg',
        glow: 'from-emerald-400 to-green-400',
        alt: 'Colorful Buddha bowl with avocado, vegetables, and grains',
        entrance: { x: 0, y: -36 },
        float: { y: [0, -8, 0], duration: 5.8, delay: 1.15 }
      }
    ],
    []
  );

  const tileEntranceVariants = useMemo(() => {
    if (shouldReduceMotion) return undefined;
    return {
      hidden: (c) => ({ opacity: 0, x: c.from.x, y: c.from.y, scale: 0.96 }),
      show: (c) => ({
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: c.delay }
      })
    };
  }, [shouldReduceMotion]);

  const handleFindMeals = async () => {
    if (postalCode.trim()) {
      setIsSearching(true);
      
      try {
        // Update postal code in context
        updatePostalCode(postalCode.trim());
        
        // Actually fetch restaurants to validate postal code
        const result = await getRestaurantsByPostalCode(postalCode.trim(), { limit: 1 });
        
        if (result.success) {
          if (result.data.length === 0) {
            showInfo(
              t('mealPlanning.restaurantSearch.noRestaurantsTitle'),
              t('mealPlanning.restaurantSearch.noRestaurantsMessage', { postalCode: postalCode.toUpperCase() })
            );
            setIsSearching(false);
            return;
          }
          
          // Show success message
          const count = result.pagination?.totalItems;
          showSuccess(
            t('mealPlanning.restaurantSearch.successTitle'),
            count 
              ? t('mealPlanning.restaurantSearch.successMessage', { count, postalCode: postalCode.toUpperCase() })
              : t('mealPlanning.restaurantSearch.successMessageSeveral', { postalCode: postalCode.toUpperCase() })
          );
          
          // Check if user is authenticated before proceeding
          if (!isAuthenticated) {
            // Show login modal if user is not authenticated
            openLoginModal();
            return;
          }
          
          // Navigate directly to restaurant step
          navigate('/plan/restaurants?source=plan');
        } else {
          // Handle API error
          showError(
            'Search Failed',
            result.error || 'Unable to search for restaurants. Please try again.'
          );
        }
      } catch (error) {
        console.error('Error searching for restaurants:', error);
        showError(
          'Connection Error',
          'Unable to connect to our servers. Please check your internet connection and try again.'
        );
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleUseCurrentLocation = () => {
    // For now, open OTP modal for signup - can be enhanced later with geolocation
    openOTPAuthModal('signup');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFindMeals();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section for Meal Planning */}
      <section className="min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-white to-red-50 relative overflow-hidden">
        {/* Background decorative elements - responsive positioning */}
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div
            className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-red-100 mix-blend-multiply filter blur-xl opacity-30"
            style={{ borderRadius: '40% 60% 55% 45% / 50% 45% 55% 50%' }}
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    x: [0, 18, -10, 0],
                    y: [0, 10, -14, 0],
                    borderRadius: [
                      '40% 60% 55% 45% / 50% 45% 55% 50%',
                      '55% 45% 40% 60% / 45% 55% 45% 55%',
                      '45% 55% 60% 40% / 55% 45% 55% 45%',
                      '40% 60% 55% 45% / 50% 45% 55% 50%'
                    ]
                  }
            }
            transition={shouldReduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-20 sm:top-40 right-5 sm:right-20 w-64 h-64 sm:w-96 sm:h-96 bg-orange-100 mix-blend-multiply filter blur-xl opacity-30"
            style={{ borderRadius: '55% 45% 50% 50% / 45% 55% 45% 55%' }}
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    x: [0, -16, 12, 0],
                    y: [0, 14, -8, 0],
                    borderRadius: [
                      '55% 45% 50% 50% / 45% 55% 45% 55%',
                      '45% 55% 60% 40% / 55% 45% 55% 45%',
                      '60% 40% 45% 55% / 50% 45% 55% 50%',
                      '55% 45% 50% 50% / 45% 55% 45% 55%'
                    ]
                  }
            }
            transition={shouldReduceMotion ? undefined : { duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          />
          <motion.div
            className="absolute bottom-10 sm:bottom-20 left-5 sm:left-20 w-56 h-56 sm:w-80 sm:h-80 bg-yellow-100 mix-blend-multiply filter blur-xl opacity-30"
            style={{ borderRadius: '45% 55% 55% 45% / 55% 45% 55% 45%' }}
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    x: [0, 12, -18, 0],
                    y: [0, -10, 14, 0],
                    borderRadius: [
                      '45% 55% 55% 45% / 55% 45% 55% 45%',
                      '60% 40% 45% 55% / 50% 45% 55% 50%',
                      '50% 50% 40% 60% / 45% 55% 45% 55%',
                      '45% 55% 55% 45% / 55% 45% 55% 45%'
                    ]
                  }
            }
            transition={shouldReduceMotion ? undefined : { duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-grub-red mb-4 sm:mb-6 leading-tight">
                  {t('mealPlanning.hero.title')}
                  <br />
                  <span className="text-grub-red bg-gradient-to-r from-grub-red via-grub-red to-grub-red bg-clip-text text-transparent">
                    {t('mealPlanning.hero.subtitle')}
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  {t('mealPlanning.hero.description')}
                </p>
              </div>
              
              {/* Enhanced Postal Code Input Container - Responsive */}
              <div className="mb-6">
                <div
                  className="relative group"
                  onMouseEnter={() => setIsPostalHover(true)}
                  onMouseLeave={() => setIsPostalHover(false)}
                >
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-grub-red via-grub-red to-grub-red rounded-3xl blur-sm"
                    animate={shouldReduceMotion ? undefined : { opacity: glowOpacity }}
                    transition={shouldReduceMotion ? undefined : { duration: 0.25, ease: 'easeOut' }}
                    style={{ opacity: glowOpacity }}
                  />
                  <motion.div
                    className="relative backdrop-blur-sm bg-white/90 border border-white/50 rounded-2xl p-1.5 sm:p-2 shadow-2xl"
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : isPostalFocused
                          ? { boxShadow: '0 28px 80px rgba(128,0,32,0.25)' }
                          : { boxShadow: '0 25px 60px rgba(0,0,0,0.12)' }
                    }
                    transition={shouldReduceMotion ? undefined : { duration: 0.25, ease: 'easeOut' }}
                  >
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setIsPostalFocused(true)}
                        onBlur={() => setIsPostalFocused(false)}
                        placeholder={t('mealPlanning.hero.postalCodePlaceholder')}
                        className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-transparent text-gray-900 placeholder-gray-500 border-0 focus:outline-none text-base sm:text-lg font-medium rounded-xl sm:rounded-none"
                        aria-label={t('mealPlanning.hero.postalCodeLabel')}
                      />
                      <button
                        onClick={handleFindMeals}
                        disabled={isSearching || !postalCode.trim()}
                        className="relative overflow-hidden px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-grub-red via-grub-red to-grub-red text-white rounded-xl font-semibold text-sm sm:text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-grub-red focus:ring-offset-2 shadow-lg hover:shadow-xl hover:shadow-grub-red/30 transform hover:-translate-y-0.5 sm:mr-1 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                      >
                        {!shouldReduceMotion && !isSearching && postalCode.trim() ? (
                          <span aria-hidden="true" className="gg-btn-shine" />
                        ) : null}
                        {isSearching ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="animate-pulse">Finding restaurants...</span>
                          </div>
                        ) : (
                          t('mealPlanning.hero.findMealsButton')
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
                
                {/* Use Current Location Option - Responsive */}
                <div className="flex items-center justify-center mt-4 sm:mt-6">
                  <div className="flex items-center space-x-2 sm:space-x-4 w-full max-w-sm sm:max-w-md">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-gray-400 flex-1"></div>
                    <div className="relative">
                      <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur opacity-30"></div>
                      <span className="relative text-gray-500 text-xs sm:text-sm font-medium px-3 sm:px-6 py-1.5 sm:py-2 bg-white/90 rounded-full border border-gray-200/50 shadow-sm">
                        or
                      </span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-gray-400 via-gray-300 to-transparent flex-1"></div>
                  </div>
                </div>
                
                <div className="text-center mt-4 sm:mt-6">
                  <div className="relative inline-block group">
                    {/* Glowing background effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-grub-red via-grub-red to-grub-red rounded-xl blur-sm opacity-15 group-hover:opacity-25 transition duration-500 group-hover:duration-200"></div>
                    
                    <button
                      onClick={handleUseCurrentLocation}
                      className="relative inline-flex items-center text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 focus:outline-none bg-white/80 hover:bg-grub-red/5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-gray-200/50 hover:border-grub-red/30 shadow-lg hover:shadow-xl transform hover:-translate-y-1 backdrop-blur-sm group text-sm sm:text-base"
                    >
                      {/* Animated location icon */}
                      <div className="relative mr-2 sm:mr-3">
                        {!shouldReduceMotion ? (
                          <motion.span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full"
                            style={{ border: '2px solid rgba(128, 0, 32, 0.35)' }}
                            animate={{ scale: [1, 2.15], opacity: [0.55, 0] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                          />
                        ) : null}
                        <svg 
                          className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                          />
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                          />
                        </svg>
                        
                        {/* Pulsing dot effect */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-grub-red rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                        </div>
                      </div>
                      
                      <span className="relative">
                        Use current location
                      </span>
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Content - Food Images - Responsive */}
            <div className="relative mt-8 lg:mt-0 order-first lg:order-last">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 max-w-md mx-auto lg:max-w-none">
                {foodTiles.map((tile, idx) => {
                  const positionClass =
                    tile.id === 'burger'
                      ? 'mt-4 sm:mt-8'
                      : tile.id === 'sushi'
                        ? '-mt-2 sm:-mt-4'
                        : tile.id === 'salad'
                          ? 'mt-2 sm:mt-4'
                          : '';

                  return (
                    <motion.div
                      key={tile.id}
                      className={`relative group ${positionClass}`}
                      variants={tileEntranceVariants}
                      custom={{ from: tile.entrance, delay: 0.08 * idx }}
                      initial={shouldReduceMotion ? false : 'hidden'}
                      whileInView={shouldReduceMotion ? undefined : 'show'}
                      viewport={{ once: true, amount: 0.35 }}
                    >
                      <div className={`absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r ${tile.glow} rounded-2xl sm:rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300`}></div>
                      <motion.div
                        className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300"
                        animate={shouldReduceMotion ? undefined : { y: tile.float.y }}
                        transition={
                          shouldReduceMotion
                            ? undefined
                            : { duration: tile.float.duration, repeat: Infinity, ease: 'easeInOut', delay: tile.float.delay }
                        }
                        whileHover={shouldReduceMotion ? undefined : { scale: tile.id === 'burger' ? 1.1 : 1.06 }}
                      >
                        <motion.img
                          src={tile.src}
                          alt={tile.alt}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = tile.fallback;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {tile.tooltip && !shouldReduceMotion ? (
                          <div className="absolute left-3 bottom-3 right-3 pointer-events-none opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-gray-900 text-xs sm:text-sm font-semibold shadow-lg">
                              {tile.tooltip}
                            </div>
                          </div>
                        ) : null}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Enhanced floating elements - Responsive */}
              <div className="absolute -top-4 sm:-top-8 -right-4 sm:-right-8 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-red-200 to-orange-200 rounded-full opacity-40 animate-pulse"></div>
              <div className="absolute -bottom-4 sm:-bottom-8 -left-4 sm:-left-8 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-r from-yellow-200 to-red-200 rounded-full opacity-40 animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 -right-2 sm:-right-4 w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-200 to-red-200 rounded-full opacity-30 animate-pulse delay-2000"></div>
            </div>
          </div>
        </div>

      </section>
      
      {/* How It Works Section */}
      {/* <HowItWorksPlan /> */}
      
      {/* Interactive Schedule Demo */}
      {/* <ScheduleDemo /> */}
    </div>
  );
};

export default LocationStep;
