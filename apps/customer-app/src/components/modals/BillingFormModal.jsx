import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useMealPlan } from '../../contexts/MealPlanContext_SSR_FIXED';
import { usePlanning } from '../../contexts/PlanningContext';
import subscriptionApi from '../../api/subscriptionApi';

const BillingFormModal = ({ isOpen, onClose, selectedPlan, onSuccess }) => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const { state: mealPlanState } = useMealPlan();
  const { selectedRestaurant } = usePlanning();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    // Payment Details
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: user?.firstName + ' ' + user?.lastName || '',
    
    // Billing Address
    billingStreet: '',
    billingCity: '',
    billingProvince: '',
    billingPostalCode: '',
    billingCountry: 'Canada',
    
    // Contact Info
    billingEmail: user?.email || '',
    billingPhone: user?.phone || ''
  });

  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Payment validation
    if (!formData.cardNumber || formData.cardNumber.length < 16) {
      newErrors.cardNumber = 'Valid card number is required';
    }
    if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Valid expiry date is required (MM/YY)';
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'Valid CVV is required';
    }
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    // Billing address validation
    if (!formData.billingStreet.trim()) {
      newErrors.billingStreet = 'Street address is required';
    }
    if (!formData.billingCity.trim()) {
      newErrors.billingCity = 'City is required';
    }
    if (!formData.billingProvince.trim()) {
      newErrors.billingProvince = 'Province is required';
    }
    if (!formData.billingPostalCode.trim()) {
      newErrors.billingPostalCode = 'Postal code is required';
    }

    // Contact validation
    if (!formData.billingEmail || !/\S+@\S+\.\S+/.test(formData.billingEmail)) {
      newErrors.billingEmail = 'Valid email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setIsProcessing(true);

    try {
      // Create subscription meal plan with all billing info (no separate subscription needed)
      const subscriptionMealPlanData = {
        restaurantId: selectedRestaurant?.id || selectedRestaurant?._id,
        planType: selectedPlan.id, // 'bi-weekly', 'monthly', etc.
        deliveryAddress: {
          street: formData.billingStreet,
          city: formData.billingCity,
          province: formData.billingProvince,
          postalCode: formData.billingPostalCode,
          instructions: ''
        },
        customerPhone: formData.billingPhone,
        specialInstructions: '',
        // Billing information integrated directly
        planName: selectedPlan.name,
        monthlyPrice: parseFloat(selectedPlan.price.replace('$', '')),
        features: selectedPlan.features,
        paymentMethod: 'card'
        // Note: In a real implementation, payment processing would be handled by Stripe
      };

      console.log('Creating subscription meal plan with billing info...');
      console.log('Subscription meal plan data:', subscriptionMealPlanData);
      console.log('Current meal plan state:', mealPlanState);
      
      const response = await subscriptionApi.createSubscriptionFromMealPlan(subscriptionMealPlanData);
      
      if (response.status === 'success') {
        // Use the backend success message instead of showing duplicate toast
        showSuccess('Success!', response.message || 'Subscription created successfully!');
        onSuccess({
          subscriptionMealPlan: response.data.subscriptionMealPlan
        });
        onClose();
      } else {
        throw new Error(response.message || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create subscription. Please try again.';
      showError('Subscription Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format card number input
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-grub-red via-grub-red to-grub-red text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Complete Your Subscription</h2>
              <p className="text-red-100 mt-1">
                {selectedPlan?.name} - {selectedPlan?.price} {selectedPlan?.period}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-red-100 hover:text-white transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-grub-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payment Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number *
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    setFormData(prev => ({ ...prev, cardNumber: formatted }));
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-transparent ${
                    errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value);
                    setFormData(prev => ({ ...prev, expiryDate: formatted }));
                  }}
                  placeholder="MM/YY"
                  maxLength="5"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-transparent ${
                    errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV *
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength="4"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-transparent ${
                    errors.cvv ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  name="cardholderName"
                  value={formData.cardholderName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-transparent ${
                    errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.cardholderName && <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>}
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-grub-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Billing Address
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="billingStreet"
                  value={formData.billingStreet}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-transparent ${
                    errors.billingStreet ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.billingStreet && <p className="text-red-500 text-sm mt-1">{errors.billingStreet}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="billingCity"
                  value={formData.billingCity}
                  onChange={handleInputChange}
                  placeholder="Toronto"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-transparent ${
                    errors.billingCity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.billingCity && <p className="text-red-500 text-sm mt-1">{errors.billingCity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province *
                </label>
                <select
                  name="billingProvince"
                  value={formData.billingProvince}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-transparent ${
                    errors.billingProvince ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Province</option>
                  <option value="AB">Alberta</option>
                  <option value="BC">British Columbia</option>
                  <option value="MB">Manitoba</option>
                  <option value="NB">New Brunswick</option>
                  <option value="NL">Newfoundland and Labrador</option>
                  <option value="NS">Nova Scotia</option>
                  <option value="ON">Ontario</option>
                  <option value="PE">Prince Edward Island</option>
                  <option value="QC">Quebec</option>
                  <option value="SK">Saskatchewan</option>
                  <option value="NT">Northwest Territories</option>
                  <option value="NU">Nunavut</option>
                  <option value="YT">Yukon</option>
                </select>
                {errors.billingProvince && <p className="text-red-500 text-sm mt-1">{errors.billingProvince}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="billingPostalCode"
                  value={formData.billingPostalCode}
                  onChange={handleInputChange}
                  placeholder="M5V 3A8"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-transparent ${
                    errors.billingPostalCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.billingPostalCode && <p className="text-red-500 text-sm mt-1">{errors.billingPostalCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="billingCountry"
                  value={formData.billingCountry}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-grub-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="billingEmail"
                  value={formData.billingEmail}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-transparent ${
                    errors.billingEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.billingEmail && <p className="text-red-500 text-sm mt-1">{errors.billingEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="billingPhone"
                  value={formData.billingPhone}
                  onChange={handleInputChange}
                  placeholder="+1 (416) 555-0123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grub-red focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Plan Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{selectedPlan?.name}</span>
              <span className="font-semibold text-gray-900">{selectedPlan?.price}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Billed {selectedPlan?.period}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-3 px-6 bg-grub-red text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Subscribe Now'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingFormModal;
