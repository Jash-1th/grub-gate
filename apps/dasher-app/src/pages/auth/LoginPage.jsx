// FILE: src/pages/auth/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faTruck,
  faCheckCircle,
  faDollarSign,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth-pages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or phone number is required';
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
    
    clearError();
    
    const result = await login(formData.identifier, formData.password);
    
    if (result.success) {
      console.log('✅ Dasher login successful!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            {/* Logo */}
            <div className="auth-logo">
              <FontAwesomeIcon icon={faTruck} className="logo-icon" />
              <h1>GrubGate Dasher</h1>
            </div>

            {/* Welcome Text */}
            <div className="auth-header">
              <h2>Welcome Back, Dasher!</h2>
              <p>Sign in to start delivering and earning</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email/Phone Input */}
              <div className="form-group">
                <label htmlFor="identifier">
                  <FontAwesomeIcon icon={faEnvelope} />
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  placeholder="Enter your email or phone number"
                  className={errors.identifier ? 'error' : ''}
                />
                {errors.identifier && (
                  <span className="error-text">{errors.identifier}</span>
                )}
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label htmlFor="password">
                  <FontAwesomeIcon icon={faLock} />
                  Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={errors.password ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Register Link */}
              <div className="auth-footer">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="auth-link">
                    Apply to become a Dasher
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="auth-info-section">
          <div className="info-content">
            <h2>Start Earning Today</h2>
            <p className="info-subtitle">
              Join thousands of dashers delivering happiness
            </p>

            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <FontAwesomeIcon icon={faDollarSign} />
                </div>
                <div className="benefit-text">
                  <h3>Flexible Earnings</h3>
                  <p>Earn money on your own schedule</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon">
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <div className="benefit-text">
                  <h3>Work Anytime</h3>
                  <p>Choose when and where you deliver</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <div className="benefit-text">
                  <h3>Quick Payouts</h3>
                  <p>Get paid weekly or instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
