import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlanning } from '../../contexts/PlanningContext';
import { useMealPlan } from '../../contexts/MealPlanContext_SSR_FIXED';
import { useToast } from '../../contexts/ToastContext';
import RestaurantGridContainer from './RestaurantGridContainer';

const RestaurantStep = ({ onNext, onBack }) => {
  const { t } = useTranslation();
  const { postalCode, isClient } = usePlanning();
  const { getTotalItemsCount } = useMealPlan();
  const { showError } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle navigation with meal validation
  const handleContinueToSubscription = async () => {
    // Prevent multiple simultaneous calls
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const totalItems = getTotalItemsCount();
      
      if (totalItems === 0) {
        showError(
          'No Meals Selected',
          'Please select at least one meal item from the restaurants below before proceeding to subscription plans.'
        );
        return;
      }
      
      // If validation passes, proceed to next step
      onNext();
    } finally {
      // Reset processing state after a short delay
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };

  // Show loading state during SSR or while checking postal code
  if (!isClient || !postalCode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-12 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Location
            </button>

            {/* Progress Indicator */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Location</span>
              </div>
              
              <div className="w-8 h-0.5 bg-gray-300"></div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-grub-red rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Restaurants</span>
              </div>
              
              <div className="w-8 h-0.5 bg-gray-300"></div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-bold">3</span>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Subscribe</span>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinueToSubscription}
              disabled={isProcessing}
              className={`inline-flex items-center px-6 py-2 text-white font-medium rounded-lg transition-colors duration-200 ${
                isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-grub-red hover:bg-red-700'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Continue to Plans'}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Restaurant Grid Section */}
      <RestaurantGridContainer 
        postalCode={postalCode}
      />

      {/* Bottom Action Bar */}
      <div className="bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Current Filters Display */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Current filters:</span>
                {postalCode && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {postalCode.toUpperCase()}
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Sorted by rating
                </span>
                {/* Meal Counter */}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  getTotalItemsCount() > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {getTotalItemsCount()} meals selected
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Change Location
              </button>
              <button
                onClick={handleContinueToSubscription}
                disabled={isProcessing}
                className={`px-8 py-2 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-grub-red to-red-700 hover:from-grub-red hover:to-red-800 transform hover:-translate-y-0.5 hover:shadow-xl'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Continue to Subscription Plans'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantStep;
