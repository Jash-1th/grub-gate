import axios from 'axios';
import { Platform } from 'react-native';
import { clearAuthSession, getAuthToken } from './secureAuthStorage';

// Changed the native URL to point to localhost (via USB) instead of a Wi-Fi IP
const nativeBaseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const webBaseURL = process.env.EXPO_PUBLIC_WEB_API_URL || 'http://localhost:5000/api/v1';
const baseURL = Platform.OS === 'web' ? webBaseURL : nativeBaseURL;

if (!baseURL && process.env.NODE_ENV !== 'test') {
  console.warn('EXPO_PUBLIC_API_URL is not set. Mobile API calls will fail until apps/customer-app-mobile/.env is configured.');
}

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await clearAuthSession();
    }

    return Promise.reject(error);
  },
);

export default api;
