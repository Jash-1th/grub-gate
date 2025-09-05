import React from 'react';
import HeroSection from '../components/home/HeroSection';
import WhyGrubGateSection from '../components/home/WhyGrubGateSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import NearbyRestaurants from '../components/home/NearbyRestaurants';
import GetStartedCTA from '../components/common/GetStartedCTA';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      
      
      <HeroSection />
      <WhyGrubGateSection />
      <TestimonialsSection />
      <NearbyRestaurants />
      <GetStartedCTA />
     
    </div>
  );
};

export default HomePage;
