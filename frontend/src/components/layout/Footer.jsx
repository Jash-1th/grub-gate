import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { navigation, siteInfo } from '../../data';
// Use public path for SSR compatibility
const logoImage = '/icons/logo192.png';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  // Social media icons mapping
  const getSocialIcon = (name) => {
    const iconMap = {
      'Facebook': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      'Instagram': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 15 15">
          <path d="M7.5 5C6.11929 5 5 6.11929 5 7.5C5 8.88071 6.11929 10 7.5 10C8.88071 10 10 8.88071 10 7.5C10 6.11929 8.88071 5 7.5 5Z" fill="currentColor"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M4.5 0C2.01472 0 0 2.01472 0 4.5V10.5C0 12.9853 2.01472 15 4.5 15H10.5C12.9853 15 15 12.9853 15 10.5V4.5C15 2.01472 12.9853 0 10.5 0H4.5ZM4 7.5C4 5.567 5.567 4 7.5 4C9.433 4 11 5.567 11 7.5C11 9.433 9.433 11 7.5 11C5.567 11 4 9.433 4 7.5ZM11 4H12V3H11V4Z" fill="currentColor"/>
        </svg>
      ),
      'Twitter': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      'LinkedIn': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    };
    return iconMap[name] || (
      <span className="text-white font-bold text-xs">{name.charAt(0).toUpperCase()}</span>
    );
  };

  return (
    <footer className="w-full bg-grub-red text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo + Tagline */}
          <div className="space-y-3">
            {/* <div className="text-2xl font-bold text-white">{siteInfo.logoText}</div> */}
            <div className="flex-shrink-0 order-1">
            <Link to="/" className="flex items-center">
            <div className="flex items-center">
  {/* Logo Image - Larger & Fully Responsive */}
  <img
    src={logoImage}
    alt={siteInfo.logoText}
    className="
      h-14 w-28     
      sm:h-16 sm:w-32  
      md:h-20 md:w-100  
      object-contain  
      ml-2.5         
      rounded-lg     
      transition-all duration-300 ease-in-out
    "
    
  />
          </div>
            </Link>
          </div>
            <p className="text-red-100 text-sm">{t('footer.builtWithLove')}</p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">{t('footer.quickLinksTitle')}</h3>
            <ul className="space-y-2">
              {navigation.footer.quickLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-red-100 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {t(`nav.${item.name}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social + Newsletter */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white">{t('footer.followUsTitle')}</h4>
              <div className="flex space-x-4">
                {navigation.footer.social.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-100 hover:text-white transition-colors duration-200 group"
                    aria-label={item.name}
                  >
                    <span className="sr-only">{item.name}</span>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-200 group-hover:scale-110 transform">
                      {getSocialIcon(item.name)}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <form className="flex space-x-2">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="w-full px-3 py-2 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none"
                aria-label="Email address"
              />
              <button type="button" className="bg-white text-grub-red px-4 py-2 rounded-md font-semibold hover:bg-red-50">
                {t('footer.subscribeButton')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar: Legal */}
        <div className="mt-6 pt-6 border-t border-red-300">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <p className="text-red-100 text-sm">{t('footer.copyright', { year: currentYear, company: siteInfo.name })}</p>
            <div className="flex items-center space-x-6 text-sm">
              {navigation.footer.legal.map((item) => (
                <Link key={item.name} to={item.href} className="text-red-100 hover:text-white">
                  {t(`footer.legal.${item.name.toLowerCase()}`)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
