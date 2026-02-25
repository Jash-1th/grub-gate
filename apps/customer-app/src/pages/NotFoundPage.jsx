import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            {/* Large 404 Text */}
            <h1 className="text-9xl font-bold text-gray-200 select-none">404</h1>
            
            {/* Food Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-grub-red rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Don't worry, let's get you back to delicious meals!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="w-full bg-grub-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-grub-red transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Go to Home</span>
          </button>

          <button
            onClick={handleGoBack}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Go Back</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Or try these popular pages:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate('/weekly-menu')}
              className="text-sm text-grub-red hover:text-grub-red font-medium transition-colors duration-200"
            >
              Weekly Menu
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/restaurants')}
              className="text-sm text-grub-red hover:text-grub-red font-medium transition-colors duration-200"
            >
              Restaurants
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/subscription')}
              className="text-sm text-grub-red hover:text-grub-red font-medium transition-colors duration-200"
            >
              Subscription
            </button>
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-8">
          <p className="text-xs text-gray-400 italic">
            🍽️ "Even the best chefs sometimes lose their way in the kitchen!" 🍽️
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
