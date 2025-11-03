import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo, Button } from '@grub-gate/ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faChevronDown, faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faInstagram, faLinkedin, faYoutube } from '@fortawesome/free-brands-svg-icons';
import PublicMobileBottomNav from './PublicMobileBottomNav';

const PublicLayout = ({ onLanguageChange }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isResourcesOpen, setIsResourcesOpen] = React.useState(false);

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
    onLanguageChange?.(newLang);
  };

  // Navigation items for desktop
  const navigationItems = [
    {
      type: 'route',
      href: '/',
      label: t('navigation.home', 'Home'),
      isActive: location.pathname === '/'
    },
    {
      type: 'scroll',
      href: '#benefits',
      label: t('navigation.benefits', 'Benefits'),
      isActive: false
    },
    {
      type: 'scroll', 
      href: '#how-it-works',
      label: t('navigation.howItWorks', 'How It Works'),
      isActive: false
    },
    {
      type: 'scroll',
      href: '#what-our-partners-say', 
      label: t('navigation.partnerReviews', 'Partner Reviews'),
      isActive: false
    },
    {
      type: 'route',
      href: '/faqs',
      label: t('navigation.faqs', 'FAQs'),
      isActive: location.pathname === '/faqs'
    }
  ];

  // Handle navigation clicks
  const handleNavigation = (item, e) => {
    e.preventDefault();

    if (item.type === 'route') {
      navigate(item.href);
    } else if (item.type === 'scroll') {
      if (location.pathname === '/') {
        // Update the URL hash without triggering an instant jump
        if (window?.history?.replaceState) {
          window.history.replaceState(null, '', item.href);
        }
        // Smooth scroll from current position
        const element = document.querySelector(item.href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // Navigate to home with hash using RR object form and tell ScrollManager to skip top scroll
        navigate(
          { pathname: '/', hash: item.href },
          { replace: false, state: { skipScrollTop: true } }
        );
        // LandingPage will handle smooth scrolling on mount via useEffect
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Completely left with no margin */}
            <div className="flex-shrink-0">
              <NavLink to="/" aria-label="Go to landing page" className="inline-flex items-center">
                <Logo size="md" />
              </NavLink>
            </div>

            {/* Navigation - Center */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavigation(item, e)}
                  className={`text-base font-medium transition-colors hover:text-grub-red ${
                    item.isActive 
                      ? 'text-grub-red border-b-2 border-grub-red pb-1' 
                      : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Actions - Desktop Only */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Language Switcher */}
              <button
                onClick={handleLanguageToggle}
                className="flex items-center space-x-1 text-gray-600 hover:text-grub-red transition-colors"
                title={t('common.language')}
              >
                <FontAwesomeIcon icon={faGlobe} className="h-4 w-4" />
                <span className="text-sm font-medium uppercase">
                  {i18n.language}
                </span>
              </button>

              {/* Sign In Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/login'}
              >
                {t('auth.login.signIn')}
              </Button>

              {/* Become Partner Button */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.href = '/register'}
              >
                {t('landingPage.hero.cta')}
              </Button>
            </div>
            
            {/* Mobile Actions - Simple Language Switcher Only */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={handleLanguageToggle}
                className="p-2 text-gray-600 hover:text-grub-red transition-colors"
                title={t('common.language')}
              >
                <FontAwesomeIcon icon={faGlobe} className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full bg-grub-red text-white mb-20 lg:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          {/* Company Info */}
          <div className="mb-8">
            <NavLink to="/" aria-label="Go to landing page" className="inline-flex mb-4">
              <Logo size="lg" />
            </NavLink>
            <p className="text-white/80 mb-4 text-sm md:text-base leading-relaxed">
              {t('footer.description', 'Join Montreal\'s leading restaurant network and grow your business with predictable revenue.')}
            </p>
          </div>

          {/* Quick Links, Contact, and Follow Us in Same Row */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12 mb-8">
            {/* Quick Links */}
            <div>
              <h3 className="text-base md:text-lg font-bold mb-3 sm:mb-4">
                {t('footer.quickLinksTitle', 'Quick Links')}
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <button 
                    onClick={(e) => handleNavigation({ type: 'scroll', href: '#benefits' }, e)}
                    className="text-white/80 hover:text-white transition-colors text-left text-sm md:text-base hover:translate-x-1 transform transition-transform duration-200 inline-block"
                  >
                    {t('landingPage.benefits.title', 'Benefits')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation({ type: 'scroll', href: '#how-it-works' }, e)}
                    className="text-white/80 hover:text-white transition-colors text-left text-sm md:text-base hover:translate-x-1 transform transition-transform duration-200 inline-block"
                  >
                    {t('landingPage.howItWorks.title', 'How It Works')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation({ type: 'scroll', href: '#what-our-partners-say' }, e)}
                    className="text-white/80 hover:text-white transition-colors text-left text-sm md:text-base hover:translate-x-1 transform transition-transform duration-200 inline-block"
                  >
                    {t('navigation.partnerReviews', 'Partner Reviews')}
                  </button>
                </li>
                <li>
                  <NavLink 
                    to="/faqs"
                    className="text-white/80 hover:text-white transition-colors text-sm md:text-base hover:translate-x-1 transform transition-transform duration-200 inline-block"
                  >
                    {t('navigation.faqs', 'FAQs')}
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-base md:text-lg font-bold mb-3 sm:mb-4">
                {t('footer.contactTitle', 'Contact Us')}
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-2 sm:gap-3">
                  <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 md:h-5 md:w-5 text-white/80 mt-0.5 flex-shrink-0" />
                  <a href="mailto:partners@grubgate.com" className="text-white/80 hover:text-white transition-colors text-xs sm:text-sm md:text-base break-all">
                    partners@grubgate.com
                  </a>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <FontAwesomeIcon icon={faPhone} className="h-4 w-4 md:h-5 md:w-5 text-white/80 mt-0.5 flex-shrink-0" />
                  <a href="tel:+15141234567" className="text-white/80 hover:text-white transition-colors text-xs sm:text-sm md:text-base">
                    +1 (514) 123-4567
                  </a>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4 md:h-5 md:w-5 text-white/80 mt-0.5 flex-shrink-0" />
                  <span className="text-white/80 text-xs sm:text-sm md:text-base">
                    Montreal, QC
                  </span>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-base md:text-lg font-bold mb-3 sm:mb-4">
                {t('footer.followUsTitle', 'Follow Us')}
              </h3>
              <div className="flex flex-wrap lg:flex-col gap-3">
                {/* Mobile: All in one row, Laptop: 3+2 layout */}
                <div className="flex gap-3 lg:w-full">
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white hover:text-grub-red rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Facebook"
                  >
                    <FontAwesomeIcon icon={faFacebook} className="h-5 w-5 md:h-6 md:w-6" />
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white hover:text-grub-red rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Twitter"
                  >
                    <FontAwesomeIcon icon={faTwitter} className="h-5 w-5 md:h-6 md:w-6" />
                  </a>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white hover:text-grub-red rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Instagram"
                  >
                    <FontAwesomeIcon icon={faInstagram} className="h-5 w-5 md:h-6 md:w-6" />
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white hover:text-grub-red rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 lg:hidden"
                    aria-label="LinkedIn"
                  >
                    <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5 md:h-6 md:w-6" />
                  </a>
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white hover:text-grub-red rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 lg:hidden"
                    aria-label="YouTube"
                  >
                    <FontAwesomeIcon icon={faYoutube} className="h-5 w-5 md:h-6 md:w-6" />
                  </a>
                </div>
                {/* Second row - Only visible on laptop */}
                <div className="hidden lg:flex gap-3">
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white hover:text-grub-red rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="LinkedIn"
                  >
                    <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5 md:h-6 md:w-6" />
                  </a>
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white hover:text-grub-red rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="YouTube"
                  >
                    <FontAwesomeIcon icon={faYoutube} className="h-5 w-5 md:h-6 md:w-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-6 sm:mt-8 md:mt-12 pt-4 sm:pt-6 md:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/70 text-xs md:text-sm text-center md:text-left">
                {t('footer.copyright', { year: new Date().getFullYear(), company: 'GrubGate' }, `© ${new Date().getFullYear()} GrubGate. All rights reserved.`)}
              </p>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm">
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Mobile Bottom Navigation */}
      <PublicMobileBottomNav />
    </div>
  );
};

export default PublicLayout;

