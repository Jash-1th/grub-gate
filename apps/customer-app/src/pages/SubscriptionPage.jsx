import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionPlans from '../components/planning/SubscriptionPlans';

const SubscriptionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-grub-red to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <button
                onClick={() => navigate('/weekly-menu')}
                className="inline-flex items-center text-red-100 hover:text-white transition-colors duration-200 mb-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Weekly Menu
              </button>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
                Choose Your Subscription Plan
              </h1>
              <p className="text-red-100 text-sm sm:text-base">
                Select the perfect plan for your meal planning needs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="py-6 sm:py-12">
        <SubscriptionPlans />
      </div>
    </div>
  );
};

export default SubscriptionPage;
