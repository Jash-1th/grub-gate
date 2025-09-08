import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// SSR-safe initialization
const isServer = typeof window === 'undefined';

const i18nConfig = {
  lng: 'en',
  fallbackLng: 'en',
  debug: false,
  
  // SSR-safe backend configuration
  backend: {
    loadPath: '/locales/{{lng}}/translation.json',
    // Prevent loading during SSR
    allowMultiLoading: false,
    crossDomain: false,
  },

  // Language detection configuration
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
    lookupLocalStorage: 'i18nextLng',
    checkWhitelist: true
  },

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
    useSuspense: true, // Enable suspense for better loading experience
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
  }
};

// Initialize i18next - Use same configuration everywhere
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nConfig);

export default i18n;
