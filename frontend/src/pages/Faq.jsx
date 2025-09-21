import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AccordionItem from '../components/faq/AccordionItem';
import { faqData } from '../data/faqData';

const Faq = () => {
  const { t } = useTranslation();
  const [openItem, setOpenItem] = useState(null);

  const handleToggle = (categoryKey, questionIndex) => {
    const itemKey = `${categoryKey}-${questionIndex}`;
    setOpenItem(openItem === itemKey ? null : itemKey);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-r from-grub-red to-red-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('faq.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
            {t('faq.subtitle')}
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Introduction */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6" style={{color: '#800020'}}>
              {t('faq.helpTitle')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {t('faq.helpSubtitle')}
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-12">
            {Object.entries(faqData).map(([categoryKey, category]) => (
              <div key={categoryKey} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                {/* Category Header */}
                <div className="mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" style={{color: '#800020'}}>
                    {t(`faq.categories.${categoryKey}.title`)}
                  </h3>
                  <div className="w-16 h-1 bg-grub-red rounded-full"></div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <AccordionItem
                      key={`${categoryKey}-${index}`}
                      question={t(`faq.categories.${categoryKey}.questions.${index}.question`)}
                      answer={t(`faq.categories.${categoryKey}.questions.${index}.answer`)}
                      isOpen={openItem === `${categoryKey}-${index}`}
                      onToggle={() => handleToggle(categoryKey, index)}
                      index={`${categoryKey}-${index}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" style={{color: '#800020'}}>
                {t('faq.contactTitle')}
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                {t('faq.contactSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-grub-red font-semibold text-base rounded-lg border-2 border-grub-red hover:bg-grub-red hover:text-white active:bg-red-700 active:border-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {t('faq.contactSupport')}
                </Link>
                <a
                  href="tel:+1-555-GRUB-GATE"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-grub-red font-semibold text-base rounded-lg border-2 border-grub-red hover:bg-grub-red hover:text-white active:bg-red-700 active:border-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {t('faq.callUs')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Faq;
