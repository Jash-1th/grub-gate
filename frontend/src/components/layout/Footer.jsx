import React from 'react';
import { Link } from 'react-router-dom';
import { navigation, siteInfo } from '../../data';
import logoImage from '../../assets/images/logo.png';
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-grub-red text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo + Tagline */}
          <div className="space-y-3">
            {/* <div className="text-2xl font-bold text-white">{siteInfo.logoText}</div> */}
            <div className="flex-shrink-0 order-1">
            <Link to="/" className="flex items-center">
              <div className="flex items-center">
                {/* Logo Image */}
                <img 
                  src={logoImage} 
                  alt={siteInfo.logoText}
                  className="h-8 w-auto sm:h-10 md:h-12 object-contain"
                />
              </div>
            </Link>
          </div>
            <p className="text-red-100 text-sm">Built with ❤️ by GrubGate.</p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              {navigation.footer.quickLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-red-100 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social + Newsletter */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white">Follow Us</h4>
              <div className="flex space-x-4">
                {navigation.footer.social.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-100 hover:text-white transition-colors duration-200"
                    aria-label={item.name}
                  >
                    <span className="sr-only">{item.name}</span>
                    <div className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200">
                      <span className="text-xs font-bold text-grub-red">
                        {item.icon === 'facebook' ? 'f' : 
                         item.icon === 'instagram' ? 'i' :
                         item.icon === 'twitter' ? 't' : 'in'}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-3 py-2 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none"
                aria-label="Email address"
              />
              <button type="button" className="bg-white text-grub-red px-4 py-2 rounded-md font-semibold hover:bg-red-50">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar: Legal */}
        <div className="mt-6 pt-6 border-t border-red-300">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <p className="text-red-100 text-sm">© {currentYear} {siteInfo.name}. All rights reserved.</p>
            <div className="flex items-center space-x-6 text-sm">
              {navigation.footer.legal.map((item) => (
                <Link key={item.name} to={item.href} className="text-red-100 hover:text-white">
                  {item.name}
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
