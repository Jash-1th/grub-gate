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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo className="h-8 w-auto" />
              <span className="ml-3 text-xl font-semibold text-gray-900">
                Partner Onboarding
              </span>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
                Dashboard
              </button>
              
              <button
                onClick={handleGoHome}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FontAwesomeIcon icon={faHome} className="mr-2 h-4 w-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li key={step.name} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                  <div className="flex items-center">
                    <div className="relative flex items-center justify-center">
                      {step.id < currentStep ? (
                        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                          <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-white" />
                        </div>
                      ) : step.id === currentStep ? (
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">{step.id}</span>
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-sm font-medium">{step.id}</span>
                        </div>
                      )}
                    </div>
                    <span className={`ml-3 text-sm font-medium ${
                      step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
          <Outlet context={{ currentStep, user }} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Need help? Contact our support team at support@grubgate.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingLayout;
