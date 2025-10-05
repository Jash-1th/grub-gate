import React, { useEffect } from 'react';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Coffee from 'lucide-react/dist/esm/icons/coffee';
import Heart from 'lucide-react/dist/esm/icons/heart';

const WelcomeBackModal = ({ isOpen, onClose, userName }) => {
  // Auto-close after 3 seconds (shorter than registration welcome)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

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
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 sm:mx-6 overflow-hidden animate-slide-up">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-grub-red to-red-600 px-6 py-6 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-2 left-4 text-white opacity-20">
            <Coffee size={20} />
          </div>
          <div className="absolute top-3 right-6 text-white opacity-20">
            <Heart size={18} />
          </div>
          <div className="absolute bottom-2 right-4 text-white opacity-20">
            <Coffee size={16} />
          </div>
          
          {/* Success Icon */}
          <div className="mb-3 flex justify-center">
            <div className="bg-white bg-opacity-20 rounded-full p-2 animate-pulse">
              <CheckCircle size={40} className="text-white" />
            </div>
          </div>
          
          {/* Welcome Back Message */}
          <h1 className="text-xl font-bold text-white mb-1">
            Welcome Back! 👋
          </h1>
          <p className="text-white text-opacity-90 text-base">
            Hi {userName}!
          </p>
        </div>
        
        {/* Content */}
        <div className="px-6 py-5 text-center">
          <div className="mb-4">
            <p className="text-gray-700 text-base leading-relaxed">
              Great to see you again! 🎉
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Ready to continue planning your delicious meals?
            </p>
          </div>
          
          {/* Quick Actions Preview */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="text-center">
              <div className="bg-grub-red bg-opacity-10 rounded-lg p-3 mb-2">
                <span className="text-xl">📅</span>
              </div>
              <p className="text-xs text-gray-600">Your Weekly Menu</p>
            </div>
            <div className="text-center">
              <div className="bg-grub-red bg-opacity-10 rounded-lg p-3 mb-2">
                <span className="text-xl">🍽️</span>
              </div>
              <p className="text-xs text-gray-600">Discover New Meals</p>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-grub-red text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"
          >
            Continue Planning 🚀
          </button>
          
          {/* Auto-close indicator */}
          <p className="text-xs text-gray-500 mt-3">
            This message will close automatically
          </p>
        </div>
        
        {/* Close X button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-gray-200 transition-colors duration-200"
          aria-label="Close welcome back modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Custom CSS for animation */}
      <style jsx>{`
        @keyframes slide-up {
          0% {
            transform: translateY(100px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WelcomeBackModal;
