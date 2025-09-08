import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';

const GetStartedCTA = () => {
  const { t } = useTranslation();
  const { openSignupModal } = useModal();

  return (
    <section className="bg-gradient-to-r from-grub-red to-red-700 py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          {t('getStartedCta.title')}
        </h2>
        <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
          {t('getStartedCta.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={openSignupModal}
            className="bg-white text-grub-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform duration-200"
          >
            {t('getStartedCta.startPlan')}
          </button>
          <Link
            to="/restaurants"
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-grub-red transition-all duration-200"
          >
            {t('getStartedCta.learnMore')}
          </Link>
        </div>
        
        {/* Trust indicators */}
        {/* <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="text-white">
            <div className="text-2xl md:text-3xl font-bold">500+</div>
            <div className="text-red-100 text-sm">{t('getStartedCta.restaurants')}</div>
          </div>
          <div className="text-white">
            <div className="text-2xl md:text-3xl font-bold">50K+</div>
            <div className="text-red-100 text-sm">{t('getStartedCta.customers')}</div>
          </div>
          <div className="text-white">
            <div className="text-2xl md:text-3xl font-bold">25min</div>
            <div className="text-red-100 text-sm">{t('getStartedCta.avgDelivery')}</div>
          </div>
          <div className="text-white">
            <div className="text-2xl md:text-3xl font-bold">4.8★</div>
            <div className="text-red-100 text-sm">{t('getStartedCta.rating')}</div>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default GetStartedCTA;
