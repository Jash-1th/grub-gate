import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import '../common/hero-responsive.css';
// Use public path for SSR compatibility
const heroImage = '/images/HowItWorksHero.jpg';

const HeroHowItWorks = () => {
  const { t } = useTranslation();
  
  const scrollToSteps = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const section = document.getElementById('how-it-works-steps');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
      <div className="hero-content-left w-full">
        <div className="max-w-2xl" style={{ marginLeft: '20px'}}>
          <h3 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight sm:leading-snug md:leading-normal tracking-wide">
            {t('howItWorks.heroTitle')}<br />
            <span className="text-red-300">{t('howItWorks.heroSubtitle')}</span>
          </h3>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-100 mb-8 leading-relaxed sm:leading-relaxed md:leading-loose tracking-wide">
            {t('howItWorks.heroDescription')}
          </p>
          
          {/* CTA Button with frosted glass effect */}
          <div className="inline-flex items-center justify-center rounded-2xl bg-black/20 backdrop-blur-sm"
               style={{ width: 'fit-content', height: 'fit-content', padding: '0.5rem' }}>
            <button
              onClick={scrollToSteps}
              className="inline-block bg-grub-red text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-grub-red transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl tracking-wide"
            >
              {t('howItWorks.getStarted')}
            </button>
          </div>
        </div>
        
        {/* Stats */}
        {/* <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl">
          <div className="text-left">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              5
            </div>
            <div className="text-sm sm:text-base text-gray-200 font-medium">
              Simple Steps
            </div>
            <div className="text-xs sm:text-sm text-gray-300">
              To get started
            </div>
          </div>
          <div className="text-left">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              500+
            </div>
            <div className="text-sm sm:text-base text-gray-200 font-medium">
              Partner Restaurants
            </div>
            <div className="text-xs sm:text-sm text-gray-300">
              Ready to serve you
            </div>
          </div>
          <div className="text-left">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              25min
            </div>
            <div className="text-sm sm:text-base text-gray-200 font-medium">
              Average Delivery
            </div>
            <div className="text-xs sm:text-sm text-gray-300">
              Fast and fresh
            </div>
          </div>
          <div className="text-left">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              4.8★
            </div>
            <div className="text-sm sm:text-base text-gray-200 font-medium">
              Customer Rating
            </div>
            <div className="text-xs sm:text-sm text-gray-300">
              Highly satisfied
            </div>
          </div>
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

export default HeroHowItWorks;
