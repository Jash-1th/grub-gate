// FILE: apps/customer-app/src/components/checkout/PaymentStep.jsx
import React, { useState } from 'react';
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

/**
 * Payment Step for Checkout
 * Handles payment method selection and processing
 * Supports multiple payment methods with validation
 */
const PaymentStep = ({ checkoutData, onNext, onPrevious, isLoading, setLoading }) => {
  const { showError, showSuccess } = useToast();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [paymentData, setPaymentData] = useState({
    // Card payment data
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    
    // Billing address (can be same as delivery)
    billingAddress: checkoutData.deliveryAddress,
    sameAsDelivery: true,
    
    // Special instructions
    specialInstructions: ''
  });
  const [errors, setErrors] = useState({});

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

  // Format card number input
  const formatCardNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Add spaces every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  // Format expiry date input
  const formatExpiryDate = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
    }
    
    return digits;
  };

  // Validate payment form
  const validatePaymentForm = () => {
    const newErrors = {};

    if (selectedPaymentMethod === 'card') {
      // Card validation
      if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length < 13) {
        newErrors.cardNumber = 'Please enter a valid card number';
      }

      if (!paymentData.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
        newErrors.expiryDate = 'Please enter expiry date (MM/YY)';
      } else {
        // Check if card is expired
        const [month, year] = paymentData.expiryDate.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const now = new Date();
        if (expiry < now) {
          newErrors.expiryDate = 'Card has expired';
        }
      }

      if (!paymentData.cvv || paymentData.cvv.length < 3) {
        newErrors.cvv = 'Please enter CVV';
      }

      if (!paymentData.cardholderName || paymentData.cardholderName.trim().length < 2) {
        newErrors.cardholderName = 'Please enter cardholder name';
      }
    }

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
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, you would:
      // 1. Process payment with Stripe/PayPal/etc.
      // 2. Create order in database
      // 3. Send confirmation emails
      // 4. Handle payment errors

      const paymentResult = {
        paymentMethod: selectedPaymentMethod,
        paymentData: selectedPaymentMethod === 'card' ? {
          last4: paymentData.cardNumber.slice(-4),
          cardType: getCardType(paymentData.cardNumber),
          cardholderName: paymentData.cardholderName
        } : null,
        specialInstructions: paymentData.specialInstructions,
        paymentId: `pay_${Date.now()}`, // Mock payment ID
        status: 'completed'
      };

      showSuccess('Payment Successful', 'Your payment has been processed successfully!');
      onNext(paymentResult);

    } catch (error) {
      console.error('Payment processing error:', error);
      showError('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get card type from number
  const getCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    if (number.startsWith('6')) return 'Discover';
    
    return 'Unknown';
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
        <div className="mb-6 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faLock} className="mr-2 text-green-600" />
            Secure Card Payment
          </h3>
          
          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number *
              </label>
              <input
                type="text"
                id="cardNumber"
                value={paymentData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                className={`
                  w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
                  ${errors.cardNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                `}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
              )}
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  value={paymentData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
                    ${errors.expiryDate ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                  `}
                  placeholder="MM/YY"
                  maxLength={5}
                />
                {errors.expiryDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                  CVV *
                </label>
                <input
                  type="text"
                  id="cvv"
                  value={paymentData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
                    ${errors.cvv ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                  `}
                  placeholder="123"
                  maxLength={4}
                />
                {errors.cvv && (
                  <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                )}
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name *
              </label>
              <input
                type="text"
                id="cardholderName"
                value={paymentData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                className={`
                  w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
                  ${errors.cardholderName ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                `}
                placeholder="John Smith"
              />
              {errors.cardholderName && (
                <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
              )}
            </div>
          </div>
        </div>
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
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          disabled={isLoading}
          className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Address
        </button>

        <button
          onClick={handlePayment}
          disabled={isLoading}
          className={`
            flex items-center px-8 py-3 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
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
