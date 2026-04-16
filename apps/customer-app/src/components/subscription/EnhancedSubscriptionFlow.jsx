// FILE: apps/customer-app/src/components/subscription/EnhancedSubscriptionFlow.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faArrowLeft, 
  faArrowRight,
  faCalendarAlt,
  faMapMarkerAlt,
  faCreditCard,
  faSpinner,
  faMoneyBillWave,
  faLock
} from '@fortawesome/free-solid-svg-icons';
import AddressSelectionStep from '../checkout/AddressSelectionStep';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useMealPlan } from '../../contexts/MealPlanContext_SSR_FIXED';
import apiClient from '../../api/apiClient';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { 
  getSubscriptionStartSunday, 
  getSubscriptionWeekInfo,
  formatSubscriptionDateRange 
} from '../../utils/subscriptionDateUtils';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Enhanced Subscription Flow with Address Integration
 * Multi-step subscription process including address selection
 */
const EnhancedSubscriptionFlow = ({ selectedPlan, onComplete, onCancel }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { selectedRestaurantId, selectedRestaurantName } = useMealPlan();
  
  // Debug log meal plan context
  console.log('🍽️ Meal Plan Context in Subscription:', {
    selectedRestaurantId,
    selectedRestaurantName
  });
  
  const [currentStep, setCurrentStep] = useState(1); // Start with address selection
  const [loading, setLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    planType: selectedPlan?.id || null,
    planData: selectedPlan || null,
    deliveryAddress: null,
    paymentMethod: null,
    userId: user?._id || null,
    startDate: null // Will be calculated by backend with proper logic
  });

  // Calculate subscription start date for display
  const [subscriptionPreview, setSubscriptionPreview] = useState(null);
  
  useEffect(() => {
    if (selectedPlan) {
      const startDate = getSubscriptionStartSunday();
      const weekInfo = getSubscriptionWeekInfo(startDate, selectedPlan.id);
      setSubscriptionPreview(weekInfo);
      
      // Update subscription data with calculated start date
      setSubscriptionData(prev => ({
        ...prev,
        startDate: startDate
      }));
    }
  }, [selectedPlan]);

  // Scroll to top when step changes
  useEffect(() => {
    // Small delay to ensure content is rendered
    setTimeout(() => {
      // Try to find the modal container with overflow-y-auto
      const modalContainer = document.querySelector('.overflow-y-auto');
      if (modalContainer && modalContainer.classList.contains('max-w-4xl')) {
        modalContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback to window scroll if not in modal
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  }, [currentStep]);

  // Steps configuration (removed plan selection - already done)
  const steps = [
    {
      id: 1,
      title: t('subscription.deliveryAddress'),
      icon: faMapMarkerAlt,
      description: t('subscription.whereShouldWeDeliver')
    },
    {
      id: 2,
      title: t('subscription.scheduleAndPayment'),
      icon: faCreditCard,
      description: t('subscription.setDeliverySchedule')
    }
  ];

  // Handle step navigation
  const handleNextStep = (stepData = {}) => {
    console.log('📝 Step data received:', stepData);
    const updated = { ...subscriptionData, ...stepData };
    setSubscriptionData(updated);
    console.log('📦 Updated subscription data:', updated);
    
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete subscription - pass updated data directly to avoid async state issue
      handleCompleteSubscription(updated);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      onCancel?.();
    }
  };

  // Complete subscription creation
  const handleCompleteSubscription = async (finalData = subscriptionData) => {
    setLoading(true);

    try {
      // Validate required data
      if (!selectedRestaurantId) {
        throw new Error('Restaurant ID is required');
      }
      if (!finalData.deliveryAddress) {
        throw new Error('Delivery address is required');
      }

      // For card payments, subscription was already created in PaymentStep
      // Just show success and complete
      if (finalData.paymentMethod === 'card' || finalData.paymentId?.startsWith('pi_')) {
        console.log('✅ Card payment subscription already created, completing flow');
        showSuccess(t('subscriptionCompletion.title'), t('subscriptionCompletion.message'));
        onComplete?.(finalData);
        return;
      }

      // For cash payments, create subscription now
      const subscriptionPayload = {
        restaurantId: selectedRestaurantId,
        planName: finalData.planData?.name || 'Custom Meal Plan',
        monthlyPrice: parseFloat(finalData.planData?.price?.replace?.('$', '') || '0') || 19.99,
        planType: finalData.planType || 'bi-weekly',
        deliveryAddress: finalData.deliveryAddress,
        paymentMethod: finalData.paymentMethod || 'cash',
        features: finalData.planData?.features || ['Flexible scheduling', 'Fresh ingredients'],
        specialInstructions: finalData.deliveryAddress?.instructions || '',
        customerPhone: user.phoneNumber || user.phone || ''
      };

      console.log('🔄 Creating cash subscription:', subscriptionPayload);
      
      const response = await apiClient.post('/subscription-meal-plans/create-from-meal-plan', subscriptionPayload);
      console.log('✅ Cash subscription created:', response.data);

      showSuccess(t('subscriptionCompletion.title'), response.data.message || t('subscriptionCompletion.message'));
      onComplete?.(subscriptionPayload);

    } catch (error) {
      console.error('Subscription creation error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || 'Unable to create your subscription. Please try again.';
      showError('Subscription Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        // Create restaurant object from meal plan context
        const restaurantData = selectedRestaurantId ? {
          id: selectedRestaurantId,
          _id: selectedRestaurantId,
          name: selectedRestaurantName || 'Selected Restaurant'
        } : {
          name: 'Subscription Meals' // Fallback if no restaurant selected
        };
        
        console.log('🏪 Subscription Flow - Restaurant Data:', restaurantData);
        
        return (
          <AddressSelectionStep
            checkoutData={{ restaurant: restaurantData }}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            isLoading={loading}
          />
        );
      
      case 2:
        return (
          <PaymentStep
            subscriptionData={subscriptionData}
            selectedRestaurantId={selectedRestaurantId}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            isLoading={loading}
            setLoading={setLoading}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="text-center mb-3">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('subscription.selectedPlan')}</p>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
              {selectedPlan.name || `${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan`}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${selectedPlan.price || 'N/A'}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium">
                / {selectedPlan.duration || t('subscription.period')}
              </div>
            </div>
          </div>
          <p className="text-center text-xs sm:text-sm text-gray-600 bg-white bg-opacity-60 rounded-lg py-2 px-3">
            {t('subscription.completeSetup')}
          </p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div className={`
                  flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 transition-all duration-300 flex-shrink-0 shadow-md
                  ${currentStep === step.id
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 text-white shadow-lg scale-110'
                    : currentStep > step.id
                    ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-400 text-white shadow-md'
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  {currentStep > step.id ? (
                    <FontAwesomeIcon icon={faCheck} className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <FontAwesomeIcon icon={step.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p className={`text-xs sm:text-sm font-semibold ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block mt-0.5">{step.description}</p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`
                  w-12 sm:w-20 md:w-32 h-1 rounded-full transition-all duration-300 flex-shrink-0 -mt-8 sm:-mt-10
                  ${currentStep > step.id 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-sm' 
                    : 'bg-gray-200'
                  }
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg">
        {renderStepContent()}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 max-w-sm">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xl sm:text-2xl text-blue-600" />
            <span className="text-base sm:text-lg font-medium text-center sm:text-left">{t('subscription.creatingYourSubscription')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Payment Step Component with Stripe Integration
const StripePaymentForm = ({ 
  clientSecret,
  planPrice,
  onPaymentSuccess, 
  setLoading, 
  isLoading 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { showError, showSuccess } = useToast();

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    if (!clientSecret) return;

    setLoading(true);

    // 1. MUST CALL THIS FIRST: Validates the form and prepares the data
    const { error: submitError } = await elements.submit();
    if (submitError) {
      showError('Payment Validation Failed', submitError.message);
      setLoading(false);
      return;
    }

    // 2. NOW you can confirm the payment
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/subscription`
        },
        redirect: 'if_required'
      });

      if (error) {
        showError('Payment Failed', error.message || 'Your payment could not be processed.');
        return;
      }

      if (!paymentIntent) {
        showError('Payment Failed', 'Payment could not be confirmed. Please try again.');
        return;
      }

      if (paymentIntent.status !== 'succeeded') {
        showError('Payment Pending', `Payment status: ${paymentIntent.status}`);
        return;
      }

      showSuccess('Payment Successful', 'Your payment has been processed successfully!');
      onPaymentSuccess({
        paymentMethod: 'card',
        paymentId: paymentIntent.id,
        status: paymentIntent.status
      });
    } catch (err) {
      console.error('Payment confirmation error:', err);
      showError('Payment Failed', err.message || 'There was an error processing your payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FontAwesomeIcon icon={faLock} className="mr-2 text-green-600" />
        Secure Card Payment
      </h3>

      <PaymentElement />

      <div className="mt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !stripe || !elements}
          className={`
            w-full flex items-center justify-center px-8 py-3 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
            ${isLoading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isLoading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheck} className="mr-2" />
              Complete Subscription - ${planPrice.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Payment Step Component
const PaymentStep = ({ subscriptionData, selectedRestaurantId, onNext, onPrevious, isLoading, setLoading }) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useToast();
  const { getWeekPlan, getWeekTotalCost, weeklyPlans, totalItems, selectedRestaurants, maxRestaurants } = useMealPlan();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [clientSecret, setClientSecret] = useState(null);
  const [intentLoading, setIntentLoading] = useState(false);
  const [createdPlanId, setCreatedPlanId] = useState(null);
  const { user } = useAuth();
  const hasInitialized = useRef(false);

  // Parse plan price
  const planPrice = useMemo(() => {
    const price = subscriptionData.planData?.price;
    if (typeof price === 'string') {
      return parseFloat(price.replace('$', '')) || 0;
    }
    return price || 0;
  }, [subscriptionData.planData?.price]);

  // Calculate raw meal cost using actual meal plan totals from useMealPlan (NOT hardcoded)
  const getRawMealCost = useMemo(() => {
    const planId = subscriptionData.planType;
    let mealCostMultiplier = 1;
    
    // Get actual meal cost from user's meal plan context (dynamically calculated)
    const week0Cost = getWeekTotalCost(0) || 0;
    const week1Cost = getWeekTotalCost(1) || 0;
    const baseBiweeklyCost = week0Cost + week1Cost; // Actual sum of selected items
    
    switch (planId) {
      case 'bi-weekly':
        mealCostMultiplier = 1;
        break;
      case 'monthly':
        mealCostMultiplier = 2;
        break;
      case 'quarterly':
        mealCostMultiplier = 6;
        break;
      case 'semi-annual':
        mealCostMultiplier = 12;
        break;
      default:
        mealCostMultiplier = 1;
    }
    
    // Return raw meal cost based on actual selected items (no hardcoded fallback)
    const rawCost = baseBiweeklyCost * mealCostMultiplier;
    return Math.round(rawCost * 100) / 100; // Round to 2 decimals
  }, [subscriptionData.planType, getWeekTotalCost]);

  // Count actual unique delivery days from user's meal plan
  const getActualDeliveryCount = useMemo(() => {
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
  }, [getWeekPlan]);

  // Create subscription first, then PaymentIntent with planId
  useEffect(() => {
    const createSubscriptionAndIntent = async () => {
      // Prevent React 18 Strict Mode double execution
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      if (paymentMethod !== 'card') return;
      if (!planPrice || planPrice <= 0) return;
      if (!selectedRestaurantId) {
        showError('Payment Error', 'Restaurant information is missing.');
        return;
      }
      // Skip if we already created the subscription and intent
      if (createdPlanId && clientSecret) return;

      setIntentLoading(true);
      try {
        // STEP 1: Save meal plan to database FIRST (required before creating subscription)
        if (!user?._id) {
          throw new Error('User not authenticated');
        }

        const mealPlanPayload = {
          userId: user._id,
          weeklyPlans: weeklyPlans,
          totalItems: totalItems || 0,
          selectedRestaurants: selectedRestaurants || [],
          maxRestaurants: maxRestaurants || 2,
          selectedRestaurantId: selectedRestaurantId,
          selectedRestaurantName: subscriptionData.restaurantName || ''
        };

        console.log('💾 Saving meal plan to database:', mealPlanPayload);
        await apiClient.post('/meal-plans', mealPlanPayload);
        console.log('✅ Meal plan saved successfully');

        // STEP 2: Create the subscription meal plan (now that meal plan exists in DB)
        const subscriptionPayload = {
          restaurantId: selectedRestaurantId,
          planName: subscriptionData.planData?.name || 'Custom Meal Plan',
          monthlyPrice: parseFloat(subscriptionData.planData?.price?.replace?.('$', '') || '0') || 19.99,
          planType: subscriptionData.planType || 'bi-weekly',
          deliveryAddress: subscriptionData.deliveryAddress,
          paymentMethod: 'card',
          features: subscriptionData.planData?.features || ['Flexible scheduling', 'Fresh ingredients'],
          specialInstructions: subscriptionData.deliveryAddress?.instructions || '',
          customerPhone: user?.phoneNumber || user?.phone || ''
        };

        console.log('🔄 Creating subscription before payment:', subscriptionPayload);
        const subResponse = await apiClient.post('/subscription-meal-plans/create-from-meal-plan', subscriptionPayload);
        const newPlanId = subResponse.data?.data?.subscriptionMealPlan?._id;

        if (!newPlanId) {
          throw new Error('Failed to create subscription - no plan ID returned');
        }

        console.log('✅ Subscription created with ID:', newPlanId);
        setCreatedPlanId(newPlanId);

        // STEP 2: Fetch restaurant details to get stripeAccountId
        const restaurantRes = await apiClient.get(`/restaurants/${selectedRestaurantId}`);
        const restaurant = restaurantRes.data?.data?.restaurant || restaurantRes.data?.data;
        
        const restaurantStripeAccountId = 
          restaurant?.stripeAccountId || 
          restaurant?.stripeConnectAccountId ||
          restaurant?.stripe_account_id;

        if (!restaurantStripeAccountId) {
          showError('Payment Error', 'Restaurant payout account is not configured.');
          setIntentLoading(false);
          return;
        }

        // Get raw meal cost directly (NO reverse-engineering)
        const rawMealCost = getRawMealCost;
        
        // Count actual delivery days from user's meal plan (NOT hardcoded)
        const totalDeliveries = getActualDeliveryCount || 
          (subscriptionData.planType === 'bi-weekly' ? 2 : 
           subscriptionData.planType === 'monthly' ? 4 : 
           subscriptionData.planType === 'quarterly' ? 12 : 1);

        // STEP 3: Create PaymentIntent WITH the planId
        const response = await apiClient.post('/payments/create-intent', {
          items: [{ price: rawMealCost, quantity: 1 }],
          orderTotal: planPrice,
          restaurantStripeAccountId,
          planType: subscriptionData.planType || 'single',
          totalDeliveries,
          restaurantDeliveryFee: 3.99,
          planId: newPlanId // <-- THIS IS THE KEY LINK FOR THE WEBHOOK
        });

        const secret = response.data?.data?.clientSecret;
        if (!secret) {
          throw new Error('Payment initialization failed');
        }
        setClientSecret(secret);
        console.log('✅ PaymentIntent created with planId:', newPlanId);
      } catch (error) {
        console.error('Error creating subscription or payment intent:', error);
        showError('Payment Error', error.response?.data?.message || error.message || 'Unable to initialize payment.');
      } finally {
        setIntentLoading(false);
      }
    };

    createSubscriptionAndIntent();
  }, [paymentMethod, planPrice, selectedRestaurantId, getRawMealCost, getActualDeliveryCount, subscriptionData, createdPlanId, clientSecret, showError, user, weeklyPlans, totalItems, selectedRestaurants, maxRestaurants]);

  const handleCashContinue = () => {
    onNext({
      paymentMethod: 'cash',
      paymentData: null,
      paymentId: `cash_${Date.now()}`,
      status: 'pending'
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 sm:pb-6 lg:pb-8">
      <div className="mb-4 sm:mb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-3 shadow-lg">
          <FontAwesomeIcon icon={faCreditCard} className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
          {t('subscription.paymentDetails')}
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          {t('subscription.choosePaymentMethod')}
        </p>
      </div>

      {/* Selected Plan Summary */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm">
        <div className="flex items-center justify-center mb-3">
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
            {t('subscription.selectedPlan').replace(':', '')}
          </div>
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-900 text-base sm:text-lg mb-1">{subscriptionData.planData?.name}</p>
          <p className="text-xs sm:text-sm text-gray-600 mb-3">{subscriptionData.planData?.description}</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${subscriptionData.planData?.price}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              / {subscriptionData.planData?.duration || t('subscription.period')}
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Address Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm">
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3" />
            <span>{t('subscription.deliveryAddress')}</span>
          </div>
        </div>
        {subscriptionData.deliveryAddress ? (
          <div className="text-center">
            <p className="text-gray-800 text-sm sm:text-base font-medium leading-relaxed">
              {subscriptionData.deliveryAddress.street}
            </p>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">
              {subscriptionData.deliveryAddress.city}, {subscriptionData.deliveryAddress.province} {subscriptionData.deliveryAddress.postalCode}
            </p>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-xs sm:text-sm italic">{t('subscription.addressWillBeSelected')}</p>
        )}
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6 sm:mb-8">
        <div className="text-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{t('subscription.choosePaymentMethodTitle')}</h3>
          <p className="text-xs sm:text-sm text-gray-600">{t('subscription.selectHowToPay')}</p>
        </div>
        <div className="space-y-3">
          {/* Card Payment Option */}
          <label className={`flex items-center p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 touch-manipulation shadow-sm ${
            paymentMethod === 'card' 
              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md ring-2 ring-blue-200' 
              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3 w-5 h-5 text-blue-600"
            />
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <FontAwesomeIcon icon={faCreditCard} className="text-white text-lg sm:text-xl" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm sm:text-base">{t('subscription.creditDebitCard')}</p>
                <p className="text-xs sm:text-sm text-gray-600">{t('subscription.securePayment')}</p>
              </div>
              {paymentMethod === 'card' && (
                <div className="bg-blue-600 text-white rounded-full p-1.5">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                </div>
              )}
            </div>
          </label>

          {/* Cash on Delivery Option */}
          <label className={`flex items-center p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 touch-manipulation shadow-sm ${
            paymentMethod === 'cash' 
              ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md ring-2 ring-green-200' 
              : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3 w-5 h-5 text-green-600"
            />
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-white text-lg sm:text-xl" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm sm:text-base">Cash on Delivery</p>
                <p className="text-xs sm:text-sm text-gray-600">Pay when your order arrives</p>
              </div>
              {paymentMethod === 'cash' && (
                <div className="bg-green-600 text-white rounded-full p-1.5">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Card Payment Form with Stripe */}
      {paymentMethod === 'card' && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <StripePaymentForm
            clientSecret={clientSecret}
            planPrice={planPrice}
            setLoading={setLoading}
            isLoading={isLoading}
            onPaymentSuccess={(paymentResult) => {
              onNext(paymentResult);
            }}
          />
        </Elements>
      )}

      {/* Loading State for Stripe */}
      {paymentMethod === 'card' && !clientSecret && (
        <div className="mb-6 bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-center text-gray-700">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-3" />
            Loading secure checkout...
          </div>
        </div>
      )}

      {/* Cash on Delivery Info */}
      {paymentMethod === 'cash' && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Cash on Delivery</h3>
          <p className="text-yellow-800 text-sm">
            You will pay ${planPrice.toFixed(2)} in cash when your subscription meals arrive. 
            Please have the exact amount ready.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between pb-20 sm:pb-0">
        <button
          onClick={onPrevious}
          disabled={isLoading}
          className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 touch-manipulation order-2 sm:order-1 shadow-sm hover:shadow-md"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          <span className="text-sm sm:text-base">{t('subscription.backToAddress')}</span>
        </button>

        {paymentMethod === 'cash' && (
          <button
            onClick={handleCashContinue}
            disabled={isLoading}
            className={`
              w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3 font-bold rounded-xl transition-all duration-200 touch-manipulation order-1 sm:order-2 text-sm sm:text-base
              ${!isLoading
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 active:from-green-700 active:to-emerald-800 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                <span>{t('subscription.creatingSubscription')}</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                <span>{t('subscription.completeSubscription')}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default EnhancedSubscriptionFlow;
