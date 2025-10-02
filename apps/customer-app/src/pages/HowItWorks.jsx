import React from 'react';
import HeroHowItWorks from '../components/howItWorks/HeroHowItWorks';
import ProcessSteps from '../components/howItWorks/ProcessSteps';
// import WhyGrubGateSection from '../components/home/WhyGrubGateSection';
import GetStartedCTA from '../components/common/GetStartedCTA';

const HowItWorks = () => {
  return (
    <div className="min-h-screen">
      <HeroHowItWorks />
      <ProcessSteps />
      {/* <WhyGrubGateSection /> */}
      <GetStartedCTA />
    </div>
  );
};

export default HowItWorks;
