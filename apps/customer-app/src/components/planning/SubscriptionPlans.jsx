import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../../contexts/MealPlanContext_SSR_FIXED';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { calculateOrderTotals, SERVICE_FEE_PERCENTAGE, DEFAULT_TAX_RATE, PLATFORM_COMMISSION_PERCENTAGE } from '../../utils/pricingCalculator';
import BillingFormModal from '../modals/BillingFormModal';
import EnhancedSubscriptionFlow from '../subscription/EnhancedSubscriptionFlow';

const SubscriptionPlans = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    getWeekTotalItems, 
    getWeekTotalCost,
    getWeekPlan,
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

  // Count actual unique delivery days from user's meal plan
  const getActualDeliveryCount = () => {
    const countDeliveryDays = (weekIndex) => {
      const weekPlan = getWeekPlan(weekIndex);
      if (!weekPlan) return 0;
      
      let count = 0;
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      days.forEach(day => {
        const dayMeals = weekPlan[day];
        if (dayMeals) {
          const hasLunch = dayMeals.lunch && dayMeals.lunch.length > 0;
          const hasDinner = dayMeals.dinner && dayMeals.dinner.length > 0;
          if (hasLunch) count++;
          if (hasDinner) count++;
        }
      });
      
      return count;
    };
    
    // Count deliveries for week 0 and week 1
    const week0Deliveries = countDeliveryDays(0);
    const week1Deliveries = countDeliveryDays(1);
    
    return week0Deliveries + week1Deliveries;
  };

  // Calculate costs based on selected plan using unified pricing calculator
  const getMealCostForPlan = (planId) => {
    // Get actual meal cost from user's meal plan context (dynamically calculated)
    const week0Cost = getWeekTotalCost(0) || 0;
    const week1Cost = getWeekTotalCost(1) || 0;
    const baseBiweeklyCost = week0Cost + week1Cost; // Actual sum of selected items
    
    let mealCostMultiplier = 1;
    
    switch (planId) {
      case 'bi-weekly': 
        mealCostMultiplier = 1;  // Base cost is already for 2 weeks
        break;
      case 'monthly': 
        mealCostMultiplier = 2;  // Monthly = 2x the bi-weekly cost
        break;
      case 'quarterly': 
        mealCostMultiplier = 6;  // Quarterly = 6x the bi-weekly cost
        break;
      default: 
        mealCostMultiplier = 1;
    }
    
    // Scale the meal cost by the plan duration multiplier
    const scaledMealCost = baseBiweeklyCost * mealCostMultiplier;
    
    // Get actual delivery count from meal plan (not hardcoded)
    const actualDeliveries = getActualDeliveryCount();
    
    // Create items array for pricing calculator with scaled meal cost
    const pricing = calculateOrderTotals({
      items: [{ price: scaledMealCost, quantity: 1 }],
      restaurantDeliveryFee: null,
      planType: planId,
      totalDeliveries: actualDeliveries || 2 // Fallback to 2 if no meals scheduled
    });
    
    return pricing;
  };

  const getPlanDurationText = (planId) => {
    switch (planId) {
      case 'bi-weekly': return 'Biweekly';
      case 'monthly': return '1 Month';
      case 'quarterly': return '3 Months';
      default: return 'Biweekly';
    }
  };

  const currentPricing = getMealCostForPlan(selectedPlan);
  const currentMealCost = currentPricing.subtotal;
  const currentDeliveryFee = currentPricing.deliveryFee;
  const currentServiceFee = currentPricing.serviceFee;
  const currentTax = currentPricing.tax;
  const currentPlatformCommission = currentPricing.platformCommission;
  const currentTotalCost = currentPricing.total;

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

  // Get dynamic pricing for each plan to show accurate prices
  const biWeeklyPricing = getMealCostForPlan('bi-weekly');
  const monthlyPricing = getMealCostForPlan('monthly');

  const plans = [
    {
      id: 'bi-weekly',
      name: t('subscription.biWeeklyPlan'),
      get price() { return `$${biWeeklyPricing.total.toFixed(2)}`; },
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
      get price() { return `$${monthlyPricing.total.toFixed(2)}`; },
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t('subscription.yourTotalCostBreakdown')}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{totalItems === 1 ? t('subscription.basedOnMeals', { count: totalItems, duration: getPlanDurationText(selectedPlan) }) : t('subscription.basedOnMealsPlural', { count: totalItems, duration: getPlanDurationText(selectedPlan) })}</p>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm sm:text-base text-gray-700">{t('subscription.mealCosts')}</span>
                    <span className="text-sm sm:text-base font-medium text-gray-900">${currentMealCost.toFixed(2)}</span>
                  </div>

                  {/* Delivery Fee */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm sm:text-base text-gray-700">{t('subscription.deliveryFee')}</span>
                    <span className="text-sm sm:text-base font-medium text-gray-900">${currentDeliveryFee.toFixed(2)}</span>
                  </div>

                  {/* Service Fee */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm sm:text-base text-gray-700">{t('subscription.serviceFee')}</span>
                    <span className="text-sm sm:text-base font-medium text-gray-900">${currentServiceFee.toFixed(2)}</span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm sm:text-base text-gray-700">{t('subscription.tax')}</span>
                    <span className="text-sm sm:text-base font-medium text-gray-900">${currentTax.toFixed(2)}</span>
                  </div>

                  {/* Platform Fee */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm sm:text-base text-gray-700">{t('subscription.platformCommission')}</span>
                    <span className="text-sm sm:text-base font-medium text-gray-900">${currentPlatformCommission.toFixed(2)}</span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-2"></div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-3">
                    <span className="text-base sm:text-lg font-semibold text-gray-900">{t('subscription.total', { duration: getPlanDurationText(selectedPlan) })}</span>
                    <span className="text-xl sm:text-2xl font-bold text-grub-red">${currentTotalCost.toFixed(2)}</span>
                  </div>
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
