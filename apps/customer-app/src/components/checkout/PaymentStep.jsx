// FILE: apps/customer-app/src/components/checkout/PaymentStep.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCreditCard, 
  faMoneyBillWave,
  faWallet,
  faArrowLeft,
  faLock,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../api/apiClient';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripePaymentForm = ({ checkoutData, onPaymentSuccess, setLoading, isLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { showError, showSuccess } = useToast();

  const [clientSecret, setClientSecret] = useState(null);
  const [intentLoading, setIntentLoading] = useState(false);

  const restaurantStripeAccountId =
    checkoutData.restaurant?.stripeAccountId ||
    checkoutData.restaurant?.stripeConnectAccountId ||
    checkoutData.restaurant?.stripe_account_id ||
    checkoutData.restaurant?.stripeAccount?.id ||
    checkoutData.restaurant?.stripeAccount;

  useEffect(() => {
    const createIntent = async () => {
      if (!checkoutData?.total) return;
      if (!restaurantStripeAccountId) {
        showError('Payment Error', 'Restaurant payout account is not configured.');
        return;
      }

      setIntentLoading(true);
      try {
        // Build items array from checkoutData.items with proper price/quantity structure
        const items = checkoutData.items?.map(item => ({
          price: item.price || item.meal?.price || 0,
          quantity: item.quantity || 1
        })) || [];

        // Get restaurant delivery fee if available
        const restaurantDeliveryFee = checkoutData.restaurant?.deliverySettings?.fee || 
                                      checkoutData.restaurant?.deliveryFee || 
                                      null;

        // Get plan type and deliveries from checkoutData
        const planType = checkoutData.planType || 'single';
        const totalDeliveries = checkoutData.totalDeliveries || 1;

        const response = await apiClient.post('/payments/create-intent', {
          items: items.length > 0 ? items : undefined,
          orderTotal: checkoutData.total,
          restaurantStripeAccountId,
          planType,
          totalDeliveries,
          restaurantDeliveryFee
        });

        const secret = response.data?.data?.clientSecret;
        if (!secret) {
          throw new Error('Payment initialization failed');
        }
        setClientSecret(secret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        showError('Payment Error', error.response?.data?.message || error.message || 'Unable to initialize payment.');
      } finally {
        setIntentLoading(false);
      }
    };

    createIntent();
  }, [checkoutData?.total, restaurantStripeAccountId]);

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
          return_url: `${window.location.origin}/checkout`
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

  if (intentLoading) {
    return (
      <div className="mb-6 bg-gray-50 rounded-xl p-6">
        <div className="flex items-center text-gray-700">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-3" />
          Preparing secure payment...
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-sm text-red-700">Unable to initialize secure payment. Please try again.</p>
      </div>
    );
  }

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
            w-full sm:w-auto flex items-center justify-center px-8 py-3 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isLoading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
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
              <FontAwesomeIcon icon={faLock} className="mr-2" />
              Complete Order - ${checkoutData.total.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/**
 * Payment Step for Checkout
 * Handles payment method selection and processing
 * Supports multiple payment methods with validation
 */
const PaymentStep = ({ checkoutData, onNext, onPrevious, isLoading, setLoading }) => {
  const { showError, showSuccess } = useToast();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [paymentData, setPaymentData] = useState({
    // Billing address (can be same as delivery)
    billingAddress: checkoutData.deliveryAddress,
    sameAsDelivery: true,
    
    // Special instructions
    specialInstructions: ''
  });
  const [errors, setErrors] = useState({});

  const stripeElementsOptions = useMemo(() => {
    return {
      appearance: { theme: 'stripe' }
    };
  }, []);

  // Payment method options
  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: faCreditCard,
      description: 'Pay securely with your card',
      available: true
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      icon: faMoneyBillWave,
      description: 'Pay when your order arrives',
      available: true
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: faWallet,
      description: 'PayPal, Apple Pay, Google Pay',
      available: false // Disabled for now
    }
  ];

  // Handle input changes
  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate payment form
  const validatePaymentForm = () => {
    const newErrors = {};

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle payment processing
  const handlePayment = async () => {
    if (!validatePaymentForm()) {
      showError('Validation Error', 'Please fix the errors in the payment form');
      return;
    }

    setLoading(true);

    try {
      if (selectedPaymentMethod === 'cash') {
        const paymentResult = {
          paymentMethod: selectedPaymentMethod,
          paymentData: null,
          specialInstructions: paymentData.specialInstructions,
          paymentId: `cash_${Date.now()}`,
          status: 'pending'
        };

        showSuccess('Cash on Delivery Selected', 'You can pay in cash when your order arrives.');
        onNext(paymentResult);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      showError('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Information
        </h2>
        <p className="text-gray-600">
          Choose your payment method and complete your order
        </p>
      </div>

      {/* Delivery Address Summary */}
      <div className="mb-6 bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Delivering to:</h3>
        <p className="text-gray-700">
          {checkoutData.deliveryAddress?.street}, {checkoutData.deliveryAddress?.city}, {checkoutData.deliveryAddress?.province} {checkoutData.deliveryAddress?.postalCode}
        </p>
        {checkoutData.deliveryAddress?.instructions && (
          <p className="text-sm text-gray-600 mt-1">
            <strong>Instructions:</strong> {checkoutData.deliveryAddress.instructions}
          </p>
        )}
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
        
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`
                relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200
                ${selectedPaymentMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : method.available
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                }
              `}
              onClick={() => method.available && setSelectedPaymentMethod(method.id)}
            >
              <div className="flex items-center">
                <div className={`
                  w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center
                  ${selectedPaymentMethod === method.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                  }
                `}>
                  {selectedPaymentMethod === method.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                
                <FontAwesomeIcon 
                  icon={method.icon} 
                  className={`mr-3 text-xl ${
                    selectedPaymentMethod === method.id ? 'text-blue-600' : 'text-gray-400'
                  }`} 
                />
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>

                {!method.available && (
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card Payment Form */}
      {selectedPaymentMethod === 'card' && (
        <Elements stripe={stripePromise} options={stripeElementsOptions}>
          <StripePaymentForm
            checkoutData={checkoutData}
            setLoading={setLoading}
            isLoading={isLoading}
            onPaymentSuccess={(paymentResult) => {
              onNext({
                ...paymentResult,
                specialInstructions: paymentData.specialInstructions
              });
            }}
          />
        </Elements>
      )}

      {/* Cash on Delivery Info */}
      {selectedPaymentMethod === 'cash' && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Cash on Delivery</h3>
          <p className="text-yellow-800 text-sm">
            You will pay ${checkoutData.total.toFixed(2)} in cash when your order arrives. 
            Please have the exact amount ready for a smooth delivery experience.
          </p>
        </div>
      )}

      {/* Special Instructions */}
      <div className="mb-6">
        <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">
          Special Instructions (Optional)
        </label>
        <textarea
          id="specialInstructions"
          value={paymentData.specialInstructions}
          onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Any special requests for your order..."
          maxLength={500}
        />
        <p className="mt-1 text-sm text-gray-500">
          {paymentData.specialInstructions.length}/500 characters
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pb-20 sm:pb-0">
        <button
          onClick={onPrevious}
          disabled={isLoading}
          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Address
        </button>

        {selectedPaymentMethod === 'cash' && (
          <button
            onClick={handlePayment}
            disabled={isLoading}
            className={`
              w-full sm:w-auto flex items-center justify-center px-8 py-3 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${isLoading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
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
                <FontAwesomeIcon icon={faLock} className="mr-2" />
                Continue - ${checkoutData.total.toFixed(2)}
              </>
            )}
          </button>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 flex items-center justify-center">
          <FontAwesomeIcon icon={faLock} className="mr-1" />
          Your payment information is secure and encrypted
        </p>
      </div>
    </div>
  );
};

export default PaymentStep;
