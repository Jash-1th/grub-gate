import React, { Suspense, lazy } from 'react';
import HeroSection from '../components/home/HeroSection';
import WhyGrubGateSection from '../components/home/WhyGrubGateSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import RoleCards from '../components/home/RoleCards';
import MealCalendarButton from '../components/home/MealCalendarButton';
// import PushNotificationTester from '../components/common/PushNotificationTester';
// import NearbyRestaurants from '../components/home/NearbyRestaurants';
import GetStartedCTA from '../components/common/GetStartedCTA';

// Lazy load debug component only in development

// Lazy load components that use browser APIs
const StatisticsSection = lazy(() => import('../components/home/StatisticsSection'));
const PopularDishes = lazy(() => import('../components/home/PopularDishes'));

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

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <WhyGrubGateSection />
      
      <Suspense fallback={<Fallback />}>
        <StatisticsSection />
      </Suspense>
      
      {/* <Suspense fallback={<Fallback />}>
        <PopularDishes />
      </Suspense> */}
      
      <TestimonialsSection />
      <RoleCards />
      {/* <NearbyRestaurants /> */}
      {/* <GetStartedCTA /> */}
      
      {/* Push Notification Tester - Development Only - Commented Out */}
      
      {/* Floating Calendar Button - Only shows for customers with active subscriptions */}
      <MealCalendarButton />
    </div>
  );
};

export default HomePage;
