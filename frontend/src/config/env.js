// Environment configuration utility

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

// Development defaults
const devConfig = {
  // Firebase
  firebase: {
    apiKey: 'dummy-key-for-dev',
    authDomain: 'dummy.firebaseapp.com',
    projectId: 'dummy-project-id',
    storageBucket: 'dummy.appspot.com',
    messagingSenderId: 'dummy-sender-id',
    appId: 'dummy-app-id',
    measurementId: 'dummy-measurement-id'
  },
  
  // EmailJS
  emailjs: {
    serviceId: 'dummy-service-id',
    templateId: 'dummy-template-id',
    publicKey: 'dummy-public-key'
  }
};

// Get environment variable with fallback
export const getEnv = (key, defaultValue = '') => {
  // Try to get from Vite environment variables first
  if (import.meta.env[key] !== undefined) {
    return import.meta.env[key];
  }
  
  // Then try process.env (for Node.js environment)
  if (typeof process !== 'undefined' && process.env[key] !== undefined) {
    return process.env[key];
  }
  
  // Return default value if nothing found
  return defaultValue;
};

// Get Firebase config
export const getFirebaseConfig = () => ({
  apiKey: getEnv('VITE_FIREBASE_API_KEY', devConfig.firebase.apiKey),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', devConfig.firebase.authDomain),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', devConfig.firebase.projectId),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', devConfig.firebase.storageBucket),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', devConfig.firebase.messagingSenderId),
  appId: getEnv('VITE_FIREBASE_APP_ID', devConfig.firebase.appId),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', devConfig.firebase.measurementId)
});

// Get EmailJS config
export const getEmailJsConfig = () => ({
  serviceId: getEnv('VITE_EMAILJS_SERVICE_ID', devConfig.emailjs.serviceId),
  templateId: getEnv('VITE_EMAILJS_TEMPLATE_ID', devConfig.emailjs.templateId),
  publicKey: getEnv('VITE_EMAILJS_PUBLIC_KEY', devConfig.emailjs.publicKey)
});

// Log environment status (only in development)
if (import.meta.env.DEV) {
  console.log('Environment Status:', {
    nodeEnv: process.env.NODE_ENV,
    viteMode: import.meta.env.MODE,
    isBrowser,
    firebaseConfigured: !getFirebaseConfig().apiKey.includes('dummy'),
    emailjsConfigured: !getEmailJsConfig().publicKey.includes('dummy')
  });
}
