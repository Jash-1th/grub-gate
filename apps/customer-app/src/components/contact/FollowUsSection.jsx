import React from 'react';
import { useTranslation } from 'react-i18next';
import { navigation } from '../../data/navigation';

const FollowUsSection = () => {
  const { t } = useTranslation();
  // Social media icons mapping
  const getSocialIcon = (name) => {
    const iconMap = {
      'Facebook': (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      'Instagram': (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 15 15">
          <path d="M7.5 5C6.11929 5 5 6.11929 5 7.5C5 8.88071 6.11929 10 7.5 10C8.88071 10 10 8.88071 10 7.5C10 6.11929 8.88071 5 7.5 5Z" fill="currentColor"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M4.5 0C2.01472 0 0 2.01472 0 4.5V10.5C0 12.9853 2.01472 15 4.5 15H10.5C12.9853 15 15 12.9853 15 10.5V4.5C15 2.01472 12.9853 0 10.5 0H4.5ZM4 7.5C4 5.567 5.567 4 7.5 4C9.433 4 11 5.567 11 7.5C11 9.433 9.433 11 7.5 11C5.567 11 4 9.433 4 7.5ZM11 4H12V3H11V4Z" fill="currentColor"/>
        </svg>
      ),
      'Twitter': (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      'LinkedIn': (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    };
    return iconMap[name] || (
      <span className="text-white font-bold text-sm">{name.charAt(0).toUpperCase()}</span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 lg:p-10">
      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center px-2" style={{color: '#800020'}}>
        {t('contact.social.title')}
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-4xl mx-auto">
        {navigation.footer.social.map((social, index) => (
          <a
            key={index}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 rounded-xl hover:bg-gray-50 transition-all duration-300 group border border-transparent hover:border-grub-red/20 hover:shadow-md transform hover:-translate-y-1"
            aria-label={`Follow us on ${social.name}`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-grub-red to-red-700 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-300 mb-2 sm:mb-3">
              <div className="scale-75 sm:scale-100 md:scale-110">
                {getSocialIcon(social.name)}
              </div>
            </div>
            <span className="text-xs sm:text-sm md:text-base font-medium text-gray-700 group-hover:text-grub-red transition-colors duration-300 text-center leading-tight">
              {social.name}
            </span>
          </a>
        ))}
      </div>
      
      {/* Additional CTA text for better engagement */}
      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
          Stay connected with us for the latest updates, special offers, and delicious food inspiration!
        </p>
      </div>
    </div>
  );
};

export default FollowUsSection;
