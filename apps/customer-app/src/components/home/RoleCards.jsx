import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../contexts/AuthContext';

const RoleCards = () => {
  const { t } = useTranslation();
  const { openOTPAuthModal } = useModal();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCustomerClick = () => {
    if (isAuthenticated) {
      // User is logged in, navigate to plan page
      navigate('/plan');
    } else {
      // User is not logged in, open OTP modal for signup
      openOTPAuthModal('signup');
    }
  };

  const handlePartnerClick = () => {
    // Navigate to partner portal
    window.open('https://gg0p1.netlify.app', '_blank');
  };

  const handleGrubRunnerClick = () => {
    // For now, do nothing - coming soon
    console.log('Grub Runners - Coming Soon!');
  };

  const roleCards = [
    {
      id: 'customer',
      title: 'For Customers',
      subtitle: 'Order & Plan Meals',
      description: 'Discover amazing restaurants, plan your weekly meals, and enjoy hassle-free food delivery.',
      icon: '🍽️',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      features: ['Weekly Meal Planning', 'Restaurant Discovery', 'Easy Ordering', 'Subscription Plans'],
      onClick: handleCustomerClick,
      buttonText: isAuthenticated ? 'Start Planning' : 'Get Started',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'partner',
      title: 'For Partners',
      subtitle: 'Grow Your Restaurant',
      description: 'Join our platform to reach more customers, manage orders efficiently, and grow your business.',
      icon: '🏪',
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'hover:from-green-600 hover:to-green-700',
      features: ['Order Management', 'Analytics Dashboard', 'Menu Management', 'Customer Insights'],
      onClick: handlePartnerClick,
      buttonText: 'Partner Portal',
      buttonStyle: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'runner',
      title: 'For Grub Runners',
      subtitle: 'Deliver & Earn',
      description: 'Become a delivery partner and earn flexible income by delivering delicious meals to customers.',
      icon: '🚴‍♂️',
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'hover:from-orange-600 hover:to-orange-700',
      features: ['Flexible Schedule', 'Competitive Pay', 'Easy App Interface', 'Weekly Payouts'],
      onClick: handleGrubRunnerClick,
      buttonText: 'Coming Soon',
      buttonStyle: 'bg-gray-400 cursor-not-allowed',
      disabled: true
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Join the GrubGate Community
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're looking to order food, grow your restaurant business, or earn as a delivery partner, 
            we have the perfect solution for you.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roleCards.map((card) => (
            <div
              key={card.id}
              className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden ${
                card.disabled ? 'opacity-75' : 'cursor-pointer'
              }`}
              onClick={!card.disabled ? card.onClick : undefined}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} ${card.hoverGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Card Content */}
              <div className="relative p-8">
                {/* Icon */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${card.gradient} text-white text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {card.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-lg font-medium text-gray-600">{card.subtitle}</p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  {card.description}
                </p>

                {/* Features */}
                <div className="mb-8">
                  <ul className="space-y-3">
                    {card.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${card.gradient} mr-3 flex-shrink-0`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="text-center">
                  <button
                    onClick={card.onClick}
                    disabled={card.disabled}
                    className={`w-full px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform group-hover:scale-105 ${card.buttonStyle} ${
                      card.disabled ? '' : 'shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {card.buttonText}
                  </button>
                </div>

                {/* Coming Soon Badge */}
                {card.disabled && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Coming Soon
                    </span>
                  </div>
                )}

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${card.gradient} transform translate-x-16 -translate-y-16`}></div>
                </div>
                <div className="absolute bottom-0 left-0 w-24 h-24 opacity-5">
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${card.gradient} transform -translate-x-12 translate-y-12`}></div>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className={`absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            Ready to be part of the GrubGate family?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleCustomerClick}
              className="bg-grub-red text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-red-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {isAuthenticated ? '🚀 Start Planning' : '✨ Join as Customer'}
            </button>
            <button
              onClick={handlePartnerClick}
              className="border-2 border-grub-red text-grub-red px-8 py-4 rounded-xl font-semibold text-lg hover:bg-grub-red hover:text-white transition-all duration-300"
            >
              🏪 Become a Partner
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoleCards;
