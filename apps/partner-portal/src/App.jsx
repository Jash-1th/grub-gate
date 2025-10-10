import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ScrollManager from './components/common/ScrollManager.jsx';
import LoadingScreen from './components/common/LoadingScreen.jsx';
import useClientLanguageDetection from './hooks/useClientLanguageDetection.js';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ModalProvider } from './contexts/ModalContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { RestaurantProvider } from './contexts/RestaurantContext.jsx';

// Modals
import PartnerOTPAuthModal from './components/auth/PartnerOTPAuthModal.jsx';
import { useModal } from './contexts/ModalContext.jsx';
import ToastContainer from './components/ui/Toast.jsx';

// Layout Components
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import PublicLayout from './components/layout/PublicLayout.jsx';

// Public Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import FaqsPage from './pages/FaqsPage.jsx';

// Dashboard Pages
import DashboardHome from './pages/dashboard/DashboardHome.jsx';
import MenuPage from './pages/dashboard/MenuPage.jsx';
import OrdersPage from './pages/dashboard/OrdersPage.jsx';
import AnalyticsPage from './pages/dashboard/AnalyticsPage.jsx';
import CustomersPage from './pages/dashboard/CustomersPage.jsx';
import SettingsPage from './pages/dashboard/SettingsPage.jsx';
import SupportPage from './pages/dashboard/SupportPage.jsx';

// Component that uses modal context (must be inside ModalProvider)
const AppContent = () => {
  // Call all hooks at the top level before any conditionals
  const { isOTPAuthModalOpen, closeOTPAuthModal } = useModal();
  const { i18n } = useTranslation();
  const { user, isAuthenticated, isLoading } = useAuth();
  useClientLanguageDetection();
  
  // Debug authentication state
  console.log('🔐 App.jsx - Authentication state:', { 
    isAuthenticated, 
    isLoading, 
    user: user ? 'User logged in' : 'No user' 
  });
  
  // Show loading screen while authentication is being initialized
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Language switching handler
  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="App">
        {/* Hash-aware scroll manager: only scrolls to top on non-hash navigations */}
        <ScrollManager />

        {/* Partner OTP Auth Modal */}
        <PartnerOTPAuthModal 
          isOpen={isOTPAuthModalOpen} 
          onClose={closeOTPAuthModal} 
        />

        {/* Toast Container */}
        <ToastContainer />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout onLanguageChange={handleLanguageChange} />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="faqs" element={<FaqsPage />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <DashboardLayout onLanguageChange={handleLanguageChange} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="support" element={<SupportPage />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Suspense>
  );
};

// Main App component with providers
function App() {
  console.log('🎨 Partner Portal App component is rendering!');

  return (
    <AuthProvider>
      <RestaurantProvider>
        <ModalProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </ModalProvider>
      </RestaurantProvider>
    </AuthProvider>
  );
}

export default App;

