import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faSignInAlt,
  faUserPlus,
  faGlobe,
  faCommentDots
} from '@fortawesome/free-solid-svg-icons';

/**
 * Mobile Bottom Navigation Component for Partner Portal Public Pages
 * Shows on mobile devices only for non-dashboard pages
 */
const PublicMobileBottomNav = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Public page navigation items for mobile
  const publicNavigation = [
    { 
      name: 'home', 
      href: '/', 
      icon: faHome,
      label: t('common.home', 'Home')
    },
    { 
      name: 'login', 
      href: '/login', 
      icon: faSignInAlt,
      label: t('auth.login.signIn', 'Sign In')
    },
    { 
      name: 'register', 
      href: '/register', 
      icon: faUserPlus,
      label: t('auth.register.getStarted', 'Join Us')
    },
    { 
      name: 'language', 
      href: '#', 
      icon: faGlobe,
      label: i18n.language.toUpperCase(),
      onClick: () => {
        const newLang = i18n.language === 'en' ? 'fr' : 'en';
        i18n.changeLanguage(newLang);
      }
    },
    { 
      name: 'faqs', 
      href: '/faqs', 
      icon: faCommentDots,
      label: t('common.faqs', 'FAQs')
    }
  ];

  // Only show on public routes (not dashboard)
  if (location.pathname.startsWith('/dashboard')) {
    return null;
  }

  const isCurrentPath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (item, e) => {
    if (item.onClick) {
      e.preventDefault();
      item.onClick();
    } else if (item.href !== '#') {
      navigate(item.href);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[max(env(safe-area-inset-bottom),0px)]">
      {/* Main Navigation */}
      <ul className="flex items-stretch justify-between px-2 py-2">
        {publicNavigation.map((item) => {
          const iconDef = item.icon;
          const isActive = item.href !== '#' && isCurrentPath(item.href);
          
          return (
            <li key={item.name} className="flex-1 min-w-0">
              {item.href === '#' ? (
                <button
                  onClick={(e) => handleNavClick(item, e)}
                  className="flex w-full flex-col items-center justify-center h-14 text-[11px] leading-tight font-medium transition-all duration-200 rounded-lg mx-0.5 text-gray-600 hover:text-grub-red hover:bg-gray-50"
                  aria-label={item.label}
                >
                  <div className="flex items-center justify-center h-6 w-6 mb-1 flex-shrink-0">
                    <FontAwesomeIcon icon={iconDef} className="h-5 w-5" />
                  </div>
                  <div className="flex items-center justify-center h-4 text-center min-w-0 w-full px-0.5">
                    <span 
                      className="block w-full overflow-hidden text-ellipsis whitespace-nowrap" 
                      title={item.label}
                    >
                      {item.label}
                    </span>
                  </div>
                </button>
              ) : (
                <NavLink
                  to={item.href}
                  end={item.href === '/'}
                  className={`flex flex-col items-center justify-center h-14 text-[11px] leading-tight font-medium transition-all duration-200 rounded-lg mx-0.5 ${
                    isActive 
                      ? 'text-grub-red bg-red-50' 
                      : 'text-gray-600 hover:text-grub-red hover:bg-gray-50'
                  }`}
                  aria-label={item.label}
                  onClick={(e) => handleNavClick(item, e)}
                >
                  <div className="flex items-center justify-center h-6 w-6 mb-1 flex-shrink-0">
                    <FontAwesomeIcon icon={iconDef} className="h-5 w-5" />
                  </div>
                  <div className="flex items-center justify-center h-4 text-center min-w-0 w-full px-0.5">
                    <span 
                      className="block w-full overflow-hidden text-ellipsis whitespace-nowrap" 
                      title={item.label}
                    >
                      {item.label}
                    </span>
                  </div>
                </NavLink>
              )}
            </li>
          );
        })}
      </ul>
      
      {/* GrubGate branding indicator */}
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
        <div className="h-1 w-8 bg-grub-red rounded-full opacity-60" />
      </div>
    </nav>
  );
};

export default PublicMobileBottomNav;