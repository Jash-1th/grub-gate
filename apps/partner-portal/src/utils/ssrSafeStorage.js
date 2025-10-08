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
 * @returns {any} The stored value or default value
 */
export const getStorageItem = (key, defaultValue = null) => {
  if (!isClient) return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
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
  if (!isClient) return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
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
