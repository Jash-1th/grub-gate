import React from 'react';
import { useTranslation } from 'react-i18next';
import { benefits, additionalFeatures } from '../../data';

const WhyGrubGateSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Benefits */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold  mb-6" style={{color: '#800020'}}>
            {t('whyGrubGate.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('whyGrubGate.subtitle')}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center group"
            >
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t(`benefits.${benefit.id}.title`)}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t(`benefits.${benefit.id}.description`)}
              </p>
              <ul className="text-sm text-gray-500 space-y-2 inline-block text-left">
                {benefit.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-[#800020] rounded-full mr-2"></span>
                    {t(`benefits.${benefit.id}.features.${index}`)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <h3 className="text-2xl md:text-3xl font-bold text-center  mb-12" style={{color: '#800020'}}>
            {t('whyGrubGate.specialTitle')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalFeatures.map((feature) => (
              <div key={feature.id} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <div className="text-2xl font-bold mb-2 text-gray-900" >
                  {feature.stats}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {t(`additionalFeatures.${feature.id}.title`)}
                </h4>
                <p className="text-gray-600 text-sm">
                  {t(`additionalFeatures.${feature.id}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};  

export default WhyGrubGateSection;
