import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useMealPlan } from '../../contexts/MealPlanContext';

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
    ]
  }
};

// Individual meal slot component
const MealSlot = ({ day, mealType, actualMealItems }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hasItems = actualMealItems && actualMealItems.length > 0;
  const firstItem = hasItems ? actualMealItems[0] : null;
  const additionalCount = hasItems ? actualMealItems.length - 1 : 0;

  const handleSlotClick = () => {
    if (hasItems) {
      // Navigate to day meal plan page if there are items
      navigate(`/meal-plan/${day}`);
    } else {
      // Navigate to restaurants page to add items
      navigate(`/restaurants?day=${day}&meal=${mealType}`);
    }
  };

  return (
    <div 
      onClick={handleSlotClick}
      className={`
        group relative p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer min-h-[90px] flex flex-col justify-center transform hover:scale-[1.02] hover:-translate-y-1
        ${hasItems 
          ? 'border-grub-red bg-gradient-to-br from-red-50 to-orange-50 shadow-lg hover:shadow-2xl hover:border-red-400' 
          : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-grub-red/60 hover:shadow-lg hover:from-red-50/30 hover:to-orange-50/30'
        }
      `}
    >
      {/* Gradient overlay for hover effect */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        hasItems 
          ? 'bg-gradient-to-br from-red-100/50 to-orange-100/50' 
          : 'bg-gradient-to-br from-red-50/30 to-orange-50/30'
      }`}></div>
      
      <div className="relative z-10">
        {hasItems ? (
          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-grub-red truncate group-hover:text-red-700 transition-colors duration-200">{firstItem.restaurantName}</div>
              {actualMealItems.length > 1 && (
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                  {actualMealItems.length}x
                </div>
              )}
            </div>
            <div className="text-gray-700 truncate group-hover:text-gray-800 transition-colors duration-200 font-medium">{firstItem.name}</div>
            <div className="font-bold text-grub-red text-sm group-hover:text-red-700 transition-colors duration-200">${firstItem.price}</div>
            {additionalCount > 0 && (
              <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-200">
                +{additionalCount} more item{additionalCount !== 1 ? 's' : ''}
              </div>
            )}
            <div className="text-xs text-grub-red/70 mt-2 font-medium group-hover:text-red-600 transition-colors duration-200 flex items-center">
              <span>View details</span>
              <svg className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500 text-center space-y-2">
            <div className="w-8 h-8 mx-auto bg-gray-100 group-hover:bg-red-100 rounded-full flex items-center justify-center transition-colors duration-200">
              <svg className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="group-hover:text-gray-600 transition-colors duration-200">{t('mealplan.clickToSelect', 'Click to select')}</div>
            <div className="text-grub-red/70 font-medium group-hover:text-red-600 transition-colors duration-200 flex items-center justify-center">
              <span>Add items</span>
              <svg className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ScheduleDemo = () => {
  const { t } = useTranslation();
  const { mealPlan } = useMealPlan();
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [calendarRef, calendarVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="weekly-menu-section" className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Combined Header and Calendar Card */}
        <div 
          ref={sectionRef}
          className={`scroll-animate ${isVisible ? 'is-visible' : ''}`}
        >
          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-300 mb-12">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-100 to-orange-100 rounded-full mb-6 shadow-lg">
                <svg className="w-8 h-8 text-grub-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-grub-red to-red-600 bg-clip-text text-transparent">
                Your Weekly Menu, Personalized by You
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
                Plan your perfect week with our interactive meal calendar. Click any slot to add delicious meals from your favorite restaurants, or view your planned meals with detailed information.
              </p>
            </div>

            {/* Calendar Section */}
            <div 
              ref={calendarRef}
              className={`scroll-animate ${calendarVisible ? 'is-visible' : ''}`}
            >
              <div className="overflow-x-auto">
                <div className="min-w-[700px] lg:min-w-0">
                  <div className="grid grid-cols-8 gap-2 md:gap-3 mb-4">
                    {/* Header row */}
                    <div className="p-2"></div>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <div key={day} className="p-2 text-center">
                        <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg px-3 py-2 shadow-sm">
                          <div className="text-sm font-bold text-gray-900">{day}</div>
                          <div className="text-xs text-gray-600 font-medium">{index + 1}</div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Lunch row */}
                    <div className="p-2 flex items-center">
                      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg px-3 py-2 shadow-sm border border-yellow-200">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <div className="text-sm font-bold text-yellow-800">{t('mealplan.lunch', 'Lunch')}</div>
                        </div>
                      </div>
                    </div>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <MealSlot 
                        key={`lunch-${day}`}
                        day={day}
                        mealType="lunch"
                        actualMealItems={mealPlan[day]?.lunch || []}
                      />
                    ))}
                    
                    {/* Dinner row */}
                    <div className="p-2 flex items-center">
                      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg px-3 py-2 shadow-sm border border-purple-200">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                          <div className="text-sm font-bold text-purple-800">{t('mealplan.dinner', 'Dinner')}</div>
                        </div>
                      </div>
                    </div>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <MealSlot 
                        key={`dinner-${day}`}
                        day={day}
                        mealType="dinner"
                        actualMealItems={mealPlan[day]?.dinner || []}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Legend */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mt-4 border border-gray-200">
                  <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-gray-700">
                    <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                      <div className="w-4 h-4 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-grub-red rounded-lg shadow-sm"></div>
                      <span className="font-medium">{t('mealplan.planned', 'Planned Meals')}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                      <div className="w-4 h-4 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-lg shadow-sm"></div>
                      <span className="font-medium">{t('mealplan.available', 'Available Slots')}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                      <div className="w-4 h-4 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-lg shadow-sm flex items-center justify-center">
                        <span className="text-xs font-bold text-green-700">2x</span>
                      </div>
                      <span className="font-medium">Multiple Items</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        </div> */}
      </div>
    </section>
  );
};

export default ScheduleDemo;
