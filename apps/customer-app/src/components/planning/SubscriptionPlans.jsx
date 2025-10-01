import React from 'react';
import { useTranslation } from 'react-i18next';

const SubscriptionPlans = () => {
  const { t } = useTranslation();

  const plans = [
    {
      id: 'biweekly',
      name: 'Bi-Weekly Plan',
      price: '$19.99',
      period: 'every 2 weeks',
      description: 'Perfect for regular meal planning',
      features: [
        '14 days of meal planning',
        'Restaurant recommendations',
        'Dietary preferences support',
        'Mobile app access',
        'Email support',
        'Flexible scheduling'
      ],
      popular: false,
      color: 'blue'
    },
    {
      id: 'quarterly',
      name: '3 Months Plan',
      price: '$149.99',
      period: 'every 3 months',
      description: 'Best value for consistent planning',
      features: [
        'Everything in Bi-Weekly',
        '90 days of meal planning',
        'Advanced nutritional tracking',
        'Multiple dietary profiles',
        'Priority support',
        'Exclusive restaurant deals',
        '15% savings vs bi-weekly'
      ],
      popular: true,
      color: 'grub-red'
    },
    {
      id: 'biannual',
      name: '6 Months Plan',
      price: '$279.99',
      period: 'every 6 months',
      description: 'Maximum savings for committed users',
      features: [
        'Everything in 3 Months',
        '180 days of meal planning',
        'Personal meal consultant',
        'Custom meal plans',
        'Restaurant partnerships',
        '24/7 phone support',
        'Early access to new features',
        '25% savings vs bi-weekly'
      ],
      popular: false,
      color: 'purple'
    }
  ];

  const getColorClasses = (color, isPopular = false) => {
    const colors = {
      blue: {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
        accent: 'text-blue-800'
      },
      'grub-red': {
        border: 'border-red-200',
        bg: 'bg-red-50',
        text: 'text-grub-red',
        button: 'bg-grub-red hover:bg-red-600',
        accent: 'text-red-800'
      },
      purple: {
        border: 'border-purple-200',
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700',
        accent: 'text-purple-800'
      }
    };

    if (isPopular) {
      return {
        border: 'border-grub-red ring-2 ring-grub-red',
        bg: 'bg-red-50',
        text: 'text-grub-red',
        button: 'bg-grub-red hover:bg-red-600',
        accent: 'text-red-800'
      };
    }

    return colors[color] || colors.blue;
  };

  return (
    <div className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your meal planning needs. All plans include access to our restaurant network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-end">
          {plans.map((plan) => {
            const colors = getColorClasses(plan.color, plan.popular);
            
            return (
              <div
                key={plan.id}
                className={`relative bg-gray-50 rounded-2xl shadow-lg border-2 ${colors.border} p-8 transform transition-all duration-200 hover:scale-105 flex flex-col h-full`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-grub-red text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className={`text-4xl font-bold ${colors.accent}`}>
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <svg className={`w-5 h-5 ${colors.text} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors duration-200 ${colors.button} mt-auto`}>
                  Get Started
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
          <div className="flex flex-wrap justify-center items-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>No setup fees</span>
            </span>
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </span>
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>24/7 support</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
