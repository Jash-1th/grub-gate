import React, { createContext, useContext, useReducer, useEffect } from 'react';

/**
 * Updated AuthContext for Refactored User Model
 * Handles the new nested partnerInfo structure
 */
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
  SET_USER: 'SET_USER',
  UPDATE_PARTNER_INFO: 'UPDATE_PARTNER_INFO'
};

// Initial state
const initialState = {
  user: null,
  partnerInfo: null,
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
        partnerInfo: action.payload.user?.partnerInfo || null,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        partnerInfo: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        partnerInfo: null,
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
        partnerInfo: action.payload.user?.partnerInfo || null,
        isAuthenticated: !!action.payload.user,
        isLoading: false
      };
    case AUTH_ACTIONS.UPDATE_PARTNER_INFO:
      return {
        ...state,
        partnerInfo: action.payload.partnerInfo,
        user: state.user ? {
          ...state.user,
          partnerInfo: action.payload.partnerInfo
        } : null
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

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Helper function to validate partner user
  const validatePartnerUser = (user) => {
    if (!user) return false;
    
    // Check if user has partner role
    if (!user.roles || !user.roles.includes('partner')) {
      return false;
    }
    
    // Check if user has partnerInfo (required for partners in new structure)
    if (!user.partnerInfo) {
      console.warn('Partner user missing partnerInfo - may need migration');
      return false;
    }
    
    // Check if partnerInfo has required fields
    if (!user.partnerInfo.restaurantId) {
      console.warn('Partner user missing restaurantId in partnerInfo');
      return false;
    }
    
    return true;
  };

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
          
          // Validate partner user with new structure
          if (validatePartnerUser(user)) {
            dispatch({
              type: AUTH_ACTIONS.SET_USER,
              payload: { user }
            });
            console.log('✅ Partner AuthContext: User authenticated from localStorage');
            console.log('📊 Partner Info:', user.partnerInfo);
          } else {
            // User doesn't meet partner requirements, clear storage
            removeStorageItem('accessToken');
            removeStorageItem('refreshToken');
            removeStorageItem('user');
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            console.log('❌ Partner AuthContext: User validation failed, cleared storage');
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          console.log('ℹ️ Partner AuthContext: No stored authentication found');
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://gg0b1.netlify.app/api/v1'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        const { accessToken, user } = result.data;

        // Validate partner user with new structure
        if (!validatePartnerUser(user)) {
          throw new Error('Access denied. Valid partner account with complete profile required.');
        }

        // Store in localStorage
        setStorageItem('accessToken', accessToken);
        setStorageItem('user', JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user }
        });

        console.log('✅ Partner AuthContext: Login successful');
        console.log('📊 Partner Info:', user.partnerInfo);
        return { success: true, user };
      } else {
        const errorMessage = result.message || 'Invalid credentials. Please try again.';
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: errorMessage }
        });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Partner login error:', error);
      const errorMessage = error.message || 'Login failed. Please try again.';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage }
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
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
  const setAuthenticatedUser = (userData) => {
    try {
      // Validate partner user with new structure
      if (!validatePartnerUser(userData.user)) {
        throw new Error('Access denied. Valid partner account with complete profile required.');
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

      console.log('✅ Partner AuthContext: User authenticated directly');
      console.log('📊 Partner Info:', userData.user.partnerInfo);
      return { success: true, user: userData.user };
    } catch (error) {
      console.error('Set authenticated user error:', error);
      return { success: false, error: error.message };
    }
  };

  // Update partner info (for settings updates)
  const updatePartnerInfo = (partnerInfo) => {
    try {
      const updatedUser = {
        ...state.user,
        partnerInfo: partnerInfo
      };

      // Update localStorage
      setStorageItem('user', JSON.stringify(updatedUser));

      dispatch({
        type: AUTH_ACTIONS.UPDATE_PARTNER_INFO,
        payload: { partnerInfo }
      });

      console.log('✅ Partner AuthContext: Partner info updated');
      return { success: true };
    } catch (error) {
      console.error('Update partner info error:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper functions for accessing nested data
  const getRestaurantId = () => {
    return state.partnerInfo?.restaurantId || null;
  };

  const getNotificationPreferences = () => {
    return state.partnerInfo?.notificationPreferences || {
      orderAlerts: true,
      systemUpdates: true,
      promotionalEmails: false,
      weeklyReports: true
    };
  };

  const getBillingInfo = () => {
    return state.partnerInfo?.billingInfo || null;
  };

  const getPartnerStatus = () => {
    return state.partnerInfo?.partnerStatus || 'pending';
  };

  const getCommissionRate = () => {
    return state.partnerInfo?.commissionRate || 15;
  };

  const isApprovedPartner = () => {
    return state.partnerInfo?.partnerStatus === 'approved';
  };

  const value = {
    ...state,
    login,
    logout,
    clearError,
    setAuthenticatedUser,
    updatePartnerInfo,
    // Helper functions
    getRestaurantId,
    getNotificationPreferences,
    getBillingInfo,
    getPartnerStatus,
    getCommissionRate,
    isApprovedPartner
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
