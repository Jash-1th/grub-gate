import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import mealCalendarApi from '../../api/mealCalendarApi';
import '../common/hero-responsive.css';
// Use public path for SSR compatibility
const heroImage = '/images/HeroHome.jpg';

const AnimatedWords = ({ text, className, isReducedMotion, isActive }) => {
  const words = useMemo(() => {
    const value = typeof text === 'string' ? text : '';
    const parts = value.trim().split(/\s+/).filter(Boolean);
    return parts.length ? parts : [''];
  }, [text]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: isReducedMotion ? 0 : 0.08,
        delayChildren: isReducedMotion ? 0 : 0.05
      }
    }
  };

  const word = {
    hidden: { opacity: 0, y: isReducedMotion ? 0 : 18, filter: isReducedMotion ? 'none' : 'blur(6px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: isReducedMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.span
      className={className}
      variants={container}
      initial={isReducedMotion ? false : 'hidden'}
      animate={isReducedMotion ? 'show' : isActive ? 'show' : 'hidden'}
    >
      {words.map((w, idx) => (
        <motion.span key={`${w}-${idx}`} variants={word} className="inline-block will-change-transform">
          {w}
          {idx < words.length - 1 ? '\u00A0' : null}
        </motion.span>
      ))}
    </motion.span>
  );
};

const HeroSection = () => {
  const { t } = useTranslation();
  const { openOTPAuthModal } = useModal();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const isInView = useInView(contentRef, { amount: 0.6, once: true });
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFinePointer, setIsFinePointer] = useState(false);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const bgScrollY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -80]);

  const bgMouseX = useMotionValue(0);
  const bgMouseY = useMotionValue(0);
  const bgMouseXSmooth = useSpring(bgMouseX, { stiffness: 140, damping: 22, mass: 0.6 });
  const bgMouseYSmooth = useSpring(bgMouseY, { stiffness: 140, damping: 22, mass: 0.6 });

  const btnX = useMotionValue(0);
  const btnY = useMotionValue(0);
  const btnXSmooth = useSpring(btnX, { stiffness: 220, damping: 18, mass: 0.35 });
  const btnYSmooth = useSpring(btnY, { stiffness: 220, damping: 18, mass: 0.35 });

  const bgPosX = useTransform(bgMouseXSmooth, (v) => `calc(50% + ${v}px)`);
  const bgPosY = useTransform([bgScrollY, bgMouseYSmooth], ([sy, my]) => `calc(50% + ${my + sy}px)`);

  // Check subscription status when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.roles?.includes('customer')) {
      checkSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine)');
    const update = () => setIsFinePointer(!!mq.matches);
    update();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const response = await mealCalendarApi.getSubscriptionStatus();
      if (response.success && response.data.hasActiveSubscription) {
        setHasActiveSubscription(true);
      } else {
        setHasActiveSubscription(false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (hasActiveSubscription) {
        // User has active subscription, navigate to meal calendar
        navigate('/meal-calendar');
      } else {
        // User is logged in but no active subscription, navigate to plan page
        navigate('/plan');
      }
    } else {
      // User is not logged in, open OTP modal for signup
      openOTPAuthModal('signup');
    }
  };

  const handleHeroMouseMove = (e) => {
    if (shouldReduceMotion || !isFinePointer) return;
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const dx = (x - 0.5) * 2;
    const dy = (y - 0.5) * 2;
    bgMouseX.set(-dx * 14);
    bgMouseY.set(-dy * 10);
  };

  const handleHeroMouseLeave = () => {
    bgMouseX.set(0);
    bgMouseY.set(0);
  };

  const handleButtonMouseMove = (e) => {
    if (shouldReduceMotion || !isFinePointer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const dx = (x - 0.5) * 2;
    const dy = (y - 0.5) * 2;
    btnX.set(dx * 8);
    btnY.set(dy * 6);
  };

  const handleButtonMouseLeave = () => {
    btnX.set(0);
    btnY.set(0);
  };

  const heroTitle = t('hero.title');
  const heroSubtitle = t('hero.subtitle');
  const heroDescription = t('hero.description');

  return (
    <motion.section 
      ref={sectionRef}
      className="hero-section-responsive"
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundPositionX: shouldReduceMotion ? '50%' : bgPosX,
        backgroundPositionY: shouldReduceMotion ? '50%' : bgPosY
      }}
    >
      {/* Frosted glass overlay */}
      <div className="hero-overlay"></div>

      {!shouldReduceMotion ? (
        <div className="hero-atmosphere" aria-hidden="true">
          <div className="hero-steam hero-steam-1"></div>
          <div className="hero-steam hero-steam-2"></div>
          <div className="hero-steam hero-steam-3"></div>
          <div className="hero-mote hero-mote-1"></div>
          <div className="hero-mote hero-mote-2"></div>
          <div className="hero-mote hero-mote-3"></div>
          <div className="hero-mote hero-mote-4"></div>
        </div>
      ) : null}
      
      {/* Content */}
      <div ref={contentRef} className="hero-content hero-content-home px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-7xl mx-auto">
        <motion.h1
          className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 md:mb-8 leading-tight"
          initial={shouldReduceMotion ? false : 'hidden'}
          animate={shouldReduceMotion ? 'show' : isInView ? 'show' : 'hidden'}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { duration: shouldReduceMotion ? 0 : 0.2 } }
          }}
        >
          <span className="block overflow-visible pb-1">
            <AnimatedWords text={heroTitle} isReducedMotion={shouldReduceMotion} isActive={isInView} />
          </span>
          <span className="block overflow-visible pb-1 text-red-300">
            <AnimatedWords text={heroSubtitle} isReducedMotion={shouldReduceMotion} isActive={isInView} />
          </span>
        </motion.h1>
       
        <motion.p
          className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-100 mb-6 sm:mb-8 md:mb-10 max-w-5xl mx-auto leading-relaxed px-2 xs:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={shouldReduceMotion ? { opacity: 1, y: 0 } : isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.65, delay: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {heroDescription}
        </motion.p>
        
        {/* Enhanced CTA Button - Next Step Highlight */}
        <div className="relative inline-flex items-center justify-center mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md">
          {/* Animated glow ring */}
          <motion.div
            className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-grub-red via-grub-red to-grub-red opacity-60 blur-md"
            animate={shouldReduceMotion ? { opacity: 0.6 } : { opacity: [0.3, 0.62, 0.3], scale: [1, 1.05, 1] }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-grub-red via-grub-red to-grub-red opacity-30 blur-sm"
            animate={shouldReduceMotion ? { opacity: 0.3 } : { opacity: [0.1, 0.38, 0.1], scale: [1, 1.09, 1] }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          {/* Glass container */}
          <div className="relative rounded-xl sm:rounded-2xl bg-black/30 backdrop-blur-md p-0.5 sm:p-1 border border-white/20 w-full">
            <motion.button
              onClick={handleGetStarted}
              disabled={loading}
              type="button"
              onMouseMove={handleButtonMouseMove}
              onMouseLeave={handleButtonMouseLeave}
              style={{ x: btnXSmooth, y: btnYSmooth }}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.06, y: -4 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98, y: -2 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="group relative w-full px-6 xs:px-8 sm:px-10 md:px-12 py-3 xs:py-4 sm:py-5 md:py-6 bg-gradient-to-r from-grub-red via-grub-red to-grub-red text-white rounded-lg sm:rounded-xl font-bold text-base xs:text-lg sm:text-xl md:text-2xl shadow-2xl hover:shadow-grub-red/50 transition-shadow duration-300 overflow-hidden"
            >
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Button content */}
              <div className="relative flex items-center justify-center">
                <span className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-wide">
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Loading...
                    </div>
                  ) : isAuthenticated ? (
                    hasActiveSubscription ? t('yourOrders.viewCalendar') : t('common.startPlanning')
                  ) : (
                    t('hero.getStarted')
                  )}
                </span>
              </div>
              
              {/* Sparkle effects */}
              <div className="absolute top-1 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-ping delay-100"></div>
              <div className="absolute bottom-2 right-6 w-1 h-1 bg-white rounded-full animate-ping delay-300"></div>
              <div className="absolute top-3 right-12 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping delay-500"></div>
            </motion.button>
          </div>
        </div>
        
        {/* Stats */}
        {/* <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {heroContent.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-sm sm:text-base text-gray-200 font-medium">
                {stat.label}
              </div>
              <div className="text-xs sm:text-sm text-gray-300">
                {stat.description}
              </div>
            </div>
          ))}
        </div> */}
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden xs:block">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </motion.section>
  );
};

export default HeroSection;