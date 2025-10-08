import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

/**
 * SSR-Safe DatePicker Component for Partner Portal
 * Allows partners to select specific dates to filter orders
 */
const DatePicker = ({ 
  selectedDate, 
  onDateChange, 
  maxDate = null, // Allow future dates by default
  minDate = null,
  placeholder = "Select date",
  className = "",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [displayDate, setDisplayDate] = useState('');

  // SSR Safety - only render interactive elements on client
  useEffect(() => {
    setIsClient(true);
    if (selectedDate) {
      setDisplayDate(formatDateForDisplay(selectedDate));
    }
  }, [selectedDate]);

  // Format date for display (e.g., "October 8, 2025")
  const formatDateForDisplay = (date) => {
    if (!date || !isClient) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format date for input value (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date || !isClient) return '';
    // Use local date to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle date selection
  const handleDateChange = (event) => {
    if (!isClient) return;
    
    const dateValue = event.target.value;
    console.log('DatePicker: Date selected:', dateValue);
    
    if (dateValue) {
      const newDate = new Date(dateValue + 'T00:00:00');
      console.log('DatePicker: New date object:', newDate);
      console.log('DatePicker: Is future date:', newDate > new Date());
      
      setDisplayDate(formatDateForDisplay(newDate));
      onDateChange(newDate);
    }
    setIsOpen(false);
  };

  // Quick date options
  const getQuickDateOptions = () => {
    if (!isClient) return [];
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return [
      { label: 'Yesterday', date: yesterday },
      { label: 'Today', date: today },
      { label: 'Tomorrow', date: tomorrow },
      { label: 'Next Week', date: nextWeek }
    ];
  };

  const quickOptions = getQuickDateOptions();

  // SSR fallback - render simple text during server-side rendering
  if (!isClient) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md bg-white">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-500">{placeholder}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Date Display Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full px-3 py-2 
          border border-gray-300 rounded-md bg-white text-left
          hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          transition-colors duration-200
        `}
      >
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className={displayDate ? 'text-gray-900' : 'text-gray-500'}>
            {displayDate || placeholder}
          </span>
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Quick Options */}
          <div className="p-2 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-2">Quick Select</div>
            <div className="space-y-1">
              {quickOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    console.log('DatePicker: Quick filter clicked:', option.label, option.date);
                    setDisplayDate(formatDateForDisplay(option.date));
                    onDateChange(option.date);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors duration-150"
                >
                  {option.label}
                  {option.date > new Date() && <span className="text-blue-500 ml-1">✨</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Date Input */}
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2">Select Date</div>
            {(() => {
              const calculatedMaxDate = maxDate ? formatDateForInput(maxDate) : formatDateForInput(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
              console.log('DatePicker: Max date for input:', calculatedMaxDate);
              console.log('DatePicker: Current selected date:', formatDateForInput(selectedDate));
              
              return (
                <input
                  type="date"
                  value={formatDateForInput(selectedDate)}
                  onChange={handleDateChange}
                  max={calculatedMaxDate}
                  min={minDate ? formatDateForInput(minDate) : undefined}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-grub-red focus:border-grub-red"
                />
              );
            })()}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default DatePicker;
