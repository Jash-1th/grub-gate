import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import mealCalendarApi from '../../api/mealCalendarApi';
import '../common/hero-responsive.css';
// Use public path for SSR compatibility
const heroImage = '/images/HeroHome.jpg';

const HeroSection = () => {
  const { t } = useTranslation();
  const { openOTPAuthModal } = useModal();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check subscription status when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.roles?.includes('customer')) {
      checkSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const checkSubscriptionStatus = async () => {
    try {
      setLoading(true);
      
      const response = await mealCalendarApi.getSubscriptionStatus();
      
      if (response.success && response.data.hasActiveSubscription) {
        setHasActiveSubscription(true);
      } else {
        setHasActiveSubscription(false);
      }
      
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (hasActiveSubscription) {
        // User has active subscription, navigate to meal calendar
        navigate('/meal-calendar');
      } else {
        // User is logged in but no active subscription, navigate to plan page
        navigate('/plan');
      }
    } else {
      // User is not logged in, open OTP modal for signup
      openOTPAuthModal('signup');
    }
  };
  
  // Debug logging
  console.log('🎭 HeroSection loading, image path:', heroImage);

  return (
    <section 
      className="hero-section-responsive"
      style={{
        backgroundImage: `url(${heroImage})`
      }}
    >
      {/* Frosted glass overlay */}
      <div className="hero-overlay"></div>
      
      {/* Content */}
      <div className="hero-content px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-7xl mx-auto">
        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 md:mb-8 leading-tight">
          {t('hero.title')}
          <br />
          <span className="text-red-300">{t('hero.subtitle')}</span>
        </h1>
       
        
        <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-100 mb-6 sm:mb-8 md:mb-10 max-w-5xl mx-auto leading-relaxed px-2 xs:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          {t('hero.description')}
        </p>
        
        {/* Enhanced CTA Button - Next Step Highlight */}
        <div className="relative inline-flex items-center justify-center mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md">
          {/* Animated glow ring */}
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-grub-red via-red-600 to-grub-red opacity-75 blur-lg animate-pulse"></div>
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-grub-red via-red-600 to-grub-red opacity-50 animate-ping"></div>
          
          {/* Glass container */}
          <div className="relative rounded-xl sm:rounded-2xl bg-black/30 backdrop-blur-md p-0.5 sm:p-1 border border-white/20 w-full">
            <button
              onClick={handleGetStarted}
              disabled={loading}
              className="group relative w-full px-6 xs:px-8 sm:px-10 md:px-12 py-3 xs:py-4 sm:py-5 md:py-6 bg-gradient-to-r from-grub-red via-red-600 to-red-700 text-white rounded-lg sm:rounded-xl font-bold text-base xs:text-lg sm:text-xl md:text-2xl shadow-2xl hover:shadow-red-500/50 transition-all duration-500 transform hover:scale-105 sm:hover:scale-110 hover:-translate-y-1 sm:hover:-translate-y-2 overflow-hidden"
            >
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Button content */}
              <div className="relative flex items-center justify-center">
                <span className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-wide">
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Loading...
                    </div>
                  ) : isAuthenticated ? (
                    hasActiveSubscription ? t('yourOrders.viewCalendar') : t('common.startPlanning')
                  ) : (
                    t('hero.getStarted')
                  )}
                </span>
              </div>
              
              {/* Sparkle effects */}
              <div className="absolute top-1 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-ping delay-100"></div>
              <div className="absolute bottom-2 right-6 w-1 h-1 bg-white rounded-full animate-ping delay-300"></div>
              <div className="absolute top-3 right-12 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping delay-500"></div>
            </button>
          </div>
        </div>
        
        {/* Stats */}
        {/* <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {heroContent.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-sm sm:text-base text-gray-200 font-medium">
                {stat.label}
              </div>
              <div className="text-xs sm:text-sm text-gray-300">
                {stat.description}
              </div>
            </div>
          ))}
        </div> */}
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden xs:block">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;