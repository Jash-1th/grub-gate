import React, { createContext, useContext, useState, useEffect } from 'react';

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
    if (typeof window !== 'undefined') {
      const savedPostalCode = localStorage.getItem('grubgate_postal_code');
      const savedPreferences = localStorage.getItem('grubgate_preferences');
      const savedRestaurant = localStorage.getItem('grubgate_selected_restaurant');
      
      if (savedPostalCode) {
        setPostalCode(savedPostalCode);
      }
      
      if (savedPreferences) {
        try {
          setSelectedPreferences(JSON.parse(savedPreferences));
        } catch (e) {
          console.error('Error parsing saved preferences:', e);
        }
      }
      
      if (savedRestaurant) {
        try {
          setSelectedRestaurant(JSON.parse(savedRestaurant));
        } catch (e) {
          console.error('Error parsing saved restaurant:', e);
        }
      }
    }
  }, []);

  // Handler for postal code updates
  const updatePostalCode = (newPostalCode) => {
    setPostalCode(newPostalCode);
    if (typeof window !== 'undefined') {
      if (newPostalCode) {
        localStorage.setItem('grubgate_postal_code', newPostalCode);
      } else {
        localStorage.removeItem('grubgate_postal_code');
      }
    }
  };

  // Handler for preferences updates
  const updatePreferences = (newPreferences) => {
    setSelectedPreferences(newPreferences);
    if (typeof window !== 'undefined') {
      if (newPreferences && newPreferences.length > 0) {
        localStorage.setItem('grubgate_preferences', JSON.stringify(newPreferences));
      } else {
        localStorage.removeItem('grubgate_preferences');
      }
    }
  };

  // Handler for restaurant selection updates
  const updateSelectedRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    if (typeof window !== 'undefined') {
      if (restaurant) {
        localStorage.setItem('grubgate_selected_restaurant', JSON.stringify(restaurant));
      } else {
        localStorage.removeItem('grubgate_selected_restaurant');
      }
    }
  };

  // Reset all planning data
  const resetPlanningData = () => {
    setPostalCode('');
    setSelectedPreferences([]);
    setSelectedRestaurant(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('grubgate_postal_code');
      localStorage.removeItem('grubgate_preferences');
      localStorage.removeItem('grubgate_selected_restaurant');
    }
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
