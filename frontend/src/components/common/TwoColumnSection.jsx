import React from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const TwoColumnSection = ({ title, description, image, reverse = false }) => {
  // Add scroll animation to each section
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Card Container with scroll animation */}
      <div 
        ref={sectionRef}
        className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-8 lg:p-10 scroll-animate ${isVisible ? 'is-visible' : ''}`}
      >
        <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-12`}>
          {/* Text Content */}
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl font-bold mb-4" style={{color: '#800020'}}>{title}</h2>
            <p className="text-gray-700 leading-relaxed text-lg">{description}</p>
          </div>
          {/* Image Content */}
          <div className="md:w-1/2">
            {/* Image Container with Fixed Aspect Ratio */}
            <div className="w-full h-48 md:h-56 lg:h-64 rounded-xl overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center">
              <img 
                src={image} 
                alt={title} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoColumnSection;
