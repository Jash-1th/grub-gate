import { useState, useEffect, useCallback } from 'react';

/**
 * SSR-Safe localStorage utilities
 * These functions safely handle localStorage operations in SSR environments
 */

/**
 * Safely get an item from localStorage
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {any} The parsed value or default value
 */
export const getStorageItem = (key, defaultValue = null) => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Safely set an item in localStorage
 * @param {string} key - The localStorage key
 * @param {any} value - The value to store
 * @returns {boolean} Success status
 */
export const setStorageItem = (key, value) => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Safely remove an item from localStorage
 * @param {string} key - The localStorage key
 * @returns {boolean} Success status
 */
export const removeStorageItem = (key) => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Check if we're running on the client side
 * @returns {boolean} True if running in browser
 */
export const isClient = () => typeof window !== 'undefined';

/**
 * Hook for SSR-safe localStorage with automatic state management
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - Default value
 * @returns {[any, function, boolean]} [value, setValue, isLoading]
 */
export const useSSRSafeStorage = (key, defaultValue = null) => {
  const [value, setValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [isClientSide, setIsClientSide] = useState(false);

  useEffect(() => {
    setIsClientSide(true);
    const storedValue = getStorageItem(key, defaultValue);
    setValue(storedValue);
    setIsLoading(false);
  }, [key, defaultValue]);

  const updateValue = useCallback((newValue) => {
    setValue(newValue);
    setStorageItem(key, newValue);
  }, [key]);

  return [value, updateValue, isLoading, isClientSide];
};
