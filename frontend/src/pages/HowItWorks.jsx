import React from 'react';
import HeroHowItWorks from '../components/howItWorks/HeroHowItWorks';
import ProcessSteps from '../components/howItWorks/ProcessSteps';
import WhyGrubGateSection from '../components/home/WhyGrubGateSection';
import HowItWorksCTA from '../components/howItWorks/HowItWorksCTA';

const HowItWorks = () => {
  return (
    <div className="min-h-screen">
      <HeroHowItWorks />
      <ProcessSteps />
      <WhyGrubGateSection />
      <HowItWorksCTA />
    </div>
  );
};

export default HowItWorks;
