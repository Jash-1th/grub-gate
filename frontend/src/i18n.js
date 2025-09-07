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

  // SSR configuration
  initImmediate: !isServer,
  
  // Preload languages for better performance
  preload: ['en', 'fr'],

  // Whitelist supported languages
  supportedLngs: ['en', 'fr'],
  nonExplicitSupportedLngs: true,

  // React configuration
  react: {
    useSuspense: false, // Disable suspense for SSR compatibility
    bindI18n: 'languageChanged',
    bindI18nStore: '',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
  }
};

// Initialize i18next
if (!isServer) {
  // Client-side initialization with backend
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(i18nConfig);
} else {
  // Server-side initialization without backend
  i18n
    .use(initReactI18next)
    .init({
      ...i18nConfig,
      lng: 'en', // Default to English on server
      resources: {
        en: { translation: {} },
        fr: { translation: {} }
      }
    });
}

export default i18n;
