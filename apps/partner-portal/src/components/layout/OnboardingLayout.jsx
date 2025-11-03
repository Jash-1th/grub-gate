import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faSpinner, 
  faArrowLeft,
  faArrowRight,
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
      {/* Enhanced Header */}
      <header className="bg-white shadow-md border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Logo className="h-8 sm:h-9 w-auto" />
            </div>
            
            {/* Centered Title */}
            <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-gray-900 text-base sm:text-xl font-bold tracking-wide">
                Partner Onboarding
              </h1>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center">
              <button
                onClick={handleBackToDashboard}
                className="inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-300 text-xs sm:text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-400 transition-all duration-200 shadow-sm"
              >
                <span>Dashboard</span>
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Progress Stepper */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between sm:justify-start">
              {steps.map((step, stepIdx) => (
                <li key={step.name} className={`${stepIdx !== steps.length - 1 ? 'flex-1 sm:flex-none sm:pr-12 lg:pr-20' : ''} relative flex items-center`}>
                  <div className="flex flex-col sm:flex-row items-center">
                    <div className="relative flex items-center justify-center">
                      {step.id < currentStep ? (
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                          <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                      ) : step.id === currentStep ? (
                        <div className="relative">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg animate-pulse">
                            <span className="text-white text-base sm:text-lg font-bold">{step.id}</span>
                          </div>
                          {/* Rotating ring */}
                          <div className="absolute inset-0 rounded-full border-2 border-blue-400 border-t-transparent animate-spin opacity-50"></div>
                        </div>
                      ) : (
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-3 border-gray-300 bg-white flex items-center justify-center shadow-sm">
                          <span className="text-gray-400 text-base sm:text-lg font-semibold">{step.id}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 sm:mt-0 sm:ml-3 text-center sm:text-left">
                      <span className={`block text-xs sm:text-sm font-bold ${
                        step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                  </div>
                  
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 min-h-[500px] sm:min-h-[600px] overflow-hidden">
          <Outlet context={{ currentStep, user }} />
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-gray-50 to-white border-t-2 border-gray-200 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@grubgate.com" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                support@grubgate.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingLayout;
