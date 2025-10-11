// FILE: src/models/GlobalAddress.js
const mongoose = require('mongoose');

/**
 * Universal Address Schema for Global Support
 * Supports address formats from all countries
 */

const globalAddressSchema = new mongoose.Schema({
  // Core address components (required)
  country: {
    type: String,
    required: [true, 'Country is required'],
    uppercase: true,
    minlength: [2, 'Country code must be at least 2 characters'],
    maxlength: [3, 'Country code cannot exceed 3 characters']
  },
  
  // Flexible address lines (universal)
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true,
    maxlength: [200, 'Address line 1 cannot exceed 200 characters']
  },
  
  addressLine2: {
    type: String,
    trim: true,
    maxlength: [200, 'Address line 2 cannot exceed 200 characters']
  },
  
  // City/Town/Village (universal)
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  },
  
  // State/Province/Region (flexible naming)
  state: {
    type: String,
    trim: true,
    maxlength: [100, 'State/Province cannot exceed 100 characters']
  },
  
  // Postal/ZIP/PIN code (country-specific validation)
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
    uppercase: true,
    maxlength: [20, 'Postal code cannot exceed 20 characters']
  },
  
  // Coordinates (universal)
  coordinates: {
    lat: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    lng: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  
  // Additional metadata
  timezone: {
    type: String,
    trim: true
  },
  
  formattedAddress: {
    type: String,
    trim: true
  },
  
  // Geocoding metadata
  geocodingProvider: {
    type: String,
    enum: ['google', 'mapbox', 'nominatim', 'manual'],
    default: 'manual'
  },
  
  geocodingAccuracy: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes for performance
globalAddressSchema.index({ country: 1, postalCode: 1 });
globalAddressSchema.index({ coordinates: '2dsphere' });
globalAddressSchema.index({ city: 1, state: 1 });

// Virtual for full address display
globalAddressSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.addressLine1,
    this.addressLine2,
    this.city,
    this.state,
    this.postalCode,
    this.getCountryName()
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Method to get country name from code
globalAddressSchema.methods.getCountryName = function() {
  const countryNames = {
    'US': 'United States',
    'CA': 'Canada', 
    'IN': 'India',
    'UK': 'United Kingdom',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'JP': 'Japan',
    'BR': 'Brazil',
    'MX': 'Mexico'
  };
  
  return countryNames[this.country] || this.country;
};

// Method to validate postal code format by country
globalAddressSchema.methods.validatePostalCode = function() {
  const postalCodePatterns = {
    'US': /^\d{5}(-\d{4})?$/,                    // 12345 or 12345-6789
    'CA': /^[A-Z]\d[A-Z] \d[A-Z]\d$/,           // H3A 1B2
    'IN': /^\d{6}$/,                             // 515671
    'UK': /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i, // SW1A 1AA
    'AU': /^\d{4}$/,                             // 2000
    'DE': /^\d{5}$/,                             // 12345
    'FR': /^\d{5}$/,                             // 75001
    'JP': /^\d{3}-\d{4}$/,                       // 100-0001
    'BR': /^\d{5}-\d{3}$/,                       // 01310-100
    'MX': /^\d{5}$/                              // 01000
  };
  
  const pattern = postalCodePatterns[this.country];
  if (!pattern) {
    return true; // Allow if no specific pattern defined
  }
  
  return pattern.test(this.postalCode);
};

// Pre-save validation
globalAddressSchema.pre('save', function(next) {
  // Validate postal code format
  if (!this.validatePostalCode()) {
    return next(new Error(`Invalid postal code format for ${this.country}`));
  }
  
  // Auto-generate formatted address if not provided
  if (!this.formattedAddress) {
    this.formattedAddress = this.fullAddress;
  }
  
  next();
});

module.exports = mongoose.model('GlobalAddress', globalAddressSchema);
