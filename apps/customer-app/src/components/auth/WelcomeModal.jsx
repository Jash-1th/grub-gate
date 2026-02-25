import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faStar, faHeart } from '@fortawesome/free-solid-svg-icons';

const WelcomeModal = ({ isOpen, onClose, userName }) => {
  // Auto-close after 4 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 sm:mx-6 overflow-hidden animate-bounce-in">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-grub-red via-grub-red to-grub-red px-6 py-8 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-2 left-4 text-white opacity-20">
            <FontAwesomeIcon icon={faStar} className="w-6 h-6" />
          </div>
          <div className="absolute top-4 right-6 text-white opacity-20">
            <FontAwesomeIcon icon={faHeart} className="w-5 h-5" />
          </div>
          <div className="absolute bottom-2 right-4 text-white opacity-20">
            <FontAwesomeIcon icon={faStar} className="w-4 h-4" />
          </div>
          
          {/* Success Icon */}
          <div className="mb-4 flex justify-center">
            <div className="bg-white bg-opacity-20 rounded-full p-3 animate-pulse">
              <FontAwesomeIcon icon={faCheckCircle} className="w-12 h-12 text-white" />
            </div>
          </div>
          
          {/* Welcome Message */}
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome to GrubGate!
          </h1>
          <p className="text-white text-opacity-90 text-lg">
            Hi {userName}! 👋
          </p>
        </div>
        
        {/* Content */}
        <div className="px-6 py-6 text-center">
          <div className="mb-4">
            <p className="text-gray-700 text-base leading-relaxed">
              Your account has been created successfully! 🎉
            </p>
            <p className="text-gray-600 text-sm mt-2">
              You're now ready to explore delicious meals and plan your weekly menu.
            </p>
          </div>
          
          {/* Features Preview */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center">
              <div className="bg-grub-red bg-opacity-10 rounded-lg p-3 mb-2">
                <span className="text-2xl">🍽️</span>
              </div>
              <p className="text-xs text-gray-600">Browse Restaurants</p>
            </div>
            <div className="text-center">
              <div className="bg-grub-red bg-opacity-10 rounded-lg p-3 mb-2">
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-xs text-gray-600">Plan Your Week</p>
            </div>
            <div className="text-center">
              <div className="bg-grub-red bg-opacity-10 rounded-lg p-3 mb-2">
                <span className="text-2xl">🚚</span>
              </div>
              <p className="text-xs text-gray-600">Get Delivered</p>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-grub-red text-white py-3 px-6 rounded-lg font-semibold hover:bg-grub-red transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"
          >
            Let's Get Started! 🚀
          </button>
          
          {/* Auto-close indicator */}
          <p className="text-xs text-gray-500 mt-3">
            This message will close automatically in a few seconds
          </p>
        </div>
        
        {/* Close X button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200"
          aria-label="Close welcome modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Custom CSS for animation */}
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3) translateY(-50px);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WelcomeModal;
