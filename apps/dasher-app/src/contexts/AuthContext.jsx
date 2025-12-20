// FILE: src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginDasher, getDasherProfile } from '../api/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dasher, setDasher] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('dasher_token');
      const storedUser = localStorage.getItem('dasher_user');

      if (token && storedUser) {
        try {
          // Verify token is not expired
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp > currentTime) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);

            // Fetch fresh profile data
            try {
              const response = await getDasherProfile();
              if (response.success) {
                setUser(response.data.user);
                setDasher(response.data.dasher);
                localStorage.setItem('dasher_user', JSON.stringify(response.data.user));
              }
            } catch (profileError) {
              console.error('Failed to fetch profile:', profileError);
            }
          } else {
            // Token expired, clear storage
            logout();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginDasher(identifier, password);

      if (response.success) {
        const { user, dasher, accessToken, refreshToken } = response.data;

        // Store tokens and user data
        localStorage.setItem('dasher_token', accessToken);
        localStorage.setItem('dasher_refresh_token', refreshToken);
        localStorage.setItem('dasher_user', JSON.stringify(user));

        setUser(user);
        setDasher(dasher);
        setIsAuthenticated(true);
        setIsLoading(false);

        return { success: true, user, dasher };
      } else {
        setError(response.message || 'Login failed');
        setIsLoading(false);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('dasher_token');
    localStorage.removeItem('dasher_refresh_token');
    localStorage.removeItem('dasher_user');
    setUser(null);
    setDasher(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    setIsAuthenticated(true);
    localStorage.setItem('dasher_user', JSON.stringify(updatedUser));
  };

  const updateDasher = (updatedDasher) => {
    setDasher(updatedDasher);
    setIsAuthenticated(true);
  };

  const value = {
    user,
    dasher,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    updateUser,
    updateDasher,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
