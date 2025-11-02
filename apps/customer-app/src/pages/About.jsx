import React from 'react';
import { useTranslation } from 'react-i18next';
import TwoColumnSection from '../components/common/TwoColumnSection';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-r from-grub-red to-red-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('about.heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
            {t('about.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{color: '#800020'}}>
            {t('about.storyTitle')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {t('about.storySubtitle')}
          </p>
        </div>

        {/* Use TwoColumnSection for each section */}
        <div className="space-y-8">
          {(Array.isArray(t('about.sections', { returnObjects: true })) ? t('about.sections', { returnObjects: true }) : []).map((section, index) => (
            <TwoColumnSection
              key={section.id}
              title={section.title}
              description={section.description}
              image={section.image}
              reverse={index % 2 === 1}
            />
          ))}
        </div>
      </section>

      {/* Our Team Section */}
      {/* <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{color: '#800020'}}>
              {t('about.teamTitle')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.teamSubtitle')}
            </p>
          </div>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', role: t('about.team.ceo') },
              { name: 'Michael Chen', role: t('about.team.cto') },
              { name: 'Emily Rodriguez', role: t('about.team.coo') },
              { name: 'David Thompson', role: t('about.team.headMarketing') },
              { name: 'Lisa Wang', role: t('about.team.headCustomerExperience') },
              { name: 'James Wilson', role: t('about.team.headOperations') }
            ].map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center group"
              >
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full mx-auto bg-grub-red flex items-center justify-center text-white text-4xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-grub-red font-semibold mb-4">
                  {member.role}
                </p>
                <div className="w-12 h-1 bg-grub-red mx-auto rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Values Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-2" style={{color: '#800020'}}>
              {t('about.valuesTitle')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4 leading-relaxed">
              {t('about.valuesSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Partnership Value */}
            <div className="group">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-gray-100 hover:border-grub-red/20 transform hover:-translate-y-1">
                <div className="relative mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    🤝
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('about.values.partnershipTitle')}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('about.values.partnershipText')}
                </p>
              </div>
            </div>

            {/* Quality Value */}
            <div className="group">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-gray-100 hover:border-grub-red/20 transform hover:-translate-y-1">
                <div className="relative mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    ⭐
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('about.values.qualityTitle')}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('about.values.qualityText')}
                </p>
              </div>
            </div>

            {/* Innovation Value */}
            <div className="group">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-gray-100 hover:border-grub-red/20 transform hover:-translate-y-1">
                <div className="relative mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    🚀
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('about.values.innovationTitle')}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('about.values.innovationText')}
                </p>
              </div>
            </div>

            {/* Community Value */}
            <div className="group">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-gray-100 hover:border-grub-red/20 transform hover:-translate-y-1">
                <div className="relative mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    ❤️
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('about.values.communityTitle')}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('about.values.communityText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;