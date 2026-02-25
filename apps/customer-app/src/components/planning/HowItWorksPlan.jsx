import React from 'react';
import { useTranslation } from 'react-i18next';

const HowItWorksPlan = () => {
  const { t } = useTranslation();

  const steps = [
    {
      id: 1,
      title: 'Enter Your Location',
      description: 'Tell us your postal code and dietary preferences to get personalized recommendations',
      icon: '📍',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Browse Restaurants',
      description: 'Discover amazing restaurants near you with detailed menus and ratings',
      icon: '🍽️',
      color: 'green'
    },
    {
      id: 3,
      title: 'Plan Your Week',
      description: 'Select meals for each day of the week and create your perfect meal plan',
      icon: '📅',
      color: 'purple'
    },
    {
      id: 4,
      title: 'Enjoy Your Meals',
      description: 'Follow your plan and enjoy delicious meals from your favorite restaurants',
      icon: '😋',
      color: 'red'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200'
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-grub-red',
        border: 'border-red-200'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Planning your perfect week of meals is simple with GrubGate. Follow these easy steps to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const colors = getColorClasses(step.color);
            
            return (
              <div key={step.id} className="relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gray-200 transform translate-x-4 z-0">
                    <div className="absolute right-0 top-1/2 transform translate-y-[-50%] translate-x-1">
                      <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                <div className="relative z-10 text-center">
                  {/* Step Icon */}
                  <div className={`w-32 h-32 mx-auto mb-6 ${colors.bg} ${colors.border} border-2 rounded-full flex items-center justify-center`}>
                    <span className="text-4xl">{step.icon}</span>
                  </div>

                  {/* Step Number */}
                  <div className={`inline-flex items-center justify-center w-8 h-8 ${colors.bg} ${colors.text} rounded-full font-bold text-sm mb-4`}>
                    {step.id}
                  </div>

                  {/* Step Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-grub-red via-grub-red to-grub-red rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Start Planning?
            </h3>
            <p className="text-red-100 mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have transformed their meal planning experience with GrubGate.
            </p>
            <button className="bg-white text-grub-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPlan;
