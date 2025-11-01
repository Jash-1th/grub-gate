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
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {t('getStartedCta.title')}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('getStartedCta.subtitle')}
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleGetStarted}
              disabled={loading}
              className="bg-grub-red text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Loading...
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