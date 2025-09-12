import React from 'react';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import '../common/hero-responsive.css';
// Use public path for SSR compatibility
const heroImage = '/images/HeroHome.jpg';

const HeroSection = () => {
  const { t } = useTranslation();
  const { openSignupModal } = useModal();
  
  // Debug logging
  console.log('🎭 HeroSection loading, image path:', heroImage);

  return (
    <section 
      className="hero-section-responsive"
      style={{
        backgroundImage: `url(${heroImage})`
      }}
    >
      {/* Frosted glass overlay */}
      <div className="hero-overlay"></div>
      
      {/* Content */}
      <div className="hero-content px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          {t('hero.title')}
          <br />
          <span className="text-red-300">{t('hero.subtitle')}</span>
        </h1>
       
        
        <p className="text-lg sm:text-xl md:text-2xl text-gray-100 mb-8 max-w-4xl mx-auto leading-relaxed">
          {t('hero.description')}
        </p>
        
        {/* CTA Button with frosted glass effect */}
        <div className="inline-flex items-center justify-center rounded-2xl bg-black/20 backdrop-blur-sm mx-auto"
             style={{ width: 'fit-content', height: 'fit-content', padding: '0.5rem' }}>
          <button
            onClick={openSignupModal}
            className="inline-block bg-grub-red text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-grub-red transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
          >
            {t('hero.getStarted')}
          </button>
        </div>
        
        {/* Stats */}
        {/* <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {heroContent.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-sm sm:text-base text-gray-200 font-medium">
                {stat.label}
              </div>
              <div className="text-xs sm:text-sm text-gray-300">
                {stat.description}
              </div>
            </div>
          ))}
        </div> */}
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
