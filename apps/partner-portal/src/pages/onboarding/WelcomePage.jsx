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
  faGift,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@grub-gate/ui';
import { useAuth } from '../../contexts/AuthContext';
import { getPartnerStats, formatStatNumber, formatRating } from '../../services/partnerStatsService';

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
  
  // Partner statistics
  const [stats, setStats] = useState({
    activeRestaurants: 500,
    monthlyOrders: 10000,
    averageRating: 4.8,
    loading: true,
    fallback: true
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch partner statistics
  useEffect(() => {
    if (!isClient) return;
    
    const fetchStats = async () => {
      try {
        const partnerStats = await getPartnerStats();
        setStats({
          ...partnerStats,
          loading: false
        });
      } catch (error) {
        console.error('Failed to load partner stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [isClient]);

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
    <div className="mobile-container">
      {/* Welcome Header - Mobile Responsive */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="mobile-heading text-gray-900 mb-3 sm:mb-4">
          Welcome to GrubGate Partner Portal! 🎉
        </h1>
        <p className="mobile-body text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
          You're just a few steps away from joining Montreal's most innovative food delivery platform. 
          Let's get your restaurant set up and ready to serve customers!
        </p>
      </div>

      {/* Benefits Section */}
      <div className="mb-8 sm:mb-12">
        <h2 className="mobile-subheading text-gray-900 text-center mb-6 sm:mb-8">
          What You'll Get as a GrubGate Partner
        </h2>
        
        <div className="mobile-grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="mobile-card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white flex items-center justify-center ${benefit.color}`}>
                  <FontAwesomeIcon icon={benefit.icon} className="text-lg sm:text-xl" />
                </div>
                <div>
                  <h3 className="mobile-subheading text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="mobile-body text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions - Mobile Responsive */}
      <div className="mb-8 sm:mb-12">
        <h2 className="mobile-subheading text-gray-900 text-center mb-6 sm:mb-8">
          Choose Your Next Step
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {quickActions.map((action, index) => (
            <div 
              key={index} 
              className={`relative mobile-card border-2 transition-all duration-200 hover:shadow-lg ${
                action.primary 
                  ? 'border-blue-500 bg-blue-50 hover:bg-blue-100' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {action.primary && (
                <div className="absolute -top-2 sm:-top-3 left-4 sm:left-6">
                  <span className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    Recommended
                  </span>
                </div>
              )}
              
              <div className="mb-4 sm:mb-6">
                <h3 className="mobile-subheading text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="mobile-body text-gray-600">
                  {action.description}
                </p>
              </div>
              
              <Button
                onClick={action.onClick}
                className={`mobile-button-primary ${action.primary ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'mobile-button-secondary'}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    <span className="hidden sm:inline">Setting up...</span>
                    <span className="sm:hidden">Loading...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">{action.action}</span>
                    <span className="sm:hidden">{action.action.split(' ')[0]}</span>
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Success Stats - Dynamic & Mobile Responsive */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center mb-4 sm:mb-6">
          Join Successful Partners Already on GrubGate
          {stats.fallback && (
            <span className="block text-xs sm:text-sm text-gray-500 mt-1 font-normal">
              Live data loading...
            </span>
          )}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
          <div className="bg-white/50 rounded-lg p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2 flex items-center justify-center">
              {stats.loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                `${formatStatNumber(stats.activeRestaurants)}+`
              )}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Active Restaurants</div>
          </div>
          <div className="bg-white/50 rounded-lg p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2 flex items-center justify-center">
              {stats.loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                `${formatStatNumber(stats.monthlyOrders)}+`
              )}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Monthly Orders</div>
          </div>
          <div className="bg-white/50 rounded-lg p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2 flex items-center justify-center">
              {stats.loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                formatRating(stats.averageRating)
              )}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Average Rating</div>
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
