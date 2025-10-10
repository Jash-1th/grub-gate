import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload,
  faTimes,
  faBuilding,
  faCreditCard,
  faUniversity
} from '@fortawesome/free-solid-svg-icons';

/**
 * BillingDetailsStep Component - Stage 3 of Partner Registration
 * Handles logo/images upload and complete billing information
 * SSR-safe implementation
 */
const BillingDetailsStep = ({ 
  data, 
  onComplete, 
  onBack, 
  isLoading, 
  setIsLoading, 
  errors, 
  setErrors 
}) => {
  
  // SSR-safe check
  const isClient = typeof window !== 'undefined';
  
  // Form state for billing details
  const [formData, setFormData] = useState({
    // Business billing info
    businessName: '',
    billingEmail: '',
    billingPhone: '',
    contactPerson: '',
    
    // Billing address
    billingStreet: '',
    billingCity: '',
    billingProvince: '',
    billingPostalCode: '',
    billingCountry: 'Canada',
    
    // Bank account info
    bankName: '',
    accountType: 'business',
    routingNumber: '',
    accountNumber: '',
    
    // Tax info
    businessNumber: '',
    gstHstNumber: '',
    
    // Payment method
    paymentMethod: 'bank_transfer'
  });
  
  // File uploads
  const [files, setFiles] = useState({
    logo: null,
    images: [],
    businessLicense: null
  });
  
  // Account type options
  const accountTypes = [
    { value: 'checking', label: 'Checking Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'business', label: 'Business Account' }
  ];

  const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'direct_deposit', label: 'Direct Deposit' },
    { value: 'check', label: 'Check' }
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    // Basic validation
    const validationErrors = {};
    if (!formData.businessName.trim()) validationErrors.businessName = 'Business name is required';
    if (!formData.billingEmail.trim()) validationErrors.billingEmail = 'Billing email is required';
    if (!formData.billingPhone.trim()) validationErrors.billingPhone = 'Billing phone is required';
    if (!formData.billingStreet.trim()) validationErrors.billingStreet = 'Billing street address is required';
    if (!formData.billingCity.trim()) validationErrors.billingCity = 'Billing city is required';
    if (!formData.billingProvince.trim()) validationErrors.billingProvince = 'Billing province is required';
    if (!formData.billingPostalCode.trim()) validationErrors.billingPostalCode = 'Billing postal code is required';
    if (!formData.bankName.trim()) validationErrors.bankName = 'Bank name is required';
    if (!formData.routingNumber.trim()) validationErrors.routingNumber = 'Routing number is required';
    if (!formData.accountNumber.trim()) validationErrors.accountNumber = 'Account number is required';
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Append verification data from previous steps
      submitData.append('identifier', data.identifier);
      submitData.append('otpVerificationToken', data.otpVerificationToken || '');
      submitData.append('completeBillingInfo', 'true');
      
      // Append files
      if (files.logo) submitData.append('logo', files.logo);
      if (files.businessLicense) submitData.append('businessLicenseFile', files.businessLicense);
      files.images.forEach((image) => {
        submitData.append('images', image);
      });
      
      // Use environment variable for API base URL with fallback
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
      
      const response = await fetch(`${apiBaseUrl}/auth/partner/complete-billing`, {
        method: 'POST',
        body: submitData
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        // Pass the complete data to parent for final completion
        onComplete(result.data);
      } else {
        console.error('❌ Billing completion failed:', result);
        if (result.errors && Array.isArray(result.errors)) {
          const errorObj = {};
          result.errors.forEach(error => {
            errorObj[error.field] = error.message;
          });
          setErrors(errorObj);
        } else {
          setErrors({ general: result.message || 'Failed to complete billing information. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Billing completion error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render on server
  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FontAwesomeIcon icon={faUpload} className="mr-2 text-grub-red" />
          Restaurant Logo & Images
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
          {errors.logo && (
            <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
          )}
        </div>

        {/* Restaurant Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restaurant Images (Optional, max 5)
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
          
          {errors.images && (
            <p className="mt-1 text-sm text-red-600">{errors.images}</p>
          )}
        </div>
      </div>

      {/* Business Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FontAwesomeIcon icon={faBuilding} className="mr-2 text-grub-red" />
          Business Information
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors ${
                errors.businessName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {errors.businessName && (
              <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="billingEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Billing Email *
            </label>
            <input
              type="email"
              id="billingEmail"
              name="billingEmail"
              value={formData.billingEmail}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors ${
                errors.billingEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {errors.billingEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.billingEmail}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="billingPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Billing Phone *
            </label>
            <input
              type="tel"
              id="billingPhone"
              name="billingPhone"
              value={formData.billingPhone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors ${
                errors.billingPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {errors.billingPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.billingPhone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Billing Address</h3>
        
        <div>
          <label htmlFor="billingStreet" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            id="billingStreet"
            name="billingStreet"
            value={formData.billingStreet}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors ${
              errors.billingStreet ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            required
            disabled={isLoading}
          />
          {errors.billingStreet && (
            <p className="mt-1 text-sm text-red-600">{errors.billingStreet}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              id="billingCity"
              name="billingCity"
              value={formData.billingCity}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors ${
                errors.billingCity ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {errors.billingCity && (
              <p className="mt-1 text-sm text-red-600">{errors.billingCity}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="billingProvince" className="block text-sm font-medium text-gray-700 mb-1">
              Province *
            </label>
            <input
              type="text"
              id="billingProvince"
              name="billingProvince"
              value={formData.billingProvince}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors ${
                errors.billingProvince ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="ON"
              required
              disabled={isLoading}
            />
            {errors.billingProvince && (
              <p className="mt-1 text-sm text-red-600">{errors.billingProvince}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="billingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code *
            </label>
            <input
              type="text"
              id="billingPostalCode"
              name="billingPostalCode"
              value={formData.billingPostalCode}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors ${
                errors.billingPostalCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="M5V 3A8"
              required
              disabled={isLoading}
            />
            {errors.billingPostalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.billingPostalCode}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bank Account Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FontAwesomeIcon icon={faUniversity} className="mr-2 text-grub-red" />
          Bank Account Information
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name *
            </label>
            <input
              type="text"
              id="bankName"
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors ${
                errors.bankName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {errors.bankName && (
              <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
              Account Type *
            </label>
            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors"
              disabled={isLoading}
            >
              {accountTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Routing Number *
            </label>
            <input
              type="text"
              id="routingNumber"
              name="routingNumber"
              value={formData.routingNumber}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors ${
                errors.routingNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="9 digits"
              required
              disabled={isLoading}
            />
            {errors.routingNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.routingNumber}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Account Number *
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors ${
                errors.accountNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="8-17 digits"
              required
              disabled={isLoading}
            />
            {errors.accountNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tax Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Tax Information (Optional)</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Business Number
            </label>
            <input
              type="text"
              id="businessNumber"
              name="businessNumber"
              value={formData.businessNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors"
              placeholder="123456789RP0001"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="gstHstNumber" className="block text-sm font-medium text-gray-700 mb-1">
              GST/HST Number
            </label>
            <input
              type="text"
              id="gstHstNumber"
              name="gstHstNumber"
              value={formData.gstHstNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors"
              placeholder="123456789RT0001"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Payment Method
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors"
          disabled={isLoading}
        >
          {paymentMethods.map(method => (
            <option key={method.value} value={method.value}>{method.label}</option>
          ))}
        </select>
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
              Completing Registration...
            </div>
          ) : (
            'Complete Registration'
          )}
        </button>
      </div>
    </form>
  );
};

export default BillingDetailsStep;
