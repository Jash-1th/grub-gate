// src/components/home/WhyGrubGateSection.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

// Individual Benefit Card Component with Animation
const BenefitCard = ({ benefit }) => {
  const { t } = useTranslation();
  // Call the hook for each card with a low threshold for early triggering
  const [cardRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div 
      ref={cardRef} 
      className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center group scroll-animate ${isVisible ? 'is-visible' : ''}`}
    >
      <h3 className="text-xl font-bold text-gray-900 mb-4">{t(`benefits.${benefit.id}.title`)}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">{t(`benefits.${benefit.id}.description`)}</p>
      <ul className="text-sm text-gray-500 space-y-2 inline-block text-left">
        {Object.keys(t(`benefits.${benefit.id}.features`, { returnObjects: true })).map(key => (
          <li key={key} className="flex items-center">
            <span className="w-2 h-2 bg-[#800020] rounded-full mr-2"></span>
            {t(`benefits.${benefit.id}.features.${key}`)}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Individual Special Feature Card Component with Animation
const SpecialFeatureCard = ({ feature }) => {
  const { t } = useTranslation();
  // Call the hook for each feature card
  const [cardRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div 
      ref={cardRef}
      className={`text-center scroll-animate ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="text-2xl font-bold mb-2 text-gray-900">{feature.stat}</div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{t(`additionalFeatures.${feature.id}.title`)}</h4>
      <p className="text-gray-600 text-sm">{t(`additionalFeatures.${feature.id}.description`)}</p>
    </div>
  );
};

const WhyGrubGateSection = () => {
  const { t } = useTranslation();

  // Data for the benefit cards to make the code cleaner
  const benefitsData = [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' }
  ];

  // Data for the special features section
  const specialFeaturesData = [
    { id: '1', stat: 'stress free' },
    { id: '2', stat: '500+ restaurants' },
    { id: '3', stat: '24/7 available' },
    { id: '4', stat: '100% secure' }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{ color: '#800020' }}>
            {t('whyGrubGate.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('whyGrubGate.subtitle')}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefitsData.map(benefit => (
            <BenefitCard key={benefit.id} benefit={benefit} />
          ))}
        </div>

        {/* Special Features Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ color: '#800020' }}>
            {t('whyGrubGate.specialTitle')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {specialFeaturesData.map(feature => (
              <SpecialFeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default WhyGrubGateSection;