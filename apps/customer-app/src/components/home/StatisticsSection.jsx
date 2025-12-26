import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useServerData } from '../../utils/serverData';
import { useInView } from 'react-intersection-observer';
import { getPlatformStats } from '../../services/restaurantService';

const AnimatedCounter = ({ target, duration = 1500, prefix = '', suffix = '', motionVariants }) => {
  const [count, setCount] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (!inView) return;
    if (shouldReduceMotion) {
      setCount(target);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();
    const safeTarget = Number.isFinite(target) ? target : 0;

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(safeTarget * eased);
      setCount(next);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [inView, target, duration, shouldReduceMotion]);

  return (
    <motion.div
      ref={ref}
      className="stat-number text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-grub-red"
      variants={motionVariants}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.div>
  );
};

const StatCard = ({ title, value, description, prefix = '', suffix = '', isLive }) => {
  const shouldReduceMotion = useReducedMotion();
  const cardVariants = {
    rest: { y: 0 },
    hover: { y: -8, boxShadow: '0 18px 42px rgba(0,0,0,0.12)' },
    tap: { scale: 0.98 }
  };

  const numberVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.2 },
    tap: { scale: 1.06 }
  };

  const handlePointerDown = (e) => {
    if (shouldReduceMotion) return;
    if (e.pointerType !== 'touch') return;
    const el = e.currentTarget;
    el.classList.remove('pulse-active');
    void el.offsetWidth;
    el.classList.add('pulse-active');
    window.setTimeout(() => el.classList.remove('pulse-active'), 260);
  };

  return (
    <motion.div
      className="stat-card bg-white p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 rounded-lg sm:rounded-xl shadow-md text-center transition-shadow duration-300"
      initial="rest"
      animate="rest"
      whileHover={shouldReduceMotion ? undefined : 'hover'}
      whileTap={shouldReduceMotion ? undefined : 'tap'}
      variants={cardVariants}
      onPointerDown={handlePointerDown}
    >
      <AnimatedCounter target={value} prefix={prefix} suffix={suffix} duration={1500} motionVariants={shouldReduceMotion ? undefined : numberVariants} />
      <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold mt-2 xs:mt-3 text-gray-800">{title}</h3>
      <p className="stat-subtext text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 mt-1.5 xs:mt-2">
        {isLive ? <span className="stat-live-dot" aria-hidden="true"></span> : null}
        {description}
      </p>
    </motion.div>
  );
};

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
            <div className="stat-card bg-white p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 rounded-lg sm:rounded-xl shadow-md text-center transition-shadow duration-300">
              <div className="stat-number text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-grub-red">0</div>
              <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold mt-2 xs:mt-3 text-gray-800">Happy Customers</h3>
              <p className="stat-subtext text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 mt-1.5 xs:mt-2"><span className="stat-live-dot" aria-hidden="true"></span>and counting</p>
            </div>
            <div className="stat-card bg-white p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 rounded-lg sm:rounded-xl shadow-md text-center transition-shadow duration-300">
              <div className="stat-number text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-grub-red">0</div>
              <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold mt-2 xs:mt-3 text-gray-800">Partner Restaurants</h3>
              <p className="stat-subtext text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 mt-1.5 xs:mt-2"><span className="stat-live-dot" aria-hidden="true"></span>and growing</p>
            </div>
            <div className="stat-card bg-white p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 rounded-lg sm:rounded-xl shadow-md text-center transition-shadow duration-300">
              <div className="stat-number text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-grub-red">0</div>
              <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold mt-2 xs:mt-3 text-gray-800">Meals Served</h3>
              <p className="stat-subtext text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 mt-1.5 xs:mt-2">and many more to come</p>
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
            isLive={!loading}
          />
          <StatCard 
            value={stats.totalRestaurants || 0} 
            title="Partner Restaurants" 
            description={loading ? "Loading..." : "and growing"}
            isLive={!loading}
          />
          <StatCard 
            value={stats.totalOrders || 0} 
            title="Meals Served" 
            description={loading ? "Loading..." : "and many more to come"}
            isLive={false}
          />
        </div>
        {!loading && stats.dataSource && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              {stats.dataSource === 'live' ? null : '⚠️ Using fallback data'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsSection;
