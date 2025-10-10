import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import '../common/hero-responsive.css';
// Use public path for SSR compatibility
const heroImage = '/images/HeroHome.jpg';

const HeroSection = () => {
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
       
        
        <p className="text-lg sm:text-xl md:text-2xl text-gray-100 mb-8 max-w-4xl mx-auto leading-relaxed px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24">
          {t('hero.description')}
        </p>
        
        {/* Enhanced CTA Button - Next Step Highlight */}
        <div className="relative inline-flex items-center justify-center mx-auto">
          {/* Animated glow ring */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-grub-red via-red-600 to-grub-red opacity-75 blur-lg animate-pulse"></div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-grub-red via-red-600 to-grub-red opacity-50 animate-ping"></div>
          
          {/* Glass container */}
          <div className="relative rounded-2xl bg-black/30 backdrop-blur-md p-1 border border-white/20">
            <button
              onClick={handleGetStarted}
              className="group relative px-10 py-5 bg-gradient-to-r from-grub-red via-red-600 to-red-700 text-white rounded-xl font-bold text-xl shadow-2xl hover:shadow-red-500/50 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 overflow-hidden"
            >
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Next Step Badge */}
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-black shadow-lg animate-bounce">
                NEXT STEP
              </div>
              
              {/* Button content */}
              <div className="relative flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-wide">
                  {isAuthenticated ? 'Start Planning' : t('hero.getStarted')}
                </span>
              </div>
              
              {/* Sparkle effects */}
              <div className="absolute top-1 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-ping delay-100"></div>
              <div className="absolute bottom-2 right-6 w-1 h-1 bg-white rounded-full animate-ping delay-300"></div>
              <div className="absolute top-3 right-12 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping delay-500"></div>
            </button>
          </div>
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
