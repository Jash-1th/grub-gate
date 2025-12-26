// src/components/home/WhyGrubGateSection.jsx

import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { getRestaurantStats } from '../../services/restaurantService';
import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

// Individual Benefit Card Component with Animation
const BenefitCard = ({ benefit, index, isActive }) => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef(null);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotX = useSpring(tiltY, { stiffness: 160, damping: 18, mass: 0.45 });
  const rotY = useSpring(tiltX, { stiffness: 160, damping: 18, mass: 0.45 });

  const handleMouseMove = (e) => {
    if (shouldReduceMotion) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const dx = (x - 0.5) * 2;
    const dy = (y - 0.5) * 2;

    tiltX.set(dx * 8);
    tiltY.set(-dy * 8);

    el.style.setProperty('--spot-x', `${x * 100}%`);
    el.style.setProperty('--spot-y', `${y * 100}%`);
  };

  const handleMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--spot-x', '50%');
    el.style.setProperty('--spot-y', '50%');
  };

  const variants = {
    hidden: { opacity: 0, y: 26, scale: 0.98 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.65,
        ease: [0.22, 1, 0.36, 1],
        delay: shouldReduceMotion ? 0 : i * 0.12
      }
    })
  };

  return (
    <motion.div 
      ref={cardRef}
      className="benefit-card bg-white rounded-xl sm:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 shadow-lg text-center group"
      variants={variants}
      initial={shouldReduceMotion ? false : 'hidden'}
      animate={shouldReduceMotion ? 'show' : isActive ? 'show' : 'hidden'}
      custom={index}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 900 }}
      whileHover={shouldReduceMotion ? undefined : { y: -10, boxShadow: '0 22px 55px rgba(0,0,0,0.18)' }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4">{t(`benefits.${benefit.id}.title`)}</h3>
      <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 mb-3 xs:mb-4 sm:mb-5 md:mb-6 leading-relaxed">{t(`benefits.${benefit.id}.description`)}</p>
      <ul className="benefit-features text-xs sm:text-sm md:text-base text-gray-500 space-y-1 xs:space-y-1.5 sm:space-y-2 inline-block text-left">
        {Object.keys(t(`benefits.${benefit.id}.features`, { returnObjects: true })).map(key => (
          <li key={key} className="flex items-center">
            <span className="benefit-bullet mr-2 flex-shrink-0" aria-hidden="true">
              <span className="benefit-bullet-dot"></span>
              <span className="benefit-bullet-check">✓</span>
            </span>
            <span className="leading-relaxed">{t(`benefits.${benefit.id}.features.${key}`)}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

// Individual Special Feature Card Component with Animation
const SpecialFeatureCard = ({ feature, index }) => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  // Call the hook for each feature card
  const [cardRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  const handlePointerDown = (e) => {
    if (shouldReduceMotion) return;
    if (e.pointerType !== 'touch') return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--ripple-x', `${x}%`);
    el.style.setProperty('--ripple-y', `${y}%`);
    el.classList.remove('ripple-active');
    // Force reflow so the animation restarts on repeated taps
    void el.offsetWidth;
    el.classList.add('ripple-active');
    window.setTimeout(() => el.classList.remove('ripple-active'), 520);
  };

  const variants = {
    hidden: { opacity: 0, y: 16 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.55,
        ease: [0.22, 1, 0.36, 1],
        delay: shouldReduceMotion ? 0 : i * 0.1
      }
    })
  };

  return (
    <motion.div 
      ref={cardRef}
      className="special-feature-card bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl p-4 xs:p-5 sm:p-6 md:p-7 border border-gray-100 transition-all duration-300"
      variants={variants}
      initial={shouldReduceMotion ? false : 'hidden'}
      animate={shouldReduceMotion ? 'show' : isVisible ? 'show' : 'hidden'}
      custom={index}
      whileHover={shouldReduceMotion ? undefined : { y: -8, boxShadow: '0 18px 42px rgba(0,0,0,0.12)' }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98, y: -2 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      onPointerDown={handlePointerDown}
    >
      <div className="text-center">
        <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mb-2 xs:mb-3 text-gray-900 flex items-center justify-center">
          {feature.isLoading && feature.id === '2' ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-grub-red"></div>
              <span className="text-lg">Loading...</span>
            </div>
          ) : (
            <span className={`${feature.id === '2' ? 'text-grub-red' : 'text-gray-800'} leading-tight`}>
              {feature.stat}
            </span>
          )}
        </div>
        <h4 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-1.5 xs:mb-2 leading-tight">
          {t(`additionalFeatures.${feature.id}.title`)}
        </h4>
        <p className="text-gray-600 text-xs xs:text-sm sm:text-base md:text-lg leading-relaxed">
          {t(`additionalFeatures.${feature.id}.description`)}
        </p>
      </div>
    </motion.div>
  );
};

const WhyGrubGateSection = () => {
  const { t } = useTranslation();
  const [restaurantCount, setRestaurantCount] = useState(0); // Default fallback
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const benefitsRef = useRef(null);
  const benefitsInView = useInView(benefitsRef, { amount: 0.2, once: true });

  // Fetch restaurant stats from backend (live DB count used for the "{{count}}+ Restaurants" text in 'What Makes Us Special')
  useEffect(() => {
    const fetchRestaurantStats = async () => {
      try {
        const response = await getRestaurantStats();
        if (response.success && response.data.totalRestaurants) {
          setRestaurantCount(response.data.totalRestaurants);
        }
      } catch (error) {
        console.error('Error fetching restaurant stats:', error);
        // Keep default fallback value
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantStats();
  }, []);

  // Data for the benefit cards to make the code cleaner
  const benefitsData = [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' }
  ];

  // Data for the special features section - now with dynamic restaurant count
  const specialFeaturesData = [
    { id: '1', stat: t('whyGrubGate.stats.stressFree') },
    { 
      id: '2', 
      stat: t('whyGrubGate.stats.restaurants', { count: loading ? 0 : restaurantCount }),
      isLoading: loading 
    },
    { id: '3', stat: t('whyGrubGate.stats.available') },
    { id: '4', stat: t('whyGrubGate.stats.secure') }
  ];

  return (
    <section className="py-8 xs:py-10 sm:py-12 md:py-16 lg:py-20 xl:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-14 lg:mb-16">
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 xs:mb-4 sm:mb-5 md:mb-6 px-2" style={{ color: '#800020' }}>
            {t('whyGrubGate.title')}
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto px-3 xs:px-4 leading-relaxed">
            {t('whyGrubGate.subtitle')}
          </p>
        </div>

        {/* Benefits Grid */}
        <div ref={benefitsRef} className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8 mb-8 xs:mb-10 sm:mb-12 md:mb-14 lg:mb-16">
          {benefitsData.map(benefit => (
            <BenefitCard key={benefit.id} benefit={benefit} index={Number(benefit.id) - 1} isActive={shouldReduceMotion ? true : benefitsInView} />
          ))}
        </div>

        {/* Special Features Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12 shadow-lg">
          <h3 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12 px-2 xs:px-3 sm:px-4" style={{ color: '#800020' }}>
            {t('whyGrubGate.specialTitle')}
          </h3>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {specialFeaturesData.map((feature, index) => (
              <SpecialFeatureCard key={feature.id} feature={feature} index={index} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default WhyGrubGateSection;