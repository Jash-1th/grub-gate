import React from 'react';
import { useTranslation } from 'react-i18next';
import { siteInfo } from '../../data/navigation';

const ContactInfo = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Contact Details */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6" style={{color: '#800020'}}>
          {t('contact.info.title')}
        </h3>
        
        <div className="space-y-6">
          {/* Address */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-grub-red rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{t('contact.info.address')}</h4>
              <p className="text-gray-600">{siteInfo.address}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-grub-red rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{t('contact.info.phone')}</h4>
              <p className="text-gray-600">{siteInfo.phone}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-grub-red rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{t('contact.info.email')}</h4>
              <p className="text-gray-600">{siteInfo.email}</p>
            </div>
          </div>

          {/* Hours */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-grub-red rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{t('contact.info.hours')}</h4>
              <div className="text-gray-600">
                <p>{t('contact.info.weekdays', { hours: siteInfo.hours.weekdays })}</p>
                <p>{t('contact.info.weekends', { hours: siteInfo.hours.weekends })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Map */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6" style={{color: '#800020'}}>
          {t('contact.info.mapTitle')}
        </h3>
        
        <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2796.1234567890!2d-73.56789012345678!3d45.50123456789012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cc91a1234567890%3A0x1234567890abcdef!2sMontreal%2C%20QC!5e0!3m2!1sen!2sca!4v1234567890123!5m2!1sen!2sca"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="GrubGate Location Map"
          ></iframe>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm">
            {t('contact.info.mapDescription')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
