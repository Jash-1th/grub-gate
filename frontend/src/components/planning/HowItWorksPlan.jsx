import React from 'react';
import { useTranslation } from 'react-i18next';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

// Step Card Component with Animation
const StepCard = ({ step, index }) => {
  const { t } = useTranslation();
  const [cardRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  // Icons for each step (using simple SVG icons for SSR safety)
  const getStepIcon = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return (
          <svg className="w-12 h-12 mx-auto mb-4 text-grub-red" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case 2:
        return (
          <svg className="w-12 h-12 mx-auto mb-4 text-grub-red" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
        );
      case 3:
        return (
          <svg className="w-12 h-12 mx-auto mb-4 text-grub-red" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H18V1h-2v1H8V1H6v1H4.5C3.11 2 2 3.11 2 4.5v15C2 20.89 3.11 22 4.5 22h15c1.39 0 2.5-1.11 2.5-2.5v-15C22 3.11 20.89 2 19.5 2zM20 19.5c0 .28-.22.5-.5.5h-15c-.28 0-.5-.22-.5-.5v-15c0-.28.22-.5.5-.5h15c.28 0 .5.22.5.5v15z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={cardRef} 
      className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center group scroll-animate ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="relative">
        {/* Step Number Badge */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-grub-red text-white rounded-full flex items-center justify-center text-sm font-bold">
          {index + 1}
        </div>
        
        {/* Step Icon */}
        {getStepIcon(index + 1)}
        
        {/* Step Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {t(`mealPlanning.howItWorks.steps.${step.id}.title`)}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {t(`mealPlanning.howItWorks.steps.${step.id}.description`)}
        </p>
      </div>
    </div>
  );
};

const HowItWorksPlan = () => {
  const { t } = useTranslation();
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  // Static data for the steps - can be moved to backend later
  const stepsData = [
    { id: '1' }, // Personalize Your Taste
    { id: '2' }, // Craft Your Schedule  
    { id: '3' }  // Subscribe & Enjoy
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div 
          ref={sectionRef}
          className={`text-center mb-16 scroll-animate ${isVisible ? 'is-visible' : ''}`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{ color: '#800020' }}>
            {t('mealPlanning.howItWorks.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('mealPlanning.howItWorks.subtitle')}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {stepsData.map((step, index) => (
            <StepCard key={step.id} step={step} index={index} />
          ))}
        </div>

        {/* Connecting Lines for Desktop */}
        <div className="hidden md:block relative -mt-16 mb-8">
          <div className="absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-grub-red/30 to-grub-red/30 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-grub-red/30 to-grub-red/30 transform -translate-y-1/2"></div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksPlan;
