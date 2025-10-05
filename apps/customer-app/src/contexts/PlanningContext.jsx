import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/ssrSafeStorage';

const PlanningContext = createContext();

export const usePlanning = () => {
  const context = useContext(PlanningContext);
  if (!context) {
    throw new Error('usePlanning must be used within a PlanningProvider');
  }
  return context;
};

export const PlanningProvider = ({ children }) => {
  const [postalCode, setPostalCode] = useState('');
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // SSR Safety - only run on client side
  useEffect(() => {
    setIsClient(true);
    
    // Load data from localStorage on client side
    const savedPostalCode = getStorageItem('grubgate_postal_code');
    const savedPreferences = getStorageItem('grubgate_preferences');
    const savedRestaurant = getStorageItem('grubgate_selected_restaurant');
    
    if (savedPostalCode) {
      setPostalCode(savedPostalCode);
    }
    
    if (savedPreferences) {
      setSelectedPreferences(savedPreferences);
    }
    
    if (savedRestaurant) {
      setSelectedRestaurant(savedRestaurant);
    }
  }, []);

  // Handler for postal code updates
  const updatePostalCode = (newPostalCode) => {
    setPostalCode(newPostalCode);
    if (newPostalCode) {
      setStorageItem('grubgate_postal_code', newPostalCode);
    } else {
      removeStorageItem('grubgate_postal_code');
    }
  };

  // Handler for preferences updates
  const updatePreferences = (newPreferences) => {
    setSelectedPreferences(newPreferences);
    if (newPreferences && newPreferences.length > 0) {
      setStorageItem('grubgate_preferences', newPreferences);
    } else {
      removeStorageItem('grubgate_preferences');
    }
  };

  // Handler for restaurant selection updates
  const updateSelectedRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    if (restaurant) {
      setStorageItem('grubgate_selected_restaurant', restaurant);
    } else {
      removeStorageItem('grubgate_selected_restaurant');
    }
  };

  // Reset all planning data
  const resetPlanningData = () => {
    setPostalCode('');
    setSelectedPreferences([]);
    setSelectedRestaurant(null);
    removeStorageItem('grubgate_postal_code');
    removeStorageItem('grubgate_preferences');
    removeStorageItem('grubgate_selected_restaurant');
  };

  const value = {
    postalCode,
    selectedPreferences,
    selectedRestaurant,
    isClient,
    updatePostalCode,
    updatePreferences,
    updateSelectedRestaurant,
    resetPlanningData
  };

  return (
    <PlanningContext.Provider value={value}>
      {children}
    </PlanningContext.Provider>
  );
};

export default PlanningContext;
