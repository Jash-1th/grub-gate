import React from 'react';
import { useTranslation } from 'react-i18next';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useModal } from '../../context/ModalContext';
import { subscriptionPlans } from '../../data/subscriptionPlans';

// Individual Plan Card Component
const PlanCard = ({ plan, index }) => {
  const { t } = useTranslation();
  const { openSignupModal } = useModal();
  const [cardRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  const handleSelectPlan = () => {
    // For now, open signup modal - can be enhanced later with plan selection logic
    openSignupModal();
  };

  return (
    <div 
      ref={cardRef}
      className={`
        relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 
        scroll-animate ${isVisible ? 'is-visible' : ''}
        ${plan.color} border-2 ${plan.borderColor}
        ${plan.popular ? 'scale-105 shadow-2xl' : 'hover:scale-102'}
        h-full flex flex-col
      `}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-grub-red text-white px-4 py-1 rounded-full text-sm font-semibold">
            {t('mealPlanning.subscriptionPlans.mostPopular')}
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {t(`mealPlanning.subscriptionPlans.plans.${plan.id}.name`)}
        </h3>
        <div className="text-3xl font-bold text-grub-red mb-1">
          ${plan.price.monthly}
          <span className="text-lg text-gray-600 font-normal">/month</span>
        </div>
        {plan.price.savings > 0 ? (
          <div className="text-sm text-green-600 font-semibold min-h-[1.25rem]">
            Save ${plan.price.savings}/month
          </div>
        ) : (
          <div className="min-h-[1.25rem]"></div>
        )}
        <div className="text-sm text-gray-600 mt-2">
          {t(`mealPlanning.subscriptionPlans.plans.${plan.id}.deliveryFrequency`)}
        </div>
      </div>

      {/* Plan Description */}
      <div className="mb-6">
        <p className="text-gray-700 text-center text-sm leading-relaxed">
          {t('mealPlanning.subscriptionPlans.planDescription')}
        </p>
      </div>

      {/* Features List - Fixed height container */}
      <div className="mb-6 flex-1">
        <ul className="space-y-3">
          {plan.features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-start">
              <svg className="w-5 h-5 text-grub-red mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Benefits - Fixed height container */}
      <div className="mb-8 min-h-[8rem]">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">
          {t('mealPlanning.subscriptionPlans.benefits')}:
        </h4>
        <ul className="space-y-2">
          {plan.benefits.map((benefit, benefitIndex) => (
            <li key={benefitIndex} className="text-gray-600 text-sm flex items-start">
              <span className="w-1.5 h-1.5 bg-grub-red rounded-full mt-2 mr-2 flex-shrink-0"></span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button - Pushed to bottom */}
      <div className="mt-auto">
        <button
          onClick={handleSelectPlan}
          className={`
            w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${plan.popular 
              ? 'bg-grub-red text-white hover:bg-red-600 focus:ring-grub-red' 
              : 'bg-white text-grub-red border-2 border-grub-red hover:bg-grub-red hover:text-white focus:ring-grub-red'
            }
          `}
        >
          {t('mealPlanning.subscriptionPlans.selectPlan')}
        </button>
      </div>
    </div>
  );
};

const SubscriptionPlans = () => {
  const { t } = useTranslation();
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div 
          ref={sectionRef}
          className={`text-center mb-16 scroll-animate ${isVisible ? 'is-visible' : ''}`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{ color: '#800020' }}>
            {t('mealPlanning.subscriptionPlans.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('mealPlanning.subscriptionPlans.subtitle')}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {subscriptionPlans.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>

        {/* Additional Information */}
        <div className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-grub-red mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('mealPlanning.subscriptionPlans.importantInfo')}
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              {t('mealPlanning.subscriptionPlans.renewalInfo')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('mealPlanning.subscriptionPlans.features.cancelAnytime')}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('mealPlanning.subscriptionPlans.features.changePlans')}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('mealPlanning.subscriptionPlans.features.noHiddenFees')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionPlans;
