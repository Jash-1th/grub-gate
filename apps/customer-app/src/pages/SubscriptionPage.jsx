import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMealPlan } from '../contexts/MealPlanContext_SSR_FIXED';
import { useToast } from '../contexts/ToastContext';
import SubscriptionPlans from '../components/planning/SubscriptionPlans';

const SubscriptionPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getTotalItemsCount, isLoading } = useMealPlan();
  const { showError } = useToast();
  const hasCheckedOnMount = useRef(false);
  const hasCheckedSubscriptionFlag = useRef(false);

  // CRITICAL FIX: Check for recent subscription in useEffect (not during render)
  useEffect(() => {
    // Only check once on mount
    if (hasCheckedSubscriptionFlag.current) return;
    hasCheckedSubscriptionFlag.current = true;
    
    const recentSubscriptionSuccess = sessionStorage.getItem('recentSubscriptionSuccess');
    if (recentSubscriptionSuccess) {
      console.log('✅ SubscriptionPage: Recent subscription detected, redirecting to meal calendar');
      sessionStorage.removeItem('recentSubscriptionSuccess');
      navigate('/meal-calendar', { replace: true });
    }
  }, [navigate]);

  // Check if user has selected at least one meal item
  useEffect(() => {
    // CRITICAL: Don't check if user just completed subscription
    const recentSubscriptionSuccess = sessionStorage.getItem('recentSubscriptionSuccess');
    if (recentSubscriptionSuccess) {
      console.log('⏭️ SubscriptionPage: Skipping meal count check - subscription just completed');
      return;
    }
    
    // Skip the check on initial mount (to avoid false positives during page refresh)
    if (!hasCheckedOnMount.current) {
      hasCheckedOnMount.current = true;
      console.log('⏭️ SubscriptionPage: Skipping check on initial mount');
      return;
    }
    
    // Don't check until meal plan data is fully loaded
    if (isLoading) {
      console.log('⏳ SubscriptionPage: Still loading meal plan data, waiting...');
      return;
    }
    
    const totalItems = getTotalItemsCount();
    
    console.log('🔍 SubscriptionPage: totalItems =', totalItems);
    
    if (totalItems === 0) {
      console.log('❌ SubscriptionPage: Showing "No Meals Selected" error');
      showError(
        'No Meals Selected',
        'Please select at least one meal item before choosing a subscription plan.'
      );
      // Redirect to weekly menu page
      navigate('/weekly-menu', { replace: true });
    } else {
      console.log('✅ SubscriptionPage: Normal flow, totalItems > 0');
    }
  }, [getTotalItemsCount, navigate, showError, isLoading]);

  // CRITICAL FIX: Don't render if subscription just completed (let useEffect handle redirect)
  const recentSubscriptionSuccess = sessionStorage.getItem('recentSubscriptionSuccess');
  if (recentSubscriptionSuccess) {
    return null; // Will redirect via useEffect
  }

  // Don't render the page if no items are selected
  const totalItems = getTotalItemsCount();
  if (totalItems === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-grub-red to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <button
                onClick={() => navigate('/weekly-menu')}
                className="inline-flex items-center text-red-100 hover:text-white transition-colors duration-200 mb-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('subscription.backToWeeklyMenu')}
              </button>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
                {t('subscription.chooseYourPlan')}
              </h1>
              <p className="text-red-100 text-sm sm:text-base">
                {t('subscription.selectPerfectPlan')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="py-6 sm:py-12">
        <SubscriptionPlans />
      </div>
    </div>
  );
};

export default SubscriptionPage;
