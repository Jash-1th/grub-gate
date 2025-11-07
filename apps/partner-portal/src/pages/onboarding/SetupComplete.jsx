import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle,
  faRocket,
  faUtensils,
  faChartLine,
  faCog,
  faArrowRight,
  faGift,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@grub-gate/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { completeSetupActivation } from '../../api/activationApi';

/**
 * SetupComplete Component
 * SSR-safe completion page with next steps
 * Celebrates setup completion and guides to dashboard
 */
const SetupComplete = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // SSR safety
  const [isClient, setIsClient] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Trigger confetti animation
    setTimeout(() => setShowConfetti(true), 500);
  }, []);

  // Don't render during SSR
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const nextSteps = [
    {
      icon: faUtensils,
      title: 'Add Your Menu Items',
      description: 'Start adding your delicious dishes and set competitive prices',
      action: 'Add Menu Items',
      route: '/dashboard/menu',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: faChartLine,
      title: 'View Analytics',
      description: 'Monitor your performance and track orders in real-time',
      action: 'View Analytics',
      route: '/dashboard/analytics',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: faCog,
      title: 'Fine-tune Settings',
      description: 'Adjust your restaurant settings and preferences',
      action: 'Manage Settings',
      route: '/dashboard/settings',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const handleGoToDashboard = async () => {
    try {
      setIsActivating(true);
      console.log('🚀 Starting restaurant activation...');
      
      // Call the activation API to make both user and restaurant active
      const result = await completeSetupActivation();
      
      if (result.success) {
        console.log('✅ Restaurant activation successful:', result.data);
        
        // Show success message
        showToast(result.message || t('toasts.restaurant.activationSuccess'), 'success');
        
        // Navigate to dashboard after a short delay to show the success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to activate restaurant');
      }
    } catch (error) {
      console.error('❌ Restaurant activation failed:', error);
      
      // Show error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to activate restaurant. Please try again.';
      showToast(errorMessage || t('toasts.restaurant.activationFailed'), 'error');
      
      // Still navigate to dashboard but show warning
      showToast(t('toasts.restaurant.proceedingToDashboard'), 'warning');
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } finally {
      setIsActivating(false);
    }
  };

  const handleGoToRoute = (route) => {
    navigate(route);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 text-center">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 animate-bounce"></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-400 animate-bounce animation-delay-200"></div>
          <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-green-400 animate-bounce animation-delay-400"></div>
          <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-red-400 animate-bounce animation-delay-600"></div>
          <div className="absolute top-3/4 left-1/2 w-2 h-2 bg-purple-400 animate-bounce animation-delay-800"></div>
        </div>
      )}

      {/* Success Header */}
      <div className="mb-8 sm:mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-4 sm:mb-6 shadow-2xl animate-bounce">
          <FontAwesomeIcon icon={faCheckCircle} className="text-4xl sm:text-5xl lg:text-6xl text-white" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
          🎉 Congratulations, {user?.firstName || 'Partner'}!
        </h1>
        
        <p className="text-base sm:text-lg lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
          Your restaurant setup is complete! You're now ready to start receiving orders and growing your business with GrubGate.
        </p>
      </div>

      {/* Setup Summary */}
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-2xl p-6 sm:p-10 mb-12 shadow-xl border-2 border-white">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          What You've Accomplished ✨
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="text-center bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <FontAwesomeIcon icon={faCheckCircle} className="text-white text-lg sm:text-2xl" />
            </div>
            <p className="font-bold text-gray-900 text-sm sm:text-lg mb-1">Restaurant Profile</p>
            <p className="text-xs sm:text-sm text-green-600 font-semibold">✓ Complete</p>
          </div>
          
          <div className="text-center bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <FontAwesomeIcon icon={faCheckCircle} className="text-white text-lg sm:text-2xl" />
            </div>
            <p className="font-bold text-gray-900 text-sm sm:text-lg mb-1">Location Setup</p>
            <p className="text-xs sm:text-sm text-blue-600 font-semibold">✓ Complete</p>
          </div>
          
          <div className="text-center bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <FontAwesomeIcon icon={faCheckCircle} className="text-white text-lg sm:text-2xl" />
            </div>
            <p className="font-bold text-gray-900 text-sm sm:text-lg mb-1">Operating Hours</p>
            <p className="text-xs sm:text-sm text-purple-600 font-semibold">✓ Complete</p>
          </div>
          
          <div className="text-center bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <FontAwesomeIcon icon={faCheckCircle} className="text-white text-lg sm:text-2xl" />
            </div>
            <p className="font-bold text-gray-900 text-sm sm:text-lg mb-1">Delivery Settings</p>
            <p className="text-xs sm:text-sm text-orange-600 font-semibold">✓ Complete</p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mb-12">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          Recommended Next Steps 🚀
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {nextSteps.map((step, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-grub-red/30 hover:-translate-y-2 group"
              onClick={() => handleGoToRoute(step.route)}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${step.bgColor.replace('bg-', 'from-')} ${step.bgColor.replace('50', '100')} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <FontAwesomeIcon icon={step.icon} className={`text-2xl ${step.color}`} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              
              <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
                {step.description}
              </p>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoToRoute(step.route);
                }}
                className="w-full bg-gradient-to-r from-grub-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 shadow-md hover:shadow-lg transition-all duration-200"
              >
                {step.action}
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Welcome Bonus */}
      <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-6 sm:p-10 mb-10 shadow-xl border-2 border-yellow-200">
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <FontAwesomeIcon icon={faGift} className="text-3xl sm:text-4xl text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Welcome Bonus! 🎁</h3>
        </div>
        
        <p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed px-2">
          As a new partner, you'll receive <strong className="text-grub-red text-lg sm:text-xl">0% commission</strong> on your first 10 orders!
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <FontAwesomeIcon key={star} icon={faStar} className="text-yellow-500 text-lg sm:text-xl" />
            ))}
          </div>
          <span className="text-xs sm:text-sm lg:text-base text-gray-700 font-semibold">Join 500+ successful partners</span>
        </div>
      </div>

      {/* Primary Action */}
      <div className="space-y-6">
        <Button
          onClick={handleGoToDashboard}
          disabled={isActivating}
          className={`px-10 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-bold transition-all duration-300 shadow-2xl ${
            isActivating 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-grub-red via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white hover:scale-105 hover:shadow-3xl'
          }`}
        >
          {isActivating ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3 inline-block"></div>
              Activating Restaurant...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faRocket} className="mr-3 text-2xl" />
              Launch My Restaurant Dashboard
            </>
          )}
        </Button>
        
        <p className="text-sm sm:text-base text-gray-600 font-medium">
          {isActivating 
            ? 'Setting up your restaurant and making it active...' 
            : 'Click to activate your restaurant and start receiving orders!'
          }
        </p>
      </div>
    </div>
  );
};

export default SetupComplete;
