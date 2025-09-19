import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useServerData } from '../../utils/serverData';

const PopularDishes = () => {
  // Get dishes from server data or use empty array as fallback
  const serverDishes = useServerData('popularDishes') || [];
  const [dishes, setDishes] = useState(serverDishes);
  
  // If no server data, fetch on client side
  useEffect(() => {
    if (dishes.length === 0) {
      // In a real app, you would fetch from your API here
      const fetchDishes = async () => {
        try {
          // This is just an example - replace with your actual API call
          // const response = await fetch('/api/popular-dishes');
          // const data = await response.json();
          // setDishes(data);
          
          // Fallback static data
          const fallbackDishes = [
            {
              id: 1,
              name: 'Gourmet Burger',
              description: 'Juicy beef patty with fresh vegetables and special sauce',
              image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
              rating: 4.8,
              price: 12.99,
            },
            {
              id: 2,
              name: 'Margherita Pizza',
              description: 'Classic Italian pizza with fresh basil and mozzarella',
              image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=500&q=80',
              rating: 4.7,
              price: 14.99,
            },
            {
              id: 3,
              name: 'Sushi Platter',
              description: 'Assorted fresh sushi with wasabi and soy sauce',
              image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80',
              rating: 4.9,
              price: 18.99,
            },
          ];
          
          setDishes(fallbackDishes);
        } catch (error) {
          console.error('Error fetching popular dishes:', error);
        }
      };
      
      fetchDishes();
    }
  }, [dishes.length]);
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
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Popular Dishes
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Discover our most loved dishes from top restaurants
            </p>
          </div>
          
          <div className="relative h-[500px] md:h-[400px] w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-xl overflow-hidden shadow-xl max-w-3xl w-full flex flex-col md:flex-row h-full">
                <div className="md:w-1/2 h-64 md:h-auto">
                  <img 
                    src={dishes[0]?.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80'} 
                    alt={dishes[0]?.name || 'Gourmet Burger'} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-8 md:w-1/2 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-gray-900">{dishes[0]?.name || 'Gourmet Burger'}</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      {dishes[0]?.rating || 4.8} ★
                    </span>
                  </div>
                  <p className="mt-4 text-gray-600">{dishes[0]?.description || 'Juicy beef patty with fresh vegetables and special sauce'}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">${(dishes[0]?.price || 12.99).toFixed(2)}</span>
                    <button className="px-6 py-3 bg-grub-red text-white rounded-lg hover:bg-red-900 transition-colors">
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-2">
              {dishes.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === 0 ? 'bg-grub-red w-6' : 'bg-gray-300'
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
    <div ref={sectionRef} className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Popular Dishes
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Discover our most loved dishes from top restaurants
          </p>
        </div>
        
        <div className="relative h-[500px] md:h-[400px] w-full">
          <AnimatePresence mode="wait">
            {dishes.map((dish, index) => (
              index === currentIndex && (
                <motion.div
                  key={dish.id}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dishVariants}
                  viewport={{ once: true, amount: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-xl max-w-3xl w-full flex flex-col md:flex-row h-full">
                    <div className="md:w-1/2 h-64 md:h-auto">
                      <img 
                        src={dish.image} 
                        alt={dish.name} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-8 md:w-1/2 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-bold text-gray-900">{dish.name}</h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                          {dish.rating} ★
                        </span>
                      </div>
                      <p className="mt-4 text-gray-600">{dish.description}</p>
                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">${dish.price.toFixed(2)}</span>
                        <button 
                          className="px-6 py-3 bg-grub-red text-white rounded-lg hover:bg-red-900 transition-colors"
                          onClick={() => console.log(`Ordered ${dish.name}`)}
                        >
                          Order Now
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
          
          <div className="flex justify-center mt-8 space-x-2">
            {dishes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-grub-red w-6' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularDishes;
