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
        showToast(result.message || 'Your restaurant is now active and ready to receive orders!', 'success');
        
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
      showToast(errorMessage, 'error');
      
      // Still navigate to dashboard but show warning
      showToast('Proceeding to dashboard. You may need to contact support if issues persist.', 'warning');
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
    <div className="p-8 text-center">
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
      <div className="mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Congratulations, {user?.firstName || 'Partner'}!
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Your restaurant setup is complete! You're now ready to start receiving orders and growing your business with GrubGate.
        </p>
      </div>

      {/* Setup Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          What You've Accomplished
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
            </div>
            <p className="font-medium text-gray-900">Restaurant Profile</p>
            <p className="text-sm text-gray-600">Complete</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
            </div>
            <p className="font-medium text-gray-900">Location Setup</p>
            <p className="text-sm text-gray-600">Complete</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
            </div>
            <p className="font-medium text-gray-900">Operating Hours</p>
            <p className="text-sm text-gray-600">Complete</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
            </div>
            <p className="font-medium text-gray-900">Delivery Settings</p>
            <p className="text-sm text-gray-600">Complete</p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          Recommended Next Steps
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {nextSteps.map((step, index) => (
            <div 
              key={index}
              className={`${step.bgColor} rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer`}
              onClick={() => handleGoToRoute(step.route)}
            >
              <div className={`w-12 h-12 ${step.bgColor} rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                <FontAwesomeIcon icon={step.icon} className={`text-xl ${step.color}`} />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              
              <p className="text-gray-600 mb-4 text-sm">
                {step.description}
              </p>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoToRoute(step.route);
                }}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
              >
                {step.action}
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Welcome Bonus */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-8 mb-8">
        <div className="flex items-center justify-center mb-4">
          <FontAwesomeIcon icon={faGift} className="text-3xl text-orange-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Welcome Bonus!</h3>
        </div>
        
        <p className="text-gray-700 mb-4">
          As a new partner, you'll receive <strong>0% commission</strong> on your first 10 orders!
        </p>
        
        <div className="flex items-center justify-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesomeIcon key={star} icon={faStar} className="text-yellow-500" />
          ))}
          <span className="ml-2 text-sm text-gray-600">Join 500+ successful partners</span>
        </div>
      </div>

      {/* Primary Action */}
      <div className="space-y-4">
        <Button
          onClick={handleGoToDashboard}
          disabled={isActivating}
          className={`px-8 py-3 text-lg font-semibold transition-all duration-200 ${
            isActivating 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105'
          }`}
        >
          {isActivating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
              Activating Restaurant...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faRocket} className="mr-2" />
              Launch My Restaurant
            </>
          )}
        </Button>
        
        <p className="text-sm text-gray-500">
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
