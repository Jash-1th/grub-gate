/**
 * Environment Configuration Helper
 * Provides a consistent way to access environment variables across the app
 */

// Get environment mode
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Get common environment variables
export const env = {
  // App info
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL,
  
  // PWA Configuration
  vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  
  // Development flags
  isDev: isDevelopment,
  isProd: isProduction,
  
  // Logging level
  logLevel: import.meta.env.VITE_LOG_LEVEL || (isDevelopment ? 'debug' : 'warn')
};

/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable key
 * @param {any} fallback - Fallback value if not found
 * @returns {any} Environment variable value or fallback
 */
export const getEnv = (key, fallback = undefined) => {
  return import.meta.env[key] ?? fallback;
};

/**
 * Check if a feature flag is enabled
 * @param {string} flag - Feature flag name (will be prefixed with VITE_FEATURE_)
 * @returns {boolean} Whether the feature is enabled
 */
export const isFeatureEnabled = (flag) => {
  const envKey = `VITE_FEATURE_${flag.toUpperCase()}`;
  const value = import.meta.env[envKey];
  return value === 'true' || value === '1' || value === 'enabled';
};

/**
 * Log helper that respects environment
 * @param {string} level - Log level (debug, info, warn, error)
 * @param {...any} args - Arguments to log
 */
export const log = (level, ...args) => {
  const levels = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = levels.indexOf(env.logLevel);
  const messageLevelIndex = levels.indexOf(level);
  
  if (messageLevelIndex >= currentLevelIndex) {
    console[level](...args);
  }
};

export default env;