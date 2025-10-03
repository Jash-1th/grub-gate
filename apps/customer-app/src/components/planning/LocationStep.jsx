import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { usePlanning } from '../../contexts/PlanningContext';
import HowItWorksPlan from './HowItWorksPlan';
import ScheduleDemo from './ScheduleDemo';

const LocationStep = ({ onNext }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openSignupModal } = useModal();
  const { updatePostalCode, updatePreferences } = usePlanning();
  const [postalCode, setPostalCode] = useState('');

  const handleFindMeals = () => {
    if (postalCode.trim()) {
      // Update postal code in context
      updatePostalCode(postalCode.trim());
      
      // Navigate directly to restaurant step (no preferences selection here)
      navigate('/plan/restaurants?source=plan');
    }
  };

  const handleUseCurrentLocation = () => {
    // For now, open signup modal - can be enhanced later with geolocation
    openSignupModal();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFindMeals();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section for Meal Planning */}
      <section className="min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-white to-red-50 relative overflow-hidden">
        {/* Background decorative elements - responsive positioning */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-20 sm:top-40 right-5 sm:right-20 w-64 h-64 sm:w-96 sm:h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 sm:bottom-20 left-5 sm:left-20 w-56 h-56 sm:w-80 sm:h-80 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-grub-red mb-4 sm:mb-6 leading-tight">
                  {t('mealPlanning.hero.title')}
                  <br />
                  <span className="text-grub-red bg-gradient-to-r from-grub-red to-red-500 bg-clip-text text-transparent">
                    {t('mealPlanning.hero.subtitle')}
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  {t('mealPlanning.hero.description')}
                </p>
              </div>
              
              {/* Enhanced Postal Code Input Container - Responsive */}
              <div className="mb-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-grub-red to-orange-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative backdrop-blur-sm bg-white/90 border border-white/50 rounded-2xl p-1.5 sm:p-2 shadow-2xl">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('mealPlanning.hero.postalCodePlaceholder')}
                        className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-transparent text-gray-900 placeholder-gray-500 border-0 focus:outline-none text-base sm:text-lg font-medium rounded-xl sm:rounded-none"
                        aria-label={t('mealPlanning.hero.postalCodeLabel')}
                      />
                      <button
                        onClick={handleFindMeals}
                        className="px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-grub-red to-red-600 text-white rounded-xl font-semibold text-sm sm:text-lg hover:from-grub-red hover:to-grub-red transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-grub-red focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 sm:mr-1 whitespace-nowrap"
                      >
                        {t('mealPlanning.hero.findMealsButton')}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Use Current Location Option - Responsive */}
                <div className="flex items-center justify-center mt-4 sm:mt-6">
                  <div className="flex items-center space-x-2 sm:space-x-4 w-full max-w-sm sm:max-w-md">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-gray-400 flex-1"></div>
                    <div className="relative">
                      <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur opacity-30"></div>
                      <span className="relative text-gray-500 text-xs sm:text-sm font-medium px-3 sm:px-6 py-1.5 sm:py-2 bg-white/90 rounded-full border border-gray-200/50 shadow-sm">
                        or
                      </span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-gray-400 via-gray-300 to-transparent flex-1"></div>
                  </div>
                </div>
                
                <div className="text-center mt-4 sm:mt-6">
                  <div className="relative inline-block group">
                    {/* Glowing background effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500 group-hover:duration-200"></div>
                    
                    <button
                      onClick={handleUseCurrentLocation}
                      className="relative inline-flex items-center text-gray-700 hover:text-white font-medium transition-all duration-300 focus:outline-none bg-white/80 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-gray-200/50 hover:border-transparent shadow-lg hover:shadow-xl transform hover:-translate-y-1 backdrop-blur-sm group text-sm sm:text-base"
                    >
                      {/* Animated location icon */}
                      <div className="relative mr-2 sm:mr-3">
                        <svg 
                          className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                          />
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                          />
                        </svg>
                        
                        {/* Pulsing dot effect */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                        </div>
                      </div>
                      
                      <span className="relative">
                        Use current location
                      </span>
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Content - Food Images - Responsive */}
            <div className="relative mt-8 lg:mt-0 order-first lg:order-last">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 max-w-md mx-auto lg:max-w-none">
                {/* Ramen Bowl */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl sm:rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                  <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <img 
                      src="https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                      alt="Delicious ramen bowl with soft-boiled eggs and vegetables"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/images/grub-gate-default-img.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                
                {/* Gourmet Burger */}
                <div className="relative mt-4 sm:mt-8 group">
                  <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl sm:rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                  <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <img 
                      src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                      alt="Gourmet burger with fresh ingredients and fries"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/images/grub-gate-default-img.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                
                {/* Sushi Platter */}
                <div className="relative -mt-2 sm:-mt-4 group">
                  <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-green-400 to-teal-400 rounded-2xl sm:rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                  <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <img 
                      src="https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                      alt="Fresh sushi platter with various rolls and sashimi"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/images/grub-gate-default-img.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                
                {/* Buddha Bowl */}
                <div className="relative mt-2 sm:mt-4 group">
                  <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-2xl sm:rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                  <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <img 
                      src="https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                      alt="Colorful Buddha bowl with avocado, vegetables, and grains"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/images/grub-gate-default-img.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced floating elements - Responsive */}
              <div className="absolute -top-4 sm:-top-8 -right-4 sm:-right-8 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-red-200 to-orange-200 rounded-full opacity-40 animate-pulse"></div>
              <div className="absolute -bottom-4 sm:-bottom-8 -left-4 sm:-left-8 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-r from-yellow-200 to-red-200 rounded-full opacity-40 animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 -right-2 sm:-right-4 w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-200 to-red-200 rounded-full opacity-30 animate-pulse delay-2000"></div>
            </div>
          </div>
        </div>

      </section>
      
      {/* How It Works Section */}
      {/* <HowItWorksPlan /> */}
      
      {/* Interactive Schedule Demo */}
      {/* <ScheduleDemo /> */}
    </div>
  );
};

export default LocationStep;
