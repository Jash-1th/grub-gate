import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isMenuOpen]);

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
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <img src="/logo192.png" alt="Grub-Gate" className="h-7 w-auto object-contain" loading="lazy"  style={{marginBottom : "5px"}}/>
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
              to="/runner-types"
              className="navbar-runner-types hover:text-grub-red transition-colors duration-200 font-medium"
              style={{
                textDecoration: 'none',
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
              Runner Types
            </Link>

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

          <button
            type="button"
            className="navbar-menu-btn"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
            style={{
              appearance: 'none',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              background: '#fff',
              borderRadius: '12px',
              padding: '0.55rem 0.7rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <span
            className="navbar-divider"
            aria-hidden="true"
            style={{ width: '1px', height: '28px', background: 'rgba(0, 0, 0, 0.10)' }}
          />

          <Link
            to="/become-a-runner"
            className="navbar-join-link bg-grub-red text-white font-black px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-opacity-90 transition-all duration-300 inline-flex items-center justify-center whitespace-nowrap"
            style={{
              textDecoration: 'none',
            }}
          >
            <span className="navbar-cta-desktop">Become a Runner</span>
            <span className="navbar-cta-mobile">Join</span>
          </Link>
        </nav>
      </div>

      <div
        className={`navbar-mobile-overlay ${isMenuOpen ? 'open' : ''}`}
        aria-hidden={!isMenuOpen}
        onClick={() => setIsMenuOpen(false)}
      />

      <aside
        className={`navbar-mobile-drawer ${isMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="navbar-mobile-drawer-inner">
          <div className="navbar-mobile-drawer-top">
            <div style={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--grub-red)' }}>Menu</div>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
              style={{
                appearance: 'none',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                background: '#fff',
                borderRadius: '12px',
                padding: '0.55rem 0.7rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="navbar-mobile-drawer-actions">
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="w-full text-center border border-gray-200 bg-white text-gray-900 px-4 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              Login
            </Link>

            <Link
              to="/become-a-runner"
              onClick={() => setIsMenuOpen(false)}
              className="w-full text-center bg-grub-red text-white px-4 py-3 rounded-2xl font-bold shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all"
              style={{ textDecoration: 'none' }}
            >
              Join
            </Link>

            <Link
              to="/runner-types"
              onClick={() => setIsMenuOpen(false)}
              className="w-full text-center border border-gray-200 bg-white text-gray-900 px-4 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              Runner Types
            </Link>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 639px) {
          .navbar-links { display: none !important; }
          .navbar-divider { display: none !important; }
          .navbar-menu-btn { display: inline-flex !important; }
          .navbar-join-link { display: none !important; }
        }
        @media (min-width: 640px) {
          .navbar-links { display: inline-flex !important; }
          .navbar-divider { display: inline-block !important; }
          .navbar-menu-btn { display: none !important; }
          .navbar-join-link { display: inline-flex !important; }
        }

        .navbar-mobile-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(0, 0, 0, 0.35);
          opacity: 0;
          pointer-events: none;
          transition: opacity 180ms ease;
        }
        .navbar-mobile-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        .navbar-mobile-drawer {
          position: fixed;
          top: 0;
          right: 0;
          height: 100vh;
          width: min(22rem, 88vw);
          z-index: 70;
          background: #fff;
          box-shadow: -20px 0 40px rgba(0, 0, 0, 0.18);
          transform: translateX(105%);
          transition: transform 220ms ease;
        }
        .navbar-mobile-drawer.open {
          transform: translateX(0);
        }
        .navbar-mobile-drawer-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 1rem;
          gap: 1rem;
        }
        .navbar-mobile-drawer-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .navbar-mobile-drawer-actions {
          display: grid;
          gap: 0.75rem;
          margin-top: 0.25rem;
        }
      `}</style>
    </header>
  );
}

export default Navbar;
