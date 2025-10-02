import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, TrendingUp, Users, Clock } from 'lucide-react';

const TestimonialsSection = ({ 
  testimonials = [], 
  title = 'Testimonials',
  subtitle = 'What our customers say',
  variant = 'customer', // 'customer' or 'partner'
  showStats = false,
  autoPlay = true,
  showNavigation = true,
  className = '',
  ordersText = 'orders'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isClient, setIsClient] = useState(false);
  
  // Determine how many cards are visible based on viewport (sm:1, md:2, lg+:3)
  useEffect(() => {
    const isClient = typeof window !== 'undefined';
    if (!isClient) return;
    
    const computeVisible = () => {
      const width = window.innerWidth;
      if (width < 768) return 1; // Tailwind sm
      if (width < 1024) return 2; // Tailwind md
      return 3; // lg+
    };

    const applyVisible = () => {
      setVisibleCount(computeVisible());
    };
    
    // Set initial value
    applyVisible();
    
    // Add event listener for resize
    window.addEventListener('resize', applyVisible);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', applyVisible);
    };
  }, []);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-play functionality - only start after client-side hydration
  useEffect(() => {
    if (!isAutoPlaying || !isClient) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const lastIndex = Math.max(0, testimonials.length - visibleCount);
        return prevIndex >= lastIndex ? 0 : prevIndex + 1;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, visibleCount, isClient, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => {
      const lastIndex = Math.max(0, testimonials.length - visibleCount);
      return prevIndex >= lastIndex ? 0 : prevIndex + 1;
    });
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.max(0, testimonials.length - visibleCount) : prevIndex - 1
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

  const renderCustomerTestimonial = (testimonial) => (
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
          <h4 className="font-semibold mb-1" style={{color: '#800020'}}>
            {testimonial.name}
          </h4>
          <p className="text-sm text-gray-600 mb-2" style={{color: '#800020'}}>
            {testimonial.location}
          </p>
          <p className="text-xs text-gray-500">
            {testimonial.orderCount} {ordersText}
          </p>
        </div>
      </div>
    </div>
  );

  const renderPartnerTestimonial = (testimonial) => (
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

        {/* Partner Info */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
            />
          </div>
          
          <h4 className="font-semibold text-gray-900 text-lg mb-1">
            {testimonial.name}
          </h4>
          
          <p className="text-grub-red font-medium mb-2">
            {testimonial.restaurant}
          </p>
          
          <p className="text-sm text-gray-500 mb-4">
            {testimonial.location}
          </p>

          {/* Stats */}
          {showStats && (
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-semibold text-green-600">
                    {testimonial.revenueIncrease}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Revenue Growth</p>
              </div>
              
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm font-semibold text-blue-600">
                    {testimonial.orderCount?.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
            </div>
          )}

          {/* Partnership Duration */}
          {testimonial.partnershipDuration && (
            <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              Partner for {testimonial.partnershipDuration}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 lg:py-24 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{color: '#800020'}}>
            {title}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div 
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Desktop Navigation Arrows */}
          {showNavigation && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 hover:bg-gray-50 hidden lg:block"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 hover:bg-gray-50 hidden lg:block"
                aria-label="Next testimonials"
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </>
          )}

          {/* Testimonials Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
            >
              {testimonials.map((testimonial) => 
                variant === 'partner' ? renderPartnerTestimonial(testimonial) : renderCustomerTestimonial(testimonial)
              )}
            </div>
          </div>

          {/* Mobile Navigation Buttons */}
          {showNavigation && (
            <div className="flex justify-center mt-6 lg:hidden space-x-4">
              <button
                onClick={prevTestimonial}
                className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 hover:bg-gray-50"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <button
                onClick={nextTestimonial}
                className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 hover:bg-gray-50"
                aria-label="Next testimonials"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          )}

          {/* Dots Indicator */}
          {showNavigation && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: Math.max(1, testimonials.length - visibleCount + 1) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentIndex ? 'bg-grub-red' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
