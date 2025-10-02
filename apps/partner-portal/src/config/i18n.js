import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en, fr } from '@grub-gate/locales';

// SSR-safe initialization
const isServer = typeof window === 'undefined';

const i18nConfig = {
  lng: 'en', // Always start with 'en' for consistent SSR
  fallbackLng: 'en',
  debug: false,
  
  // Use shared locale resources
  resources: {
    en: {
      translation: en
    },
    fr: {
      translation: fr
    }
  },

  // Language detection configuration (only for client-side)
  // Note: Detection will only happen after hydration to prevent mismatches
  ...(isServer ? {} : {
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      checkWhitelist: true
    }
  }),

  interpolation: {
    escapeValue: false, // React already escapes values
  },

  // Namespace configuration
  ns: ['translation'],
  defaultNS: 'translation',

  // SSR configuration - Force immediate initialization in all cases
  initImmediate: true,
  
  // Preload languages for better performance
  preload: ['en', 'fr'],

  // Whitelist supported languages
  supportedLngs: ['en', 'fr'],
  nonExplicitSupportedLngs: true,

  // React configuration
  react: {
    useSuspense: false, // Disable suspense for better SSR compatibility
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
  }
};

// Initialize i18next
if (isServer) {
  // Server-side initialization without language detector
  i18n
    .use(initReactI18next)
    .init(i18nConfig);
} else {
  // Client-side initialization with language detector
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(i18nConfig);
}

export default i18n;

