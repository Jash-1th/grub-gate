import React from 'react';
import locationImg from '../../assets/images/HowItWorks/Location.png';
import kitchenImg from '../../assets/images/HowItWorks/Restaurant.png';
import planImg from '../../assets/images/HowItWorks/ChoosePlan.png';
import deliveryImg from '../../assets/images/HowItWorks/PickUporDel.png';
import relaxImg from '../../assets/images/HowItWorks/Relax&Enjoy.png';

const ProcessSteps = () => {
  const steps = [
    {
      id: 1,
      title: 'Enter Your Location',
      description: 'Drop your address or pin your location. We instantly show you local restaurants offering subscription-based meals.',
      icon: '📍',
      image: locationImg
    },
    {
      id: 2,
      title: 'Discover Local Kitchens',
      description: 'Browse verified kitchens near you and select the type of meals they offer — Veg, Non-Veg, or both.',
      icon: '👨‍🍳',
      image: kitchenImg
    },
    {
      id: 3,
      title: 'Choose Your Meal Plan',
      description: 'Pick from flexible meal plans – daily, weekly, or monthly – according to your needs.',
      icon: '📋',
      image: planImg
    },
    {
      id: 4,
      title: 'Pick Up or Delivery',
      description: 'Choose to pick up your meals or have them delivered at your preferred timeslot.',
      icon: '🚚',
      image: deliveryImg
    },
    {
      id: 5,
      title: 'Relax & Enjoy',
      description: 'Get fresh, restaurant-prepped meals on time and enjoy your day – no cooking stress!',
      icon: '😋',
      image: relaxImg
    }
  ];

  return (
    <section id="how-it-works-steps" className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{color: '#800020'}}>
            How GrubGate Works
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Our simple 5-step process makes getting delicious meals delivered to your door effortless and convenient.
          </p>
        </div>

        {/* Process Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Step Card */}
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 lg:p-10 border border-gray-100 hover:border-gray-200">
                <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                  {/* Step Number and Icon */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-grub-red rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-md">
                        {step.id}
                      </div>
                      <div className="absolute -top-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center text-sm sm:text-lg shadow-sm border-2 border-gray-100">
                        {step.icon}
                      </div>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4" style={{color: '#800020'}}>
                      {step.title}
                    </h3>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                      {step.description}
                    </p>
                  </div>

                  {/* Step Image */}
                  <div className="flex-shrink-0 w-full sm:w-72 lg:w-80">
                    <div className="w-full h-40 sm:h-48 lg:h-56 rounded-xl overflow-hidden shadow-md">
                      <img
                        src={step.image}
                        alt={`Step ${step.id}: ${step.title}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector Arrow between cards */}
              {index < steps.length - 1 && (
                <div className="flex justify-center mt-8 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-110 transform group bg-grub-red/30 hover:bg-grub-red">
                    <svg
                      className="w-6 h-6 text-grub-red group-hover:text-white transition-colors duration-200"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                        clipRule="evenodd"
                        className="stroke-2 group-hover:stroke-[3]"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-20 bg-gray-50 rounded-3xl p-8 md:p-12">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6" style={{color: '#800020'}}>
              Ready to Get Started?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Join thousands of satisfied customers who have simplified their daily meals with GrubGate. 
              Fresh, delicious, and delivered right to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-grub-red text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl">
                Start Your Plan
              </button>
              <button className="border-2 border-grub-red text-grub-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-grub-red hover:text-white transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
