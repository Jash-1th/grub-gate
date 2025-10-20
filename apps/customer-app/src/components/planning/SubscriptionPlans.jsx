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
  const getServiceFeeForPlan = (planId) => {
    switch (planId) {
      case 'bi-weekly': return 19.99;
      case 'monthly': return 39.99;
      case 'quarterly': return 59.99;
      default: return 19.99;
    }
  };

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

  const currentServiceFee = getServiceFeeForPlan(selectedPlan);
  const currentMealCost = getMealCostForPlan(selectedPlan);
  const currentTotalCost = currentServiceFee + currentMealCost;

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
    
    // Toast already shown in BillingFormModal, no need to show again
    // Navigate to meal calendar to show the newly created subscription
    navigate('/meal-calendar');
  };

  const plans = [
    {
      id: 'bi-weekly',
      name: 'Bi-Weekly Plan',
      price: '$19.99',
      period: 'every 2 weeks',
      description: 'Perfect for regular meal planning',
      features: [
        '14 days of meal planning',
        'Restaurant recommendations',
        'Dietary preferences support',
        'Mobile app access',
        'Email support',
        'Flexible scheduling'
      ],
      popular: false,
      color: 'blue'
    },
    {
      id: 'monthly',
      name: '1 Month Plan',
      price: '$39.99',
      period: 'every month',
      description: 'Best value for consistent planning',
      features: [
        'Everything in Bi-Weekly',
        '30 days of meal planning',
        'Advanced nutritional tracking',
        'Multiple dietary profiles',
        'Priority support',
        'Exclusive restaurant deals',
        '10% savings vs bi-weekly'
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
    <div className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your meal planning needs. All plans include access to our restaurant network.
          </p>
        </div>

        {/* Cost Breakdown - Only show if user has meal plan items */}
        {totalItems > 0 && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your Total Cost Breakdown</h3>
                <p className="text-gray-600">Based on your current {totalItems} selected meal{totalItems !== 1 ? 's' : ''} for {getPlanDurationText(selectedPlan)} plan</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* Service Fee */}
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Service Fee</h4>
                  <p className="text-2xl font-bold text-blue-600">${currentServiceFee.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mt-1">GrubGate platform access</p>
                </div>

                {/* Meal Costs */}
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Meal Costs</h4>
                  <p className="text-2xl font-bold text-green-600">${currentMealCost.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mt-1">Restaurant food costs</p>
                </div>

                {/* Total Cost */}
                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                  <div className="w-12 h-12 mx-auto mb-3 bg-grub-red rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Total {getPlanDurationText(selectedPlan)}</h4>
                  <p className="text-2xl font-bold text-red-700">${currentTotalCost.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mt-1">Service + meals</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-white rounded-lg">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Meal costs vary by restaurant and selections
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Service fee is fixed per plan
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-end">
          {plans.map((plan) => {
            const colors = getColorClasses(plan.color, plan.popular);
            
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative bg-gray-50 rounded-2xl shadow-lg border-2 ${selectedPlan === plan.id ? 'border-grub-red ring-2 ring-grub-red' : colors.border} p-8 transform transition-all duration-200 hover:scale-105 flex flex-col h-full cursor-pointer`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-grub-red text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
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

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className={`text-4xl font-bold ${colors.accent}`}>
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <svg className={`w-5 h-5 ${colors.text} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleGetStarted(plan.id)}
                  disabled={isProcessing}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors duration-200 ${colors.button} mt-auto hover:transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? 'Processing...' : 'Get Started'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
          <div className="flex flex-wrap justify-center items-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>No setup fees</span>
            </span>
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </span>
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>24/7 support</span>
            </span>
          </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Complete Your Subscription</h2>
                <button
                  onClick={handleEnhancedFlowCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
