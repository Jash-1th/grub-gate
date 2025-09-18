import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const dishes = [
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

const PopularDishes = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % dishes.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isClient) {
    // SSR-friendly static version
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dishes.map((dish) => (
              <div key={dish.id} className="bg-white rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={dish.image} 
                  alt={dish.name} 
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-900">{dish.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-grub-red">
                      {dish.rating} ★
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{dish.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">${dish.price.toFixed(2)}</span>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Client-side with animations
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
          <AnimatePresence mode="wait">
            {dishes.map((dish, index) => (
              index === currentIndex && (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
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
