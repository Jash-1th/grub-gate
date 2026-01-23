import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../../contexts/MealPlanContext_SSR_FIXED';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import BillingFormModal from '../modals/BillingFormModal';
import EnhancedSubscriptionFlow from '../subscription/EnhancedSubscriptionFlow';

const SubscriptionPlans = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    getWeekTotalItems, 
    getWeekTotalCost, 
    getRestaurantsInAllWeeks,
    getSelectedRestaurantCount,
    getSelectedRestaurants,
    clearAllMealPlanData
  } = useMealPlan();
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  
  // State to track selected subscription plan
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showEnhancedFlow, setShowEnhancedFlow] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate actual meal costs from user's meal plan
  const biweeklyMealCost = getWeekTotalCost(0) + getWeekTotalCost(1);
  const totalItems = getWeekTotalItems(0) + getWeekTotalItems(1);

  // Calculate costs based on selected plan
  const getMealCostForPlan = (planId) => {
    switch (planId) {
      case 'bi-weekly': return biweeklyMealCost;
      case 'monthly': return biweeklyMealCost * 2; // 1 month = 2 biweeks
      case 'quarterly': return biweeklyMealCost * 6; // 3 months = 6 biweeks
      default: return biweeklyMealCost;
    }
  };

  const getPlanDurationText = (planId) => {
    switch (planId) {
      case 'bi-weekly': return 'Biweekly';
      case 'monthly': return '1 Month';
      case 'quarterly': return '3 Months';
      default: return 'Biweekly';
    }
  };

  const currentMealCost = getMealCostForPlan(selectedPlan);
  const currentServiceFee = currentMealCost * 0.10;
  const currentTax = currentMealCost * 0.15;
  const currentTotalCost = currentMealCost + currentServiceFee + currentTax;

  // Handle Get Started button click
  const handleGetStarted = (planId) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      showInfo('Login Required', 'Please login to subscribe to a plan');
      navigate('/login?redirect=/subscription');
      return;
    }

    // Set the selected plan and show enhanced subscription flow
    setSelectedPlan(planId);
    setShowEnhancedFlow(true);
  };

  // Handle billing modal close
  const handleCloseBillingModal = () => {
    setShowBillingModal(false);
    setIsProcessing(false);
  };

  // Handle enhanced flow completion
  const handleEnhancedFlowComplete = async (subscriptionData) => {
    setShowEnhancedFlow(false);
    
    // Set flag to prevent "No Meals Selected" error on subscription page
    console.log('🎯 SubscriptionPlans: Setting recentSubscriptionSuccess flag (enhanced flow)');
    sessionStorage.setItem('recentSubscriptionSuccess', 'true');
    console.log('🎯 SubscriptionPlans: Flag set, value =', sessionStorage.getItem('recentSubscriptionSuccess'));
    
    // IMPORTANT: Clear all meal plan data from frontend after successful subscription
    // This prevents showing old data even though it's deleted from database
    console.log('🧹 Clearing meal plan data after successful subscription creation (enhanced flow)...');
    
    try {
      // Clear all meal plan data and localStorage (now async)
      await clearAllMealPlanData();
      console.log('✅ Successfully cleared meal plan data from frontend');
    } catch (error) {
      console.error('⚠️ Error clearing meal plan data:', error);
    }
    
    // Toast already shown in EnhancedSubscriptionFlow, no need to show again
    // Navigate to meal calendar to show the newly created subscription
    navigate('/meal-calendar');
  };

  // Handle enhanced flow cancellation
  const handleEnhancedFlowCancel = () => {
    setShowEnhancedFlow(false);
  };

  // Get plan details by ID
  const getPlanById = (planId) => {
    return plans.find(plan => plan.id === planId);
  };

  // Handle successful subscription creation
  const handleSubscriptionSuccess = async () => {
    // Set flag to prevent "No Meals Selected" error on subscription page
    console.log('🎯 SubscriptionPlans: Setting recentSubscriptionSuccess flag');
    sessionStorage.setItem('recentSubscriptionSuccess', 'true');
    console.log('🎯 SubscriptionPlans: Flag set, value =', sessionStorage.getItem('recentSubscriptionSuccess'));
    
    // IMPORTANT: Clear all meal plan data from frontend after successful subscription
    // This prevents showing old data even though it's deleted from database
    console.log('🧹 Clearing meal plan data after successful subscription creation...');
    
    try {
      // Clear all meal plan data and localStorage (now async)
      await clearAllMealPlanData();
      console.log('✅ Successfully cleared meal plan data from frontend');
    } catch (error) {
      console.error('⚠️ Error clearing meal plan data:', error);
    }
    
    // CRITICAL FIX: Wait a brief moment to ensure state updates are complete
    // This prevents the flash of weekly-menu page during navigation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Toast already shown in BillingFormModal, no need to show again
    // Navigate to meal calendar to show the newly created subscription
    // Use replace: true to avoid adding to history stack
    navigate('/meal-calendar', { replace: true });
  };

  const plans = [
    {
      id: 'bi-weekly',
      name: t('subscription.biWeeklyPlan'),
      price: '$19.99',
      period: t('subscription.everyTwoWeeks'),
      description: t('subscription.perfectForRegular'),
      features: [
        t('subscription.daysOfPlanning14'),
        t('subscription.restaurantRecommendations'),
        t('subscription.dietaryPreferencesSupport'),
        t('subscription.mobileAppAccess'),
        t('subscription.emailSupport'),
        t('subscription.flexibleScheduling')
      ],
      popular: false,
      color: 'blue'
    },
    {
      id: 'monthly',
      name: t('subscription.monthlyPlan'),
      price: '$39.99',
      period: t('subscription.everyMonth'),
      description: t('subscription.bestValueConsistent'),
      features: [
        t('subscription.everythingInBiWeekly'),
        t('subscription.daysOfPlanning30'),
        t('subscription.advancedNutritionalTracking'),
        t('subscription.multipleDietaryProfiles'),
        t('subscription.prioritySupport'),
        t('subscription.exclusiveRestaurantDeals'),
        t('subscription.savingsVsBiweekly10')
      ],
      popular: true,
      color: 'grub-red'
    }
    // {
    //   id: 'quarterly',
    //   name: '3 Months Plan',
    //   price: '$59.99',
    //   period: 'every 3 months',
    //   description: 'Maximum savings for committed users',
    //   features: [
    //     'Everything in Monthly',
    //     '90 days of meal planning',
    //     'Personal meal consultant',
    //     'Custom meal plans',
    //     'Restaurant partnerships',
    //     '24/7 phone support',
    //     'Early access to new features',
    //     '25% savings vs bi-weekly'
    //   ],
    //   popular: false,
    //   color: 'purple'
    // }
  ];

  const getColorClasses = (color, isPopular = false) => {
    const colors = {
      blue: {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
        accent: 'text-blue-800'
      },
      'grub-red': {
        border: 'border-red-200',
        bg: 'bg-red-50',
        text: 'text-grub-red',
        button: 'bg-grub-red hover:bg-red-600',
        accent: 'text-red-800'
      },
      purple: {
        border: 'border-purple-200',
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700',
        accent: 'text-purple-800'
      }
    };

    if (isPopular) {
      return {
        border: 'border-grub-red ring-2 ring-grub-red',
        bg: 'bg-red-50',
        text: 'text-grub-red',
        button: 'bg-grub-red hover:bg-red-600',
        accent: 'text-red-800'
      };
    }

    return colors[color] || colors.blue;
  };

  return (
    <div className="py-6 sm:py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            {t('subscription.chooseYourPlanTitle')}
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
            {t('subscription.selectPerfectPlanDesc')}
          </p>
        </div>

        {/* Cost Breakdown - Only show if user has meal plan items */}
        {totalItems > 0 && (
          <div className="mb-6 sm:mb-12">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-200">
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{t('subscription.yourTotalCostBreakdown')}</h3>
                <p className="text-sm sm:text-base text-gray-600">{totalItems === 1 ? t('subscription.basedOnMeals', { count: totalItems, duration: getPlanDurationText(selectedPlan) }) : t('subscription.basedOnMealsPlural', { count: totalItems, duration: getPlanDurationText(selectedPlan) })}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-6 max-w-5xl mx-auto">
                {/* Service Fee */}
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{t('subscription.serviceFee')}</h4>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">${currentServiceFee.toFixed(2)}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('subscription.grubGatePlatformAccess')}</p>
                </div>

                {/* Meal Costs */}
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{t('subscription.mealCosts')}</h4>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">${currentMealCost.toFixed(2)}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('subscription.restaurantFoodCosts')}</p>
                </div>

                {/* Tax */}
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 4.99h.01M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{t('subscription.tax')}</h4>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">${currentTax.toFixed(2)}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('subscription.taxOnMealCost')}</p>
                </div>

                {/* Total Cost */}
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-grub-red rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{t('subscription.total', { duration: getPlanDurationText(selectedPlan) })}</h4>
                  <p className="text-xl sm:text-2xl font-bold text-red-700">${currentTotalCost.toFixed(2)}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('subscription.servicePlusMeals')}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white rounded-lg">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('subscription.mealCostsVary')}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    {t('subscription.serviceFeeFixed')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 items-stretch">
          {plans.map((plan) => {
            const colors = getColorClasses(plan.color, plan.popular);
            
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative bg-gray-50 rounded-xl sm:rounded-2xl shadow-lg border-2 ${selectedPlan === plan.id ? 'border-grub-red ring-2 ring-grub-red' : colors.border} p-4 sm:p-8 transform transition-all duration-200 hover:scale-[1.02] sm:hover:scale-105 flex flex-col h-full cursor-pointer touch-manipulation`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-grub-red text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                      {t('subscription.mostPopular')}
                    </span>
                  </div>
                )}

                {selectedPlan === plan.id && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-green-500 text-white rounded-full p-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                <div className="text-center mb-4 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{plan.description}</p>
                  <div className="mb-4 sm:mb-6">
                    <span className={`text-3xl sm:text-4xl font-bold ${colors.accent}`}>
                      {plan.price}
                    </span>
                    <span className="text-sm sm:text-base text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 sm:space-y-4 mb-4 sm:mb-8 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                      <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleGetStarted(plan.id)}
                  disabled={isProcessing}
                  className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-white text-sm sm:text-base transition-colors duration-200 ${colors.button} mt-auto hover:transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation`}
                >
                  {isProcessing ? t('subscription.processing') : t('subscription.getStarted')}
                </button>
              </div>
            );
          })}
        </div>

      </div>

      {/* Billing Form Modal */}
      <BillingFormModal
        isOpen={showBillingModal}
        onClose={handleCloseBillingModal}
        selectedPlan={getPlanById(selectedPlan)}
        onSuccess={handleSubscriptionSuccess}
      />

      {/* Enhanced Subscription Flow Modal */}
      {showEnhancedFlow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{t('subscription.completeYourSubscription')}</h2>
                <button
                  onClick={handleEnhancedFlowCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 touch-manipulation"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <EnhancedSubscriptionFlow
                selectedPlan={getPlanById(selectedPlan)}
                onComplete={handleEnhancedFlowComplete}
                onCancel={handleEnhancedFlowCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
