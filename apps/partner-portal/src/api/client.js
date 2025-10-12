// FILE: src/api/client.js
import axios from 'axios';

// Determine the correct API base URL
const getApiBaseUrl = () => {
  // If environment variable is set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // If we're in production (on Netlify), use the backend URL
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
    return 'https://gg0b1.netlify.app/api/v1';
  }
  
  // Use production backend for deployment
  return 'https://gg0b1.netlify.app/api/v1';
  
  // COMMENTED OUT: Local backend for development
  // return 'http://localhost:5000/api/v1';
};

// Create axios instance with base configuration
const baseURL = getApiBaseUrl();
console.log('🔧 Partner Portal API Client - Base URL:', baseURL);

export const apiClient = axios.create({
  baseURL,
  timeout: 30000, // 30 seconds timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent automatic logout during initial page load
let isInitialLoad = true;
let pageLoadTime = Date.now();

// Reset initial load flag after 5 seconds or when user interacts
const resetInitialLoad = () => {
  isInitialLoad = false;
  console.log('🔓 Initial load protection disabled');
};

setTimeout(resetInitialLoad, 5000); // Give 5 seconds for initial page load

// Also reset on user interaction
document.addEventListener('click', resetInitialLoad, { once: true });
document.addEventListener('keydown', resetInitialLoad, { once: true });

// Request interceptor to add auth token and handle FormData
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If sending FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('🔍 FormData detected - removing Content-Type header for proper boundary');
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
    if (error.response?.status === 401) {
      const timeSinceLoad = Date.now() - pageLoadTime;
      console.warn(`🚨 API returned 401 - Token may be expired or invalid (${timeSinceLoad}ms since page load)`);
      
      // Don't redirect during initial page load to prevent logout on refresh
      if (!isInitialLoad && window.location.pathname !== '/login') {
        console.log('🚪 Logging out user due to 401 error');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Use a small delay to prevent race conditions
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      } else if (isInitialLoad) {
        console.log(`🛡️ Ignoring 401 during initial page load (${timeSinceLoad}ms since load) to prevent logout on refresh`);
      }
    }
    
    // Return a more user-friendly error object
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    const errorDetails = error.response?.data?.errors || [];
    
    return Promise.reject({
      message: errorMessage,
      details: errorDetails,
      status: error.response?.status,
      originalError: error
    });
  }
);

export default apiClient;
