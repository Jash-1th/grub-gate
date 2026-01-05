import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#800020] to-[#b91c1c] text-red-100 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="text-xl font-extrabold text-white">GrubGate Dasher</div>
            <div className="mt-4 text-sm">
              Deliver smart. Earn predictably. The best way to gig.
            </div>
            <div className="mt-4 text-sm">
              <a href="#" className="hover:text-white transition-colors duration-200">
                Twitter
              </a>
              <span className="mx-2">|</span>
              <a href="#" className="hover:text-white transition-colors duration-200">
                LinkedIn
              </a>
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-white uppercase tracking-wider mb-4">Resources</div>
            <div className="space-y-3 text-sm">
              <a href="#" className="hover:text-white transition-colors duration-200">
                Help Center
              </a>
              <div>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Safety &amp; Insurance
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Earnings Guide
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Community Blog
                </a>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-white uppercase tracking-wider mb-4">Get Started</div>
            <div className="space-y-3 text-sm">
              <Link to="/register" className="hover:text-white transition-colors duration-200">
                Become a Runner
              </Link>
              <div>
                <Link to="/login" className="hover:text-white transition-colors duration-200">
                  Dasher Login
                </Link>
              </div>
              <div>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Download App
                </a>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-white uppercase tracking-wider mb-4">Legal</div>
            <div className="space-y-3 text-sm">
              <a href="#" className="hover:text-white transition-colors duration-200">
                Driver Terms of Service
              </a>
              <div>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Privacy Policy
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/15 md:flex md:items-center md:justify-between">
          <div className="text-sm">© 2025 GrubGate Inc. All rights reserved.</div>
          <div className="text-sm mt-4 md:mt-0">Made with ♥️ for Runners</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
