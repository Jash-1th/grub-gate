import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faEyeSlash, 
  faEnvelope, 
  faLock, 
  faUtensils, 
  faUsers, 
  faArrowTrendUp, 
  faShield 
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
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
        setErrors({ general: result.error || 'Login failed. Please try again.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
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
    <div className="min-h-screen bg-gradient-to-br from-grub-gray-50 via-white to-red-50 flex">
      {/* Left Side - Features (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:pl-16 xl:pl-20 lg:pr-8 xl:pr-12">
        <div className="max-w-lg">
          <div className="mb-16">
            <Logo size="xl" className="mb-12" />
            <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Welcome to GrubGate Partner Portal
            </h1>
            <p className="text-xl xl:text-2xl text-gray-600 leading-relaxed mb-12">
              Join Montreal's leading restaurant network and grow your business with predictable revenue.
            </p>
            <div className="flex items-center space-x-3 text-grub-red">
              <div className="w-16 h-0.5 bg-grub-red"></div>
              <span className="text-sm font-medium uppercase tracking-wider">Trusted by 500+ Restaurants</span>
            </div>
          </div>
          
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-5 group">
                <div className="flex-shrink-0 w-14 h-14 bg-grub-red/10 rounded-xl flex items-center justify-center group-hover:bg-grub-red/20 transition-all duration-300">
                  <FontAwesomeIcon icon={feature.icon} className="w-7 h-7 text-grub-red" />
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                  <p className="text-gray-600 text-base leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 xl:px-16 lg:max-w-xl xl:max-w-2xl">
        <div className="w-full max-w-md mx-auto lg:max-w-none">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Logo size="lg" className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Partner Portal
            </h1>
            <p className="text-gray-600">
              Sign in to manage your restaurant
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-12">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-grub-red/5 rounded-full blur-xl"></div>
              <div className="relative">
                <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Sign in to your account
                </h2>
                <p className="text-lg xl:text-xl text-gray-600 mb-8 leading-relaxed">
                  Welcome back! Ready to manage your restaurant?
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Secure Login</span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                  <span>24/7 Support Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-10 lg:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-grub-red/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3">
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
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-base ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-3">
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
                    className={`block w-full pl-10 pr-12 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-base ${
                      errors.password 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
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
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-grub-red focus:ring-grub-red border-gray-300 rounded transition-colors"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
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
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  className="w-full py-4 text-base font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
                
                {/* Error Display */}
                {(errors.general || error) && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">
                      {errors.general || error}
                    </p>
                  </div>
                )}
              </div>

              {/* Sign Up Link */}
              <div className="text-center pt-6 border-t border-gray-100">
                <span className="text-sm text-gray-600">
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

          {/* Mobile Features */}
          <div className="lg:hidden mt-12 space-y-6">
            <div className="text-center text-sm text-gray-600 mb-6">
              Why choose GrubGate?
            </div>
            <div className="grid grid-cols-2 gap-6">
              {features.slice(0, 4).map((feature, index) => (
                <div key={index} className="text-center p-4 bg-white rounded-xl shadow-soft border border-gray-100">
                  <FontAwesomeIcon icon={feature.icon} className="w-6 h-6 text-grub-red mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default LoginPage;
