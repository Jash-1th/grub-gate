import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useServerData } from '../../utils/serverData';
import { useInView } from 'react-intersection-observer';

const AnimatedCounter = ({ target, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (!inView) return;
    
    let start = 0;
    const increment = target / (duration / 16); // 60fps
    
    const updateCounter = () => {
      start += increment;
      if (start < target) {
        setCount(Math.ceil(start));
        requestAnimationFrame(updateCounter);
      } else {
        setCount(target);
      }
    };
    
    updateCounter();
  }, [inView, target, duration]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-grub-red">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
};

const StatCard = ({ title, value, description, prefix = '', suffix = '' }) => (
  <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
    <AnimatedCounter target={value} prefix={prefix} suffix={suffix} />
    <h3 className="text-xl font-semibold mt-2 text-gray-800">{title}</h3>
    <p className="text-gray-600 mt-2">{description}</p>
  </div>
);

const StatisticsSection = () => {
  // Get statistics from server data or use empty object as fallback
  const serverStats = useServerData('statistics') || {};
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    happyCustomers: 0,
    deliveryAreas: 0,
    orderCount: 0,
    ...serverStats
  });
  
  // If no server data, fetch on client side
  useEffect(() => {
    if (Object.keys(serverStats).length === 0) {
      // In a real app, you would fetch from your API here
      const fetchStats = async () => {
        try {
          // This is just an example - replace with your actual API call
          // const response = await fetch('/api/statistics');
          // const data = await response.json();
          // setStats(prev => ({ ...prev, ...data }));
          
          // Fallback static data
          const fallbackStats = {
            totalRestaurants: 500,
            happyCustomers: 10000,
            deliveryAreas: 25,
            orderCount: 50000,
          };
          
          setStats(fallbackStats);
        } catch (error) {
          console.error('Error fetching statistics:', error);
        }
      };
      
      fetchStats();
    }
  }, [serverStats]);

  // Use dynamic imports for browser-only code
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return a static version for SSR that matches client-side structure
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              GrubGate in Numbers
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Join thousands of satisfied users and restaurants
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl md:text-5xl font-bold text-grub-red">1000</div>
              <h3 className="text-xl font-semibold mt-2 text-gray-800">Happy Customers</h3>
              <p className="text-gray-600 mt-2">and counting</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl md:text-5xl font-bold text-grub-red">200</div>
              <h3 className="text-xl font-semibold mt-2 text-gray-800">Partner Restaurants</h3>
              <p className="text-gray-600 mt-2">and growing</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl md:text-5xl font-bold text-grub-red">5000</div>
              <h3 className="text-xl font-semibold mt-2 text-gray-800">Meals Served</h3>
              <p className="text-gray-600 mt-2">and many more to come</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Client-side rendering with animations
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            GrubGate in Numbers
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Join thousands of satisfied users and restaurants
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            value={1000} 
            title="Happy Customers" 
            description="and counting"
          />
          <StatCard 
            value={200} 
            title="Partner Restaurants" 
            description="and growing"
          />
          <StatCard 
            value={5000} 
            title="Meals Served" 
            description="and many more to come"
          />
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;
