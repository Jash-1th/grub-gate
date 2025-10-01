import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';

const GetStartedCTA = () => {
  const { t } = useTranslation();
  const { openSignupModal } = useModal();

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {t('getStartedCta.title')}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('getStartedCta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={openSignupModal}
              className="bg-grub-red text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform duration-200"
            >
              {t('getStartedCta.startPlan')}
            </button>
            <Link
              to="/restaurants"
              className="border-2 border-grub-red text-grub-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-grub-red hover:text-white transition-all duration-200"
            >
              {t('getStartedCta.learnMore')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetStartedCTA;
