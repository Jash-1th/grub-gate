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
  const [isClient, setIsClient] = useState(false);

  // SSR Safety - only run on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handler for postal code updates
  const updatePostalCode = (newPostalCode) => {
    setPostalCode(newPostalCode);
  };

  // Handler for preferences updates
  const updatePreferences = (newPreferences) => {
    setSelectedPreferences(newPreferences);
  };

  // Reset all planning data
  const resetPlanningData = () => {
    setPostalCode('');
    setSelectedPreferences([]);
  };

  const value = {
    postalCode,
    selectedPreferences,
    isClient,
    updatePostalCode,
    updatePreferences,
    resetPlanningData
  };

  return (
    <PlanningContext.Provider value={value}>
      {children}
    </PlanningContext.Provider>
  );
};

export default PlanningContext;
