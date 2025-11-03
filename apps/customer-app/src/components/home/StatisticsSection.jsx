import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useServerData } from '../../utils/serverData';
import { useInView } from 'react-intersection-observer';
import { getPlatformStats } from '../../services/restaurantService';

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
    <div ref={ref} className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-grub-red">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
};

const StatCard = ({ title, value, description, prefix = '', suffix = '' }) => (
  <div className="bg-white p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 rounded-lg sm:rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
    <AnimatedCounter target={value} prefix={prefix} suffix={suffix} />
    <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold mt-2 xs:mt-3 text-gray-800">{title}</h3>
    <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 mt-1.5 xs:mt-2">{description}</p>
  </div>
);

const StatisticsSection = () => {
  // Get statistics from server data or use empty object as fallback
  const serverStats = useServerData('statistics') || {};
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalCustomers: 0,
    totalOrders: 0,
    ...serverStats
  });
  const [loading, setLoading] = useState(true);
  
  // Fetch platform statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getPlatformStats();
        if (response.success && response.data) {
          setStats({
            totalRestaurants: response.data.totalRestaurants || 0,
            totalCustomers: response.data.totalCustomers || 0,
            totalOrders: response.data.totalOrders || 0,
            averageRating: response.data.averageRating || 0,
            dataSource: response.data.dataSource || 'live'
          });
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Keep default fallback values
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Use dynamic imports for browser-only code
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return a static version for SSR that matches client-side structure
    return (
      <div className="py-8 xs:py-10 sm:py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="text-center mb-8 xs:mb-10 sm:mb-12">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
              GrubGate in Numbers
            </h2>
            <p className="mt-2 xs:mt-3 sm:mt-4 max-w-3xl mx-auto text-sm xs:text-base sm:text-lg md:text-xl text-gray-500">
              Join thousands of satisfied users and restaurants
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8">
            <div className="bg-white p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 rounded-lg sm:rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-grub-red">0</div>
              <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold mt-2 xs:mt-3 text-gray-800">Happy Customers</h3>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 mt-1.5 xs:mt-2">and counting</p>
            </div>
            <div className="bg-white p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 rounded-lg sm:rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-grub-red">0</div>
              <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold mt-2 xs:mt-3 text-gray-800">Partner Restaurants</h3>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 mt-1.5 xs:mt-2">and growing</p>
            </div>
            <div className="bg-white p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 rounded-lg sm:rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-grub-red">0</div>
              <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold mt-2 xs:mt-3 text-gray-800">Meals Served</h3>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 mt-1.5 xs:mt-2">and many more to come</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Client-side rendering with animations
  return (
    <div className="py-8 xs:py-10 sm:py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="text-center mb-8 xs:mb-10 sm:mb-12">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
            GrubGate in Numbers
          </h2>
          <p className="mt-2 xs:mt-3 sm:mt-4 max-w-3xl mx-auto text-sm xs:text-base sm:text-lg md:text-xl text-gray-500">
            Join thousands of satisfied users and restaurants
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8">
          <StatCard 
            value={stats.totalCustomers || 0} 
            title="Happy Customers" 
            description={loading ? "Loading..." : "and counting"}
          />
          <StatCard 
            value={stats.totalRestaurants || 0} 
            title="Partner Restaurants" 
            description={loading ? "Loading..." : "and growing"}
          />
          <StatCard 
            value={stats.totalOrders || 0} 
            title="Meals Served" 
            description={loading ? "Loading..." : "and many more to come"}
          />
        </div>
        {!loading && stats.dataSource && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              {stats.dataSource === 'live' ? '📊 Live data from database' : '⚠️ Using fallback data'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsSection;
