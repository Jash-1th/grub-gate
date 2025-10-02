import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to handle client-side language detection after hydration
 * This prevents hydration mismatches by deferring language detection
 * until after the initial render is complete
 */
export const useClientLanguageDetection = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === 'undefined') return;

    // Check if we already have a detected language
    if (i18n.language !== 'en') return;

    // Perform language detection after hydration
    const detectLanguage = async () => {
      try {
        // Check localStorage first
        const storedLang = localStorage.getItem('i18nextLng');
        if (storedLang && ['en', 'fr'].includes(storedLang)) {
          await i18n.changeLanguage(storedLang);
          return;
        }

        // Check browser language
        const browserLang = navigator.language?.split('-')[0];
        if (browserLang && ['en', 'fr'].includes(browserLang)) {
          await i18n.changeLanguage(browserLang);
          return;
        }

        // Check HTML lang attribute
        const htmlLang = document.documentElement.lang?.split('-')[0];
        if (htmlLang && ['en', 'fr'].includes(htmlLang)) {
          await i18n.changeLanguage(htmlLang);
        }
      } catch (error) {
        console.warn('Language detection failed:', error);
        // Fallback to English is already set
      }
    };

    // Use a small delay to ensure hydration is complete
    const timeoutId = setTimeout(detectLanguage, 100);

    return () => clearTimeout(timeoutId);
  }, [i18n]);
};

export default useClientLanguageDetection;
