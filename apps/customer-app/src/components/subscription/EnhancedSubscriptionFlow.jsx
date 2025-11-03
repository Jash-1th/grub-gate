// FILE: apps/customer-app/src/components/subscription/EnhancedSubscriptionFlow.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faArrowLeft, 
  faArrowRight,
  faCalendarAlt,
  faMapMarkerAlt,
  faCreditCard,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import AddressSelectionStep from '../checkout/AddressSelectionStep';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useMealPlan } from '../../contexts/MealPlanContext_SSR_FIXED';
import apiClient from '../../api/apiClient';
import { 
  getSubscriptionStartSunday, 
  getSubscriptionWeekInfo,
  formatSubscriptionDateRange 
} from '../../utils/subscriptionDateUtils';

/**
 * Enhanced Subscription Flow with Address Integration
 * Multi-step subscription process including address selection
 */
const EnhancedSubscriptionFlow = ({ selectedPlan, onComplete, onCancel }) => {
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

  // Steps configuration (removed plan selection - already done)
  const steps = [
    {
      id: 1,
      title: 'Delivery Address',
      icon: faMapMarkerAlt,
      description: 'Where should we deliver?'
    },
    {
      id: 2,
      title: 'Schedule & Payment',
      icon: faCreditCard,
      description: 'Set delivery schedule and payment'
    }
  ];

  // Handle step navigation
  const handleNextStep = (stepData = {}) => {
    console.log('📝 Step data received:', stepData);
    setSubscriptionData(prev => {
      const updated = { ...prev, ...stepData };
      console.log('📦 Updated subscription data:', updated);
      return updated;
    });
    
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete subscription
      handleCompleteSubscription();
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
  const handleCompleteSubscription = async () => {
    setLoading(true);

    try {
      // Validate required data
      if (!selectedRestaurantId) {
        throw new Error('Restaurant ID is required');
      }
      if (!subscriptionData.deliveryAddress) {
        throw new Error('Delivery address is required');
      }

      // Create subscription with all collected data
      const subscriptionPayload = {
        // Required fields
        restaurantId: selectedRestaurantId,
        planName: subscriptionData.planData?.name || 'Custom Meal Plan',
        monthlyPrice: parseFloat(subscriptionData.planData?.price?.replace?.('$', '') || '0') || 19.99,
        
        // Optional fields
        planType: subscriptionData.planType || 'bi-weekly',
        deliveryAddress: subscriptionData.deliveryAddress,
        paymentMethod: subscriptionData.paymentMethod || 'card',
        features: subscriptionData.planData?.features || ['Flexible scheduling', 'Fresh ingredients'],
        specialInstructions: subscriptionData.deliveryAddress?.instructions || '',
        customerPhone: user.phoneNumber || user.phone || '',
        
        // Additional data (not sent to API but for local use)
        customerId: user._id,
        status: 'active'
      };

      // Remove fields that shouldn't be sent to the API
      delete subscriptionPayload.customerId;
      delete subscriptionPayload.status;

      // Call subscription creation API
      console.log('🔄 Creating subscription:', subscriptionPayload);
      
      const response = await apiClient.post('/subscription-meal-plans/create-from-meal-plan', subscriptionPayload);
      console.log('✅ Subscription created successfully:', response.data);

      // Use the backend success message instead of showing duplicate toast
      showSuccess('Subscription Created!', response.data.message || 'Your meal plan subscription has been set up successfully.');
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
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            isLoading={loading}
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
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Selected Plan:</p>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
              {selectedPlan.name || `${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan`}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${selectedPlan.price || 'N/A'}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium">
                / {selectedPlan.duration || 'period'}
              </div>
            </div>
          </div>
          <p className="text-center text-xs sm:text-sm text-gray-600 bg-white bg-opacity-60 rounded-lg py-2 px-3">
            Complete your subscription setup below
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
            <span className="text-base sm:text-lg font-medium text-center sm:text-left">Creating your subscription...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Payment Step Component
const PaymentStep = ({ subscriptionData, onNext, onPrevious, isLoading }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleContinue = () => {
    onNext({
      paymentMethod
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 sm:pb-6 lg:pb-8">
'      <div className="mb-4 sm:mb-6 text-center">'
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-3 shadow-lg">
          <FontAwesomeIcon icon={faCreditCard} className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
          Payment Details
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Choose your payment method to complete your subscription
        </p>
      </div>

      {/* Selected Plan Summary */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm">
        <div className="flex items-center justify-center mb-3">
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
            Selected Plan
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
              / {subscriptionData.planData?.duration}
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Address Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm">
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3" />
            <span>Delivery Address</span>
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
          <p className="text-center text-gray-500 text-xs sm:text-sm italic">Address will be selected in previous step</p>
        )}
      </div>

      {/* Payment Method */}
      <div className="mb-6 sm:mb-8">
        <div className="text-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Choose Payment Method</h3>
          <p className="text-xs sm:text-sm text-gray-600">Select how you'd like to pay</p>
        </div>
        <div className="space-y-3">
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
                <p className="font-bold text-gray-900 text-sm sm:text-base">Credit/Debit Card</p>
                <p className="text-xs sm:text-sm text-gray-600">Secure payment with your card</p>
              </div>
              {paymentMethod === 'card' && (
                <div className="bg-blue-600 text-white rounded-full p-1.5">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <button
          onClick={onPrevious}
          disabled={isLoading}
          className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 touch-manipulation order-2 sm:order-1 shadow-sm hover:shadow-md"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          <span className="text-sm sm:text-base">Back to Address</span>
        </button>

        <button
          onClick={handleContinue}
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
              <span>Creating Subscription...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheck} className="mr-2" />
              <span>Complete Subscription</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EnhancedSubscriptionFlow;
