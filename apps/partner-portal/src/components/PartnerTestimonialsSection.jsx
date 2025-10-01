import React from 'react';
import { useTranslation } from 'react-i18next';
import { TestimonialsSection as CommonTestimonialsSection } from '@grub-gate/ui';
import { featuredPartnerTestimonials } from '../lib/mock-data.js';

const PartnerTestimonialsSection = () => {
  const { t } = useTranslation();
  
  return (
    <div id="what-our-partners-say">
      <CommonTestimonialsSection
        testimonials={featuredPartnerTestimonials}
        title={t('landingPage.partnerTestimonials.title')}
        subtitle={t('landingPage.partnerTestimonials.subtitle')}
        variant="partner"
        showStats={true}
        autoPlay={true}
        showNavigation={true}
      />
    </div>
  );
};

export default PartnerTestimonialsSection;
