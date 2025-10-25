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
    <div className="fixed bottom-20 sm:bottom-6 right-6 z-50">
      <button
        onClick={handleCalendarClick}
        className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300"
        title="View My Meal Calendar"
        aria-label="View My Meal Calendar"
      >
        <div className="flex items-center space-x-2">
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6" 
            />
          </svg>
          <span className="hidden sm:inline font-semibold">My Calendar</span>
        </div>
        
        {/* Notification badge if there are upcoming meals */}
        {subscriptionData?.remainingDays > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {subscriptionData.remainingDays > 99 ? '99+' : subscriptionData.remainingDays}
          </div>
        )}
      </button>
      
      {/* Tooltip for desktop */}
      <div className="hidden lg:block absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        View your scheduled meals
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export default MealCalendarButton;
