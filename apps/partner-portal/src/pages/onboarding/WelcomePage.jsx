import React, { useState, useEffect, useRef } from 'react';
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
import { useCountUp } from '../../hooks/useCountUp';
import { statisticsApi } from '../../api/statisticsApi';

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
  const [statistics, setStatistics] = useState({
    activePartners: 1200,
    monthlyOrders: 25000,
    partnerRating: 4.9,
    revenueBoost: 40
  });
  const [successStories, setSuccessStories] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const statsRef = useRef(null);

  // Animated counters (using dynamic statistics)
  const partnersCount = useCountUp(statistics.activePartners, 2000);
  const ordersCount = useCountUp(statistics.monthlyOrders, 2500);
  const ratingCount = useCountUp(Math.round(statistics.partnerRating * 10), 1500); // Convert to integer for animation
  const revenueCount = useCountUp(statistics.revenueBoost, 1800);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch statistics and success stories
  useEffect(() => {
    if (!isClient) return;

    const fetchData = async () => {
      try {
        setStatsLoading(true);
        
        // Fetch both statistics and success stories in parallel
        const [statsResponse, storiesResponse] = await Promise.all([
          statisticsApi.getPlatformStatistics(),
          statisticsApi.getSuccessStories()
        ]);

        if (statsResponse.data.success) {
          console.log('📊 WelcomePage: Statistics loaded:', statsResponse.data.data);
          setStatistics(statsResponse.data.data);
        }

        if (storiesResponse.data.success) {
          console.log('🏪 WelcomePage: Success stories loaded:', storiesResponse.data.data.length, 'stories');
          setSuccessStories(storiesResponse.data.data);
        }

      } catch (error) {
        console.error('❌ WelcomePage: Error fetching data:', error);
        // Keep fallback data that's already set in initial state
      } finally {
        setStatsLoading(false);
      }
    };

    // Add a small delay to prevent flash of loading state
    const timer = setTimeout(fetchData, 100);
    return () => clearTimeout(timer);
  }, [isClient]);

  // Intersection Observer for stats animation
  useEffect(() => {
    if (!isClient || !statsRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start all counter animations
            partnersCount.startAnimation();
            ordersCount.startAnimation();
            ratingCount.startAnimation();
            revenueCount.startAnimation();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(statsRef.current);

    return () => observer.disconnect();
  }, [isClient, partnersCount, ordersCount, ratingCount, revenueCount]);

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

      {/* Enhanced Success Partners Section */}
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Join Successful Partners Already on GrubGate
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Thousands of restaurants are already growing their business with us. See what they've achieved and join the success story.
          </p>
        </div>
        
        {/* Animated Statistics */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {partnersCount.count.toLocaleString()}+
            </div>
            <div className="text-sm text-gray-600">Active Partners</div>
          </div>
          <div className="text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Math.floor(ordersCount.count / 1000)}K+
            </div>
            <div className="text-sm text-gray-600">Monthly Orders</div>
          </div>
          <div className="text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {(ratingCount.count / 10).toFixed(1)}★
            </div>
            <div className="text-sm text-gray-600">Partner Rating</div>
          </div>
          <div className="text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {revenueCount.count}%
            </div>
            <div className="text-sm text-gray-600">Avg Revenue Boost</div>
          </div>
        </div>

        {/* Featured Success Stories */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 text-center mb-6">
            Success Stories from Our Partners
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.length > 0 ? successStories.map((story, index) => {
              // Dynamic gradient colors for avatars
              const gradients = [
                'from-red-500 to-orange-500',
                'from-green-500 to-teal-500', 
                'from-purple-500 to-pink-500',
                'from-blue-500 to-indigo-500',
                'from-yellow-500 to-red-500',
                'from-pink-500 to-purple-500'
              ];
              
              const gradient = gradients[index % gradients.length];
              
              // Format metric display
              const getMetricDisplay = (metric) => {
                switch (metric.type) {
                  case 'orders':
                    return `+${metric.value}% Orders`;
                  case 'revenue':
                    return `+${metric.value}% Revenue`;
                  case 'customers':
                    return `${metric.value}x Customers`;
                  default:
                    return `+${metric.value}${metric.unit}`;
                }
              };

              // Render star rating
              const renderStars = (rating) => {
                const fullStars = Math.floor(rating);
                const hasHalfStar = rating % 1 !== 0;
                const stars = [];
                
                for (let i = 0; i < fullStars; i++) {
                  stars.push(<FontAwesomeIcon key={i} icon={faStar} className="mr-1" />);
                }
                
                if (hasHalfStar) {
                  stars.push(<FontAwesomeIcon key="half" icon={faStar} className="mr-1 opacity-50" />);
                }
                
                return stars;
              };

              return (
                <div key={story.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                      {story.avatar}
                    </div>
                    <div className="ml-3">
                      <h5 className="font-semibold text-gray-900">{story.name}</h5>
                      <p className="text-sm text-gray-600">{story.cuisine} Cuisine</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center text-yellow-500 mb-2">
                      {renderStars(story.rating)}
                      <span className="text-gray-600 text-sm ml-1">{story.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-gray-600 italic">
                      "{story.testimonial}"
                    </p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-semibold">{getMetricDisplay(story.metric)}</span>
                    <span className="text-blue-600 font-semibold">{story.city}, {story.country}</span>
                  </div>
                </div>
              );
            }) : (
              // Fallback loading state
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="ml-3">
                      <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Partner Joins */}
        <div className="bg-white/50 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">A</div>
              <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">B</div>
              <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">C</div>
              <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">D</div>
              <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">+</div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-green-600">12 new partners</span> joined this week
          </p>
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
