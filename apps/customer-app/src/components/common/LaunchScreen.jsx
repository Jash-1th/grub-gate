import React, { useEffect, useState } from 'react';

// Load LaunchScreen CSS
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/launch-screen.css';
  if (!document.querySelector('link[href="/launch-screen.css"]')) {
    document.head.appendChild(link);
  }
}

/**
 * LaunchScreen Component
 * 
 * A branded splash screen that appears only on the first visit of each session.
 * Features:
 * - Fullscreen overlay with GrubGate branding
 * - Smooth fade-out animation after specified duration
 * - Floating logo animation
 * - Session-based display control
 * - External CSS to avoid SSR JSON parsing conflicts
 * 
 * Props:
 * - durationMs: number (default: 2200) - How long to show before fade begins
 * - fadeDurationMs: number (default: 600) - CSS fade-out transition duration
 * - onFinish: () => void - Callback invoked after fade completes
 */
const LaunchScreen = ({ durationMs = 2200, fadeDurationMs = 600, onFinish }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // After the visible duration, start the fade-out animation
    const visibleTimer = setTimeout(() => {
      setIsFading(true);
      
      // After fade duration completes, notify parent component
      const fadeTimer = setTimeout(() => {
        onFinish?.();
      }, fadeDurationMs);
      
      return () => clearTimeout(fadeTimer);
    }, durationMs);

    return () => clearTimeout(visibleTimer);
  }, [durationMs, fadeDurationMs, onFinish]);

  return (
    <div
      className={`gg-launch-screen ${isFading ? 'gg-fade-out' : ''}`}
      role="img"
      aria-label="GrubGate loading screen"
      aria-hidden="true"
    >
      {/* Logo */}
      <img
        src="/icons/logo512.png"
        alt="GrubGate Logo"
        className="gg-launch-logo"
        width="140"
        height="140"
        loading="eager"
        decoding="sync"
      />
      
      {/* Brand Title */}
      <h1 className="gg-launch-title">GrubGate</h1>
      
      {/* Subtitle */}
      <p className="gg-launch-subtitle">
        Your Daily Meals, Delivered from Real Kitchens
      </p>
      
      {/* Progress Bar */}
      <div className="gg-launch-progress">
        <div className="gg-launch-progress-bar"></div>
      </div>
    </div>
  );
};

export default LaunchScreen;
