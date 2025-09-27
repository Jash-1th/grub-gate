import React, { useState, useEffect } from 'react';
import { DAYS_OF_WEEK, MEAL_AVAILABILITY, isMealAvailable, getCurrentDay } from '../../utils/filteringAlgorithms';

const DaysFilterModal = ({ 
  isOpen, 
  onClose, 
  selectedDay,
  setSelectedDay,
  selectedMealType,
  dayFilteredItems,
  onApply 
}) => {
  const [localDay, setLocalDay] = useState(selectedDay);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setLocalDay(selectedDay);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, selectedDay]);

  const handleDaySelection = (dayId) => {
    setLocalDay(dayId);
  };

  const handleApply = () => {
    setSelectedDay(localDay);
    onApply();
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleReset = () => {
    setLocalDay(getCurrentDay());
  };

  if (!isOpen) return null;

  const selectedDayName = DAYS_OF_WEEK.find(d => d.id === localDay)?.name;
  const currentDayName = DAYS_OF_WEEK.find(d => d.id === getCurrentDay())?.name;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-end justify-center pb-4">
        <div 
          className={`relative w-full max-w-lg transform transition-all duration-300 ${
            isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          {/* Modal Content */}
          <div className="relative bg-white rounded-t-2xl shadow-2xl h-[70vh] flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Select Day</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-2">Choose which day you want to view the menu for</p>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 py-3 overflow-y-auto">
              {/* Days Grid */}
              <div className="space-y-3">
                {DAYS_OF_WEEK.map((day) => {
                  const dayAvailability = MEAL_AVAILABILITY[day.id];
                  const hasLunch = dayAvailability?.lunch || false;
                  const hasDinner = dayAvailability?.dinner || false;
                  const isAvailable = hasLunch || hasDinner; // Day is available if any meal is available
                  const isSelected = localDay === day.id;
                  const isToday = day.id === getCurrentDay();
                  
                  return (
                    <button
                      key={day.id}
                      onClick={() => handleDaySelection(day.id)}
                      disabled={!isAvailable}
                      className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-blue-50 border-2 border-blue-500 text-blue-700 shadow-md'
                          : isAvailable
                          ? 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent text-gray-700 hover:shadow-sm'
                          : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isSelected 
                            ? 'bg-blue-500 text-white' 
                            : isToday 
                            ? 'bg-orange-100 text-orange-600 border-2 border-orange-300'
                            : isAvailable 
                            ? 'bg-gray-200 text-gray-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <span className="font-bold text-sm">{day.short}</span>
                        </div>
                        <div className="text-left">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{day.name}</span>
                            {isToday && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                                Today
                              </span>
                            )}
                          </div>
                          <span className={`text-sm ${
                            isAvailable ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {isAvailable 
                              ? `${hasLunch ? 'Lunch' : ''}${hasLunch && hasDinner ? ' & ' : ''}${hasDinner ? 'Dinner' : ''} available`
                              : 'No menu available'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isSelected && (
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {!isAvailable && (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Day Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mt-6 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Selected Day
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Day:</span>
                    <span className="font-medium text-blue-800">
                      {selectedDayName}
                      {localDay === getCurrentDay() && (
                        <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                          Today
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Available meals:</span>
                    <span className="font-medium text-blue-800">
                      {dayFilteredItems?.availableMeals?.length > 0 
                        ? dayFilteredItems.availableMeals.map(meal => meal.charAt(0).toUpperCase() + meal.slice(1)).join(', ')
                        : 'None'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-6 pb-16 sm:pb-10">
              <div className="flex space-x-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-300"
                >
                  Today ({currentDayName})
                </button>
                <button
                  onClick={handleApply}
                  className="flex-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Apply Day</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaysFilterModal;
