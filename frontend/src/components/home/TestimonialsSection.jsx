import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { featuredTestimonials } from '../../data';

const TestimonialsSection = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isClient, setIsClient] = useState(false);

  // Determine how many cards are visible based on viewport (sm:1, md:2, lg+:3)
  useEffect(() => {
    // Mark as client-side after hydration
    setIsClient(true);
    
    const computeVisible = () => {
      if (typeof window === 'undefined') return 3;
      const width = window.innerWidth;
      if (width < 768) return 1; // Tailwind sm
      if (width < 1024) return 2; // Tailwind md
      return 3; // lg+
    };

    const applyVisible = () => {
      const nextVisible = computeVisible();
      setVisibleCount(nextVisible);
      // Clamp currentIndex so we don't go out of range when resizing smaller
      const maxIndex = Math.max(0, featuredTestimonials.length - nextVisible);
      setCurrentIndex((idx) => Math.min(idx, maxIndex));
    };

    // Only apply visible count after client-side hydration
    if (typeof window !== 'undefined') {
      applyVisible();
      window.addEventListener('resize', applyVisible);
      return () => window.removeEventListener('resize', applyVisible);
    }
  }, []);

  // Auto-play functionality - only start after client-side hydration
  useEffect(() => {
    if (!isAutoPlaying || !isClient) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const lastIndex = Math.max(0, featuredTestimonials.length - visibleCount);
        return prevIndex >= lastIndex ? 0 : prevIndex + 1;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, visibleCount, isClient]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => {
      const lastIndex = Math.max(0, featuredTestimonials.length - visibleCount);
      return prevIndex >= lastIndex ? 0 : prevIndex + 1;
    });
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.max(0, featuredTestimonials.length - visibleCount) : prevIndex - 1
    );
    setIsAutoPlaying(false);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold  mb-6" style={{color: '#800020'}}>
            {t('testimonials.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="relative">
          {/* Testimonials Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
            >
              {featuredTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-4">
                  <div className="bg-gray-50 rounded-2xl p-8 h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                    {/* Rating */}
                    <div className="flex justify-center mb-4">
                      {renderStars(testimonial.rating)}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-gray-700 text-center mb-6 italic leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>

                    {/* User Info */}
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-semibold  mb-1" style={{color: '#800020'}}>
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2" style={{color: '#800020'}}>
                        {testimonial.location}
                      </p>
                      <p className="text-xs text-gray-500">
                        {testimonial.orderCount} {t('testimonials.orders')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-grub-red text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors duration-200 z-10"
            aria-label={t('common.previous')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-grub-red text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors duration-200 z-10"
            aria-label={t('common.next')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: Math.max(1, featuredTestimonials.length - (visibleCount - 1)) }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-grub-red' : 'bg-gray-300'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Auto-play toggle */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-sm text-gray-500 hover:text-grub-red transition-colors duration-200"
          >
            {isAutoPlaying ? t('testimonials.pause') : t('testimonials.resume')} {t('testimonials.autoPlay')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
