import React from 'react';
import { useTranslation } from 'react-i18next';
import { TestimonialsSection as CommonTestimonialsSection } from '@grub-gate/ui';
import { featuredTestimonials } from '../../data';

const TestimonialsSection = () => {
  const { t } = useTranslation();
  
  return (
    <CommonTestimonialsSection
      testimonials={featuredTestimonials}
      title={t('testimonials.title')}
      subtitle={t('testimonials.subtitle')}
      variant="customer"
      showStats={false}
      autoPlay={true}
      showNavigation={true}
      ordersText={t('testimonials.orders')}
    />
  );
};

export default TestimonialsSection;
