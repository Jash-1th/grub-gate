// FILE: src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Placeholder components
const RegistrationSuccess = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>🎉 Registration Successful!</h1>
    <p>Your application has been submitted and is under review.</p>
    <p>You will be notified once your account is approved.</p>
  </div>
);

const Dashboard = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Dasher Dashboard</h1>
    <p>Welcome to your dashboard!</p>
  </div>
);

export default App;
