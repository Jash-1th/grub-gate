import React from 'react';

// Use public path for SSR compatibility
const howItWorksImage = '/images/HowItWorks.png';

/**
 * Reusable component for navigation icons
 * @param {Object} props - Component props
 * @param {string} props.name - The name of the icon to render
 * @param {string} [props.className] - Additional CSS classes
 */
const NavIcon = ({ name, className = '' }) => {
  const baseClasses = 'w-4 h-4 md:w-5 md:h-5';
  const iconClasses = `${baseClasses} ${className}`.trim();

  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClasses}>
          <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" />
        </svg>
      );
    case 'about':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClasses}>
          <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0H5z" />
        </svg>
      );
    case 'howItWorks':
      return (
        <div className="flex items-center justify-center">
          <img 
            src={howItWorksImage} 
            alt="How It Works" 
            className="w-3 h-3 md:w-4 md:h-4 object-contain"
            loading="lazy"
            width={12}
            height={12}
          />
        </div>
      );
    case 'contact':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={iconClasses} fill="currentColor">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      );
    case 'faq':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClasses}>
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm2.07-7.75l-.9.92A3.5 3.5 0 0013 13h-2v-.5c0-.83.67-1.5 1.5-1.5.56 0 1.07-.31 1.34-.8l.37-.74a2 2 0 10-3.58-1.86l-.89.45A3.5 3.5 0 1115.07 9.25z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClasses}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
};

export default NavIcon;
