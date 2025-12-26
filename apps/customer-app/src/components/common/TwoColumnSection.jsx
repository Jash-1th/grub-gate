import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const TwoColumnSection = ({ sectionId, title, description, image, reverse = false }) => {
  // Add scroll animation to each section
  const shouldReduceMotion = useReducedMotion();
  const [canTrigger, setCanTrigger] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) return;
    if (typeof window === 'undefined') return;
    const id = requestAnimationFrame(() => setCanTrigger(true));
    return () => cancelAnimationFrame(id);
  }, [shouldReduceMotion]);

  const handleViewportEnter = () => {
    if (shouldReduceMotion) return;
    if (!canTrigger) return;
    setHasEntered(true);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => setIsMobile(Boolean(mq.matches));
    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else mq.addListener(apply);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', apply);
      else mq.removeListener(apply);
    };
  }, []);

  const normalizedId = sectionId != null ? String(sectionId) : '';
  const isMission = normalizedId === '1';
  const isVision = normalizedId === '2';
  const isStory = normalizedId === '3';

  const textFromX = reverse ? 72 : -72;
  const imageFromX = reverse ? -72 : 72;

  const blockVariants = useMemo(() => {
    if (shouldReduceMotion) return undefined;
    return {
      hidden: (c) => ({
        opacity: 0,
        y: c.isMobile ? 18 : 0,
        x: c.isMobile ? 0 : c.fromX
      }),
      show: (c) => ({
        opacity: 1,
        y: 0,
        x: 0,
        transition: {
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
          delay: c.delay
        }
      })
    };
  }, [shouldReduceMotion]);

  const missionHeadingStyle = shouldReduceMotion
    ? undefined
    : {
        color: isMission && hasEntered ? '#800020' : '#111827'
      };

  const missionTextStyle = shouldReduceMotion
    ? undefined
    : {
        color: isMission && hasEntered ? '#111827' : '#374151'
      };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Card Container with scroll animation */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 lg:p-10"
        initial={false}
        onViewportEnter={handleViewportEnter}
        viewport={{ once: true, amount: 0.35, margin: '0px 0px -15% 0px' }}
      >
        <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-12`}>
          {/* Text Content */}
          <motion.div
            className="md:w-1/2 text-center md:text-left"
            variants={blockVariants}
            custom={{ fromX: textFromX, delay: 0.05, isMobile }}
            initial={shouldReduceMotion ? false : 'hidden'}
            animate={shouldReduceMotion ? undefined : hasEntered ? 'show' : 'hidden'}
          >
            <motion.h2
              className="text-3xl font-bold mb-4"
              style={isMission ? missionHeadingStyle : { color: '#800020' }}
              animate={isMission && !shouldReduceMotion ? { color: hasEntered ? '#800020' : '#111827' } : undefined}
              transition={isMission && !shouldReduceMotion ? { duration: 0.6, ease: 'easeOut' } : undefined}
            >
              {title}
            </motion.h2>
            <motion.p
              className="leading-relaxed text-lg"
              style={isMission ? missionTextStyle : { color: '#374151' }}
              animate={isMission && !shouldReduceMotion ? { color: hasEntered ? '#111827' : '#374151' } : undefined}
              transition={isMission && !shouldReduceMotion ? { duration: 0.6, ease: 'easeOut', delay: 0.08 } : undefined}
            >
              {description}
            </motion.p>
          </motion.div>
          {/* Image Content */}
          <motion.div
            className="md:w-1/2"
            variants={blockVariants}
            custom={{ fromX: imageFromX, delay: 0.12, isMobile }}
            initial={shouldReduceMotion ? false : 'hidden'}
            animate={shouldReduceMotion ? undefined : hasEntered ? 'show' : 'hidden'}
          >
            {/* Image Container with Fixed Aspect Ratio */}
            <div className="w-full h-48 md:h-56 lg:h-64 rounded-xl overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center">
              {isMission ? (
                <motion.div
                  className="w-full h-full flex items-center justify-center"
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : {
                          scale: [1, 1.08, 1]
                        }
                  }
                  transition={
                    shouldReduceMotion
                      ? undefined
                      : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
                  }
                >
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-xl">
                    <span aria-hidden="true" className="text-4xl md:text-5xl">❤️</span>
                  </div>
                </motion.div>
              ) : (
                <motion.img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                  initial={shouldReduceMotion ? false : { scale: 1, x: 0 }}
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : hasEntered
                        ? isVision
                          ? { scale: [1, 1.05] }
                          : isStory
                            ? { x: [-14, 14] }
                            : undefined
                        : undefined
                  }
                  transition={
                    shouldReduceMotion
                      ? undefined
                      : isVision
                        ? { duration: 5, ease: 'linear', repeat: Infinity, repeatType: 'mirror' }
                        : isStory
                          ? { duration: 8, ease: 'linear', repeat: Infinity, repeatType: 'mirror' }
                          : undefined
                  }
                />
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default TwoColumnSection;
