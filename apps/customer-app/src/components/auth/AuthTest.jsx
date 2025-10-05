import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Simple test component to verify authentication functionality
 * This can be temporarily added to any page to test auth flow
 */
const AuthTest = () => {
  const { isAuthenticated, user, login, register, logout, isLoading, error } = useAuth();

  const handleTestLogin = async () => {
    const result = await login('test@example.com', 'password123');
    console.log('Login result:', result);
  };

  const handleTestRegister = async () => {
    const result = await register({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'customer'
    });
    console.log('Register result:', result);
  };

  const handleTestLogout = () => {
    logout();
    console.log('User logged out');
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 m-4">
      <h3 className="text-lg font-semibold mb-4">Authentication Test Panel</h3>
      
      {/* Auth Status */}
      <div className="mb-4">
        <p><strong>Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
        {user && (
          <p><strong>User:</strong> {user.name} ({user.email})</p>
        )}
        {isLoading && <p className="text-blue-600">Loading...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
      </div>

      {/* Test Buttons */}
      <div className="space-x-2">
        <button
          onClick={handleTestLogin}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Login
        </button>
        
        <button
          onClick={handleTestRegister}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Register
        </button>
        
        <button
          onClick={handleTestLogout}
          disabled={isLoading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Test Logout
        </button>
      </div>

      {/* API Base URL Info */}
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL}</p>
      </div>
    </div>
  );
};

export default AuthTest;
