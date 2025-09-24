import React from 'react';
import { useTranslation } from 'react-i18next';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

// Mock data for the weekly schedule demo - can be moved to backend later
const mockScheduleData = {
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  meals: {
    lunch: [
      { restaurant: 'Spice Garden', meal: 'Butter Chicken Bowl', price: '$12.99', available: true },
      { restaurant: 'Green Leaf', meal: 'Quinoa Buddha Bowl', price: '$11.49', available: true },
      { restaurant: 'Pasta Palace', meal: 'Creamy Alfredo', price: '$13.99', available: false },
      { restaurant: 'Taco Fiesta', meal: 'Chicken Burrito', price: '$10.99', available: true },
      { restaurant: 'Sushi Zen', meal: 'Salmon Teriyaki', price: '$15.99', available: true },
      { restaurant: 'Pizza Corner', meal: 'Margherita Slice', price: '$8.99', available: true },
      { restaurant: 'Healthy Bites', meal: 'Protein Power Bowl', price: '$12.49', available: true }
    ],
    dinner: [
      { restaurant: 'Royal Curry', meal: 'Lamb Biryani', price: '$16.99', available: true },
      { restaurant: 'Mediterranean', meal: 'Grilled Salmon', price: '$18.49', available: true },
      { restaurant: 'Noodle House', meal: 'Pad Thai Special', price: '$14.99', available: true },
      { restaurant: 'Grill Master', meal: 'BBQ Ribs Platter', price: '$19.99', available: false },
      { restaurant: 'Veggie Delight', meal: 'Stuffed Bell Peppers', price: '$13.99', available: true },
      { restaurant: 'Seafood Bay', meal: 'Fish & Chips', price: '$15.49', available: true },
      { restaurant: 'Comfort Kitchen', meal: 'Roasted Chicken', price: '$17.99', available: true }
    ]
  }
};

// Individual meal slot component
const MealSlot = ({ day, mealType, mealData, dayIndex }) => {
  const isSelected = dayIndex % 3 === 0; // Mock some selected slots for demo
  const isEmpty = !mealData.available;

  return (
    <div className={`
      p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
      ${isSelected 
        ? 'border-grub-red bg-red-50 shadow-md' 
        : isEmpty 
          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
          : 'border-gray-200 bg-white hover:border-grub-red/50 hover:shadow-sm'
      }
    `}>
      {isSelected ? (
        <div className="text-xs">
          <div className="font-semibold text-grub-red truncate">{mealData.restaurant}</div>
          <div className="text-gray-700 truncate">{mealData.meal}</div>
          <div className="font-bold text-grub-red">{mealData.price}</div>
        </div>
      ) : isEmpty ? (
        <div className="text-xs text-gray-400 text-center py-2">
          Unavailable
        </div>
      ) : (
        <div className="text-xs text-gray-500 text-center py-2">
          Click to select
        </div>
      )}
    </div>
  );
};

// Weekly calendar component
const WeeklyCalendar = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="grid grid-cols-8 gap-2 mb-4">
        {/* Header row */}
        <div className="p-2"></div>
        {mockScheduleData.days.map((day, index) => (
          <div key={day} className="p-2 text-center">
            <div className="text-sm font-semibold text-gray-900">{day.slice(0, 3)}</div>
            <div className="text-xs text-gray-500">{index + 1}</div>
          </div>
        ))}
        
        {/* Lunch row */}
        <div className="p-2 flex items-center">
          <div className="text-sm font-medium text-gray-700">Lunch</div>
        </div>
        {mockScheduleData.days.map((day, dayIndex) => (
          <MealSlot 
            key={`lunch-${day}`}
            day={day}
            mealType="lunch"
            mealData={mockScheduleData.meals.lunch[dayIndex]}
            dayIndex={dayIndex}
          />
        ))}
        
        {/* Dinner row */}
        <div className="p-2 flex items-center">
          <div className="text-sm font-medium text-gray-700">Dinner</div>
        </div>
        {mockScheduleData.days.map((day, dayIndex) => (
          <MealSlot 
            key={`dinner-${day}`}
            day={day}
            mealType="dinner"
            mealData={mockScheduleData.meals.dinner[dayIndex]}
            dayIndex={dayIndex}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-50 border-2 border-grub-red rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white border-2 border-gray-200 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-50 border-2 border-gray-200 rounded opacity-50"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};

const ScheduleDemo = () => {
  const { t } = useTranslation();
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [calendarRef, calendarVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div 
          ref={sectionRef}
          className={`text-center mb-12 scroll-animate ${isVisible ? 'is-visible' : ''}`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{ color: '#800020' }}>
            {t('mealPlanning.scheduleDemo.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            {t('mealPlanning.scheduleDemo.description')}
          </p>
        </div>

        {/* Calendar Demo */}
        <div 
          ref={calendarRef}
          className={`mb-12 scroll-animate ${calendarVisible ? 'is-visible' : ''}`}
        >
          <WeeklyCalendar />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-grub-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-grub-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('mealPlanning.scheduleDemo.features.flexibility.title')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('mealPlanning.scheduleDemo.features.flexibility.description')}
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-grub-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-grub-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('mealPlanning.scheduleDemo.features.variety.title')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('mealPlanning.scheduleDemo.features.variety.description')}
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-grub-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-grub-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('mealPlanning.scheduleDemo.features.convenience.title')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('mealPlanning.scheduleDemo.features.convenience.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScheduleDemo;
