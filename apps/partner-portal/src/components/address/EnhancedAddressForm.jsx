// FILE: apps/partner-portal/src/components/address/EnhancedAddressForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faExclamationCircle, 
  faSpinner,
  faMapMarkerAlt,
  faGlobe
} from '@fortawesome/free-solid-svg-icons';

/**
 * Enhanced Address Form for Partner Portal
 * Supports global addresses with country detection and validation
 * Integrated with existing Partner Portal validation system
 */
const EnhancedAddressForm = ({ 
  formData, 
  handleInputChange, 
  errors = {},
  loading = false,
  showCountrySelection = true,
  showCoordinateCapture = true
}) => {
  const [isClient, setIsClient] = useState(false);
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [countryDetection, setCountryDetection] = useState({
    detected: false,
    country: null,
    format: null
  });

  // SSR safety
  useEffect(() => {
    setIsClient(true);
    
    // Auto-detect country from existing postal code
    if (formData.postalCode && formData.postalCode.length >= 3) {
      detectCountryFromPostalCode(formData.postalCode);
    }
  }, [formData.postalCode]);

  // Client-side postal code patterns for instant detection
  const detectCountryClientSide = (postalCode) => {
    const patterns = {
      'CA': /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,  // M5V 2B4
      'US': /^\d{5}(-\d{4})?$/,                        // 12345 or 12345-6789
      'IN': /^\d{6}$/,                                 // 515671
      'UK': /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,  // SW1A 1AA
      'AU': /^\d{4}$/,                                 // 2000
      'DE': /^\d{5}$/,                                 // 12345
      'FR': /^\d{5}$/,                                 // 75001
      'JP': /^\d{3}-\d{4}$/,                          // 100-0001
      'BR': /^\d{5}-?\d{3}$/,                         // 01310-100
      'MX': /^\d{5}$/                                  // 01000
    };

    for (const [country, pattern] of Object.entries(patterns)) {
      if (pattern.test(postalCode.trim())) {
        return {
          country,
          format: {
            'CA': 'Postal Code',
            'US': 'ZIP Code', 
            'IN': 'PIN Code',
            'UK': 'Postcode',
            'AU': 'Postcode',
            'DE': 'Postleitzahl',
            'FR': 'Code Postal',
            'JP': 'Postal Code',
            'BR': 'CEP',
            'MX': 'Código Postal'
          }[country]
        };
      }
    }
    return null;
  };

  // Country detection from postal code (with client-side fallback)
  const detectCountryFromPostalCode = useCallback(async (postalCode) => {
    // First try client-side detection for instant feedback
    const clientDetection = detectCountryClientSide(postalCode);
    if (clientDetection) {
      setCountryDetection({
        detected: true,
        country: clientDetection.country,
        format: clientDetection.format
      });

      // Auto-fill country if not already set
      if (!formData.country) {
        handleInputChange('country', clientDetection.country);
      }
    }

    // Then try server-side detection for validation
    try {
      const response = await fetch(`/api/v1/geocoding/detect-country?postalCode=${encodeURIComponent(postalCode)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.data && data.data.country) {
          setCountryDetection({
            detected: true,
            country: data.data.country,
            format: data.data.format
          });

          // Update country if server detection differs from client
          if (data.data.country !== clientDetection?.country) {
            handleInputChange('country', data.data.country);
          }
        }
      }
    } catch (error) {
      console.warn('Server country detection failed, using client-side detection:', error);
      // Client-side detection already applied above
    }
  }, [formData.country, handleInputChange]);

  // Validate and geocode address
  const validateAddress = useCallback(async () => {
    if (!formData.street || !formData.city || !formData.postalCode) {
      return;
    }

    console.log('🌍 Starting geocoding validation...');
    setValidatingAddress(true);

    try {
      const addressData = {
        street: formData.street,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        country: formData.country || countryDetection.country
      };

      const response = await fetch('/api/v1/geocoding/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address: addressData })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.data && data.data.coordinates && showCoordinateCapture) {
          // Update coordinates in form data
          handleInputChange('coordinates', data.data.coordinates);
          handleInputChange('formattedAddress', data.data.address.formattedAddress);
        }
      }
    } catch (error) {
    } finally {
      setValidatingAddress(false);
    }
  }, [formData.street, formData.city, formData.province, formData.postalCode, formData.country, countryDetection.country, handleInputChange, showCoordinateCapture]);

  // Debounced validation to prevent repeated API calls
  useEffect(() => {
    if (showCoordinateCapture && formData.street && formData.city && formData.postalCode) {
      console.log('⏱️ Setting up geocoding timer (1 second delay)...');
      const debounceTimer = setTimeout(() => {
        console.log('⏰ Timer expired, calling validateAddress...');
        validateAddress();
      }, 1000); // Wait 1 second after user stops typing
      
      return () => clearTimeout(debounceTimer);
    }
  }, [formData.street, formData.city, formData.postalCode, formData.country, showCoordinateCapture]);

  // Country options
  const countries = [
    { code: 'CA', name: 'Canada', format: 'Postal Code' },
    { code: 'US', name: 'United States', format: 'ZIP Code' },
    { code: 'IN', name: 'India', format: 'PIN Code' },
    { code: 'UK', name: 'United Kingdom', format: 'Postcode' },
    { code: 'AU', name: 'Australia', format: 'Postcode' },
    { code: 'DE', name: 'Germany', format: 'Postleitzahl' },
    { code: 'FR', name: 'France', format: 'Code Postal' },
    { code: 'JP', name: 'Japan', format: 'Postal Code' },
    { code: 'BR', name: 'Brazil', format: 'CEP' },
    { code: 'MX', name: 'Mexico', format: 'Código Postal' }
  ];

  // Get postal code placeholder based on country
  const getPostalCodePlaceholder = () => {
    if (countryDetection.detected) {
      switch (countryDetection.country) {
        case 'CA': return 'M5V 2B4';
        case 'US': return '12345';
        case 'IN': return '515671';
        case 'UK': return 'SW1A 1AA';
        case 'AU': return '2000';
        case 'DE': return '12345';
        case 'FR': return '75001';
        case 'JP': return '100-0001';
        case 'BR': return '01310-100';
        case 'MX': return '01000';
        default: return 'Postal Code';
      }
    }
    return 'M5V 2B4';
  };

  if (!isClient) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Country Selection - Always show when enabled */}
      {showCountrySelection && (
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            <FontAwesomeIcon icon={faGlobe} className="mr-2 text-blue-600" />
            Country *
            {countryDetection.detected && (
              <span className="ml-2 text-xs text-green-600 font-medium">
                ✓ Auto-detected from postal code
              </span>
            )}
          </label>
          <select
            id="country"
            name="country"
            value={formData.country || ''}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
              errors.country ? 'border-red-300 bg-red-50' : 'border-gray-300'
            } ${countryDetection.detected ? 'bg-green-50 border-green-300' : ''}`}
            disabled={loading}
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {countryDetection.detected && (
            <p className="mt-1 text-xs text-green-600">
              Country auto-detected from postal code. You can change it if needed.
            </p>
          )}
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
          )}
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
          name="street"
          value={formData.street || ''}
          onChange={(e) => handleInputChange('street', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
            errors.street ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="456 College Street"
          disabled={loading}
        />
        {errors.street && (
          <p className="mt-1 text-sm text-red-600">{errors.street}</p>
        )}
      </div>

      {/* City, Province, Postal Code */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city || ''}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
              errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
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
            name="province"
            value={formData.province || ''}
            onChange={(e) => handleInputChange('province', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
              errors.province ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
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
              name="postalCode"
              value={formData.postalCode || ''}
              onChange={(e) => {
                handleInputChange('postalCode', e.target.value);
                // Trigger country detection for new postal codes
                if (e.target.value.length >= 3) {
                  detectCountryFromPostalCode(e.target.value);
                }
              }}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors ${
                errors.postalCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder={getPostalCodePlaceholder()}
              disabled={loading}
            />
            
            {/* Country Detection Indicator */}
            {countryDetection.detected && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <FontAwesomeIcon 
                  icon={faCheck} 
                  className="h-4 w-4 text-green-500" 
                  title={`${countryDetection.country} format detected`}
                />
              </div>
            )}
            
            {/* Address Validation Indicator */}
            {validatingAddress && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <FontAwesomeIcon 
                  icon={faSpinner} 
                  className="h-4 w-4 text-blue-500 animate-spin" 
                  title="Validating address..."
                />
              </div>
            )}
          </div>
          
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
          )}
          
          {/* Country Detection Success Message */}
          {countryDetection.detected && (
            <p className="mt-1 text-sm text-green-600 flex items-center">
              <FontAwesomeIcon icon={faCheck} className="mr-1" />
              {countryDetection.format} format detected - Country set to {countryDetection.country}
            </p>
          )}
        </div>
      </div>

      {/* Address Validation Status */}
      {formData.coordinates && showCoordinateCapture && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800 flex items-center">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
            Address validated and coordinates captured
          </p>
          {formData.formattedAddress && (
            <p className="text-xs text-green-700 mt-1">
              📍 {formData.formattedAddress}
            </p>
          )}
        </div>
      )}

      {/* Address Validation Error */}
      {errors.address && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800 flex items-center">
            <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
            {errors.address}
          </p>
        </div>
      )}

      {/* Development Info */}
      {process.env.NODE_ENV === 'development' && formData.coordinates && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600">
            <strong>Debug Info:</strong><br/>
            Coordinates: {formData.coordinates.lat?.toFixed(6)}, {formData.coordinates.lng?.toFixed(6)}<br/>
            Country: {formData.country || countryDetection.country || 'Not detected'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedAddressForm;
