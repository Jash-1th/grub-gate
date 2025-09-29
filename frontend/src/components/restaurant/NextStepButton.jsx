import React from 'react';
import { useNavigate } from 'react-router-dom';

const NextStepButton = ({ 
  destination = '/weekly-menu',
  buttonText = 'Next Step',
  className = ''
}) => {
  const navigate = useNavigate();

  return (
    <div className={`fixed bottom-20 sm:bottom-6 left-1/2 transform -translate-x-1/2 sm:left-auto sm:right-6 sm:transform-none z-[60] ${className}`}>
      <button
        onClick={() => navigate(destination)}
        className="group bg-gradient-to-r from-grub-red to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center space-x-2 sm:space-x-3"
      >
        <span className="font-semibold text-xs sm:text-sm whitespace-nowrap">{buttonText}</span>
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  );
};

export default NextStepButton;
