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

      showSuccess('Subscription Created!', 'Your meal plan subscription has been set up successfully.');
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
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Selected Plan: {selectedPlan.name || `${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan`}
              </h3>
              <p className="text-gray-600 text-sm">
                Complete your subscription setup below
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                ${selectedPlan.price || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">
                {selectedPlan.duration || 'per period'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className={`
                flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                ${currentStep === step.id
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : currentStep > step.id
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
                }
              `}>
                {currentStep > step.id ? (
                  <FontAwesomeIcon icon={faCheck} className="w-5 h-5" />
                ) : (
                  <FontAwesomeIcon icon={step.icon} className="w-5 h-5" />
                )}
              </div>

              {/* Step Info */}
              <div className="ml-4">
                <h3 className={`font-semibold ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`
                  ml-8 w-24 h-0.5 transition-colors duration-300
                  ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-lg">
        {renderStepContent()}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex items-center space-x-4">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-blue-600" />
            <span className="text-lg font-medium">Creating your subscription...</span>
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
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment
        </h2>
        <p className="text-gray-600">
          Choose your payment method to complete your subscription
        </p>
      </div>

      {/* Selected Plan Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Selected Plan</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-blue-900">{subscriptionData.planData?.name}</p>
            <p className="text-sm text-blue-700">{subscriptionData.planData?.description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              ${subscriptionData.planData?.price}
            </p>
            <p className="text-sm text-blue-700">
              / {subscriptionData.planData?.duration}
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Address Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
        {subscriptionData.deliveryAddress ? (
          <p className="text-gray-700">
            {subscriptionData.deliveryAddress.street}, {subscriptionData.deliveryAddress.city}, {subscriptionData.deliveryAddress.province} {subscriptionData.deliveryAddress.postalCode}
          </p>
        ) : (
          <p className="text-gray-500">Address will be selected in previous step</p>
        )}
      </div>

      {/* Payment Method */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
        <div className="space-y-3">
          <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3"
            />
            <FontAwesomeIcon icon={faCreditCard} className="mr-3 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Credit/Debit Card</p>
              <p className="text-sm text-gray-600">Secure payment with your card</p>
            </div>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          disabled={isLoading}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Address
        </button>

        <button
          onClick={handleContinue}
          disabled={isLoading}
          className={`
            px-8 py-3 font-semibold rounded-xl transition-all duration-200
            ${!isLoading
              ? 'bg-green-600 text-white hover:bg-green-700 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Creating Subscription...
            </>
          ) : (
            <>
              Complete Subscription
              <FontAwesomeIcon icon={faCheck} className="ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EnhancedSubscriptionFlow;
