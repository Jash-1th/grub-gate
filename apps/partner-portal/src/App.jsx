import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ScrollManager from './components/common/ScrollManager.jsx';
import LoadingScreen from './components/common/LoadingScreen.jsx';
import useClientLanguageDetection from './hooks/useClientLanguageDetection.js';

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

// Mock authentication state (in real app, this would come from context/state management)
const isAuthenticated = true; // Change to true to test dashboard

function App() {
  console.log('🎨 App component is rendering!');

  const { i18n } = useTranslation();
  
  // Handle client-side language detection after hydration
  useClientLanguageDetection();

  // Language switching handler
  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="App">
        {/* Hash-aware scroll manager: only scrolls to top on non-hash navigations */}
        <ScrollManager />

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
}

export default App;

