import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const LoadingScreen = () => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-white via-rose-50 to-red-50">
        {/* Background decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-grub-red/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-red-400/10 blur-3xl" />
        </div>

        {/* Loader card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative w-[92%] max-w-sm rounded-2xl bg-white/80 backdrop-blur-md shadow-xl border border-white/60 p-8 text-center"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          {/* Brand mark */}
          <Link to="/" aria-label="Go to landing page" className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-grub-red to-red-600 shadow-md focus:outline-none focus:ring-2 focus:ring-grub-red/40">
            <img
              src="/icons/Logo.png"
              alt="GrubGate"
              className="h-9 w-9 select-none"
              draggable="false"
            />
          </Link>

          {/* Animated ring */}
          <div className="relative mx-auto mt-6 h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-red-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-grub-red animate-spin motion-reduce:animate-none [animation-duration:1s]" />
          </div>

          {/* Shimmer bar */}
          <div className="relative mt-6 h-2 w-40 mx-auto overflow-hidden rounded-full bg-gray-100">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] motion-reduce:hidden bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          </div>

          {/* Tagline */}
          <p className="mt-6 text-sm text-gray-600">
            Preparing your partner experience…
          </p>
        </motion.div>

        {/* Keyframes for shimmer (Tailwind arbitrary value above) */}
        <style>
          {`@keyframes shimmer { 100% { transform: translateX(100%); } }`}
        </style>
      </div>
    </AnimatePresence>
  );
};

export default LoadingScreen;