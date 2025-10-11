import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../contexts/AuthContext';

const GetStartedCTA = () => {
  const { t } = useTranslation();
  const { openSignupModal } = useModal();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // User is logged in, navigate to plan page
      navigate('/plan');
    } else {
      // User is not logged in, open signup modal
      openSignupModal();
    }
  };

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
          <div className="flex justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-grub-red text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform duration-200"
            >
              {isAuthenticated ? 'Start Planning' : t('getStartedCta.startPlan')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetStartedCTA;
