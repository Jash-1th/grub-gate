import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowTrendUp, 
  faUsers, 
  faHeadphones, 
  faChartBar,
  faCheckCircle,
  faStar,
  faArrowRight,
  faPlay,
  faUtensils,
  faMobileAlt,
  faChartLine,
  faClock,
  faShieldAlt,
  faRocket,
  faBell,
  faGlobe
} from '@fortawesome/free-solid-svg-icons';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@grub-gate/ui';
import { mockTestimonials } from '../lib/mock-data.js';
import PartnerTestimonialsSection from '../components/PartnerTestimonialsSection';
import PWAInstallButton from '../components/common/PWAInstallButton';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Handle hash navigation when component mounts
  useEffect(() => {
    setIsVisible(true);
    // Check if there's a hash in the URL
    if (location.hash) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.hash]);

  const benefits = [
    {
      icon: faArrowTrendUp,
      title: t('landingPage.benefits.items.revenue.title'),
      description: t('landingPage.benefits.items.revenue.description')
    },
    {
      icon: faUsers,
      title: t('landingPage.benefits.items.growth.title'),
      description: t('landingPage.benefits.items.growth.description')
    },
    {
      icon: faHeadphones,
      title: t('landingPage.benefits.items.support.title'),
      description: t('landingPage.benefits.items.support.description')
    },
    {
      icon: faChartBar,
      title: t('landingPage.benefits.items.analytics.title'),
      description: t('landingPage.benefits.items.analytics.description')
    }
  ];

  const steps = [
    {
      number: '1',
      title: t('landingPage.howItWorks.steps.1.title'),
      description: t('landingPage.howItWorks.steps.1.description')
    },
    {
      number: '2',
      title: t('landingPage.howItWorks.steps.2.title'),
      description: t('landingPage.howItWorks.steps.2.description')
    },
    {
      number: '3',
      title: t('landingPage.howItWorks.steps.3.title'),
      description: t('landingPage.howItWorks.steps.3.description')
    },
    {
      number: '4',
      title: t('landingPage.howItWorks.steps.4.title'),
      description: t('landingPage.howItWorks.steps.4.description')
    }
  ];

  const stats = [
    { label: t('landingPage.hero.stats.partners'), value: '500+' },
    { label: t('landingPage.hero.stats.customers'), value: '50K+' },
    { label: t('landingPage.hero.stats.revenue'), value: '25%' },
    { label: t('landingPage.hero.stats.satisfaction'), value: '98%' }
  ];

  // Handle intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp');
          // Make sure the element stays visible after animation
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is in view
    });

    // Observe all sections with the 'scroll-animate' class
    const animateElements = document.querySelectorAll('.scroll-animate');
    animateElements.forEach((el) => observer.observe(el));
    
    // Force trigger animation for hero section immediately
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      heroSection.classList.add('animate-fadeInUp');
      heroSection.style.opacity = '1';
      heroSection.style.transform = 'translateY(0)';
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section className="bg-grub-red text-white py-12 md:py-16 lg:py-20 pb-20 md:pb-24 relative overflow-hidden">
        {/* Animated Background Elements - Subtle */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-20 -right-20 w-64 h-64 md:w-96 md:h-96 bg-black/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 md:w-[500px] md:h-[500px] bg-black/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 md:w-[600px] md:h-[600px] bg-black/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Centered Hero Content */}
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 bg-red-800/40 backdrop-blur-sm px-4 py-2 rounded-full mb-6 text-sm font-medium">
              <FontAwesomeIcon icon={faRocket} className="h-4 w-4" />
              <span>{t('landingPage.hero.badge')}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 mx-auto max-w-4xl">
              {t('landingPage.hero.headline')}
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-white/95 mb-8 leading-relaxed mx-auto max-w-3xl">
              {t('landingPage.hero.subheadline')}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/register')}
                className="bg-white/10 text-white border-2 border-white px-10 py-4 rounded-xl font-bold hover:bg-white hover:text-grub-red shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 text-base sm:text-lg"
              >
                {t('landingPage.hero.cta')}
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate('/login')}
                className="bg-transparent text-white border-2 border-white hover:!bg-white hover:!text-grub-red px-10 py-4 rounded-xl font-bold transition-all duration-300 text-base sm:text-lg"
              >
                {t('landingPage.hero.signIn')}
              </Button>
            </div>
            
            {/* Stats Row */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-4xl mx-auto mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/90 text-sm md:text-base font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Trust Indicators */}
            <div className="flex justify-center">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap">{t('landingPage.hero.trust.free')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap">{t('landingPage.hero.trust.noCard')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap">{t('landingPage.hero.trust.cancel')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16 scroll-animate">
            <div className="inline-flex items-center gap-2 bg-grub-red/10 text-grub-red px-4 py-2 rounded-full mb-4 text-sm font-semibold">
              <FontAwesomeIcon icon={faStar} className="h-4 w-4" />
              <span>{t('landingPage.benefits.badge')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
              {t('landingPage.benefits.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('landingPage.benefits.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {benefits.map((benefit, index) => {
              const iconDef = benefit.icon;
              return (
                <Card 
                  key={index} 
                  className="text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-grub-red/20 bg-white scroll-animate group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 md:p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-grub-red to-red-600 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FontAwesomeIcon icon={iconDef} className="h-8 w-8 md:h-10 md:w-10 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                      {benefit.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-4 text-sm font-semibold">
              <FontAwesomeIcon icon={faRocket} className="h-4 w-4" />
              <span>{t('landingPage.features.badge')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
              {t('landingPage.features.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('landingPage.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 scroll-animate text-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <FontAwesomeIcon icon={faMobileAlt} className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{t('landingPage.features.items.mobile.title')}</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {t('landingPage.features.items.mobile.description')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 scroll-animate text-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <FontAwesomeIcon icon={faChartLine} className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{t('landingPage.features.items.analytics.title')}</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {t('landingPage.features.items.analytics.description')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 scroll-animate text-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-green-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <FontAwesomeIcon icon={faBell} className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{t('landingPage.features.items.notifications.title')}</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {t('landingPage.features.items.notifications.description')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 scroll-animate text-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <FontAwesomeIcon icon={faUtensils} className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{t('landingPage.features.items.menu.title')}</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {t('landingPage.features.items.menu.description')}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 scroll-animate text-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-red-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <FontAwesomeIcon icon={faShieldAlt} className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{t('landingPage.features.items.payments.title')}</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {t('landingPage.features.items.payments.description')}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 scroll-animate text-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <FontAwesomeIcon icon={faGlobe} className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{t('landingPage.features.items.multilang.title')}</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {t('landingPage.features.items.multilang.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-600 px-4 py-2 rounded-full mb-4 text-sm font-semibold">
              <FontAwesomeIcon icon={faClock} className="h-4 w-4" />
              <span>{t('landingPage.howItWorks.badge')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
              {t('landingPage.howItWorks.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('landingPage.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative scroll-animate" style={{ animationDelay: `${index * 150}ms` }}>
                <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-grub-red/20 bg-white">
                  <CardContent className="p-6 md:p-8 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-grub-red to-red-600 text-white rounded-2xl text-xl md:text-2xl font-bold mb-6 shadow-lg">
                      {step.number}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                      {step.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Arrow connector for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 bg-grub-red/10 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 text-grub-red" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Testimonials Section */}
      <PartnerTestimonialsSection />

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="bg-grub-red rounded-3xl shadow-2xl overflow-hidden relative">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-black/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl"></div>
            </div>
            
            <div className="p-6 sm:p-8 md:p-12 lg:p-16 text-center relative z-10">
              <div className="inline-flex items-center gap-2 bg-red-800/40 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6 text-xs sm:text-sm font-semibold text-white">
                <FontAwesomeIcon icon={faRocket} className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{t('landingPage.cta.badge')}</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
                {t('landingPage.cta.title')}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/95 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2">
                {t('landingPage.cta.subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-6 sm:mb-8 px-2">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => navigate('/register')}
                  className="bg-white/10 text-white border-2 border-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold hover:bg-white hover:text-grub-red shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 text-sm sm:text-base md:text-lg w-full sm:w-auto"
                >
                  {t('landingPage.cta.button')}
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="bg-transparent border-2 border-white text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold hover:!bg-white hover:!text-grub-red transition-all duration-300 text-sm sm:text-base md:text-lg w-full sm:w-auto"
                >
                  {t('landingPage.cta.signIn')}
                </Button>
              </div>
              
              {/* Additional info */}
              <div className="flex justify-center">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 text-white/90 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                    <span className="font-medium whitespace-nowrap">{t('landingPage.hero.trust.free')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                    <span className="font-medium whitespace-nowrap">{t('landingPage.hero.trust.noCard')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                    <span className="font-medium whitespace-nowrap">{t('landingPage.hero.trust.cancel')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
