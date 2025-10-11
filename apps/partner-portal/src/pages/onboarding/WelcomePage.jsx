import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket,
  faChartLine,
  faUsers,
  faCog,
  faArrowRight,
  faCheckCircle,
  faStar,
  faHandshake,
  faGift
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@grub-gate/ui';
import { useAuth } from '../../contexts/AuthContext';

/**
 * WelcomePage Component
 * SSR-safe welcome page for new partners
 * Shows benefits and guides them to setup
 */
const WelcomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentStep } = useOutletContext();
  
  // SSR safety
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGetStarted = async () => {
    setIsLoading(true);
    
    // Simulate brief loading for better UX
    setTimeout(() => {
      navigate('/onboarding/setup');
      setIsLoading(false);
    }, 500);
  };

  const handleSkipToMenu = () => {
    navigate('/dashboard/menu');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  // Don't render during SSR
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const benefits = [
    {
      icon: faChartLine,
      title: 'Boost Your Revenue',
      description: 'Reach thousands of hungry customers and increase your daily orders by up to 40%',
      color: 'text-green-600'
    },
    {
      icon: faUsers,
      title: 'Expand Your Reach',
      description: 'Connect with new customers in your delivery area and build a loyal customer base',
      color: 'text-blue-600'
    },
    {
      icon: faCog,
      title: 'Easy Management',
      description: 'Manage orders, menu, and analytics all in one powerful dashboard',
      color: 'text-purple-600'
    },
    {
      icon: faHandshake,
      title: 'Dedicated Support',
      description: 'Get help from our partner success team whenever you need it',
      color: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'Complete Restaurant Setup',
      description: 'Add your menu, set operating hours, and configure delivery settings',
      action: 'Get Started',
      primary: true,
      onClick: handleGetStarted
    },
    {
      title: 'Add Your First Menu Items',
      description: 'Skip setup for now and start adding your delicious menu items',
      action: 'Add Menu Items',
      primary: false,
      onClick: handleSkipToMenu
    }
  ];

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
          <FontAwesomeIcon icon={faRocket} className="text-2xl text-blue-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to GrubGate, {user?.firstName || 'Partner'}! 🎉
        </h1>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Congratulations on joining our platform! You're now part of a growing network of successful restaurants. 
          Let's get your restaurant set up and ready to receive orders.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
          What You'll Get as a GrubGate Partner
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-white flex items-center justify-center ${benefit.color}`}>
                  <FontAwesomeIcon icon={benefit.icon} className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
          Choose Your Next Step
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {quickActions.map((action, index) => (
            <div 
              key={index} 
              className={`relative rounded-xl p-6 border-2 transition-all duration-200 hover:shadow-lg ${
                action.primary 
                  ? 'border-blue-500 bg-blue-50 hover:bg-blue-100' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {action.primary && (
                <div className="absolute -top-3 left-6">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Recommended
                  </span>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600">
                  {action.description}
                </p>
              </div>
              
              <Button
                onClick={action.onClick}
                disabled={isLoading}
                className={`w-full ${
                  action.primary 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
                }`}
              >
                {isLoading && action.primary ? (
                  <>
                    <FontAwesomeIcon icon={faRocket} className="animate-spin mr-2" />
                    Setting up...
                  </>
                ) : (
                  <>
                    {action.action}
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Success Stats */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
          Join Successful Partners Already on GrubGate
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
            <div className="text-gray-600">Active Restaurants</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-gray-600">Monthly Orders</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">4.8★</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>

      {/* Alternative Actions */}
      <div className="text-center">
        <p className="text-gray-500 mb-4">
          Already familiar with the platform?
        </p>
        <button
          onClick={handleGoToDashboard}
          className="text-blue-600 hover:text-blue-700 font-medium underline"
        >
          Go directly to dashboard
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
