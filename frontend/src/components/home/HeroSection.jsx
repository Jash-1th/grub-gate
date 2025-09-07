import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { heroContent } from '../../data';
import heroImage from '../../assets/images/HeroHome.png';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${heroImage})`
      }}
    >
      {/* Frosted glass overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
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
          <Link
            to={heroContent.ctaButton.href} 
            className="inline-block bg-grub-red text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-grub-red transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {t('hero.getStarted')}
          </Link>
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
