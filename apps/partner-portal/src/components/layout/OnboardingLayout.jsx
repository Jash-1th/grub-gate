import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faSpinner, 
  faArrowLeft,
  faHome
} from '@fortawesome/free-solid-svg-icons';
import { Logo } from '@grub-gate/ui';
import { useAuth } from '../../contexts/AuthContext';

/**
 * OnboardingLayout Component
 * SSR-safe layout for partner onboarding flow
 * Handles progress tracking and navigation
 */
const OnboardingLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // SSR safety
  const [isClient, setIsClient] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine current step based on route
  useEffect(() => {
    if (!isClient) return;
    
    const path = location.pathname;
    if (path.includes('/welcome')) setCurrentStep(1);
    else if (path.includes('/setup')) setCurrentStep(2);
    else if (path.includes('/complete')) setCurrentStep(3);
  }, [location.pathname, isClient]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isClient && !isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isClient, isLoading, isAuthenticated, navigate]);

  // Show loading during SSR or auth check
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const steps = [
    { id: 1, name: 'Welcome', path: '/onboarding/welcome' },
    { id: 2, name: 'Setup', path: '/onboarding/setup' },
    { id: 3, name: 'Complete', path: '/onboarding/complete' }
  ];

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-2 sm:mr-4 p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                aria-label="Go back"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <Logo className="h-6 sm:h-8 w-auto" />
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden xs:inline">
                Step {currentStep} of 3
              </span>
              <span className="text-xs text-gray-600 xs:hidden">
                {currentStep}/3
              </span>
              <button
                onClick={handleHome}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                aria-label="Go to dashboard"
              >
                <FontAwesomeIcon icon={faHome} className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar - Mobile Responsive */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="py-3 sm:py-4">
            {/* Mobile Progress Bar */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-900">
                  {steps[currentStep - 1]?.title}
                </span>
                <span className="text-xs text-gray-500">
                  {currentStep} of {steps.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Desktop Progress Steps */}
            <div className="hidden sm:flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    index + 1 < currentStep 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : index + 1 === currentStep
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}>
                    {index + 1 < currentStep ? (
                      <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    index + 1 <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`ml-4 w-12 h-0.5 ${
                      index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Responsive */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Outlet context={{ currentStep, setCurrentStep }} />
      </main>
    </div>
  );
};

export default OnboardingLayout;
