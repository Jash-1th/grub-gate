import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'success',
      duration: 4000,
      ...toast
    };

    // Check for duplicate toasts (same title and message within 2 seconds)
    setToasts(prev => {
      const now = Date.now();
      const duplicateExists = prev.some(existingToast => 
        existingToast.title === newToast.title && 
        existingToast.message === newToast.message &&
        existingToast.type === newToast.type &&
        (now - existingToast.createdAt) < 2000 // Within 2 seconds
      );

      if (duplicateExists) {
        return prev; // Don't add duplicate
      }

      return [...prev, { ...newToast, createdAt: now }];
    });
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const showSuccess = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'success',
      title,
      message,
      ...options
    });
  }, [addToast]);

  const showError = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'error',
      title,
      message,
      ...options
    });
  }, [addToast]);

  const showInfo = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [addToast]);

  // Special method for meal plan additions
  const showMealPlanSuccess = useCallback((itemName, day, mealType, restaurantName, price) => {
    return addToast({
      type: 'success',
      title: 'Added to Meal Plan! 🎉',
      message: `${itemName} added to ${day.charAt(0).toUpperCase() + day.slice(1)} ${mealType}. Click "Back to Weekly Planning" to add more meals!`,
      duration: 6000,
      itemData: {
        day,
        mealType,
        restaurantName,
        price
      }
    });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showInfo,
    showMealPlanSuccess
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container - Top Center Below Navbar */}
      <div className="fixed top-16 md:top-20 left-1/2 transform -translate-x-1/2 z-[10000] pointer-events-none px-4 w-full max-w-sm">
        <div className="flex flex-col space-y-3">
          {toasts.map((toast, index) => (
            <div
              key={toast.id}
              className="pointer-events-auto"
              style={{
                zIndex: 1000 - index
              }}
            >
              <Toast
                {...toast}
                onClose={removeToast}
              />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
