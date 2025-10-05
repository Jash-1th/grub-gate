import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiClient from '../api/apiClient';

// Auth Context
const AuthContext = createContext();

// Auth Actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case 'LOGIN_ERROR_RESET':
      return {
        ...state,
        isLoading: false,
        error: null,
      };

    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth on mount
  useEffect(() => {
    console.log('🔍 AuthContext: Checking for existing auth on mount');
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    console.log('🔍 AuthContext: Found token:', !!token);
    console.log('🔍 AuthContext: Found user:', !!user);
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log('✅ AuthContext: Restoring auth state for user:', parsedUser);
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: { user: parsedUser, token },
        });
      } catch (error) {
        console.error('❌ AuthContext: Error parsing stored user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    } else {
      console.log('❌ AuthContext: No existing auth found');
    }
  }, []);

  // Handle pending redirect after authentication state is set
  useEffect(() => {
    if (state.isAuthenticated && !state.isLoading) {
      const pendingRedirect = localStorage.getItem('pendingRedirect');
      if (pendingRedirect) {
        console.log('🔄 AuthContext: Processing pending redirect to:', pendingRedirect);
        localStorage.removeItem('pendingRedirect');
        
        // Also clean up any remaining redirectAfterLogin and loginInProgress
        localStorage.removeItem('redirectAfterLogin');
        localStorage.removeItem('loginInProgress');
        
        // Validate the redirect URL
        try {
          const url = new URL(pendingRedirect, window.location.origin);
          if (url.origin === window.location.origin) {
            setTimeout(() => {
              console.log('🔄 AuthContext: Executing redirect to:', pendingRedirect);
              // Before redirecting, ensure auth state is properly set
              if (!state.isAuthenticated) {
                console.log('🔄 AuthContext: Auth state not set, forcing state update before redirect');
                const storedToken = localStorage.getItem('authToken');
                const storedUser = localStorage.getItem('user');
                if (storedToken && storedUser) {
                  try {
                    const parsedUser = JSON.parse(storedUser);
                    dispatch({
                      type: AUTH_ACTIONS.SET_USER,
                      payload: { user: parsedUser, token: storedToken },
                    });
                  } catch (e) {
                    console.error('Error parsing stored user:', e);
                  }
                }
              }
              window.location.href = pendingRedirect;
            }, 500); // Increased timeout to ensure state is set
          } else {
            console.warn('🚨 AuthContext: Invalid redirect URL origin, ignoring redirect');
            localStorage.removeItem('loginInProgress');
          }
        } catch (e) {
          console.warn('🚨 AuthContext: Invalid redirect URL format, ignoring redirect:', e);
          localStorage.removeItem('loginInProgress');
        }
      } else {
        // Clean up any stale redirect URLs and flags when user is authenticated
        localStorage.removeItem('redirectAfterLogin');
        localStorage.removeItem('loginInProgress');
      }
    }
  }, [state.isAuthenticated, state.isLoading]);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { accessToken, user } = response.data.data;

      // Store in localStorage
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token: accessToken },
      });

      console.log('✅ AuthContext: Login successful, user:', user);
      console.log('✅ AuthContext: Token stored:', accessToken);

      // Handle redirect after login - using a flag to trigger redirect in useEffect
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      console.log('🔄 AuthContext: Checking for redirect URL:', redirectUrl);
      
      if (redirectUrl && redirectUrl !== '/') {
        console.log('🔄 AuthContext: Setting up redirect to:', redirectUrl);
        // Set a flag to trigger redirect after state updates
        localStorage.setItem('pendingRedirect', redirectUrl);
        localStorage.removeItem('redirectAfterLogin');
        
        // Also set a temporary flag to prevent AuthGuard from opening modal again
        localStorage.setItem('loginInProgress', 'true');
        // Set a longer timeout to ensure authentication state is fully established
        setTimeout(() => {
          localStorage.removeItem('loginInProgress');
        }, 5000); // Increased to 5 seconds for better reliability
      } else {
        console.log('🔄 AuthContext: No valid redirect URL found, staying on current page');
      }

      return { success: true, user };
    } catch (error) {
      let errorMessage = 'Invalid email or password. Please try again.';
      let fieldErrors = {};
      
      // Handle validation errors from backend
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        
        // Convert backend errors to field-specific errors
        backendErrors.forEach(err => {
          if (err.field) {
            fieldErrors[err.field] = err.message;
          }
        });
        
        // If we have field errors, don't show a global error message
        if (Object.keys(fieldErrors).length > 0) {
          errorMessage = null; // No global error when we have field-specific errors
        } else {
          // Use the backend message if no field-specific errors
          errorMessage = error.response.data.message || errorMessage;
        }
      } else if (error.response?.status === 401) {
        // Unauthorized - wrong credentials
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else {
        // Use backend message for other errors
        errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      }
      
      // We need to reset the loading state, but without setting isAuthenticated to false
      // Create a custom action that only resets loading without affecting authentication
      dispatch({
        type: 'LOGIN_ERROR_RESET',
        payload: null,
      });
      
      console.log('Login failed, returning error after resetting loading state');
      
      return { 
        success: false, 
        error: errorMessage,
        fieldErrors: fieldErrors
      };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    
    try {
      const response = await apiClient.post('/auth/register', userData);

      // If registration includes tokens, automatically log the user in
      if (response.data.data.accessToken && response.data.data.user) {
        const { accessToken, refreshToken, user } = response.data.data;
        
        // Store tokens
        localStorage.setItem('authToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(user));

        // Update state to logged in
        dispatch({ 
          type: AUTH_ACTIONS.LOGIN_SUCCESS, 
          payload: { user, token: accessToken } 
        });

        return { 
          success: true, 
          autoLogin: true,
          message: response.data.message || 'Registration successful! Welcome to GrubGate!' 
        };
      } else {
        // Fallback for registration without auto-login
        dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS });

        return { 
          success: true, 
          autoLogin: false,
          message: response.data.message || 'Registration successful! Please log in.' 
        };
      }
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      let fieldErrors = {};
      
      // Handle validation errors from backend
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        
        // Convert backend errors to field-specific errors
        backendErrors.forEach(err => {
          if (err.field) {
            fieldErrors[err.field] = err.message;
          }
        });
        
        // If we have field errors, don't show a global error message
        if (Object.keys(fieldErrors).length > 0) {
          errorMessage = null; // No global error when we have field-specific errors
        } else {
          // Use the backend message if no field-specific errors
          errorMessage = error.response.data.message || errorMessage;
        }
      } else {
        // Use backend message for other errors
        errorMessage = error.response?.data?.message || errorMessage;
      }
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage,
      });

      return { 
        success: false, 
        error: errorMessage,
        fieldErrors: fieldErrors // Return field-specific errors
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
