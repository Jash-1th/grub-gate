import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import mealCalendarApi from '../../api/mealCalendarApi';

const GetStartedCTA = () => {
  const { t } = useTranslation();
  const { openLoginModal } = useModal();
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
      // User is not logged in, open login modal
      openLoginModal();
    }
  };

  return (
    <section className="py-8 xs:py-10 sm:py-12 md:py-16 lg:py-20 px-3 xs:px-4 sm:px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-5 xs:p-6 sm:p-8 md:p-10 lg:p-12 text-center">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 xs:mb-5 sm:mb-6">
            {t('getStartedCta.title')}
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 xs:mb-7 sm:mb-8 max-w-3xl mx-auto px-2">
            {t('getStartedCta.subtitle')}
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleGetStarted}
              disabled={loading}
              className="w-full xs:w-auto bg-grub-red text-white px-6 xs:px-7 sm:px-8 md:px-10 py-3 xs:py-3.5 sm:py-4 md:py-5 rounded-lg sm:rounded-xl font-semibold text-base xs:text-lg sm:text-xl hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 xs:h-5 xs:w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  <span className="text-base xs:text-lg sm:text-xl">Loading...</span>
                </div>
              ) : isAuthenticated ? (
                hasActiveSubscription ? t('yourOrders.viewCalendar') : 'Start Planning'
              ) : (
                t('getStartedCta.startPlan')
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetStartedCTA;