import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../styles/auth-pages.css';
import { 
  faEye, 
  faEyeSlash, 
  faEnvelope, 
  faLock, 
  faUtensils, 
  faUsers, 
  faArrowTrendUp, 
  faShield,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { Button, Logo } from '@grub-gate/ui';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, getRedirectRoute, isAuthenticated, user } = useAuth();
  const { showSuccess } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  // Remove local loading state, use AuthContext loading
  const [errors, setErrors] = useState({});

  // Redirect authenticated users to appropriate page
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 LoginPage: User already authenticated, redirecting...');
      // Use the existing redirect logic from AuthContext
      const redirectRoute = getRedirectRoute();
      navigate(redirectRoute);
    }
  }, [isAuthenticated, user, navigate, getRedirectRoute]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
    // Clear AuthContext error
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g., user@example.com)';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Clear any previous auth errors
    clearError();
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        console.log('✅ Partner login successful!');
        
        // Use redirect route returned from login function (for login flow)
        const redirectRoute = result.redirectRoute || getRedirectRoute();
        console.log('📍 Login redirect route determined:', redirectRoute);
        
        // Show success toast message
        showSuccess(`Welcome back, ${result.user.firstName || 'Partner'}! You have successfully logged in.`, 6000);
        
        navigate(redirectRoute);
        console.log('📍 Navigation called to:', redirectRoute);
      } else {
        // Error is already set in AuthContext, no need for local state
        console.log('🚨 Login failed - using AuthContext error');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error Response Data:', error.response?.data);
      
      // Handle axios error responses with detailed validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        console.log('🔍 Backend validation errors:', error.response.data.errors);
        // Format backend validation errors for display
        const formattedErrors = {};
        error.response.data.errors.forEach(err => {
          formattedErrors[err.field] = err.message;
        });
        setErrors(formattedErrors);
      } else if (error.response?.data?.message) {
        // Show specific backend error message
        console.log('📝 Backend error message:', error.response.data.message);
        setErrors({ general: error.response.data.message });
      } else {
        // Fallback to generic message
        setErrors({ general: 'Login failed. Please try again.' });
      }
    }
  };

  const features = [
    {
      icon: faUtensils,
      title: 'Manage Your Menu',
      description: 'Create and update your restaurant menu with ease'
    },
    {
      icon: faUsers,
      title: 'Track Customers',
      description: 'Monitor customer orders and preferences'
    },
    {
      icon: faArrowTrendUp,
      title: 'Boost Revenue',
      description: 'Grow your business with subscription meal plans'
    },
    {
      icon: faShield,
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security'
    }
  ];

  return (
    <div className="min-h-screen auth-gradient flex flex-col relative overflow-x-hidden overflow-y-auto">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-element absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-grub-red/10 to-orange-200/10 rounded-full blur-xl"></div>
        <div className="floating-element absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-br from-blue-200/10 to-grub-red/10 rounded-full blur-xl"></div>
        <div className="floating-element absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-200/10 to-pink-200/10 rounded-full blur-xl"></div>
      </div>

      {/* Top Section - Features */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-16 pt-4 sm:pt-6 lg:pt-6 xl:pt-8 pb-3 sm:pb-4 relative z-10">
        <div className="w-full">
          <div className="mb-4 sm:mb-6 lg:mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 leading-tight drop-shadow-sm">
              Welcome to GrubGate Partner Portal
            </h1>
            <p className="text-sm sm:text-base xl:text-lg text-gray-700 leading-relaxed mb-3 sm:mb-4 lg:mb-6 drop-shadow-sm">
              Join Montreal's leading restaurant network and grow your business with predictable revenue.
            </p>
            <div className="flex items-center justify-center space-x-3 text-grub-red">
              <div className="w-12 h-0.5 bg-grub-red"></div>
              <span className="text-xs font-medium uppercase tracking-wider">Trusted by 500+ Restaurants</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className={`feature-card flex items-start space-x-2 sm:space-x-3 group p-3 sm:p-4 rounded-xl bg-white border-2 border-gray-300 hover:border-grub-red shadow-md hover:shadow-lg transition-all duration-300`}>
                <div className="feature-icon flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-grub-red/10 to-grub-red/20 rounded-lg flex items-center justify-center group-hover:from-grub-red/20 group-hover:to-grub-red/30 transition-all duration-300 shadow-lg">
                  <FontAwesomeIcon icon={feature.icon} className="w-4 h-4 sm:w-5 sm:h-5 text-grub-red" />
                </div>
                <div className="pt-0.5">
                  <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-xs sm:text-sm group-hover:text-grub-red transition-colors duration-300 drop-shadow-sm">{feature.title}</h3>
                  <p className="text-gray-700 text-[10px] sm:text-xs leading-relaxed drop-shadow-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section - Login Form */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-16 py-3 sm:py-4 lg:py-6 pb-8 sm:pb-6 relative z-10">
        <div className="w-full max-w-md mx-auto lg:max-w-lg xl:max-w-xl">
          {/* Login Form */}
          <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-white/50 bg-white/95 backdrop-blur-xl hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] transition-all duration-500">
            {/* Enhanced decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-grub-red/20 via-orange-300/10 to-transparent rounded-full -translate-y-20 translate-x-20 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/10 via-purple-300/10 to-transparent rounded-full translate-y-16 -translate-x-16 blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-br from-grub-red/5 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            
            {/* Card header with gradient accent */}
            <div className="relative mb-4 sm:mb-5">
              <div className="text-center mb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-grub-red to-red-600 rounded-xl shadow-lg mb-2">
                  <FontAwesomeIcon icon={faLock} className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">Sign In</h3>
                <p className="text-xs sm:text-sm text-gray-600">Enter your credentials to access your account</p>
              </div>
              <div className="h-0.5 w-12 sm:w-16 bg-gradient-to-r from-grub-red to-orange-500 rounded-full mx-auto"></div>
            </div>
            
            <div className="relative">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 drop-shadow-sm">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={`auth-input block w-full pl-10 pr-3 py-3 sm:py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 text-sm sm:text-base text-gray-600 ${
                      errors.email 
                        ? 'error border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : formData.email && !errors.email
                        ? 'success border-green-300 focus:border-green-500 focus:ring-green-500'
                        : 'border-gray-300 focus:border-grub-red focus:ring-grub-red hover:border-gray-400'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 drop-shadow-sm">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={`auth-input block w-full pl-10 pr-12 py-3 sm:py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 text-sm sm:text-base text-gray-600 ${
                      errors.password 
                        ? 'error border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : formData.password && !errors.password
                        ? 'success border-green-300 focus:border-green-500 focus:ring-green-500'
                        : 'border-gray-300 focus:border-grub-red focus:ring-grub-red hover:border-gray-400'
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FontAwesomeIcon icon={faEyeSlash} className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FontAwesomeIcon icon={faEye} className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-3 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-grub-red focus:ring-grub-red border-gray-300 rounded transition-colors"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-600 drop-shadow-sm">
                    Remember me
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-grub-red hover:text-grub-red-light transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <div className="pt-2 sm:pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="auth-button w-full py-3 sm:py-4 px-6 bg-gradient-to-r from-grub-red to-red-600 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="auth-spinner mr-3"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in to Dashboard'
                  )}
                </button>
                
                {/* Error Display */}
                {error && (
                  <div className="message-slide-in mt-4 p-4 bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-600" />
                      </div>
                      <p className="ml-3 text-sm text-red-700 font-medium">
                        {error}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sign Up Link */}
              <div className="text-center pt-3 sm:pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-600 drop-shadow-sm">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-grub-red hover:text-grub-red-light transition-colors"
                  >
                    Sign up for free
                  </Link>
                </span>
              </div>
            </form>
            </div>
          </div>

        </div>
      </div>
    </div>

  );
};

export default LoginPage;


