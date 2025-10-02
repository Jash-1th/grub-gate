// Export shared configurations
export { default as tailwindPreset } from './tailwind-preset.js';

// Export common configuration objects
export const commonConfig = {
  appName: 'GrubGate',
  version: '1.0.0',
  supportedLanguages: ['en', 'fr'],
  defaultLanguage: 'en',
  apiBaseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.grubgate.com' 
    : 'http://localhost:3001',
  features: {
    analytics: true,
    notifications: true,
    multiLanguage: true,
    darkMode: false, // Can be enabled later
  }
};






