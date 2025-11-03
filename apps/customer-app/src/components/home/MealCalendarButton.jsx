import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import mealCalendarApi from '../../api/mealCalendarApi';

const MealCalendarButton = () => {
  // SSR-safe state initialization
  const [isClient, setIsClient] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // SSR safety check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check subscription status when component mounts
  useEffect(() => {
    if (isClient && isAuthenticated && user?.roles?.includes('customer')) {
      checkSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [isClient, isAuthenticated, user]);

  const checkSubscriptionStatus = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 MealCalendarButton: Checking subscription status...');
      
      const response = await mealCalendarApi.getSubscriptionStatus();
      
      console.log('✅ MealCalendarButton: Subscription status received:', response);
      
      if (response.success && response.data.hasActiveSubscription) {
        setHasActiveSubscription(true);
        setSubscriptionData(response.data.activeSubscription);
      } else {
        setHasActiveSubscription(false);
      }
      
    } catch (error) {
      console.error('❌ MealCalendarButton: Error checking subscription:', error);
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarClick = () => {
    console.log('📅 MealCalendarButton: Navigating to meal calendar...');
    navigate('/meal-calendar');
  };

  // Don't render during SSR
  if (!isClient) {
    return null;
  }

  // Don't show if user is not authenticated or not a customer
  if (!isAuthenticated || !user?.roles?.includes('customer')) {
    return null;
  }

  // Don't show if loading
  if (loading) {
    return null;
  }

  // Don't show if no active subscription
  if (!hasActiveSubscription) {
    return null;
  }

  return (
    <div className="fixed 
                    bottom-[72px] left-1/2 -translate-x-1/2 z-40
                    xs:bottom-[76px] sm:bottom-[80px]
                    md:bottom-6 md:right-6 md:left-auto md:translate-x-0 md:z-50">
      <button
        onClick={handleCalendarClick}
        className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white 
                   px-4 py-2.5 xs:px-5 xs:py-3 sm:px-6 sm:py-3.5 md:px-6 md:py-4 
                   rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 
                   focus:outline-none focus:ring-4 focus:ring-orange-300"
        title="View Your Meal Calendar"
        aria-label="View Your Meal Calendar"
      >
        <div className="flex items-center space-x-2 xs:space-x-2.5">
          <svg 
            className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <span className="font-semibold text-xs xs:text-sm sm:text-base whitespace-nowrap">Your Meal Calendar</span>
        </div>
        
        {/* Notification badge if there are upcoming meals */}
        {subscriptionData?.remainingDays > 0 && (
          <div className="absolute -top-2 xs:-top-2 -right-2 xs:-right-2 bg-red-500 text-white text-[10px] xs:text-xs font-bold rounded-full w-5 h-5 xs:w-6 xs:h-6 flex items-center justify-center shadow-md border-2 border-white">
            {subscriptionData.remainingDays > 99 ? '99+' : subscriptionData.remainingDays}
          </div>
        )}
      </button>
    </div>
  );
};

export default MealCalendarButton;
