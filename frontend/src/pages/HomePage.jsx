import React from 'react';
import HeroSection from '../components/home/HeroSection';
import WhyGrubGateSection from '../components/home/WhyGrubGateSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import NearbyRestaurants from '../components/home/NearbyRestaurants';
import GetStartedCTA from '../components/common/GetStartedCTA';
import PushNotificationTester from '../components/common/PushNotificationTester';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      
      
      <HeroSection />
      <WhyGrubGateSection />
      <TestimonialsSection />
      <NearbyRestaurants />
      
      {/* Push Notification Tester - Remove this in production */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Push Notification Testing</h2>
            <p className="text-gray-600">Test the push notification functionality (Development Only)</p>
          </div>
          <PushNotificationTester />
        </div>
      </div>
      
      <GetStartedCTA />
     
    </div>
  );
};

export default HomePage;
