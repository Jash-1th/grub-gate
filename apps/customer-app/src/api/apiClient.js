import axios from 'axios';
import { getStorageItem, removeStorageItem } from '../utils/ssrSafeStorage';

// Create axios instance with base configuration
const baseURL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1')
  : (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1');

const apiClient = axios.create({
  baseURL,

  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getStorageItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Only redirect if this is NOT a login attempt
      // Login attempts should handle 401 errors themselves
      const isLoginAttempt = error.config?.url?.includes('/auth/login');
      
      if (!isLoginAttempt) {
        removeStorageItem('authToken');
        removeStorageItem('user');
        // Redirect to login or refresh page for authenticated requests
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
      // For login attempts, just pass the error through without redirecting
    }
    
    // Handle network errors and HTML responses
    if (!error.response) {
      console.error('Network error:', error.message);
    } else if (error.response?.data instanceof String && error.response.data.startsWith('<!DOCTYPE')) {
      console.error('Received HTML response instead of JSON - API endpoint may be incorrect or server is down');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;