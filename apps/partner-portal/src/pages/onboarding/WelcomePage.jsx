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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section with Confetti Effect */}
      <div className="relative overflow-hidden bg-grub-red text-white">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl animate-bounce"></div>
        </div>
        
        <div className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 pb-20 sm:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-full mb-6 sm:mb-8 shadow-2xl animate-bounce">
              <FontAwesomeIcon icon={faRocket} className="text-3xl sm:text-4xl text-white" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Welcome to GrubGate,<br className="sm:hidden" /> {user?.firstName || 'Partner'}! 🎉
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              Congratulations on joining our platform! You're now part of a growing network of successful restaurants.
            </p>
            
            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold mb-1">1200+</div>
                <div className="text-xs sm:text-sm text-white/80">Partners</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold mb-1">25K+</div>
                <div className="text-xs sm:text-sm text-white/80">Orders/Month</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold mb-1">4.9★</div>
                <div className="text-xs sm:text-sm text-white/80">Rating</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold mb-1">+40%</div>
                <div className="text-xs sm:text-sm text-white/80">Revenue</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="url(#wave-gradient)" />
            <defs>
              <linearGradient id="wave-gradient" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgb(239, 246, 255)" />
                <stop offset="50%" stopColor="rgb(238, 242, 255)" />
                <stop offset="100%" stopColor="rgb(243, 232, 255)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto mb-12 sm:mb-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            What You'll Get as a GrubGate Partner
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to grow your restaurant business
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="group bg-white rounded-2xl p-5 sm:p-6 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="flex flex-col items-center text-center">
                <div className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center ${benefit.color} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <FontAwesomeIcon icon={benefit.icon} className="text-2xl sm:text-3xl" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-5xl mx-auto mb-12 sm:mb-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Choose Your Next Step
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Let's get your restaurant up and running
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {quickActions.map((action, index) => (
            <div 
              key={index} 
              className={`relative rounded-2xl p-6 sm:p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                action.primary 
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50' 
                  : 'border-gray-200 bg-white hover:border-blue-200'
              }`}
            >
              {action.primary && (
                <div className="absolute -top-3 sm:-top-4 left-4 sm:left-6">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg flex items-center">
                    <FontAwesomeIcon icon={faStar} className="mr-1.5" />
                    Recommended
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                  {action.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {action.description}
                </p>
              </div>
              
              <button
                onClick={action.onClick}
                disabled={isLoading}
                className={`w-full py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 ${
                  action.primary 
                    ? 'bg-grub-red hover:bg-grub-red text-white shadow-lg hover:shadow-xl' 
                    : 'bg-grub-red hover:bg-grub-red text-white shadow-lg hover:shadow-xl'
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
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Success Partners Section */}
      <div className="max-w-6xl mx-auto bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-3xl p-6 sm:p-8 lg:p-12 mb-8 sm:mb-12 shadow-xl border-2 border-white">
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Join Successful Partners Already on GrubGate
          </h3>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
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
      <div className="max-w-4xl mx-auto text-center bg-white rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gray-100">
        <p className="text-base sm:text-lg text-gray-600 mb-4">
          Already familiar with the platform?
        </p>
        <button
          onClick={handleGoToDashboard}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-base sm:text-lg transition-colors duration-200 group"
        >
          Go directly to dashboard
          <FontAwesomeIcon icon={faArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
      </div>
    </div>
  );
};

export default WelcomePage;
