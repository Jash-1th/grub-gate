import React, { useState, Suspense, lazy } from 'react';
import HeroPlan from '../components/planning/HeroPlan';
import FoodPreferences from '../components/planning/FoodPreferences';
import RestaurantGrid from '../components/planning/RestaurantGrid';
import HowItWorksPlan from '../components/planning/HowItWorksPlan';
import ScheduleDemo from '../components/planning/ScheduleDemo';
import SubscriptionPlans from '../components/planning/SubscriptionPlans';
import GetStartedCTA from '../components/common/GetStartedCTA';

// Lazy load components that might use browser APIs or heavy resources
// Currently all components are loaded directly for better SSR compatibility

// Fallback component for lazy loading
const Fallback = () => (
  <div className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MealPlanningPage = () => {
  // State for postal code and food preferences
  const [postalCode, setPostalCode] = useState('');
  const [selectedPreferences, setSelectedPreferences] = useState([]);

  // Handler for postal code updates from HeroPlan
  const handlePostalCodeChange = (newPostalCode) => {
    setPostalCode(newPostalCode);
  };

  // Handler for preferences updates from FoodPreferences
  const handlePreferencesChange = (newPreferences) => {
    setSelectedPreferences(newPreferences);
  };

  // Handler for preferences selected from modal in HeroPlan
  const handlePreferencesSelected = (newPreferences) => {
    setSelectedPreferences(newPreferences);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section for Meal Planning */}
      <HeroPlan 
        onPostalCodeChange={handlePostalCodeChange}
        onPreferencesSelected={handlePreferencesSelected}
      />
      
      {/* Food Preferences Selection */}
      {/* <FoodPreferences onPreferencesChange={handlePreferencesChange} /> */}
      
      {/* Dynamic Restaurant Grid */}
      <div data-restaurant-section>
        <RestaurantGrid 
          postalCode={postalCode} 
          selectedPreferences={selectedPreferences} 
        />
      </div>
      
      {/* How It Works Section */}
      {/* <HowItWorksPlan /> */}
      
      {/* Interactive Schedule Demo */}
      <ScheduleDemo />
      
      {/* Subscription Plans */}
      <SubscriptionPlans />
      
      {/* Final Call to Action */}
      <GetStartedCTA />
    </div>
  );
};

export default MealPlanningPage;
