import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiClient } from '../api/client.js';
import partnerPushNotificationService from '../services/pushNotificationService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_USER: 'SET_USER'
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isLoading: false
      };
    default:
      return state;
  }
};

// SSR-safe storage helpers
const isClient = typeof window !== 'undefined';

const getStorageItem = (key) => {
  if (!isClient) return null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return null;
  }
};

const setStorageItem = (key, value) => {
  if (!isClient) return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
  }
};

const removeStorageItem = (key) => {
  if (!isClient) return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

// Helper function to determine redirect route based on registration status
const getRedirectRoute = (user, isSignup = false) => {
  if (!user) return '/login';
  
  // Check if user has partner info (from registration)
  const hasPartnerInfo = user.partnerInfo && Object.keys(user.partnerInfo).length > 0;
  
  // Check registration completion status
  const registrationComplete = user.registrationComplete || false;
  const registrationStage = user.registrationStage || 1;
  
  console.log('🔍 Registration Status Check:', {
    hasPartnerInfo,
    registrationComplete,
    registrationStage,
    userRoles: user.roles,
    isSignup,
    userId: user._id,
    restaurantId: user.restaurantId,
    fullUserObject: user
  });
  
  // For signup flow - always start with welcome page
  if (isSignup) {
    return '/onboarding/welcome';
  }
  
  // For login flow - prioritize dashboard for existing partners
  // If user has partner role and restaurantId, go to dashboard
  if (user.roles?.includes('partner') && user.restaurantId) {
    console.log('✅ Partner with restaurant found, redirecting to dashboard');
    return '/dashboard';
  }
  
  // If registration is explicitly complete, go to dashboard
  if (registrationComplete === true) {
    console.log('✅ Registration marked complete, redirecting to dashboard');
    return '/dashboard';
  }
  
  // If user has partner info, go to dashboard
  if (hasPartnerInfo) {
    console.log('✅ Partner info found, redirecting to dashboard');
    return '/dashboard';
  }
  
  // Only redirect to onboarding if clearly incomplete
  if (registrationComplete === false || registrationStage < 3) {
    console.log('⚠️ Registration incomplete, redirecting to onboarding');
    return '/onboarding/welcome';
  }
  
  // Default to dashboard for partners
  console.log('✅ Defaulting to dashboard for partner user');
  return '/dashboard';
};

// Initialize push notifications for partner
const initializePartnerNotifications = async () => {
  try {
    console.log('🔔 Initializing partner push notifications...');
    
    // Initialize the notification service
    const initialized = await partnerPushNotificationService.initialize();
    
    if (initialized) {
      // Request permission and register token
      const registered = await partnerPushNotificationService.requestPermissionAndRegister();
      
      if (registered) {
        console.log('✅ Partner push notifications initialized successfully');
      } else {
        console.log('⚠️ Partner push notification registration failed');
      }
    } else {
      console.log('⚠️ Partner push notification service initialization failed');
    }
  } catch (error) {
    console.error('❌ Error initializing partner push notifications:', error);
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);


  // Initialize auth state from localStorage (SSR-safe)
  useEffect(() => {
    const initializeAuth = () => {
      // Skip initialization on server-side
      if (!isClient) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      try {
        const token = getStorageItem('accessToken');
        const userStr = getStorageItem('user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          // Verify user has partner role
          if (user.roles && user.roles.includes('partner')) {
            dispatch({
              type: AUTH_ACTIONS.SET_USER,
              payload: { user }
            });
            console.log('✅ Partner AuthContext: User authenticated from localStorage');
            
            // Initialize push notifications for returning user
            initializePartnerNotifications();
          } else {
            // User doesn't have partner role, clear storage
            removeStorageItem('accessToken');
            removeStorageItem('refreshToken');
            removeStorageItem('user');
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            console.log('❌ Partner AuthContext: User lacks partner role, cleared storage');
          }
        } else {
          // No token or user data found
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          console.log('ℹ️ Partner AuthContext: No authentication data found');
        }
      } catch (error) {
        console.error('Partner AuthContext initialization error:', error);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    // Small delay to ensure client-side hydration is complete
    const timeoutId = setTimeout(initializeAuth, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  // Login function
  const login = async (identifier, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      console.log('🔐 Attempting login with apiClient...');
      console.log('🔗 API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1');
        
      const response = await apiClient.post('/auth/partner/login', {
        identifier,
        password,
      });

      console.log('✅ Login response received:', response);
      const result = response.data;

      if (result.status === 'success') {
        const { accessToken, user } = result.data;
        
        console.log('🔍 Login user data received:', {
          userId: user._id,
          email: user.email,
          roles: user.roles,
          registrationComplete: user.registrationComplete,
          registrationStage: user.registrationStage,
          restaurantId: user.restaurantId,
          restaurantStatus: user.restaurantStatus
        });

        // Verify user has partner role
        if (!user.roles || !user.roles.includes('partner')) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_FAILURE,
            payload: 'Access denied. Partner role required.'
          });
          return { success: false, error: 'Access denied. Partner role required.' };
        }

        // Store tokens and user data
        setStorageItem('accessToken', accessToken);
        setStorageItem('user', JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user }
        });

        // Initialize push notifications for partner
        initializePartnerNotifications();

        return { 
          success: true, 
          user,
          redirectRoute: getRedirectRoute(user, false) // false = login flow
        };
      } else {
        const errorMessage = result.message || 'Login failed';
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: errorMessage
        });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Partner login error:', error);
      // Extract the specific backend error message
      const errorMessage = error.response?.data?.message || error.message || 'Network error. Please check your connection.';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Cleanup push notifications
      await partnerPushNotificationService.removeTokenFromBackend();
      partnerPushNotificationService.cleanup();
      
      // Clear localStorage
      removeStorageItem('accessToken');
      removeStorageItem('refreshToken');
      removeStorageItem('user');

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      console.log('✅ Partner AuthContext: Logout successful');
    } catch (error) {
      console.error('Partner logout error:', error);
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Set authenticated user directly (for post-signup login)
  const setAuthenticatedUser = (userData, isSignup = false) => {
    try {
      // Verify user has partner role
      if (!userData.user.roles || !userData.user.roles.includes('partner')) {
        throw new Error('Access denied. Partner account required.');
      }

      // Store in localStorage
      setStorageItem('accessToken', userData.accessToken);
      if (userData.refreshToken) {
        setStorageItem('refreshToken', userData.refreshToken);
      }
      setStorageItem('user', JSON.stringify(userData.user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: userData.user }
      });

      console.log('✅ Partner AuthContext: User authenticated directly', isSignup ? '(signup)' : '(login)');
      return { 
        success: true, 
        user: userData.user,
        redirectRoute: getRedirectRoute(userData.user, isSignup)
      };
    } catch (error) {
      console.error('Set authenticated user error:', error);
      return { success: false, error: error.message };
    }
  };

  // Signup function (wrapper for setAuthenticatedUser with signup flag)
  const handleSignupSuccess = (userData) => {
    return setAuthenticatedUser(userData, true);
  };

  const value = {
    ...state,
    login,
    logout,
    clearError,
    setAuthenticatedUser,
    handleSignupSuccess,
    getRedirectRoute: () => getRedirectRoute(state.user),
    getLoginRedirectRoute: () => getRedirectRoute(state.user, false),
    getSignupRedirectRoute: () => getRedirectRoute(state.user, true)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
