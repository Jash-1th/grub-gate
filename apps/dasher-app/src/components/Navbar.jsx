import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: '#fff',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '0.75rem 1rem',
          minHeight: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div
            className="cursor-pointer hover:opacity-80 transition-opacity"
            style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}
          >
            <span style={{ fontWeight: 950, letterSpacing: '-0.02em', color: 'var(--grub-red)' }}>GrubRunners</span>
          </div>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a
              href="#faq"
              className="navbar-faq"
              style={{
                textDecoration: 'none',
                color: '#111',
                fontWeight: 800,
                padding: '0.55rem 0.75rem',
                borderRadius: '10px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                background: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              FAQ
            </a>

            <Link
              to="/login"
              className="navbar-login hover:text-grub-red transition-colors duration-200 font-medium"
              style={{
                textDecoration: 'none',
                padding: '0.55rem 0.75rem',
                borderRadius: '10px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                background: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Login
            </Link>
          </div>

          <span
            className="navbar-divider"
            aria-hidden="true"
            style={{ width: '1px', height: '28px', background: 'rgba(0, 0, 0, 0.10)' }}
          />

          <Link
            to="/become-a-runner"
            className="bg-grub-red text-white font-black px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-opacity-90 transition-all duration-300 inline-flex items-center justify-center whitespace-nowrap"
            style={{
              textDecoration: 'none',
            }}
          >
            <span className="navbar-cta-desktop">Become a Runner</span>
            <span className="navbar-cta-mobile">Join</span>
          </Link>
        </nav>
      </div>

      <style>{`
        @media (max-width: 639px) {
          .navbar-faq { display: none !important; }
          .navbar-login { display: inline-flex !important; padding: 0.45rem 0.6rem !important; font-size: 0.92rem !important; }
          .navbar-divider { display: none !important; }
          .navbar-cta-desktop { display: none; }
          .navbar-cta-mobile { display: inline; }
        }
        @media (min-width: 640px) {
          .navbar-faq { display: inline-flex !important; }
          .navbar-login { display: inline-flex !important; }
          .navbar-divider { display: inline-block !important; }
          .navbar-cta-desktop { display: inline; }
          .navbar-cta-mobile { display: none; }
        }
      `}</style>
    </header>
  );
}

export default Navbar;
