import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { navigation } from '../../data';
import { useAuth } from '../../contexts/AuthContext';
// const howItWorksImage = '/images/HowItWorks.png';

const getNavIcon = (key) => {
  switch (key) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" />
        </svg>
      );
    case 'about':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0H5z" />
        </svg>
      );
    case 'howItWorks':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
        </svg>
      );
    case 'contact':
      return (
        <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 84.04" className="w-6 h-6"><title>call-message</title><path d="M34.11,3h83a5.8,5.8,0,0,1,5.79,5.79V70.27a5.76,5.76,0,0,1-1,3.25,2.32,2.32,0,0,1-.55.82,2.2,2.2,0,0,1-.54.38,5.78,5.78,0,0,1-3.7,1.35H68a15.44,15.44,0,0,0,.42-4.45h47.22L84.8,39.23,74.62,47.91h0a2.22,2.22,0,0,1-2.84,0L61.1,39.23h0l-9.69,9.71A12.4,12.4,0,0,0,47,47.07L57.64,36.41,37.91,20.32a14,14,0,0,0-.68-3.42l-.79-3.49L73.15,43.34,115.26,7.46H35.11L34.11,3ZM17.46,31a61.46,61.46,0,0,0,4.73,14.91A51.89,51.89,0,0,0,32.61,60.48a1.47,1.47,0,0,0,1.17.45,5.31,5.31,0,0,0,2-.67,17.91,17.91,0,0,0,2.1-1.36c3.14-2.18,7-4.89,10.29-1.85.08.07.12.14.2.2L58.84,68.78a1.13,1.13,0,0,1,.1.13,6.09,6.09,0,0,1,.79,5.77,14.31,14.31,0,0,1-3.94,5.76,13.76,13.76,0,0,1-7.94,3.46,29.8,29.8,0,0,1-8.28-.4,27.16,27.16,0,0,1-11.31-4.73,54.16,54.16,0,0,1-9.86-9.43l-.24-.29c-1.52-1.8-3.16-3.73-4.69-5.88A78.72,78.72,0,0,1,1,34.34C-.72,25.59-.37,16.85,3.33,9.62c2-4,5.06-7.2,9-8.69,3.44-1.32,7.51-1.34,12.13.63a1.67,1.67,0,0,1,1,1.24l3.73,16.58a4.57,4.57,0,0,1-.82,4.88,9.43,9.43,0,0,1-4.29,2.5c-.56.24-1.21.45-1.9.67-2.27.74-4.86,1.61-4.73,3.65v0Zm70.72,5.33,30.26,31.73V10.58L88.18,36.36Z"/></svg>
      );
    case 'faq':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm2.07-7.75l-.9.92A3.5 3.5 0 0013 13h-2v-.5c0-.83.67-1.5 1.5-1.5.56 0 1.07-.31 1.34-.8l.37-.74a2 2 0 10-3.58-1.86l-.89.45A3.5 3.5 0 1115.07 9.25z" />
        </svg>
      );
    case 'yourOrders':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM9 17l3-4 2 3 3-4 3 5H9z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
};

const MobileBottomNav = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth() || { isAuthenticated: false };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[max(env(safe-area-inset-bottom),0px)]">
      {/* Main Navigation */}
      <ul className="flex items-stretch justify-between px-2 py-2 overflow-hidden">
        {navigation.main
          .filter(item => !item.protected || isAuthenticated)
          .map((item) => (
          <li key={item.name} className="flex-1 min-w-0 overflow-hidden">
            <NavLink
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) => `flex min-w-0 w-full overflow-hidden flex-col items-center justify-center h-14 text-[11px] leading-tight font-medium transition-all duration-200 rounded-lg mx-0.5 ${
                isActive 
                  ? 'text-grub-red bg-red-50' 
                  : 'text-gray-600 hover:text-grub-red hover:bg-gray-50'
              }`}
              aria-label={t(`nav.${item.name}`)}
            >
              <div className="flex items-center justify-center h-5 w-5 mb-1 flex-shrink-0">
                {getNavIcon(item.name)}
              </div>
              <div className="flex items-center justify-center h-4 text-center min-w-0 w-full px-0.5">
                <span className="block w-full overflow-hidden text-ellipsis whitespace-nowrap" title={t(`nav.${item.name}`)}>
                  {t(`nav.${item.name}`)}
                </span>
              </div>
            </NavLink>
          </li>
        ))}
      </ul>
      
    </nav>
  );
};

export default MobileBottomNav;


