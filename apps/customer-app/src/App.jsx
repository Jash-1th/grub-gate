import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import i18n from './i18n';
import { ModalProvider } from './context/ModalContext';
import { MealPlanProvider } from './contexts/MealPlanContext_SSR_FIXED';
import { ToastProvider } from './contexts/ToastContext';
import { PlanningProvider } from './contexts/PlanningContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import MealPlanningPage from './pages/MealPlanningPage';
import MealPlanningFlowPage from './pages/MealPlanningFlowPage';
import WeeklyMenuPage from './pages/WeeklyMenuPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import DayMealPlanPage from './pages/DayMealPlanPage';
import SubscriptionPage from './pages/SubscriptionPage';
import CheckoutPage from './pages/CheckoutPage';
import AddressBookPage from './pages/AddressBookPage';
import MenuSelectionStep from './components/planning/MenuSelectionStep';
import LaunchScreen from './components/common/LaunchScreen';
import ScrollToTop from './components/common/ScrollToTop';
import ProtectedRoute from './components/guards/ProtectedRoute';
import OTPAuthModal from './components/auth/OTPAuthModal';
import { useScrollToTop } from './hooks/useScrollToTop';
import './App.css';

// Custom hook to handle first visit detection and session management
const useFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);
    
    // Only run client-side logic after hydration
    if (typeof window !== 'undefined') {
      try {
        const SESSION_KEY = 'grubgate_launch_screen_shown';
        const hasSeenLaunchScreen = sessionStorage.getItem(SESSION_KEY);
        
        if (!hasSeenLaunchScreen) {
          console.log('🚀 First visit detected - showing launch screen');
          sessionStorage.setItem(SESSION_KEY, 'true');
          setIsFirstVisit(true);
        }
      } catch (error) {
        console.warn('⚠️ SessionStorage unavailable, skipping launch screen');
      }
    }
  }, []);

  return { isFirstVisit, isClient };
};

// Main App component
function App({ initialized = true }) {
  const { isFirstVisit, isClient } = useFirstVisit();
  const location = useLocation();
  const [isLaunching, setIsLaunching] = useState(false); // Start as false to match SSR
  const [isReady, setIsReady] = useState(true); // Always start ready for SSR consistency
  
  // Use the scroll to top hook
  useScrollToTop();
  
  // Handle app readiness and transitions
  useEffect(() => {
    // Only run after client-side hydration
    if (!isClient) return;
    
    // Set launching state based on first visit after hydration
    if (isFirstVisit) {
      setIsLaunching(true);
      setIsReady(false);
    } else {
      setIsReady(true);
    }
  }, [isFirstVisit, isClient]);
  
  // Handle launch screen completion
  useEffect(() => {
    if (isFirstVisit && !isLaunching) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isFirstVisit, isLaunching]);
  
  // Track page views only
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location.pathname]);
  
  // Handle launch screen completion
  const handleLaunchComplete = useCallback(() => {
    setIsLaunching(false);
  }, []);
  
  // Show loading state while app is initializing
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-grub-red"></div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
            <MealPlanProvider>
                <PlanningProvider>
            <div className="app-container">
          {/* Launch Screen - Only shown on first visit and after hydration */}
          {isClient && isFirstVisit && isLaunching && (
            <LaunchScreen onComplete={handleLaunchComplete} />
          )}
          
          {/* Main App Content */}
          <div className="app-content">
            <ScrollToTop />
              <Layout>
                {/* Authentication Modals */}
                <OTPAuthModal />
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/plan" element={<MealPlanningFlowPage />} />
                  <Route path="/plan/:step" element={<MealPlanningFlowPage />} />
                  <Route path="/meal-planning" element={<MealPlanningPage />} />
                  <Route path="/weekly-menu" element={
                    <ProtectedRoute>
                      <WeeklyMenuPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/subscription" element={
                    <ProtectedRoute>
                      <SubscriptionPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/restaurant/:id" element={
                    <ProtectedRoute>
                      <RestaurantDetailPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/meal-plan/:day" element={
                    <ProtectedRoute>
                      <DayMealPlanPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/plan/restaurants" element={
                    <ProtectedRoute>
                      <MenuSelectionStep />
                    </ProtectedRoute>
                  } />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/addresses" element={
                    <ProtectedRoute>
                      <AddressBookPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/restaurants/weekly-menu" element={<WeeklyMenuPage />} />
                  {/* Add more routes as needed */}
                </Routes>
              </AnimatePresence>
              </Layout>
          </div>
        </div>
              </PlanningProvider>
          </MealPlanProvider>
        </ModalProvider>
        </ToastProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
