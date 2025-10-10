// FILE: src/utils/ssrSafeStorage.js
import { useState, useEffect, useCallback } from 'react';

/**
 * SSR-safe localStorage utilities
 */

/**
 * Check if we're running on the client side
 */
const isClient = typeof window !== 'undefined';

/**
 * Safely get an item from localStorage
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - Default value if key doesn't exist or SSR
 * @param {boolean} parseJson - Whether to parse as JSON (default: true)
 * @returns {any} The stored value or default value
 */
export const getStorageItem = (key, defaultValue = null, parseJson = true) => {
  if (!isClient) return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    // For tokens and other plain strings, don't parse as JSON
    if (!parseJson) return item;
    
    // Try to parse as JSON, fallback to string if it fails
    try {
      return JSON.parse(item);
    } catch (parseError) {
      // If JSON parsing fails, return the raw string (for tokens, etc.)
      return item;
    }
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Safely set an item in localStorage
 * @param {string} key - The localStorage key
 * @param {any} value - The value to store
 * @param {boolean} stringifyJson - Whether to stringify as JSON (default: true)
 * @returns {boolean} Success status
 */
export const setStorageItem = (key, value, stringifyJson = true) => {
  if (!isClient) return false;
  
  try {
    // For tokens and other plain strings, store directly
    if (!stringifyJson || typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
    return true;
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Safely remove an item from localStorage
 * @param {string} key - The localStorage key
 * @returns {boolean} Success status
 */
export const removeStorageItem = (key) => {
  if (!isClient) return false;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * React hook for SSR-safe localStorage state management
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - Default value
 * @returns {[any, function]} State value and setter function
 */

export const useSSRSafeStorage = (key, defaultValue = null) => {
  const [isClientSide, setIsClientSide] = useState(false);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setIsClientSide(true);
    const storedValue = getStorageItem(key, defaultValue);
    setValue(storedValue);
  }, [key, defaultValue]);

  const setStorageValue = useCallback((newValue) => {
    setValue(newValue);
    if (isClientSide) {
      setStorageItem(key, newValue);
    }
  }, [key, isClientSide]);

  return [value, setStorageValue, isClientSide];
};

/**
 * Convenience functions for common storage operations
 */

/**
 * Get a token from localStorage (no JSON parsing)
 * @param {string} key - The localStorage key
 * @param {string} defaultValue - Default value if key doesn't exist
 * @returns {string|null} The token or default value
 */
export const getToken = (key, defaultValue = null) => {
  return getStorageItem(key, defaultValue, false);
};

/**
 * Set a token in localStorage (no JSON stringifying)
 * @param {string} key - The localStorage key
 * @param {string} token - The token to store
 * @returns {boolean} Success status
 */
export const setToken = (key, token) => {
  return setStorageItem(key, token, false);
};

/**
 * Get user data from localStorage (with JSON parsing)
 * @param {string} key - The localStorage key (default: 'user')
 * @param {object} defaultValue - Default value if key doesn't exist
 * @returns {object|null} The user data or default value
 */
export const getUserData = (key = 'user', defaultValue = null) => {
  return getStorageItem(key, defaultValue, true);
};

/**
 * Set user data in localStorage (with JSON stringifying)
 * @param {string} key - The localStorage key (default: 'user')
 * @param {object} userData - The user data to store
 * @returns {boolean} Success status
 */
export const setUserData = (key = 'user', userData) => {
  return setStorageItem(key, userData, true);
};
