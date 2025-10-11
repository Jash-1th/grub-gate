// FILE: backend/src/controllers/geocoding.controller.js
const { asyncHandler } = require('../middlewares/errorHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { geocodeGlobalAddress, detectCountryFromPostalCode } = require('../services/globalGeocodingService');

/**
 * @desc    Validate and geocode an address
 * @route   POST /api/v1/geocoding/validate
 * @access  Public
 */
const validateAddress = asyncHandler(async (req, res) => {
  const { address } = req.body;

  if (!address) {
    return errorResponse(res, 'Address object is required', 400);
  }

  const { street, city, province, state, postalCode, country } = address;

  // Basic validation
  if (!street || !city || !postalCode) {
    return errorResponse(res, 'Street, city, and postal code are required', 400);
  }

  try {
    // Auto-detect country if not provided
    let finalCountry = country;
    if (!finalCountry && postalCode) {
      finalCountry = detectCountryFromPostalCode(postalCode);
      if (!finalCountry) {
        return errorResponse(res, 'Unable to determine country from postal code', 400);
      }
    }

    // Build address object for geocoding
    const addressObj = {
      country: finalCountry,
      addressLine1: street,
      city: city,
      state: province || state,
      postalCode: postalCode
    };

    // Geocode the address
    const geocodingResult = await geocodeGlobalAddress(addressObj);

    // Return validated address with coordinates
    successResponse(res, {
      address: {
        ...address,
        country: finalCountry,
        formattedAddress: geocodingResult.formattedAddress
      },
      coordinates: {
        lat: geocodingResult.lat,
        lng: geocodingResult.lng
      },
      provider: geocodingResult.provider,
      accuracy: geocodingResult.accuracy
    }, 'Address validated successfully');

  } catch (error) {
    console.error('Address validation error:', error);
    errorResponse(res, error.message || 'Address validation failed', 400);
  }
});

/**
 * @desc    Reverse geocode coordinates to address
 * @route   GET /api/v1/geocoding/reverse
 * @access  Public
 */
const reverseGeocode = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return errorResponse(res, 'Latitude and longitude are required', 400);
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return errorResponse(res, 'Invalid latitude or longitude values', 400);
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return errorResponse(res, 'Coordinates out of valid range', 400);
  }

  try {
    // Import the global geocoding service
    const { reverseGeocode } = require('../services/globalGeocodingService');
    
    // Perform actual reverse geocoding
    const geocodingResult = await reverseGeocode(latitude, longitude);
    
    if (geocodingResult && geocodingResult.address) {
      const address = {
        street: geocodingResult.address.street || geocodingResult.address.streetNumber && geocodingResult.address.streetName ? 
          `${geocodingResult.address.streetNumber} ${geocodingResult.address.streetName}` : '',
        city: geocodingResult.address.city || geocodingResult.address.locality || '',
        province: geocodingResult.address.province || geocodingResult.address.state || geocodingResult.address.region || '',
        postalCode: geocodingResult.address.postalCode || geocodingResult.address.zipCode || '',
        country: geocodingResult.address.country || '',
        formattedAddress: geocodingResult.address.formattedAddress || `${latitude}, ${longitude}`
      };

      successResponse(res, {
        address,
        coordinates: { lat: latitude, lng: longitude }
      }, 'Reverse geocoding completed');
    } else {
      // Fallback if reverse geocoding fails
      const address = {
        street: '',
        city: '',
        province: '',
        postalCode: '',
        country: '',
        formattedAddress: `Location: ${latitude}, ${longitude}`
      };

      successResponse(res, {
        address,
        coordinates: { lat: latitude, lng: longitude }
      }, 'Reverse geocoding completed with limited data');
    }

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    errorResponse(res, 'Reverse geocoding failed', 500);
  }
});

/**
 * @desc    Detect country from postal code
 * @route   GET /api/v1/geocoding/detect-country
 * @access  Public
 */
const detectCountry = asyncHandler(async (req, res) => {
  const { postalCode } = req.query;

  if (!postalCode) {
    return errorResponse(res, 'Postal code is required', 400);
  }

  try {
    const country = detectCountryFromPostalCode(postalCode.trim());
    
    if (!country) {
      return successResponse(res, {
        country: null,
        isValid: false,
        format: null
      }, 'Country could not be determined from postal code');
    }

    // Get format information
    const formats = {
      'US': { format: 'ZIP Code', example: '12345 or 12345-6789' },
      'CA': { format: 'Postal Code', example: 'M5V 2B4' },
      'IN': { format: 'PIN Code', example: '515671' },
      'UK': { format: 'Postcode', example: 'SW1A 1AA' },
      'AU': { format: 'Postcode', example: '2000' },
      'DE': { format: 'Postleitzahl', example: '12345' },
      'FR': { format: 'Code Postal', example: '75001' },
      'JP': { format: 'Postal Code', example: '100-0001' },
      'BR': { format: 'CEP', example: '01310-100' },
      'MX': { format: 'Código Postal', example: '01000' }
    };

    const formatInfo = formats[country] || { format: 'Postal Code', example: postalCode };

    successResponse(res, {
      country,
      isValid: true,
      format: formatInfo.format,
      example: formatInfo.example
    }, 'Country detected successfully');

  } catch (error) {
    console.error('Country detection error:', error);
    errorResponse(res, 'Country detection failed', 500);
  }
});

/**
 * @desc    Get address suggestions (autocomplete)
 * @route   GET /api/v1/geocoding/suggestions
 * @access  Public
 */
const getAddressSuggestions = asyncHandler(async (req, res) => {
  const { q: query, country, limit = 5 } = req.query;

  if (!query || query.length < 3) {
    return errorResponse(res, 'Query must be at least 3 characters', 400);
  }

  try {
    // This is a placeholder implementation
    // In a real scenario, you'd integrate with address suggestion APIs
    // like Google Places API, MapBox Geocoding API, etc.
    
    const suggestions = [];
    
    // For now, return empty suggestions
    // TODO: Implement proper address suggestions
    
    successResponse(res, {
      suggestions,
      query,
      country: country || null,
      limit: parseInt(limit)
    }, 'Address suggestions retrieved');

  } catch (error) {
    console.error('Address suggestions error:', error);
    errorResponse(res, 'Failed to get address suggestions', 500);
  }
});

/**
 * @desc    Check if address is within delivery zone
 * @route   POST /api/v1/geocoding/check-delivery
 * @access  Public
 */
const checkDeliveryZone = asyncHandler(async (req, res) => {
  const { address, restaurantId } = req.body;

  if (!address || !restaurantId) {
    return errorResponse(res, 'Address and restaurant ID are required', 400);
  }

  try {
    const Restaurant = require('../models/Restaurant');
    
    // Get restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    // Validate and geocode customer address
    const validation = await validateAddress({ body: { address } }, { 
      json: () => {}, 
      status: () => ({ json: () => {} }) 
    });

    if (!validation || !validation.coordinates) {
      return errorResponse(res, 'Invalid customer address', 400);
    }

    // Check if restaurant delivers to this location
    const canDeliver = restaurant.deliversTo(validation.coordinates);
    
    if (!canDeliver) {
      return successResponse(res, {
        canDeliver: false,
        reason: 'Outside delivery zone'
      }, 'Address is outside delivery zone');
    }

    // Calculate distance and delivery fee
    const distance = Restaurant.calculateDistance(
      restaurant.address.coordinates,
      validation.coordinates
    );

    const deliveryFee = restaurant.deliverySettings.fee;
    const estimatedTime = restaurant.deliverySettings.avgDeliveryTime;

    successResponse(res, {
      canDeliver: true,
      distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      deliveryFee,
      estimatedTime,
      restaurant: {
        name: restaurant.name,
        address: restaurant.fullAddress
      }
    }, 'Delivery zone check completed');

  } catch (error) {
    console.error('Delivery zone check error:', error);
    errorResponse(res, 'Delivery zone check failed', 500);
  }
});

module.exports = {
  validateAddress,
  reverseGeocode,
  detectCountry,
  getAddressSuggestions,
  checkDeliveryZone
};
