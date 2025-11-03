import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useServerData } from '../../utils/serverData';
import { getPopularDishes } from '../../services/restaurantService';

const PopularDishes = () => {
  // Get dishes from server data or use empty array as fallback
  const serverDishes = useServerData('popularDishes') || [];
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('loading');
  
  // Fetch popular dishes from API
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await getPopularDishes(6);
        if (response.success && response.data.dishes) {
          setDishes(response.data.dishes);
          setDataSource(response.data.dataSource || 'api');
        }
      } catch (error) {
        console.error('Error fetching popular dishes:', error);
        // Keep empty array, will show fallback in UI
      } finally {
        setLoading(false);
      }
    };
    
    fetchDishes();
  }, []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);

  // Handle auto-rotation of dishes
  useEffect(() => {
    setIsClient(true);
    
    const interval = setInterval(() => {
      if (isInView) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % dishes.length);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isInView]);

  // Intersection Observer to detect when section is in view
  useEffect(() => {
    if (!sectionRef.current || !isClient) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        } else {
          setIsInView(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isClient]);

  if (!isClient) {
    // SSR-friendly static version - matches client structure exactly
    return (
      <div className="py-8 xs:py-10 sm:py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="text-center mb-8 xs:mb-10 sm:mb-12">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
              Last Week's Most Ordered
            </h2>
            <p className="mt-2 xs:mt-3 sm:mt-4 max-w-3xl mx-auto text-sm xs:text-base sm:text-lg md:text-xl text-gray-500">
              Discover what everyone was ordering last week from our top restaurants
            </p>
          </div>
          
          <div className="relative h-auto min-h-[400px] xs:min-h-[450px] sm:min-h-[500px] md:h-[400px] lg:h-[450px] w-full">
            <div className="flex items-center justify-center">
              <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-xl max-w-4xl w-full flex flex-col md:flex-row">
                <div className="md:w-1/2 h-48 xs:h-56 sm:h-64 md:h-auto">
                  <img 
                    src={dishes[0]?.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80'} 
                    alt={dishes[0]?.name || 'Gourmet Burger'} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 xs:p-5 sm:p-6 md:p-8 md:w-1/2 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-3 xs:mb-4">
                    <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">Last Week's Most Ordered</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      🔥 Most Ordered
                    </span>
                  </div>
                  
                  <p className="text-xs xs:text-sm sm:text-base text-gray-600 mb-3 xs:mb-4">Discover what everyone was ordering last week from our top restaurants</p>
                  
                  {/* Restaurant info placeholder */}
                  <div className="flex items-center mb-3 xs:mb-4">
                    <div className="w-8 h-8 bg-grub-red rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">R</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Featured Restaurant</p>
                      <p className="text-xs text-gray-500">Various Cuisines</p>
                    </div>
                  </div>
                  
                  {/* Loading state */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg xs:text-xl sm:text-2xl font-bold text-grub-red">Loading...</span>
                    <span className="text-xs sm:text-sm text-blue-600 font-medium">⭐ Featured</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-6 xs:mt-7 sm:mt-8 space-x-2">
              {dishes.map((_, index) => (
                <button
                  key={index}
                  className={`w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full transition-colors ${
                    index === 0 ? 'bg-grub-red w-5 xs:w-6' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Client-side with animations
  // Animation variants for better performance
  const dishVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      x: -50,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div ref={sectionRef} className="py-8 xs:py-10 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="text-center mb-8 xs:mb-10 sm:mb-12">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
            Last Week's Most Ordered
          </h2>
          <p className="mt-2 xs:mt-3 sm:mt-4 max-w-3xl mx-auto text-sm xs:text-base sm:text-lg md:text-xl text-gray-500">
            Discover what everyone was ordering last week from our top restaurants
          </p>
        </div>
        
        <div className="relative h-auto min-h-[400px] xs:min-h-[450px] sm:min-h-[500px] md:h-[400px] lg:h-[450px] w-full">
          <AnimatePresence mode="wait">
            {dishes.map((dish, index) => (
              index === currentIndex && (
                <motion.div
                  key={dish._id || dish.id || `dish-${index}`}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dishVariants}
                  viewport={{ once: true, amount: 0.2 }}
                  className="flex items-center justify-center"
                >
                  <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-xl max-w-4xl w-full flex flex-col md:flex-row">
                    <div className="md:w-1/2 h-48 xs:h-56 sm:h-64 md:h-auto">
                      <img 
                        src={dish.image} 
                        alt={dish.name} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 xs:p-5 sm:p-6 md:p-8 md:w-1/2 flex flex-col justify-center">
                      <div className="flex flex-col xs:flex-row justify-between items-start mb-3 xs:mb-4 gap-2">
                        <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">{dish.name}</h3>
                        {dish.totalOrders > 0 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            🔥 {dish.totalOrders} orders last week
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs xs:text-sm sm:text-base text-gray-600 mb-3 xs:mb-4">{dish.description}</p>
                      
                      {/* Restaurant info */}
                      <div className="flex items-center mb-3 xs:mb-4">
                        <div className="w-8 h-8 bg-grub-red rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">
                            {dish.restaurant?.name?.charAt(0) || 'R'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{dish.restaurant?.name}</p>
                          <p className="text-xs text-gray-500">
                            {dish.restaurant?.cuisine?.join(', ') || dish.category}
                          </p>
                        </div>
                      </div>
                      
                      {/* Price and popularity */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg xs:text-xl sm:text-2xl font-bold text-grub-red">
                          ${typeof dish.price === 'number' ? dish.price.toFixed(2) : dish.price}
                        </span>
                        <div className="flex items-center space-x-2">
                          {dataSource === 'order_analytics' && (
                            <span className="text-xs text-green-600 font-medium">📊 Most Ordered</span>
                          )}
                          {dataSource === 'random_sample' && (
                            <span className="text-xs text-blue-600 font-medium">⭐ Featured</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
          
          <div className="flex justify-center mt-6 xs:mt-7 sm:mt-8 space-x-2">
            {dishes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-grub-red w-5 xs:w-6' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Data source indicator */}
          {!loading && dataSource && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                {dataSource === 'order_analytics' && '📊 Based on last week\'s order data'}
                {dataSource === 'random_sample' && '🎲 No orders from last week, showing sample dishes'}
                {dataSource === 'fallback' && '⚠️ Using sample data'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopularDishes;
