// FILE: apps/customer-app/src/components/address/AddressForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faExclamationCircle, 
  faSpinner,
  faHome,
  faBuilding,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import CurrentLocationButton from '../location/CurrentLocationButton';
import addressValidationService from '../../services/addressValidationService';
import { useToast } from '../../contexts/ToastContext';

/**
 * Enhanced Address Form Component
 * Supports global addresses with validation and geocoding
 * SSR-safe implementation
 */
const AddressForm = ({ 
  address = null, 
  onSave, 
  onCancel,
  showTypeSelection = true,
  showInstructions = true,
  showCurrentLocation = true,
  className = ''
}) => {
  const { showSuccess, showError } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState({});

  // Form data state
  const [formData, setFormData] = useState({
    type: 'home',
    street: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
    instructions: '',
    isDefault: false,
    coordinates: null
  });

  // Country detection state
  const [countryDetection, setCountryDetection] = useState({
    detected: false,
    country: null,
    format: null
  });

  // SSR safety
  useEffect(() => {
    setIsClient(true);
    
    // Pre-populate form if editing existing address
    if (address) {
      setFormData({
        type: address.type || 'home',
        street: address.street || address.addressLine1 || '',
        addressLine2: address.addressLine2 || '',
        city: address.city || '',
        province: address.province || address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || '',
        instructions: address.instructions || '',
        isDefault: address.isDefault || false,
        coordinates: address.coordinates || null
      });

      // Set country detection if country is already known
      if (address.country) {
        setCountryDetection({
          detected: true,
          country: address.country,
          format: null
        });
      }
    }
  }, [address]);

  // Address type options
  const addressTypes = [
    { value: 'home', label: 'Home', icon: faHome },
    { value: 'work', label: 'Work', icon: faBuilding },
    { value: 'other', label: 'Other', icon: faMapMarkerAlt }
  ];

  // Handle input changes with validation
  const handleInputChange = useCallback((field, value) => {
    // Auto-correct common typos
    let correctedValue = value;
    
    if (field === 'city') {
      const cityCorrections = {
        'tornoto': 'Toronto',
        'toranto': 'Toronto',
        'toronot': 'Toronto',
        'vancuver': 'Vancouver',
        'vancouer': 'Vancouver',
        'montral': 'Montreal',
        'calgery': 'Calgary',
        'calgarry': 'Calgary'
      };
      
      const lowerValue = value.toLowerCase();
      if (cityCorrections[lowerValue]) {
        correctedValue = cityCorrections[lowerValue];
        // Show a helpful message
        setTimeout(() => {
          showSuccess('Auto-corrected', `Changed "${value}" to "${correctedValue}"`);
        }, 100);
      }
    }
    
    if (field === 'street') {
      // Auto-correct common street typos
      correctedValue = value
        .replace(/\bmaiin\b/gi, 'Main')
        .replace(/\bmian\b/gi, 'Main')
        .replace(/\bstret\b/gi, 'Street')
        .replace(/\bstreat\b/gi, 'Street')
        .replace(/\bavenu\b/gi, 'Avenue')
        .replace(/\baveune\b/gi, 'Avenue');
      
      if (correctedValue !== value) {
        setTimeout(() => {
          showSuccess('Auto-corrected', 'Fixed spelling in street address');
        }, 100);
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: correctedValue
    }));

    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors, showSuccess]);

  // Detect country from postal code
  const detectCountryFromPostalCode = useCallback(async (postalCode) => {
    try {
      const detection = await addressValidationService.detectCountryFromPostalCode(postalCode);
      
      if (detection.country) {
        setCountryDetection({
          detected: true,
          country: detection.country,
          format: detection.format
        });

        // Auto-fill country if not already set
        if (!formData.country) {
          setFormData(prev => ({
            ...prev,
            country: detection.country
          }));
        }
      }
    } catch (error) {
      console.warn('Country detection failed:', error);
    }
  }, [formData.country]);

  // Trigger country detection when postal code changes
  useEffect(() => {
    if (formData.postalCode && formData.postalCode.length >= 3) {
      detectCountryFromPostalCode(formData.postalCode);
    }
  }, [formData.postalCode, detectCountryFromPostalCode]);

  // Handle current location
  const handleLocationFound = useCallback((location) => {
    const { coordinates, address } = location;
    
    setFormData(prev => ({
      ...prev,
      street: address.street || prev.street,
      city: address.city || prev.city,
      province: address.province || address.state || prev.province,
      postalCode: address.postalCode || prev.postalCode,
      country: address.country || prev.country,
      coordinates
    }));

    if (address.country) {
      setCountryDetection({
        detected: true,
        country: address.country,
        format: null
      });
    }

    showSuccess('Location Found', 'Your current location has been detected and filled in the form.');
  }, [showSuccess]);

  // Handle location error
  const handleLocationError = useCallback((error) => {
    showError('Location Error', error);
  }, [showError]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    const rules = addressValidationService.getValidationRules(formData.country);

    // Required field validation
    Object.keys(rules).forEach(field => {
      const rule = rules[field];
      const value = formData[field];

      if (rule.required && (!value || value.trim().length === 0)) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      } else if (value && rule.minLength && value.length < rule.minLength) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rule.minLength} characters`;
      } else if (value && rule.maxLength && value.length > rule.maxLength) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${rule.maxLength} characters`;
      } else if (value && rule.pattern && !rule.pattern.test(value)) {
        newErrors[field] = `Please enter a valid ${field}`;
      }
    });

    // Custom validation
    if (formData.street && formData.street.length < 5) {
      newErrors.street = 'Please enter a complete street address';
    }

    // Street address validation
    if (formData.street) {
      // Check for common typos and incomplete addresses
      const streetLower = formData.street.toLowerCase();
      
      // Check for missing street number
      if (!/^\d+/.test(formData.street.trim())) {
        newErrors.street = 'Please include a street number (e.g., 123 Main Street)';
      }
      
      // Check for common typos in street names
      const commonTypos = {
        'maiin': 'main',
        'mian': 'main',
        'stret': 'street',
        'streat': 'street',
        'avenu': 'avenue',
        'aveune': 'avenue'
      };
      
      for (const [typo, correct] of Object.entries(commonTypos)) {
        if (streetLower.includes(typo)) {
          newErrors.street = `Did you mean "${correct}"? Please check the spelling of your street name.`;
          break;
        }
      }
    }

    // City validation
    if (formData.city) {
      const cityLower = formData.city.toLowerCase();
      
      // Check for common city name typos
      const cityTypos = {
        'tornoto': 'Toronto',
        'toranto': 'Toronto',
        'toronot': 'Toronto',
        'vancuver': 'Vancouver',
        'vancouer': 'Vancouver',
        'montral': 'Montreal',
        'montreal': 'Montréal',
        'calgery': 'Calgary',
        'calgarry': 'Calgary'
      };
      
      for (const [typo, correct] of Object.entries(cityTypos)) {
        if (cityLower === typo) {
          newErrors.city = `Did you mean "${correct}"? Please check the spelling of your city name.`;
          break;
        }
      }
      
      // Check for minimum length
      if (formData.city.length < 2) {
        newErrors.city = 'Please enter a valid city name';
      }
    }

    if (formData.postalCode) {
      // Use detected country if available, otherwise use selected country
      const countryToValidate = countryDetection.detected ? countryDetection.country : formData.country;
      
      if (countryToValidate) {
        const isValidFormat = addressValidationService.validatePostalCodeFormat(formData.postalCode, countryToValidate);
        console.log('🔍 Postal code validation:', {
          postalCode: formData.postalCode,
          country: countryToValidate,
          isValid: isValidFormat,
          detectedCountry: countryDetection.country,
          detectedFormat: countryDetection.format
        });
        
        if (!isValidFormat) {
          const detection = addressValidationService.detectCountryClientSide(formData.postalCode);
          newErrors.postalCode = `Please enter a valid ${countryDetection.format || detection.format || 'postal code'} ${detection.example ? `(e.g., ${detection.example})` : ''}`;
        }
      } else if (formData.postalCode.trim()) {
        // If no country selected, require country selection
        newErrors.country = 'Please select a country for postal code validation';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, countryDetection.format]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);
    setValidating(true);

    try {
      console.log('🔄 Validating and geocoding address:', JSON.stringify(formData, null, 2));
      
      // Validate and geocode address
      const validation = await addressValidationService.validateAddress(formData);
      
      console.log('✅ Address validation result:', JSON.stringify(validation, null, 2));
      
      if (!validation.isValid) {
        console.log('❌ Address validation failed:', validation.errors);
        setErrors({
          general: validation.errors?.[0] || 'Address validation failed'
        });
        showError('Invalid Address', validation.errors?.[0] || 'Please check your address and try again');
        return;
      }

      // Check if geocoding was successful
      if (!validation.coordinates) {
        console.log('⚠️ Address validation succeeded but no coordinates returned');
        setErrors({
          general: 'Unable to locate this address. Please check the spelling and try again.'
        });
        showError('Address Not Found', 'We could not find this address. Please verify the spelling of the street name and city.');
        return;
      }

      // Prepare address data for saving
      const addressData = {
        ...formData,
        coordinates: validation.coordinates || formData.coordinates,
        formattedAddress: validation.formattedAddress,
        // Ensure postal code is properly formatted
        postalCode: addressValidationService.formatPostalCode(formData.postalCode, formData.country)
      };
      
      console.log('📦 Final address data to save:', JSON.stringify(addressData, null, 2));
      console.log('🔍 Coordinates check:', {
        hasCoordinates: !!addressData.coordinates,
        coordinatesValue: addressData.coordinates
      });

      const savedAddresses = await onSave(addressData);
      console.log('💾 Addresses returned after save:', JSON.stringify(savedAddresses, null, 2));
      showSuccess('Address Saved', 'Your address has been saved successfully');
      
    } catch (error) {
      console.error('Address save error:', error);
      showError('Save Failed', error.message || 'Failed to save address. Please try again.');
    } finally {
      setLoading(false);
      setValidating(false);
    }
  };

  // Don't render during SSR
  if (!isClient) {
    return (
      <div className="address-form-loading p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`address-form space-y-6 ${className}`}>
      {/* Address Type Selection */}
      {showTypeSelection && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Address Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {addressTypes.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleInputChange('type', type.value)}
                className={`
                  flex items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
                  ${formData.type === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }
                `}
              >
                <FontAwesomeIcon icon={type.icon} className="mr-2" />
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Location Button */}
      {showCurrentLocation && (
        <div className="flex justify-center">
          <CurrentLocationButton
            onLocationFound={handleLocationFound}
            onError={handleLocationError}
            size="medium"
          />
        </div>
      )}

      {/* Street Address */}
      <div>
        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
          Street Address *
        </label>
        <input
          type="text"
          id="street"
          value={formData.street}
          onChange={(e) => handleInputChange('street', e.target.value)}
          className={`
            w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
            ${errors.street ? 'border-red-300 bg-red-50' : 'border-gray-300'}
          `}
          placeholder="123 Main Street"
          disabled={loading}
        />
        {errors.street && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
            {errors.street}
          </p>
        )}
      </div>

      {/* Apartment/Suite */}
      <div>
        <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
          Apartment, Suite, etc. (Optional)
        </label>
        <input
          type="text"
          id="addressLine2"
          value={formData.addressLine2}
          onChange={(e) => handleInputChange('addressLine2', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Apt 4B, Unit 12, etc."
          disabled={loading}
        />
      </div>

      {/* City, Province, Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={`
              w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
              ${errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="Toronto"
            disabled={loading}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        <div>
          <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
            {formData.country === 'US' ? 'State' : 'Province'} *
          </label>
          <input
            type="text"
            id="province"
            value={formData.province}
            onChange={(e) => handleInputChange('province', e.target.value)}
            className={`
              w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
              ${errors.province ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder={formData.country === 'US' ? 'NY' : 'ON'}
            disabled={loading}
          />
          {errors.province && (
            <p className="mt-1 text-sm text-red-600">{errors.province}</p>
          )}
        </div>

        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
            {countryDetection.format || 'Postal Code'} *
          </label>
          <div className="relative">
            <input
              type="text"
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              className={`
                w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
                ${errors.postalCode ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
              placeholder={countryDetection.detected ? 
                (countryDetection.country === 'CA' ? 'M5V 2B4' : 
                 countryDetection.country === 'US' ? '12345' : 
                 countryDetection.country === 'IN' ? '515671' : 'Postal Code') : 
                'M5V 2B4'
              }
              disabled={loading}
            />
            {countryDetection.detected && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <FontAwesomeIcon 
                  icon={faCheck} 
                  className="h-4 w-4 text-green-500" 
                  title={`${countryDetection.country} format detected`}
                />
              </div>
            )}
          </div>
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
          )}
          {countryDetection.detected && (
            <p className="mt-1 text-sm text-green-600">
              ✓ {countryDetection.format} format detected
            </p>
          )}
        </div>
      </div>

      {/* Country */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country *
          </label>
          {countryDetection.detected && (
            <span className="text-xs text-green-600 flex items-center">
              <FontAwesomeIcon icon={faCheck} className="w-3 h-3 mr-1" />
              Auto-detected from postal code
            </span>
          )}
        </div>
        <select
          id="country"
          value={formData.country || (countryDetection.detected ? countryDetection.country : '')}
          onChange={(e) => handleInputChange('country', e.target.value)}
          className={`
            w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
            ${errors.country ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            ${countryDetection.detected ? 'bg-green-50 border-green-300' : ''}
          `}
          disabled={loading}
        >
          <option value="">Select Country</option>
          <option value="CA">Canada</option>
          <option value="US">United States</option>
          <option value="IN">India</option>
          <option value="UK">United Kingdom</option>
          <option value="AU">Australia</option>
          <option value="DE">Germany</option>
          <option value="FR">France</option>
          <option value="JP">Japan</option>
          <option value="BR">Brazil</option>
          <option value="MX">Mexico</option>
        </select>
        {errors.country && (
          <p className="mt-1 text-sm text-red-600">{errors.country}</p>
        )}
      </div>


      {/* Delivery Instructions */}
      {showInstructions && (
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Instructions (Optional)
          </label>
          <textarea
            id="instructions"
            value={formData.instructions}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Ring buzzer, leave at door, call before delivery, etc."
            maxLength={200}
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            {formData.instructions.length}/200 characters
          </p>
        </div>
      )}

      {/* Set as Default */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => handleInputChange('isDefault', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          disabled={loading}
        />
        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
          Set as default address
        </label>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 flex items-center">
            <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
            {errors.general}
          </p>
        </div>
      )}

      {/* Validation Status */}
      {validating && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600 flex items-center">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
            Validating address...
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || validating}
          className={`
            flex-1 px-6 py-3 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${loading || validating
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Saving...
            </span>
          ) : (
            'Save Address'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
