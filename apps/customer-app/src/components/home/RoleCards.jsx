import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion, useAnimationControls, useInView, useReducedMotion } from 'framer-motion';

const RoleCards = () => {
  const { t } = useTranslation();
  const { openOTPAuthModal } = useModal();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { amount: 0.2, once: true });
  const [isMobile, setIsMobile] = useState(false);
  const runnerButtonControls = useAnimationControls();

  const handleCustomerClick = () => {
    if (isAuthenticated) {
      // User is logged in, navigate to plan page
      navigate('/plan');
    } else {
      // User is not logged in, open OTP modal for signup
      openOTPAuthModal('signup');
    }
  };

  const handlePartnerClick = () => {
    // Navigate to partner portal
    window.open('https://gg0p1.netlify.app/', '_blank');
  };

  const handleGrubRunnerClick = () => {
    // For now, do nothing - coming soon
    console.log('Grub Runners - Coming Soon!');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 639px)');
    const apply = () => setIsMobile(Boolean(mq.matches));
    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else mq.addListener(apply);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', apply);
      else mq.removeListener(apply);
    };
  }, []);

  const handleLockedRunnerClick = async () => {
    if (shouldReduceMotion) return;
    await runnerButtonControls.start({
      x: [0, -6, 6, -5, 5, -3, 3, 0],
      transition: { duration: 0.38, ease: 'easeInOut' }
    });
  };

  const roleCards = [
    {
      id: 'customer',
      title: t('roleCards.cards.customer.title'),
      subtitle: t('roleCards.cards.customer.subtitle'),
      description: t('roleCards.cards.customer.description'),
      icon: '🍽️',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      features: [
        t('roleCards.cards.customer.features.0'),
        t('roleCards.cards.customer.features.1'),
        t('roleCards.cards.customer.features.2'),
        t('roleCards.cards.customer.features.3')
      ],
      onClick: handleCustomerClick,
      buttonText: isAuthenticated ? t('common.startPlanning') : t('roleCards.cards.customer.button'),
      buttonStyle: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'partner',
      title: t('roleCards.cards.partner.title'),
      subtitle: t('roleCards.cards.partner.subtitle'),
      description: t('roleCards.cards.partner.description'),
      icon: '🏪',
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'hover:from-green-600 hover:to-green-700',
      features: [
        t('roleCards.cards.partner.features.0'),
        t('roleCards.cards.partner.features.1'),
        t('roleCards.cards.partner.features.2'),
        t('roleCards.cards.partner.features.3')
      ],
      onClick: handlePartnerClick,
      buttonText: t('roleCards.cards.partner.button'),
      buttonStyle: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'runner',
      title: t('roleCards.cards.runner.title'),
      subtitle: t('roleCards.cards.runner.subtitle'),
      description: t('roleCards.cards.runner.description'),
      icon: '🚴‍♂️',
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'hover:from-orange-600 hover:to-orange-700',
      features: [
        t('roleCards.cards.runner.features.0'),
        t('roleCards.cards.runner.features.1'),
        t('roleCards.cards.runner.features.2'),
        t('roleCards.cards.runner.features.3')
      ],
      onClick: handleGrubRunnerClick,
      buttonText: t('roleCards.cards.runner.button'),
      buttonStyle: 'bg-gray-400 cursor-not-allowed',
      disabled: true
    }
  ];

  const cardMotionConfig = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        variants: undefined,
        getCustom: () => ({ fromX: 0, delay: 0 })
      };
    }

    const desktop = {
      customer: { fromX: -64, delay: 0.18 },
      partner: { fromX: 0, delay: 0.05 },
      runner: { fromX: 64, delay: 0.22 }
    };

    const mobile = {
      customer: { fromX: -56, delay: 0.0 },
      partner: { fromX: 56, delay: 0.12 },
      runner: { fromX: -56, delay: 0.24 }
    };

    const variants = {
      hidden: (c) => ({ opacity: 0, y: 18, x: c.fromX, scale: 0.985 }),
      show: (c) => ({
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        transition: {
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
          delay: c.delay
        }
      })
    };

    return {
      variants,
      getCustom: (id) => (isMobile ? mobile[id] : desktop[id])
    };
  }, [isMobile, shouldReduceMotion]);

  return (
    <section ref={sectionRef} className="py-6 xs:py-8 sm:py-10 md:py-12 lg:py-14 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-6 xs:mb-7 sm:mb-8 md:mb-10">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 xs:mb-4">
            {t('roleCards.sectionTitle')}
          </h2>
          <p className="text-sm xs:text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2">
            {t('roleCards.sectionSubtitle')}
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6">
          {roleCards.map((card) => (
            <motion.div
              key={card.id}
              className={`group relative bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 overflow-hidden ${
                card.disabled ? 'opacity-75' : 'cursor-pointer'
              }`}
              onClick={!card.disabled ? card.onClick : undefined}
              variants={cardMotionConfig.variants}
              initial={shouldReduceMotion ? false : 'hidden'}
              animate={shouldReduceMotion ? 'show' : isInView ? 'show' : 'hidden'}
              custom={cardMotionConfig.getCustom(card.id)}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} ${card.hoverGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Card Content */}
              <div className="relative p-4 xs:p-5 sm:p-6">
                {/* Icon */}
                <div className="text-center mb-3 xs:mb-4">
                  <div className={`relative inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${card.gradient} text-white text-xl xs:text-2xl mb-2 xs:mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    {card.id === 'runner' ? (
                      <motion.span
                        aria-hidden="true"
                        animate={
                          shouldReduceMotion
                            ? undefined
                            : {
                                x: [0, 7, 0, -6, 0],
                                y: [0, -1, 0]
                              }
                        }
                        transition={
                          shouldReduceMotion
                            ? undefined
                            : {
                                duration: 2.2,
                                repeat: Infinity,
                                repeatDelay: 0.8,
                                ease: 'easeInOut'
                              }
                        }
                      >
                        {card.icon}
                      </motion.span>
                    ) : card.id === 'partner' ? (
                      <>
                        <span aria-hidden="true">{card.icon}</span>
                        <motion.span
                          aria-hidden="true"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide"
                          style={{ background: 'rgba(255,255,255,0.92)', color: '#0f5132' }}
                          animate={
                            shouldReduceMotion
                              ? undefined
                              : {
                                  opacity: [0.35, 1, 0.55, 1, 0.4]
                                }
                          }
                          transition={
                            shouldReduceMotion
                              ? undefined
                              : {
                                  duration: 2.6,
                                  repeat: Infinity,
                                  repeatDelay: 0.6,
                                  ease: 'easeInOut'
                                }
                          }
                        >
                          OPEN
                        </motion.span>
                        <motion.span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background:
                              'linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0) 60%)'
                          }}
                          animate={
                            shouldReduceMotion
                              ? undefined
                              : {
                                  y: [0, -1.5, 0]
                                }
                          }
                          transition={
                            shouldReduceMotion
                              ? undefined
                              : {
                                  duration: 2.8,
                                  repeat: Infinity,
                                  ease: 'easeInOut'
                                }
                          }
                        />
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">{card.icon}</span>
                        <motion.span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background:
                              'linear-gradient(120deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 65%)',
                            mixBlendMode: 'overlay',
                            transform: 'skewX(-18deg) translateX(-140%)'
                          }}
                          animate={
                            shouldReduceMotion
                              ? undefined
                              : {
                                  x: ['-140%', '140%']
                                }
                          }
                          transition={
                            shouldReduceMotion
                              ? undefined
                              : {
                                  duration: 1.05,
                                  repeat: Infinity,
                                  repeatDelay: 2.1,
                                  ease: 'easeInOut'
                                }
                          }
                        />
                      </>
                    )}
                  </div>
                  <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-1">{card.title}</h3>
                  <p className="text-sm xs:text-base font-medium text-gray-600">{card.subtitle}</p>
                </div>

                {/* Description */}
                <p className="text-xs xs:text-sm text-gray-600 text-center mb-3 xs:mb-4 leading-snug line-clamp-2">
                  {card.description}
                </p>

                {/* Features */}
                <div className="mb-4 xs:mb-5">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 xs:gap-y-2">
                    {card.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-xs text-gray-700">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${card.gradient} mr-2 flex-shrink-0`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="text-center">
                  {card.id === 'runner' ? (
                    <motion.button
                      type="button"
                      animate={runnerButtonControls}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGrubRunnerClick();
                        handleLockedRunnerClick();
                      }}
                      aria-disabled="true"
                      className={`w-full px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 rounded-lg sm:rounded-xl font-semibold text-sm text-white transition-all duration-300 ${card.buttonStyle}`}
                    >
                      {card.buttonText}
                    </motion.button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        card.onClick();
                      }}
                      className={`w-full px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 rounded-lg sm:rounded-xl font-semibold text-sm text-white transition-all duration-300 ${card.buttonStyle} shadow-lg hover:shadow-xl`}
                    >
                      {card.buttonText}
                    </button>
                  )}
                </div>

                {/* Coming Soon Badge */}
                {card.disabled && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {t('roleCards.cards.runner.badge')}
                    </span>
                  </div>
                )}

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${card.gradient} transform translate-x-16 -translate-y-16`}></div>
                </div>
                <div className="absolute bottom-0 left-0 w-24 h-24 opacity-5">
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${card.gradient} transform -translate-x-12 translate-y-12`}></div>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className={`absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        {/* <div className="text-center mt-8 xs:mt-10 sm:mt-12">
          <p className="text-base xs:text-lg text-gray-600 mb-3 xs:mb-4 px-2">
            Ready to be part of the GrubGate family?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 xs:gap-4 justify-center items-center px-3">
            <button
              onClick={handleCustomerClick}
              className="w-full sm:w-auto bg-grub-red text-white px-6 xs:px-7 sm:px-8 py-2.5 xs:py-3 rounded-lg sm:rounded-xl font-semibold text-base hover:bg-red-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {isAuthenticated ? `🚀 ${t('common.startPlanning')}` : '✨ Join as Customer'}
            </button>
            <button
              onClick={handlePartnerClick}
              className="w-full sm:w-auto border-2 border-grub-red text-grub-red px-6 xs:px-7 sm:px-8 py-2.5 xs:py-3 rounded-lg sm:rounded-xl font-semibold text-base hover:bg-grub-red hover:text-white transition-all duration-300"
            >
              🏪 Become a Partner
            </button>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default RoleCards;
