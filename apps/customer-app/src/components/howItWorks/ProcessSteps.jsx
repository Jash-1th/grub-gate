import React from 'react';
import { useTranslation } from 'react-i18next';
import TwoColumnSection from '../common/TwoColumnSection';
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

        {/* Process Steps - Using TwoColumnSection */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <TwoColumnSection
              key={step.id}
              title={step.title}
              description={step.description}
              image={step.image}
              reverse={index % 2 === 1}
            />
          ))}
        </div>

        {/* Additional Info */}
        {/* <div className="mt-20 bg-white rounded-3xl p-8 md:p-12 shadow-lg">
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
        </div> */}
      </div>
    </section>
  );
};

export default ProcessSteps;
