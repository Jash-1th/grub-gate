import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faEyeSlash, 
  faUpload,
  faTimes,
  faImage,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import EnhancedAddressForm from '../../address/EnhancedAddressForm.jsx';
import { apiClient } from '../../../api/client.js';
import { validateFormWithSchema, formatBackendErrors, VALIDATION_RULES } from '../../../utils/validationErrorHandler.js';

/**
 * BusinessDetailsStep Component
{{ ... }}
 * Handles business details form with new nested partnerInfo structure
 * SSR-safe and creates data in the format expected by the refactored User model
 */
const BusinessDetailsStep = ({ 
  data, 
  onComplete, 
  onBack, 
  isLoading, 
  setIsLoading, 
  errors, 
  setErrors 
}) => {
  
  // Form state for business details
  const [formData, setFormData] = useState({
    // User details
    firstName: '',
    lastName: '',
    email: data.channel === 'email' ? data.identifier : '',
    phoneNumber: data.channel === 'sms' ? data.identifier : '',
    password: '',
    confirmPassword: '',
    
    // Restaurant details (will go into partnerInfo)
    restaurantName: '',
    description: '',
    cuisine: '',
    businessType: 'restaurant',
    
    // Address (will go into partnerInfo)
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
    
    // Contact details (will go into partnerInfo)
    businessPhone: data.channel === 'sms' ? data.identifier : '',
    businessEmail: data.channel === 'email' ? data.identifier : '',
    website: '',
    
    // Delivery settings (will go into partnerInfo)
    deliveryRadius: 5,
    deliveryFee: 0,
    minOrderAmount: 0,
    avgDeliveryTime: 30,
    
    // Business info (will go into partnerInfo)
    businessLicense: '',
    taxId: ''
  });
  
  // File uploads
  const [files, setFiles] = useState({
    logo: null,
    images: [],
    businessLicense: null,
    taxDocument: null
  });
  
  // Test function to trigger validation errors (for development)
 
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Business type options
  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'cafe', label: 'Cafe' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'food_truck', label: 'Food Truck' },
    { value: 'catering', label: 'Catering' },
    { value: 'other', label: 'Other' }
  ];

  const cuisineOptions = [
    'Italian', 'Chinese', 'Mexican', 'Indian', 'French', 'Japanese', 
    'Thai', 'Mediterranean', 'American', 'Greek', 'Lebanese', 'Vietnamese',
    'Korean', 'Spanish', 'Turkish', 'Moroccan', 'Ethiopian', 'Other'
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file changes
  const handleFileChange = (e, fileType) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Define allowed file types
    const allowedTypes = {
      logo: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      businessLicense: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    };
    
    if (fileType === 'images') {
      // Check if adding new files would exceed limit
      const currentCount = files.images.length;
      const newCount = currentCount + selectedFiles.length;
      
      if (newCount > 5) {
        setErrors(prev => ({ 
          ...prev, 
          images: `Cannot add ${selectedFiles.length} more images. You can only have 5 images total (currently have ${currentCount}).` 
        }));
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      // Validate file types
      const invalidFiles = selectedFiles.filter(file => !allowedTypes.images.includes(file.type));
      if (invalidFiles.length > 0) {
        setErrors(prev => ({ 
          ...prev, 
          images: `Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Please upload only JPEG, PNG, or WebP images.` 
        }));
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      // Add new files to existing files
      setFiles(prev => ({ ...prev, images: [...prev.images, ...selectedFiles] }));
      // Clear any previous errors
      if (errors.images) {
        setErrors(prev => ({ ...prev, images: '' }));
      }
    } else {
      // Single file for logo and business license
      const file = selectedFiles[0];
      
      // Validate file type
      if (!allowedTypes[fileType].includes(file.type)) {
        const allowedExtensions = fileType === 'businessLicense' 
          ? 'JPEG, PNG, WebP, or PDF' 
          : 'JPEG, PNG, or WebP';
        setErrors(prev => ({ 
          ...prev, 
          [fileType]: `Invalid file type: ${file.name}. Please upload ${allowedExtensions} files only.` 
        }));
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      setFiles(prev => ({ ...prev, [fileType]: file }));
      // Clear any previous errors
      if (errors[fileType]) {
        setErrors(prev => ({ ...prev, [fileType]: '' }));
      }
    }
  };

  // Remove individual images
  const removeImage = (indexToRemove) => {
    setFiles(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
    
    // Clear any previous errors when removing images
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  // Handle form submission with new nested structure
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔘 Submit button clicked!', { isLoading });
    
    if (isLoading) {
      console.log('⏳ Form is already loading, skipping submission');
      return;
    }
    
    // Enhanced validation using Joi schemas
    const validationErrors = validateFormWithSchema(formData, 'businessDetails');
    
    // Additional custom validation for password confirmation
    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to top to show validation errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsLoading(true);
    setErrors({});
    
    try {
      // Create FormData for backend (flat structure as expected)
      const submitData = new FormData();
      
      // OTP verification data
      submitData.append('identifier', data.identifier);
      submitData.append('skipOtpVerification', 'true');
      submitData.append('otpVerificationToken', data.otpVerificationToken || `verified_${data.identifier}_${Date.now()}`);
      submitData.append('otp', data.otp || '123456'); // Use actual OTP from data
      submitData.append('userType', 'partner'); // Required by backend validation schema
      
      // User personal data
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('phoneNumber', formData.phoneNumber);
      submitData.append('password', formData.password);
      
      // Restaurant data
      submitData.append('restaurantName', formData.restaurantName);
      submitData.append('description', formData.description);
      submitData.append('cuisine', formData.cuisine);
      submitData.append('cuisineType', formData.cuisine); // Backend expects both
      submitData.append('businessType', formData.businessType);
      
      // Address data (flat structure)
      submitData.append('street', formData.street);
      submitData.append('city', formData.city);
      // Send both to satisfy Joi schema AND controller
      submitData.append('province', formData.province); // Joi schema expects this
      submitData.append('state', formData.province);    // Controller destructuring expects this
      submitData.append('postalCode', formData.postalCode);
      
      // Controller validation requires 'country' field
      const countryValue = formData.country || 'IN';
      submitData.append('country', countryValue);
      
      console.log('🌍 Sending state:', formData.province, 'country:', countryValue);
      
      // Coordinates for distance calculation (critical for customer app)
      if (formData.coordinates) {
        submitData.append('coordinates', JSON.stringify(formData.coordinates));
      }
      
      // Formatted address for display
      if (formData.formattedAddress) {
        submitData.append('formattedAddress', formData.formattedAddress);
      }
      
      // Contact data
      submitData.append('businessPhone', formData.businessPhone);
      submitData.append('businessEmail', formData.businessEmail);
      submitData.append('website', formData.website);
      
      // Delivery settings (flat structure)
      submitData.append('deliveryRadius', parseFloat(formData.deliveryRadius) || 5);
      submitData.append('deliveryFee', parseFloat(formData.deliveryFee) || 0);
      submitData.append('minOrderAmount', parseFloat(formData.minOrderAmount) || 0);
      submitData.append('avgDeliveryTime', parseInt(formData.avgDeliveryTime) || 30);
      
      // Business info
      submitData.append('businessLicenseText', formData.businessLicenseText || '');
      submitData.append('taxId', formData.taxId || '');
      
      // Append files
      if (files.logo) submitData.append('logo', files.logo);
      if (files.businessLicense) submitData.append('businessLicenseFile', files.businessLicense);
      files.images.forEach((image) => {
        submitData.append('images', image);
      });
      
      // Debug: Log FormData entries
      console.log('🔍 FormData being sent:');
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}:`, value);
      }
      
      // Use the configured API client (respects local/production backend settings)
      // Note: Don't set Content-Type manually for FormData - let Axios handle the boundary
      console.log('🚀 Making API request to:', '/auth/partner/otp/verify');
      console.log('🔍 API Base URL:', apiClient.defaults.baseURL);
      console.log('🔍 Full URL will be:', `${apiClient.defaults.baseURL}/auth/partner/otp/verify`);
      
      let response;
      try {
        console.log('📡 Sending request...');
        response = await apiClient.post('/auth/partner/otp/verify', submitData);
        console.log('✅ Request successful!');
      } catch (requestError) {
        console.error('❌ Request failed:', requestError);
        console.error('❌ Request error details:', {
          message: requestError.message,
          code: requestError.code,
          response: requestError.response,
          request: requestError.request
        });
        throw requestError; // Re-throw to be caught by outer try-catch
      }
      
      const result = response.data;
      
      // Debug: Log the response
      console.log('🔍 API Response:', {
        status: response.status,
        result: result
      });
      
      if ((response.status === 200 || response.status === 201) && result.status === 'success') {
        // Pass the user data to parent to move to Stage 3 (billing details)
        onComplete({
          user: result.data.user,
          restaurant: result.data.restaurant,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken
        });
      } else {
        console.error('❌ Registration failed:', result);
        if (result.errors && Array.isArray(result.errors)) {
          const errorObj = {};
          result.errors.forEach(error => {
            errorObj[error.field] = error.message;
          });
          setErrors(errorObj);
          // Scroll to top to show validation errors
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setErrors({ general: result.message || 'Registration failed. Please try again.' });
          // Scroll to top to show error message
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Use enhanced error formatting for Joi validation errors
          const formattedErrors = formatBackendErrors(errorData.errors);
          setErrors(formattedErrors);
          // Scroll to top to show validation errors
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setErrors({ general: errorData.message || 'Registration failed. Please try again.' });
          // Scroll to top to show error message
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        // Network error or other issue
        setErrors({ general: 'Network error. Please check your connection and try again.' });
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
                errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
                errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FontAwesomeIcon 
                  icon={showPassword ? faEyeSlash : faEye} 
                  className="h-4 w-4 text-gray-400"
                />
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
                  errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FontAwesomeIcon 
                  icon={showConfirmPassword ? faEyeSlash : faEye} 
                  className="h-4 w-4 text-gray-400"
                />
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Personal Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Personal Email *
              {data.channel === 'email' && (
                <span className="ml-2 text-xs text-green-600 font-medium hidden sm:inline">✓ Verified</span>
              )}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } ${data.channel === 'email' ? 'bg-gray-50' : ''}`}
              required
              disabled={isLoading || data.channel === 'email'}
              placeholder="john@example.com"
            />
            {data.channel === 'email' && (
              <p className="mt-1 text-xs text-gray-500 hidden sm:block">This email was verified during registration</p>
            )}
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Personal Phone *
              {data.channel === 'sms' && (
                <span className="ml-2 text-xs text-green-600 font-medium hidden sm:inline">✓ Verified</span>
              )}
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
                errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } ${data.channel === 'sms' ? 'bg-gray-50' : ''}`}
              required
              disabled={isLoading || data.channel === 'sms'}
              placeholder="+1-234-567-8900"
            />
            {data.channel === 'sms' && (
              <p className="mt-1 text-xs text-gray-500 hidden sm:block">This phone was verified during registration</p>
            )}
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Restaurant Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Restaurant Information</h3>
        
        <div>
          <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-1">
            Restaurant Name *
          </label>
          <input
            type="text"
            id="restaurantName"
            name="restaurantName"
            value={formData.restaurantName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
              errors.restaurantName ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            required
            disabled={isLoading}
          />
          {errors.restaurantName && (
            <p className="mt-1 text-sm text-red-600">{errors.restaurantName}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">
              Cuisine Type *
            </label>
            <select
              id="cuisine"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
                errors.cuisine ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            >
              <option value="">Select cuisine type</option>
              {cuisineOptions.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
            {errors.cuisine && (
              <p className="mt-1 text-sm text-red-600">{errors.cuisine}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors"
              disabled={isLoading}
            >
              {businessTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
              errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Tell us about your restaurant..."
            disabled={isLoading}
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.description}
            </p>
          )}
        </div>
      </div>
      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Business Address</h3>
        
        <EnhancedAddressForm
          formData={{
            street: formData.street,
            city: formData.city,
            province: formData.province,
            postalCode: formData.postalCode,
            country: formData.country || ''
          }}
          handleInputChange={(field, value) => {
            setFormData(prev => ({ ...prev, [field]: value }));
          }}
          errors={errors}
          loading={isLoading}
          showCountrySelection={true}
          showCoordinateCapture={true}
        />
      </div>

      {/* Delivery Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Delivery Settings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="deliveryRadius" className="block text-sm font-medium text-gray-700 mb-1">
              <span className="inline sm:hidden">Delivery Radius *</span>
              <span className="hidden sm:inline">Delivery Radius (km) *</span>
            </label>
            <input
              type="number"
              id="deliveryRadius"
              name="deliveryRadius"
              value={formData.deliveryRadius}
              onChange={handleInputChange}
              min="1"
              max="50"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
                errors.deliveryRadius ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="5"
              disabled={isLoading}
            />
            {errors.deliveryRadius && (
              <p className="mt-1 text-sm text-red-600">{errors.deliveryRadius}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Maximum distance for delivery (1-50 km)</p>
          </div>
          
          <div>
            <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Fee ($)
            </label>
            <input
              type="number"
              id="deliveryFee"
              name="deliveryFee"
              value={formData.deliveryFee}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors"
              placeholder="2.99"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">Delivery fee charged to customers</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minOrderAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Order ($)
            </label>
            <input
              type="number"
              id="minOrderAmount"
              name="minOrderAmount"
              value={formData.minOrderAmount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors"
              placeholder="15.00"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">Minimum order amount for delivery</p>
          </div>
          
          <div>
            <label htmlFor="avgDeliveryTime" className="block text-sm font-medium text-gray-700 mb-1">
              <span className="inline sm:hidden">Delivery Time (min)</span>
              <span className="hidden sm:inline">Delivery Time (minutes)</span>
            </label>
            <input
              type="number"
              id="avgDeliveryTime"
              name="avgDeliveryTime"
              value={formData.avgDeliveryTime}
              onChange={handleInputChange}
              min="10"
              max="120"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors"
              placeholder="30"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">Average delivery time (10-120 minutes)</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Business Phone *
              {data.channel === 'sms' && (
                <span className="ml-2 text-xs text-green-600 font-medium hidden sm:inline">✓ Auto-filled from verified phone</span>
              )}
            </label>
            <input
              type="tel"
              id="businessPhone"
              name="businessPhone"
              value={formData.businessPhone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
                errors.businessPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } ${data.channel === 'sms' ? 'bg-gray-50' : ''}`}
              required
              disabled={isLoading || data.channel === 'sms'}
              placeholder="+1-234-567-8900"
            />
            {data.channel === 'sms' && (
              <p className="mt-1 text-xs text-gray-500 hidden sm:block">Auto-filled from your verified phone number</p>
            )}
            {errors.businessPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.businessPhone}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Business Email
              {data.channel === 'email' && (
                <span className="ml-2 text-xs text-green-600 font-medium hidden sm:inline">✓ Auto-filled from verified email</span>
              )}
            </label>
            <input
              type="email"
              id="businessEmail"
              name="businessEmail"
              value={formData.businessEmail}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
                data.channel === 'email' ? 'bg-gray-50' : ''
              }`}
              disabled={isLoading || data.channel === 'email'}
              placeholder="restaurant@example.com"
            />
            {data.channel === 'email' && (
              <p className="mt-1 text-xs text-gray-500 hidden sm:block">Auto-filled from your verified email address</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors"
            placeholder="https://yourrestaurant.com"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Restaurant Media & Documents */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Restaurant Media & Documents</h3>
        
        {/* Restaurant Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restaurant Logo
            <span className="text-xs text-gray-500 ml-2">(Optional - JPEG, PNG, WebP)</span>
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="file"
                id="logo"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleFileChange(e, 'logo')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors"
                disabled={isLoading}
              />
              {files.logo && (
                <p className="mt-1 text-sm text-green-600">
                  <FontAwesomeIcon icon={faUpload} className="mr-1" />
                  {files.logo.name}
                </p>
              )}
              {errors.logo && (
                <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
              )}
            </div>
            {files.logo && (
              <button
                type="button"
                onClick={() => setFiles(prev => ({ ...prev, logo: null }))}
                className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>

        {/* Restaurant Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restaurant Images
            <span className="text-xs text-gray-500 ml-2">(Optional - Up to 5 images, JPEG, PNG, WebP)</span>
          </label>
          <input
            type="file"
            id="images"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleFileChange(e, 'images')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors"
            disabled={isLoading}
          />
          {files.images.length > 0 && (
            <div className="mt-2 space-y-1">
              {files.images.map((image, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm text-gray-700">
                    <FontAwesomeIcon icon={faImage} className="mr-2 text-gray-500" />
                    {image.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    disabled={isLoading}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.images && (
            <p className="mt-1 text-sm text-red-600">{errors.images}</p>
          )}
        </div>

        {/* Business License */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business License Document
            <span className="text-xs text-gray-500 ml-2">(Optional - JPEG, PNG, WebP, PDF)</span>
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="file"
                id="businessLicense"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                onChange={(e) => handleFileChange(e, 'businessLicense')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors"
                disabled={isLoading}
              />
              {files.businessLicense && (
                <p className="mt-1 text-sm text-green-600">
                  <FontAwesomeIcon icon={faFileAlt} className="mr-1" />
                  {files.businessLicense.name}
                </p>
              )}
              {errors.businessLicense && (
                <p className="mt-1 text-sm text-red-600">{errors.businessLicense}</p>
              )}
            </div>
            {files.businessLicense && (
              <button
                type="button"
                onClick={() => setFiles(prev => ({ ...prev, businessLicense: null }))}
                className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Test Validation Button (Development Only) - Commented out until testValidation function is implemented */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="pt-4">
          <button
            type="button"
            onClick={testValidation}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            🧪 Test Validation Errors
          </button>
        </div>
      )} */}
      
      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold text-base transition-all duration-200 shadow-lg ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'text-white hover:shadow-xl transform hover:-translate-y-0.5 transition-transform'
          }`}
          style={{ backgroundColor: isLoading ? undefined : '#800020' }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg 
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating Account...
            </div>
          ) : (
            'Continue to Billing'
          )}
        </button>
      </div>
    </form>
  );
};

export default BusinessDetailsStep;
