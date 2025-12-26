import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import TwoColumnSection from '../components/common/TwoColumnSection';

const About = () => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef(null);
  const [isFinePointer, setIsFinePointer] = useState(false);

  const heroMouseX = useMotionValue(0);
  const heroMouseY = useMotionValue(0);
  const heroDriftX = useMotionValue(0);
  const heroDriftY = useMotionValue(0);
  const heroMouseXSmooth = useSpring(heroMouseX, { stiffness: 140, damping: 22, mass: 0.6 });
  const heroMouseYSmooth = useSpring(heroMouseY, { stiffness: 140, damping: 22, mass: 0.6 });
  const heroDriftXSmooth = useSpring(heroDriftX, { stiffness: 180, damping: 20, mass: 0.55 });
  const heroDriftYSmooth = useSpring(heroDriftY, { stiffness: 180, damping: 20, mass: 0.55 });

  const spotlightBg = useTransform([heroMouseXSmooth, heroMouseYSmooth], ([x, y]) => {
    const rx = Number.isFinite(x) ? x : 0;
    const ry = Number.isFinite(y) ? y : 0;
    return `radial-gradient(360px circle at ${rx}px ${ry}px, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 60%)`;
  });

  const heroTextShadow = useTransform([heroDriftXSmooth, heroDriftYSmooth], ([dx, dy]) => {
    const ox = -dx * 14;
    const oy = -dy * 14;
    return `${ox.toFixed(2)}px ${oy.toFixed(2)}px 26px rgba(0,0,0,0.38)`;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine)');
    const update = () => setIsFinePointer(Boolean(mq.matches));
    update();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  const handleHeroMouseMove = (e) => {
    if (shouldReduceMotion || !isFinePointer) return;
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    heroMouseX.set(x);
    heroMouseY.set(y);
    const nx = rect.width ? x / rect.width - 0.5 : 0;
    const ny = rect.height ? y / rect.height - 0.5 : 0;
    heroDriftX.set(nx * 2);
    heroDriftY.set(ny * 2);
  };

  const handleHeroMouseLeave = () => {
    heroMouseX.set(0);
    heroMouseY.set(0);
    heroDriftX.set(0);
    heroDriftY.set(0);
  };

  const valueCards = [
    {
      id: 'partnership',
      icon: '🤝',
      iconGradient: 'from-blue-500 to-blue-600',
      glow: '0 22px 55px rgba(59, 130, 246, 0.25)',
      title: t('about.values.partnershipTitle'),
      text: t('about.values.partnershipText')
    },
    {
      id: 'quality',
      icon: '⭐',
      iconGradient: 'from-yellow-500 to-orange-500',
      glow: '0 22px 55px rgba(245, 158, 11, 0.25)',
      title: t('about.values.qualityTitle'),
      text: t('about.values.qualityText')
    },
    {
      id: 'innovation',
      icon: '🚀',
      iconGradient: 'from-purple-500 to-pink-500',
      glow: '0 22px 55px rgba(168, 85, 247, 0.24)',
      title: t('about.values.innovationTitle'),
      text: t('about.values.innovationText')
    },
    {
      id: 'community',
      icon: '❤️',
      iconGradient: 'from-red-500 to-pink-500',
      glow: '0 22px 55px rgba(239, 68, 68, 0.24)',
      title: t('about.values.communityTitle'),
      text: t('about.values.communityText')
    }
  ];

  const cardVariants = shouldReduceMotion
    ? undefined
    : {
        hidden: {
          opacity: 0,
          rotateY: -90,
          transformPerspective: 1100
        },
        show: (i) => ({
          opacity: 1,
          rotateY: 0,
          transition: {
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.08 * i
          }
        })
      };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="gg-about-hero relative py-20 lg:py-32"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        {!shouldReduceMotion && isFinePointer ? (
          <motion.div
            aria-hidden
            className="gg-about-spotlight"
            style={{ backgroundImage: spotlightBg }}
          />
        ) : null}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center gg-about-hero-text">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            style={shouldReduceMotion ? undefined : { textShadow: heroTextShadow }}
            initial={shouldReduceMotion ? false : { opacity: 0, letterSpacing: '0.08em' }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, letterSpacing: '0em' }}
            viewport={{ once: true, amount: 0.7, margin: '0px 0px -10% 0px' }}
            transition={shouldReduceMotion ? undefined : { duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          >
            {t('about.heroTitle')}
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed"
            style={shouldReduceMotion ? undefined : { textShadow: heroTextShadow }}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.7, margin: '0px 0px -10% 0px' }}
            transition={shouldReduceMotion ? undefined : { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          >
            {t('about.heroSubtitle')}
          </motion.p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{color: '#800020'}}>
            {t('about.storyTitle')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {t('about.storySubtitle')}
          </p>
        </div>

        {/* Use TwoColumnSection for each section */}
        <div className="space-y-8">
          {(Array.isArray(t('about.sections', { returnObjects: true })) ? t('about.sections', { returnObjects: true }) : []).map((section, index) => (
            <TwoColumnSection
              key={section.id}
              sectionId={section.id}
              title={section.title}
              description={section.description}
              image={section.image}
              reverse={index % 2 === 1}
            />
          ))}
        </div>
      </section>

      {/* Our Team Section */}
      {/* <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{color: '#800020'}}>
              {t('about.teamTitle')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.teamSubtitle')}
            </p>
          </div>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', role: t('about.team.ceo') },
              { name: 'Michael Chen', role: t('about.team.cto') },
              { name: 'Emily Rodriguez', role: t('about.team.coo') },
              { name: 'David Thompson', role: t('about.team.headMarketing') },
              { name: 'Lisa Wang', role: t('about.team.headCustomerExperience') },
              { name: 'James Wilson', role: t('about.team.headOperations') }
            ].map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center group"
              >
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full mx-auto bg-grub-red flex items-center justify-center text-white text-4xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-grub-red font-semibold mb-4">
                  {member.role}
                </p>
                <div className="w-12 h-1 bg-grub-red mx-auto rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Values Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-2" style={{color: '#800020'}}>
              {t('about.valuesTitle')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4 leading-relaxed">
              {t('about.valuesSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {valueCards.map((card, index) => (
              <motion.div
                key={card.id}
                className="group"
                variants={cardVariants}
                custom={index}
                initial={shouldReduceMotion ? false : 'hidden'}
                whileInView={shouldReduceMotion ? undefined : 'show'}
                viewport={{ once: false, amount: 0.6, margin: '0px 0px -10% 0px' }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <motion.div
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg transition-all duration-300 text-center border border-gray-100 hover:border-grub-red/20"
                  initial={false}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -6,
                          boxShadow: card.glow
                        }
                  }
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                >
                  <div className="relative mb-6">
                    <motion.div
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br ${card.iconGradient} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-4 shadow-lg overflow-hidden`}
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : card.id === 'community'
                            ? { scale: [1, 1.12, 1] }
                            : card.id === 'innovation'
                              ? { y: [0, -6, 0] }
                              : card.id === 'partnership'
                                ? { y: [0, -2, 0] }
                                : card.id === 'quality'
                                  ? { rotate: [0, 10, -8, 0] }
                                  : undefined
                      }
                      transition={
                        shouldReduceMotion
                          ? undefined
                          : card.id === 'community'
                            ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                            : card.id === 'innovation'
                              ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
                              : card.id === 'partnership'
                                ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
                                : card.id === 'quality'
                                  ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
                                  : undefined
                      }
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : card.id === 'partnership'
                            ? { y: [-2, -6, -2] }
                            : card.id === 'innovation'
                              ? { rotate: [0, -6, 6, -4, 4, 0] }
                              : undefined
                      }
                    >
                      <span aria-hidden="true">{card.icon}</span>

                      {card.id === 'quality' && !shouldReduceMotion ? (
                        <motion.span
                          aria-hidden="true"
                          className="absolute inset-0"
                          style={{
                            background:
                              'linear-gradient(120deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 65%)',
                            mixBlendMode: 'overlay',
                            transform: 'skewX(-18deg) translateX(-140%)'
                          }}
                          animate={{ x: ['-140%', '140%'] }}
                          transition={{ duration: 1.05, repeat: Infinity, repeatDelay: 2.2, ease: 'easeInOut' }}
                        />
                      ) : null}
                    </motion.div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{card.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{card.text}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;