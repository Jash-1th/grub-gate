import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo, Button } from '@grub-gate/ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faChevronDown, faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import PublicMobileBottomNav from './PublicMobileBottomNav';
import { useAuth } from '../../contexts/AuthContext';

const PublicLayout = ({ onLanguageChange }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isResourcesOpen, setIsResourcesOpen] = React.useState(false);
  
  // Authentication context
  const { isAuthenticated, user, logout } = useAuth();

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
    onLanguageChange?.(newLang);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDashboard = () => {
    navigate('/dashboard');
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

              {/* Conditional Actions based on Authentication */}
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-2 text-gray-700">
                    <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {user?.firstName || 'Partner'}
                    </span>
                  </div>

                  {/* Dashboard Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDashboard}
                  >
                    Dashboard
                  </Button>

                  {/* Logout Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
            
            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center space-x-2">
              {/* Language Switcher */}
              <button
                onClick={handleLanguageToggle}
                className="p-2 text-gray-600 hover:text-grub-red transition-colors touch-target"
                title={t('common.language')}
              >
                <FontAwesomeIcon icon={faGlobe} className="h-5 w-5" />
              </button>

              {/* Mobile Auth Actions */}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-600 hover:text-red-700 transition-colors touch-target"
                  title="Logout"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="h-5 w-5" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-r from-grub-red to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <NavLink to="/" aria-label="Go to landing page" className="inline-flex mb-4">
                <Logo size="lg" />
              </NavLink>
              <p className="text-gray-300 mb-4 max-w-md">
                {t('footer.description')}
              </p>
              <p className="text-gray-400 text-sm">
                {t('footer.builtWithLove')}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {t('footer.quickLinksTitle')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={(e) => handleNavigation({ type: 'scroll', href: '#benefits' }, e)}
                    className="text-gray-300 hover:text-white transition-colors text-left"
                  >
                    {t('landingPage.benefits.title')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation({ type: 'scroll', href: '#how-it-works' }, e)}
                    className="text-gray-300 hover:text-white transition-colors text-left"
                  >
                    {t('landingPage.howItWorks.title')}
                  </button>
                </li>
                <li>
                  <button 
onClick={(e) => handleNavigation({ type: 'scroll', href: '#what-our-partners-say' }, e)}
                    className="text-gray-300 hover:text-white transition-colors text-left"
                  >
                    {t('navigation.partnerReviews', 'Partner Reviews')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {t('footer.followUsTitle')}
              </h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Facebook
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              {t('footer.copyright', { year: new Date().getFullYear(), company: 'GrubGate' })}
            </p>
          </div>
        </div>
      </footer>
      
      {/* Mobile Bottom Navigation */}
      <PublicMobileBottomNav />
    </div>
  );
};

export default PublicLayout;

