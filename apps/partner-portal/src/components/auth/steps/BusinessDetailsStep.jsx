import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faEyeSlash, 
  faUpload,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

/**
 * BusinessDetailsStep Component
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
    
    // Contact details (will go into partnerInfo)
    businessPhone: '',
    businessEmail: '',
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
    businessLicense: null
  });
  
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
        return;
      }
      
      // Validate file types
      const invalidFiles = selectedFiles.filter(file => !allowedTypes.images.includes(file.type));
      if (invalidFiles.length > 0) {
        setErrors(prev => ({ 
          ...prev, 
          images: `Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Please upload only JPEG, PNG, or WebP images.` 
        }));
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
    
    if (isLoading) return;
    
    // Basic validation
    const validationErrors = {};
    if (!formData.firstName.trim()) validationErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) validationErrors.lastName = 'Last name is required';
    if (!formData.password) validationErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) validationErrors.confirmPassword = 'Passwords do not match';
    if (!formData.restaurantName.trim()) validationErrors.restaurantName = 'Restaurant name is required';
    if (!formData.cuisine) validationErrors.cuisine = 'Cuisine type is required';
    if (!formData.street.trim()) validationErrors.street = 'Street address is required';
    if (!formData.city.trim()) validationErrors.city = 'City is required';
    if (!formData.province.trim()) validationErrors.province = 'Province is required';
    if (!formData.postalCode.trim()) validationErrors.postalCode = 'Postal code is required';
    if (!formData.businessPhone.trim()) validationErrors.businessPhone = 'Business phone is required';
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Debug: Log the data being sent
      console.log('🔍 Form submission data:', {
        identifier: data.identifier,
        otp: data.otp,
        channel: data.channel,
        formData: formData
      });
      
      // Append OTP verification fields
      submitData.append('identifier', data.identifier);
      submitData.append('otp', data.otp);
      
      // Append user details
      submitData.append('firstName', formData.firstName.trim());
      submitData.append('lastName', formData.lastName.trim());
      submitData.append('password', formData.password);
      
      // Determine email/phone based on verification channel
      if (data.channel === 'email') {
        submitData.append('email', data.identifier);
        if (formData.phoneNumber) {
          submitData.append('phoneNumber', formData.phoneNumber.trim());
        }
      } else {
        submitData.append('phoneNumber', data.identifier);
        if (formData.email) {
          submitData.append('email', formData.email.trim());
        }
      }
      
      // Append restaurant details (these will be structured into partnerInfo by backend)
      submitData.append('restaurantName', formData.restaurantName.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('cuisine', formData.cuisine);
      submitData.append('cuisineType', formData.cuisine); // Backend expects both fields
      submitData.append('businessType', formData.businessType);
      
      // Append address (will go into partnerInfo)
      submitData.append('street', formData.street.trim());
      submitData.append('city', formData.city.trim());
      submitData.append('province', formData.province.trim());
      submitData.append('postalCode', formData.postalCode.trim());
      
      // Append contact details (will go into partnerInfo)
      submitData.append('businessPhone', formData.businessPhone.trim());
      submitData.append('businessEmail', formData.businessEmail.trim());
      submitData.append('website', formData.website.trim());
      
      // Append delivery settings (will go into partnerInfo)
      submitData.append('deliveryRadius', formData.deliveryRadius);
      submitData.append('deliveryFee', formData.deliveryFee);
      submitData.append('minOrderAmount', formData.minOrderAmount);
      submitData.append('avgDeliveryTime', formData.avgDeliveryTime);
      
      // Append business info (will go into partnerInfo)
      submitData.append('businessLicenseText', formData.businessLicense.trim());
      submitData.append('taxId', formData.taxId.trim());
      
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
      
      // Use environment variable for API base URL with fallback
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
      
      const response = await fetch(`${apiBaseUrl}/auth/partner/otp/verify`, {
        method: 'POST',
        body: submitData
      });
      
      const result = await response.json();
      
      // Debug: Log the response
      console.log('🔍 API Response:', {
        status: response.status,
        ok: response.ok,
        result: result
      });
      
      if (response.ok && result.status === 'success') {
        // Pass the complete user data to parent for authentication
        onComplete(result.data);
      } else {
        console.error('❌ Registration failed:', result);
        if (result.errors && Array.isArray(result.errors)) {
          const errorObj = {};
          result.errors.forEach(error => {
            errorObj[error.field] = error.message;
          });
          setErrors(errorObj);
        } else {
          setErrors({ general: result.message || 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
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
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors"
            placeholder="Tell us about your restaurant..."
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Business Address</h3>
        
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
              errors.street ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            required
            disabled={isLoading}
          />
          {errors.street && (
            <p className="mt-1 text-sm text-red-600">{errors.street}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
                errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
              Province *
            </label>
            <input
              type="text"
              id="province"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
                errors.province ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="ON"
              required
              disabled={isLoading}
            />
            {errors.province && (
              <p className="mt-1 text-sm text-red-600">{errors.province}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code *
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
                errors.postalCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="M5V 3A8"
              required
              disabled={isLoading}
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Business Phone *
            </label>
            <input
              type="tel"
              id="businessPhone"
              name="businessPhone"
              value={formData.businessPhone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
                errors.businessPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {errors.businessPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.businessPhone}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Business Email
            </label>
            <input
              type="email"
              id="businessEmail"
              name="businessEmail"
              value={formData.businessEmail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors"
              disabled={isLoading}
            />
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
            'Complete Registration'
          )}
        </button>
      </div>
    </form>
  );
};

export default BusinessDetailsStep;
