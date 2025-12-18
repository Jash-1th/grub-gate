// FILE: src/api/authApi.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dasher_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('dasher_refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/dasher/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('dasher_token', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('dasher_token');
        localStorage.removeItem('dasher_refresh_token');
        localStorage.removeItem('dasher_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Register a new dasher
 */
export const registerDasher = async (formData) => {
  const response = await axios.post(`${API_URL}/dasher/auth/register`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Login dasher
 */
export const loginDasher = async (identifier, password) => {
  const response = await api.post('/dasher/auth/login', {
    identifier,
    password,
  });
  return response.data;
};

/**
 * Get current dasher profile
 */
export const getDasherProfile = async () => {
  const response = await api.get('/dasher/auth/me');
  return response.data;
};

/**
 * Update dasher profile
 */
export const updateDasherProfile = async (profileData) => {
  const response = await api.put('/dasher/auth/profile', profileData);
  return response.data;
};

/**
 * Toggle dasher availability
 */
export const toggleAvailability = async () => {
  const response = await api.post('/dasher/auth/toggle-availability');
  return response.data;
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  const response = await axios.post(`${API_URL}/dasher/auth/refresh`, {
    refreshToken,
  });
  return response.data;
};

export default api;
