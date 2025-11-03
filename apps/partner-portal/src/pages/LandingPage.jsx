import React, { useEffect } from 'react';
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
  faPlay
} from '@fortawesome/free-solid-svg-icons';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@grub-gate/ui';
import { mockTestimonials } from '../lib/mock-data.js';
import PartnerTestimonialsSection from '../components/PartnerTestimonialsSection';
import PWAInstallButton from '../components/common/PWAInstallButton';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle hash navigation when component mounts
  useEffect(() => {
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
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-grub-red to-grub-red-dark text-white py-12 md:py-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="hero-section scroll-animate opacity-0 translate-y-6 transition-all duration-500 ease-out">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                {t('landingPage.hero.headline')}
              </h1>
              <p className="text-xl text-red-100 mb-8 leading-relaxed">
                {t('landingPage.hero.subheadline')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/register')}
                  className="bg-white text-grub-red px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {t('landingPage.hero.cta')}
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="text-white border-white hover:bg-white hover:text-grub-red px-8 py-4 rounded-lg font-semibold transition-all duration-200"
                >
                  Sign In
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white border-white hover:bg-white hover:text-grub-red"
                >
                  <FontAwesomeIcon icon={faPlay} className="mr-2 h-5 w-5" />
                  {t('landingPage.hero.learnMore')}
                </Button>
                <PWAInstallButton 
                  variant="secondary" 
                  className="text-grub-red hover:bg-white"
                />
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-red-100 text-sm">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('landingPage.benefits.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landingPage.benefits.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const iconDef = benefit.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-grub-red/10 rounded-full mb-6">
                      <FontAwesomeIcon icon={iconDef} className="h-8 w-8 text-grub-red" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('landingPage.howItWorks.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landingPage.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-grub-red text-white rounded-full text-xl font-bold mb-6">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Arrow connector for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <FontAwesomeIcon icon={faArrowRight} className="h-6 w-6 text-gray-400" />
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
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {t('landingPage.cta.title')}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {t('landingPage.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate('/register')}
                className="bg-grub-red text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {t('landingPage.cta.button')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="border-2 border-grub-red text-grub-red px-8 py-4 rounded-lg font-semibold hover:bg-grub-red hover:text-white transition-all duration-200"
              >
                Sign In
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="border-2 border-gray-300 text-gray-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200"
              >
                {t('landingPage.cta.contact')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
