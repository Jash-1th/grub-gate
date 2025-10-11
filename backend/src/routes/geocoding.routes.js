// FILE: backend/src/routes/geocoding.routes.js
const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { validateRequest } = require('../middlewares/joiValidation');
const {
  validateAddress,
  reverseGeocode,
  detectCountry,
  getAddressSuggestions,
  checkDeliveryZone
} = require('../controllers/geocoding.controller');

// Validation schemas
const validateAddressSchema = {
  body: {
    address: {
      street: { required: true, type: 'string', min: 5, max: 100 },
      city: { required: true, type: 'string', min: 2, max: 50 },
      province: { required: false, type: 'string', max: 50 },
      state: { required: false, type: 'string', max: 50 },
      postalCode: { required: true, type: 'string', min: 3, max: 10 },
      country: { required: false, type: 'string', min: 2, max: 3 }
    }
  }
};

const reverseGeocodeSchema = {
  query: {
    lat: { required: true, type: 'number', min: -90, max: 90 },
    lng: { required: true, type: 'number', min: -180, max: 180 }
  }
};

const detectCountrySchema = {
  query: {
    postalCode: { required: true, type: 'string', min: 3, max: 10 }
  }
};

const addressSuggestionsSchema = {
  query: {
    q: { required: true, type: 'string', min: 3, max: 100 },
    country: { required: false, type: 'string', min: 2, max: 3 },
    limit: { required: false, type: 'number', min: 1, max: 10 }
  }
};

const checkDeliverySchema = {
  body: {
    address: {
      street: { required: true, type: 'string' },
      city: { required: true, type: 'string' },
      postalCode: { required: true, type: 'string' }
    },
    restaurantId: { required: true, type: 'string' }
  }
};

/**
 * @route   POST /api/v1/geocoding/validate
 * @desc    Validate and geocode an address
 * @access  Public
 */
router.post('/validate', [
  body('address').notEmpty().withMessage('Address object is required'),
  body('address.street').notEmpty().isLength({ min: 5, max: 100 }).withMessage('Street address must be 5-100 characters'),
  body('address.city').notEmpty().isLength({ min: 2, max: 50 }).withMessage('City must be 2-50 characters'),
  body('address.postalCode').notEmpty().isLength({ min: 3, max: 10 }).withMessage('Postal code must be 3-10 characters'),
  body('address.province').optional().isLength({ max: 50 }).withMessage('Province cannot exceed 50 characters'),
  body('address.state').optional().isLength({ max: 50 }).withMessage('State cannot exceed 50 characters'),
  body('address.country').optional().isLength({ min: 2, max: 3 }).withMessage('Country code must be 2-3 characters')
], validateAddress);

/**
 * @route   GET /api/v1/geocoding/reverse
 * @desc    Reverse geocode coordinates to address
 * @access  Public
 */
router.get('/reverse', [
  query('lat').notEmpty().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  query('lng').notEmpty().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180')
], reverseGeocode);

/**
 * @route   GET /api/v1/geocoding/detect-country
 * @desc    Detect country from postal code
 * @access  Public
 */
router.get('/detect-country', [
  query('postalCode').notEmpty().isLength({ min: 3, max: 10 }).withMessage('Postal code must be 3-10 characters')
], detectCountry);

/**
 * @route   GET /api/v1/geocoding/suggestions
 * @desc    Get address suggestions (autocomplete)
 * @access  Public
 */
router.get('/suggestions', [
  query('q').notEmpty().isLength({ min: 3, max: 100 }).withMessage('Query must be 3-100 characters'),
  query('country').optional().isLength({ min: 2, max: 3 }).withMessage('Country code must be 2-3 characters'),
  query('limit').optional().isInt({ min: 1, max: 10 }).withMessage('Limit must be between 1 and 10')
], getAddressSuggestions);

/**
 * @route   POST /api/v1/geocoding/check-delivery
 * @desc    Check if address is within delivery zone
 * @access  Public
 */
router.post('/check-delivery', [
  body('address').notEmpty().withMessage('Address object is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.postalCode').notEmpty().withMessage('Postal code is required'),
  body('restaurantId').notEmpty().isMongoId().withMessage('Valid restaurant ID is required')
], checkDeliveryZone);

module.exports = router;
