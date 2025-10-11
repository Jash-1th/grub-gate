// FILE: apps/customer-app/src/services/addressValidationService.js
/**
 * Address Validation Service
 * Handles address validation, postal code detection, and geocoding
 * Works with the backend global geocoding system
 */

import apiClient from '../api/apiClient';

class AddressValidationService {
  constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  /**
   * Validate and geocode an address
   * @param {object} address - Address object to validate
   * @returns {Promise<{isValid: boolean, address?: object, errors?: array}>}
   */
  async validateAddress(address) {
    try {
      const response = await apiClient.post('/geocoding/validate', {
        address: {
          street: address.street || address.addressLine1,
          city: address.city,
          province: address.province || address.state,
          postalCode: address.postalCode,
          country: address.country
        }
      });

      return {
        isValid: true,
        address: response.data.data.address,
        coordinates: response.data.data.coordinates,
        formattedAddress: response.data.data.formattedAddress
      };
    } catch (error) {
      console.error('Address validation failed:', error);
      
      return {
        isValid: false,
        errors: error.response?.data?.errors || [error.message || 'Address validation failed'],
        address: null
      };
    }
  }

  /**
   * Detect country from postal code
   * @param {string} postalCode - Postal code to analyze
   * @returns {Promise<{country: string, format: string}>}
   */
  async detectCountryFromPostalCode(postalCode) {
    if (!postalCode) {
      return { country: null, format: null };
    }

    try {
      const response = await apiClient.get(`/geocoding/detect-country?postalCode=${encodeURIComponent(postalCode)}`);
      
      return {
        country: response.data.data.country,
        format: response.data.data.format,
        isValid: response.data.data.isValid
      };
    } catch (error) {
      // Fallback to client-side detection
      return this.detectCountryClientSide(postalCode);
    }
  }

  /**
   * Client-side country detection fallback
   * @param {string} postalCode - Postal code to analyze
   * @returns {object} Country detection result
   */
  detectCountryClientSide(postalCode) {
    const patterns = {
      'US': { 
        regex: /^\d{5}(-\d{4})?$/, 
        format: 'ZIP Code',
        example: '12345 or 12345-6789'
      },
      'CA': { 
        regex: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i, 
        format: 'Postal Code',
        example: 'M5V 2B4'
      },
      'IN': { 
        regex: /^\d{6}$/, 
        format: 'PIN Code',
        example: '515671'
      },
      'UK': { 
        regex: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, 
        format: 'Postcode',
        example: 'SW1A 1AA'
      },
      'AU': { 
        regex: /^\d{4}$/, 
        format: 'Postcode',
        example: '2000'
      },
      'DE': { 
        regex: /^\d{5}$/, 
        format: 'Postleitzahl',
        example: '12345'
      },
      'FR': { 
        regex: /^\d{5}$/, 
        format: 'Code Postal',
        example: '75001'
      },
      'JP': { 
        regex: /^\d{3}-\d{4}$/, 
        format: 'Postal Code',
        example: '100-0001'
      },
      'BR': { 
        regex: /^\d{5}-?\d{3}$/, 
        format: 'CEP',
        example: '01310-100'
      },
      'MX': { 
        regex: /^\d{5}$/, 
        format: 'Código Postal',
        example: '01000'
      }
    };

    const cleanPostalCode = postalCode.trim().toUpperCase();

    for (const [country, pattern] of Object.entries(patterns)) {
      if (pattern.regex.test(cleanPostalCode)) {
        return {
          country,
          format: pattern.format,
          example: pattern.example,
          isValid: true
        };
      }
    }

    return {
      country: null,
      format: null,
      isValid: false
    };
  }

  /**
   * Validate postal code format for specific country
   * @param {string} postalCode - Postal code to validate
   * @param {string} country - Country code (US, CA, IN, etc.)
   * @returns {boolean} Whether postal code is valid for the country
   */
  validatePostalCodeFormat(postalCode, country) {
    if (!postalCode || !country) return false;

    const detection = this.detectCountryClientSide(postalCode);
    return detection.country === country && detection.isValid;
  }

  /**
   * Format postal code according to country standards
   * @param {string} postalCode - Postal code to format
   * @param {string} country - Country code
   * @returns {string} Formatted postal code
   */
  formatPostalCode(postalCode, country) {
    if (!postalCode) return '';

    const clean = postalCode.replace(/\s+/g, '').toUpperCase();

    switch (country) {
      case 'CA':
        // Canadian postal codes: A1A 1A1
        if (clean.length === 6) {
          return `${clean.substring(0, 3)} ${clean.substring(3)}`;
        }
        return postalCode;

      case 'UK':
        // UK postcodes: SW1A 1AA
        const ukMatch = clean.match(/^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})$/);
        if (ukMatch) {
          return `${ukMatch[1]} ${ukMatch[2]}`;
        }
        return postalCode;

      case 'JP':
        // Japanese postal codes: 100-0001
        if (clean.length === 7 && !clean.includes('-')) {
          return `${clean.substring(0, 3)}-${clean.substring(3)}`;
        }
        return postalCode;

      case 'BR':
        // Brazilian CEP: 01310-100
        if (clean.length === 8 && !clean.includes('-')) {
          return `${clean.substring(0, 5)}-${clean.substring(5)}`;
        }
        return postalCode;

      default:
        return postalCode;
    }
  }

  /**
   * Get address suggestions based on partial input
   * @param {string} query - Partial address query
   * @param {string} country - Country to search in
   * @returns {Promise<array>} Array of address suggestions
   */
  async getAddressSuggestions(query, country = null) {
    if (!query || query.length < 3) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        q: query,
        limit: 5
      });

      if (country) {
        params.append('country', country);
      }

      const response = await apiClient.get(`/geocoding/suggestions?${params}`);
      return response.data.data.suggestions || [];
    } catch (error) {
      console.warn('Address suggestions failed:', error);
      return [];
    }
  }

  /**
   * Validate if address is within delivery zone of restaurant
   * @param {object} address - Customer address
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise<{canDeliver: boolean, distance?: number, fee?: number}>}
   */
  async checkDeliveryZone(address, restaurantId) {
    console.log('🌐 === API SERVICE DELIVERY CHECK START ===');
    console.log('📍 Address to check:', JSON.stringify(address, null, 2));
    console.log('🏪 Restaurant ID:', restaurantId);
    
    try {
      const requestData = {
        address,
        restaurantId
      };
      
      console.log('📤 API Request Data:', JSON.stringify(requestData, null, 2));
      console.log('🔗 API Endpoint: POST /restaurants/check-delivery');
      
      const response = await apiClient.post('/restaurants/check-delivery', requestData);
      
      console.log('📥 Raw API Response:', JSON.stringify(response.data, null, 2));

      const result = {
        canDeliver: response.data.data.delivers, // Backend uses 'delivers', not 'canDeliver'
        distance: response.data.data.distance,
        fee: response.data.data.deliveryFee,
        estimatedTime: response.data.data.estimatedTime,
        maxDistance: response.data.data.maxDistance,
        note: response.data.data.note
      };
      
      console.log('✅ Formatted Result:', JSON.stringify(result, null, 2));
      console.log('🌐 === API SERVICE DELIVERY CHECK END ===');
      
      return result;
    } catch (error) {
      console.error('❌ Delivery zone check failed:', error);
      console.log('📥 Error Response:', error.response?.data);
      console.log('🌐 === API SERVICE DELIVERY CHECK END (ERROR) ===');
      
      return {
        canDeliver: false,
        error: error.response?.data?.message || 'Unable to check delivery availability'
      };
    }
  }

  /**
   * Get validation rules for address fields by country
   * @param {string} country - Country code
   * @returns {object} Validation rules object
   */
  getValidationRules(country) {
    const baseRules = {
      street: { required: true, minLength: 5, maxLength: 100 },
      city: { required: true, minLength: 2, maxLength: 50 },
      postalCode: { required: true }
    };

    const countrySpecific = {
      'US': {
        ...baseRules,
        state: { required: true, minLength: 2, maxLength: 2 },
        postalCode: { ...baseRules.postalCode, pattern: /^\d{5}(-\d{4})?$/ }
      },
      'CA': {
        ...baseRules,
        province: { required: true, minLength: 2, maxLength: 2 },
        postalCode: { ...baseRules.postalCode, pattern: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i }
      },
      'IN': {
        ...baseRules,
        state: { required: true, minLength: 2, maxLength: 50 },
        postalCode: { ...baseRules.postalCode, pattern: /^\d{6}$/ }
      },
      'UK': {
        ...baseRules,
        postalCode: { ...baseRules.postalCode, pattern: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i }
      }
    };

    return countrySpecific[country] || baseRules;
  }
}

// Create singleton instance
const addressValidationService = new AddressValidationService();

export default addressValidationService;
