import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload,
  faTimes,
  faUser,
  faBuilding,
  faMapMarkerAlt,
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import useFormValidation from '../../../hooks/useFormValidation';
import ValidatedInput from '../../common/ValidatedInput';
import schemas from '../../../utils/validation/schemas';

/**
 * Enhanced BusinessDetailsStep Component with Joi Validation
 * Provides comprehensive form validation with user-friendly error messages
 */
const BusinessDetailsStep = ({ 
  data, 
  onComplete, 
  onBack, 
  isLoading, 
  setIsLoading, 
  errors: externalErrors, 
  setErrors: setExternalErrors 
}) => {
  
  // Initial form data
  const initialFormData = {
    // User details
    firstName: '',
    lastName: '',
    email: data.channel === 'email' ? data.identifier : '',
    phoneNumber: data.channel === 'sms' ? data.identifier : '',
    password: '',
    confirmPassword: '',
    
    // Restaurant details
    restaurantName: '',
    description: '',
    cuisine: '',
    businessType: 'restaurant',
    
    // Address
    street: '',
    city: '',
    province: '',
    postalCode: '',
    
    // Contact details
    businessPhone: '',
    businessEmail: '',
    website: '',
    
    // Delivery settings
    deliveryRadius: 5,
    deliveryFee: 0,
    minOrderAmount: 0,
    avgDeliveryTime: 30,
    
    // Business info
    businessLicense: '',
    taxId: ''
  };

  // Form validation hook
  const {
    formData,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldProps,
    errors: validationErrors,
    isValid,
    hasErrors,
    validationSummary
  } = useFormValidation(
    initialFormData,
    schemas.registrationSchemas.businessDetails,
    {
      validateOnChange: true,
      validateOnBlur: true,
      showErrorsOnlyAfterTouch: true,
      debounceMs: 500
    }
  );
  
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
        setExternalErrors(prev => ({ 
          ...prev, 
          images: `Cannot add ${selectedFiles.length} more images. You can only have 5 images total (currently have ${currentCount}).` 
        }));
        return;
      }
      
      // Validate file types
      const invalidFiles = selectedFiles.filter(file => !allowedTypes.images.includes(file.type));
      if (invalidFiles.length > 0) {
        setExternalErrors(prev => ({ 
          ...prev, 
          images: `Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Please upload only JPEG, PNG, or WebP images.` 
        }));
        return;
      }
      
      // Add new files to existing files
      setFiles(prev => ({ ...prev, images: [...prev.images, ...selectedFiles] }));
      // Clear any previous errors
      if (externalErrors.images) {
        setExternalErrors(prev => ({ ...prev, images: '' }));
      }
    } else {
      // Single file for logo and business license
      const file = selectedFiles[0];
      
      // Validate file type
      if (!allowedTypes[fileType].includes(file.type)) {
        const allowedExtensions = fileType === 'businessLicense' 
          ? 'JPEG, PNG, WebP, or PDF' 
          : 'JPEG, PNG, or WebP';
        setExternalErrors(prev => ({ 
          ...prev, 
          [fileType]: `Invalid file type: ${file.name}. Please upload ${allowedExtensions} files only.` 
        }));
        return;
      }
      
      setFiles(prev => ({ ...prev, [fileType]: file }));
      // Clear any previous errors
      if (externalErrors[fileType]) {
        setExternalErrors(prev => ({ ...prev, [fileType]: '' }));
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
    if (externalErrors.images) {
      setExternalErrors(prev => ({ ...prev, images: '' }));
    }
  };

  // Handle form submission
  const onSubmit = handleSubmit(async (validatedData) => {
    setIsLoading(true);
    setExternalErrors({});
    
    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Debug: Log the data being sent
      console.log('🔍 Form submission data:', {
        identifier: data.identifier,
        otpVerified: data.otpVerified,
        otpVerificationToken: data.otpVerificationToken,
        channel: data.channel,
        formData: validatedData
      });
      
      // Append verification fields (OTP already verified in Stage 1)
      submitData.append('identifier', data.identifier);
      submitData.append('skipOtpVerification', 'true');
      submitData.append('otpVerificationToken', data.otpVerificationToken || '');
      
      // Append user details
      submitData.append('firstName', validatedData.firstName.trim());
      submitData.append('lastName', validatedData.lastName.trim());
      submitData.append('password', validatedData.password);
      
      // Determine email/phone based on verification channel
      if (data.channel === 'email') {
        submitData.append('email', data.identifier);
        if (validatedData.phoneNumber) {
          submitData.append('phoneNumber', validatedData.phoneNumber.trim());
        }
      } else {
        submitData.append('phoneNumber', data.identifier);
        if (validatedData.email) {
          submitData.append('email', validatedData.email.trim());
        }
      }
      
      // Append restaurant details (these will be structured into partnerInfo by backend)
      submitData.append('restaurantName', validatedData.restaurantName.trim());
      submitData.append('description', validatedData.description.trim());
      submitData.append('cuisine', validatedData.cuisine);
      submitData.append('cuisineType', validatedData.cuisine); // Backend expects both fields
      submitData.append('businessType', validatedData.businessType);
      
      // Append address (will go into partnerInfo)
      submitData.append('street', validatedData.street.trim());
      submitData.append('city', validatedData.city.trim());
      submitData.append('province', validatedData.province.trim());
      submitData.append('postalCode', validatedData.postalCode.trim());
      
      // Append contact details (will go into partnerInfo)
      submitData.append('businessPhone', validatedData.businessPhone.trim());
      submitData.append('businessEmail', validatedData.businessEmail.trim());
      submitData.append('website', validatedData.website.trim());
      
      // Append delivery settings (will go into partnerInfo)
      submitData.append('deliveryRadius', validatedData.deliveryRadius);
      submitData.append('deliveryFee', validatedData.deliveryFee);
      submitData.append('minOrderAmount', validatedData.minOrderAmount);
      submitData.append('avgDeliveryTime', validatedData.avgDeliveryTime);
      
      // Append business info (will go into partnerInfo)
      submitData.append('businessLicenseText', validatedData.businessLicense.trim());
      submitData.append('taxId', validatedData.taxId.trim());
      
      // Append files
      if (files.logo) submitData.append('logo', files.logo);
      if (files.businessLicense) submitData.append('businessLicenseFile', files.businessLicense);
      files.images.forEach((image) => {
        submitData.append('images', image);
      });
      
      // Use environment variable for API base URL with fallback to deployed backend
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://gg0b1.netlify.app/api/v1';
      
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
          setExternalErrors(errorObj);
        } else {
          setExternalErrors({ general: result.message || 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setExternalErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Validation Summary (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">{validationSummary}</p>
          {hasErrors && (
            <details className="mt-2">
              <summary className="text-xs text-blue-600 cursor-pointer">View validation errors</summary>
              <pre className="text-xs mt-1 text-blue-700">{JSON.stringify(validationErrors, null, 2)}</pre>
            </details>
          )}
        </div>
      )}

      {/* General Error */}
      {externalErrors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{externalErrors.general}</p>
        </div>
      )}

      {/* User Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FontAwesomeIcon icon={faUser} className="mr-2 text-grub-red" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInput
            label="First Name"
            name="firstName"
            required
            disabled={isLoading}
            {...getFieldProps('firstName')}
          />
          
          <ValidatedInput
            label="Last Name"
            name="lastName"
            required
            disabled={isLoading}
            {...getFieldProps('lastName')}
          />
        </div>

        {/* Email/Phone based on channel */}
        {data.channel === 'sms' && (
          <ValidatedInput
            label="Email Address"
            name="email"
            type="email"
            disabled={isLoading}
            helperText="Optional: Add your email for better account security"
            {...getFieldProps('email')}
          />
        )}

        {data.channel === 'email' && (
          <ValidatedInput
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            disabled={isLoading}
            helperText="Optional: Add your phone for SMS notifications"
            {...getFieldProps('phoneNumber')}
          />
        )}

        {/* Password Fields */}
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInput
            label="Password"
            name="password"
            type="password"
            required
            disabled={isLoading}
            showPasswordToggle
            helperText="Minimum 8 characters"
            {...getFieldProps('password')}
          />
          
          <ValidatedInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            required
            disabled={isLoading}
            showPasswordToggle
            {...getFieldProps('confirmPassword')}
          />
        </div>
      </div>

      {/* Restaurant Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FontAwesomeIcon icon={faBuilding} className="mr-2 text-grub-red" />
          Restaurant Information
        </h3>
        
        <ValidatedInput
          label="Restaurant Name"
          name="restaurantName"
          required
          disabled={isLoading}
          {...getFieldProps('restaurantName')}
        />

        <div className="grid grid-cols-2 gap-4">
          <ValidatedInput
            label="Cuisine Type"
            name="cuisine"
            type="select"
            required
            disabled={isLoading}
            placeholder="Select cuisine type"
            options={cuisineOptions}
            {...getFieldProps('cuisine')}
          />
          
          <ValidatedInput
            label="Business Type"
            name="businessType"
            type="select"
            disabled={isLoading}
            options={businessTypes}
            {...getFieldProps('businessType')}
          />
        </div>

        <ValidatedInput
          label="Description"
          name="description"
          type="textarea"
          rows={3}
          disabled={isLoading}
          placeholder="Tell us about your restaurant..."
          helperText="Optional: Describe your restaurant's specialties and atmosphere"
          {...getFieldProps('description')}
        />
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-grub-red" />
          Business Address
        </h3>
        
        <ValidatedInput
          label="Street Address"
          name="street"
          required
          disabled={isLoading}
          {...getFieldProps('street')}
        />

        <div className="grid grid-cols-3 gap-4">
          <ValidatedInput
            label="City"
            name="city"
            required
            disabled={isLoading}
            {...getFieldProps('city')}
          />
          
          <ValidatedInput
            label="Province"
            name="province"
            required
            disabled={isLoading}
            placeholder="ON"
            {...getFieldProps('province')}
          />
          
          <ValidatedInput
            label="Postal Code"
            name="postalCode"
            required
            disabled={isLoading}
            placeholder="M5V 3A8"
            {...getFieldProps('postalCode')}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FontAwesomeIcon icon={faPhone} className="mr-2 text-grub-red" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInput
            label="Business Phone"
            name="businessPhone"
            type="tel"
            required
            disabled={isLoading}
            {...getFieldProps('businessPhone')}
          />
          
          <ValidatedInput
            label="Business Email"
            name="businessEmail"
            type="email"
            disabled={isLoading}
            helperText="Optional: For business communications"
            {...getFieldProps('businessEmail')}
          />
        </div>

        <ValidatedInput
          label="Website"
          name="website"
          type="url"
          disabled={isLoading}
          placeholder="https://yourrestaurant.com"
          helperText="Optional: Your restaurant's website"
          {...getFieldProps('website')}
        />
      </div>

      {/* Delivery Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Delivery Settings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInput
            label="Delivery Radius (km)"
            name="deliveryRadius"
            type="number"
            min="1"
            max="50"
            disabled={isLoading}
            {...getFieldProps('deliveryRadius')}
          />
          
          <ValidatedInput
            label="Delivery Fee ($)"
            name="deliveryFee"
            type="number"
            min="0"
            step="0.01"
            disabled={isLoading}
            {...getFieldProps('deliveryFee')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ValidatedInput
            label="Minimum Order Amount ($)"
            name="minOrderAmount"
            type="number"
            min="0"
            step="0.01"
            disabled={isLoading}
            {...getFieldProps('minOrderAmount')}
          />
          
          <ValidatedInput
            label="Average Delivery Time (minutes)"
            name="avgDeliveryTime"
            type="number"
            min="10"
            max="120"
            disabled={isLoading}
            {...getFieldProps('avgDeliveryTime')}
          />
        </div>
      </div>

      {/* Business Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInput
            label="Business License"
            name="businessLicense"
            disabled={isLoading}
            helperText="Optional: Business license number"
            {...getFieldProps('businessLicense')}
          />
          
          <ValidatedInput
            label="Tax ID"
            name="taxId"
            disabled={isLoading}
            helperText="Optional: Tax identification number"
            {...getFieldProps('taxId')}
          />
        </div>
      </div>

      {/* File Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FontAwesomeIcon icon={faUpload} className="mr-2 text-grub-red" />
          Restaurant Media (Optional)
        </h3>
        
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restaurant Logo
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-grub-red transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'logo')}
              className="hidden"
              id="logo-upload"
              disabled={isLoading}
            />
            <label htmlFor="logo-upload" className="cursor-pointer">
              {files.logo ? (
                <div className="flex items-center justify-center">
                  <span className="text-green-600">✓ {files.logo.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles(prev => ({ ...prev, logo: null }))}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ) : (
                <div>
                  <FontAwesomeIcon icon={faUpload} className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Click to upload logo</p>
                </div>
              )}
            </label>
          </div>
          {externalErrors.logo && (
            <p className="mt-1 text-sm text-red-600">{externalErrors.logo}</p>
          )}
        </div>

        {/* Restaurant Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restaurant Images (Max 5)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-grub-red transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange(e, 'images')}
              className="hidden"
              id="images-upload"
              disabled={isLoading}
            />
            <label htmlFor="images-upload" className="cursor-pointer">
              <FontAwesomeIcon icon={faUpload} className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Click to upload images</p>
            </label>
          </div>
          
          {/* Display selected images */}
          {files.images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {files.images.map((image, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded px-2 py-1">
                  <span className="text-sm text-gray-700">{image.name}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {externalErrors.images && (
            <p className="mt-1 text-sm text-red-600">{externalErrors.images}</p>
          )}
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
          disabled={isLoading || !isValid}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold text-base transition-all duration-200 shadow-lg ${
            isLoading || !isValid
              ? 'bg-gray-400 cursor-not-allowed'
              : 'text-white hover:shadow-xl transform hover:-translate-y-0.5 transition-transform'
          }`}
          style={{ backgroundColor: (isLoading || !isValid) ? undefined : '#800020' }}
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
