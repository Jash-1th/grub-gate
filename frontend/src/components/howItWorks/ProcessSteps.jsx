import React from 'react';
import { useTranslation } from 'react-i18next';
import locationImg from '../../assets/images/HowItWorks/Location.png';
import kitchenImg from '../../assets/images/HowItWorks/Restaurant.png';
import planImg from '../../assets/images/HowItWorks/ChoosePlan.png';
import deliveryImg from '../../assets/images/HowItWorks/PickUporDel.png';
import relaxImg from '../../assets/images/HowItWorks/Relax&Enjoy.png';

const ProcessSteps = () => {
  const { t } = useTranslation();

  const steps = [
    {
      id: 1,
      title: t('howItWorks.step1Title'),
      description: t('howItWorks.step1Description'),
      image: locationImg
    },
    {
      id: 2,
      title: t('howItWorks.step2Title'),
      description: t('howItWorks.step2Description'),
      image: kitchenImg
    },
    {
      id: 3,
      title: t('howItWorks.step3Title'),
      description: t('howItWorks.step3Description'),
      image: planImg
    },
    {
      id: 4,
      title: t('howItWorks.step4Title'),
      description: t('howItWorks.step4Description'),
      image: deliveryImg
    },
    {
      id: 5,
      title: t('howItWorks.step5Title'),
      description: t('howItWorks.step5Description'),
      image: relaxImg
    }
  ];

  return (
    <section id="how-it-works-steps" className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{color: '#800020'}}>
            {t('howItWorks.stepsTitle')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('howItWorks.stepsSubtitle')}
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {steps.map((step, index) => {
            const isEven = index % 2 === 1; // For alternating layout (0-indexed, so second card is index 1)
            
            return (
              <div key={step.id} className="relative mb-32 last:mb-0">
                {/* Step Card */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 lg:p-10 border border-gray-100 hover:border-gray-200">
                  <div className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-6 lg:gap-12`}>
                    
                    {/* Step Content */}
                    <div className="flex-1 text-center lg:text-left">
                      <div className="mb-4">
                        
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4" style={{color: '#800020'}}>
                        {step.title}
                      </h3>
                      <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        {step.description}
                      </p>
                    </div>

                    {/* Step Image */}
                    <div className="flex-shrink-0 w-full sm:w-80 lg:w-96">
                      <div className="w-full h-48 sm:h-56 lg:h-64 rounded-xl overflow-hidden shadow-lg">
                        <img
                          src={step.image}
                          alt={`${step.title} illustration`}
                          className="w-full h-full object-contain object-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Curved SVG Path Connector */}
                {index < steps.length - 1 && (
                  <>
                    {/* Desktop/Tablet: Enhanced S-Curved SVG Path */}
                    <div className="hidden md:block absolute left-0 right-0 pointer-events-none" style={{ top: '100%', height: '128px', zIndex: 1 }}>
                      <svg 
                        className="w-full h-full" 
                        viewBox="0 0 1000 128" 
                        preserveAspectRatio="none"
                        style={{ overflow: 'visible' }}
                      >
                        <path
                          d={isEven 
                            ? "M750 0 C750 32 650 32 550 48 C450 64 350 64 250 96 C200 112 200 128 250 128" // Enhanced S-curve from right to left
                            : "M250 0 C250 32 350 32 450 48 C550 64 650 64 750 96 C800 112 800 128 750 128" // Enhanced S-curve from left to right
                          }
                          stroke="#9CA3AF"
                          strokeWidth="2.5"
                          fill="none"
                          strokeDasharray="8,5"
                          opacity="0.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    {/* Mobile: Straight Vertical Dotted Line */}
                    <div className="md:hidden flex justify-center my-12">
                      <div 
                        className="w-0.5 h-16 opacity-75"
                        style={{
                          backgroundImage: 'linear-gradient(to bottom, #9CA3AF 60%, transparent 40%)',
                          backgroundSize: '2px 10px',
                          backgroundRepeat: 'repeat-y'
                        }}
                      ></div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-20 bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6" style={{color: '#800020'}}>
              {t('howItWorks.ctaTitle')}
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('howItWorks.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-grub-red text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                {t('howItWorks.startPlan')}
              </button>
              <button className="border-2 border-grub-red text-grub-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-grub-red hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                {t('howItWorks.learnMore')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
