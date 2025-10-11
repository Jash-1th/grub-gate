// FILE: src/models/Restaurant.js
const mongoose = require('mongoose');

const operatingHoursSchema = new mongoose.Schema({
  // Traditional single period (for backward compatibility)
  open: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  close: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  closed: {
    type: Boolean,
    default: false
  },
  // Lunch and dinner periods
  lunch: {
    open: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    },
    close: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    },
    available: {
      type: Boolean,
      default: true
    }
  },
  dinner: {
    open: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    },
    close: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    },
    available: {
      type: Boolean,
      default: true
    }
  }
});

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: [100, 'Restaurant name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  cuisine: {
    type: [String],
    required: [true, 'Cuisine type is required'],
    validate: {
      validator: function(cuisines) {
        return cuisines && cuisines.length > 0;
      },
      message: 'At least one cuisine type is required'
    }
  },
  businessType: {
    type: String,
    enum: ['restaurant', 'cafe', 'bakery', 'food_truck', 'catering', 'other'],
    required: [true, 'Business type is required']
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  address: {
    // Flexible address support - accepts both formats
    country: {
      type: String,
      required: false, // Made optional with default
      default: 'IN',
      uppercase: true,
      minlength: [2, 'Country code must be at least 2 characters'],
      maxlength: [3, 'Country code cannot exceed 3 characters']
    },
    // Accept both street and addressLine1
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    addressLine1: {
      type: String,
      trim: true,
      maxlength: [200, 'Address line 1 cannot exceed 200 characters']
    },
    addressLine2: {
      type: String,
      trim: true,
      maxlength: [200, 'Address line 2 cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City name cannot exceed 100 characters']
    },
    // Accept both state and province
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State/Province cannot exceed 100 characters']
    },
    province: {
      type: String,
      trim: true,
      maxlength: [100, 'State/Province cannot exceed 100 characters']
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
      uppercase: true,
      maxlength: [20, 'Postal code cannot exceed 20 characters']
    },
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
    timezone: {
      type: String,
      trim: true
    },
    formattedAddress: {
      type: String,
      trim: true
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  logo: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  operatingHours: {
    monday: operatingHoursSchema,
    tuesday: operatingHoursSchema,
    wednesday: operatingHoursSchema,
    thursday: operatingHoursSchema,
    friday: operatingHoursSchema,
    saturday: operatingHoursSchema,
    sunday: operatingHoursSchema
  },
  deliverySettings: {
    radius: {
      type: Number,
      required: [true, 'Delivery radius is required'],
      min: [1, 'Delivery radius must be at least 1 km'],
      max: [50, 'Delivery radius cannot exceed 50 km']
    },
    fee: {
      type: Number,
      required: [true, 'Delivery fee is required'],
      min: [0, 'Delivery fee cannot be negative']
    },
    minOrderAmount: {
      type: Number,
      required: [true, 'Minimum order amount is required'],
      min: [0, 'Minimum order amount cannot be negative']
    },
    avgDeliveryTime: {
      type: Number,
      required: [true, 'Average delivery time is required'],
      min: [10, 'Average delivery time must be at least 10 minutes'],
      max: [120, 'Average delivery time cannot exceed 120 minutes']
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: [0, 'Review count cannot be negative']
  },
  totalOrders: {
    type: Number,
    default: 0,
    min: [0, 'Total orders cannot be negative']
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  commissionRate: {
    type: Number,
    default: 15,
    min: [0, 'Commission rate cannot be negative'],
    max: [50, 'Commission rate cannot exceed 50%']
  },
  businessLicense: {
    type: String,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  billingInfo: {
    businessName: {
      type: String,
      trim: true,
      maxlength: [100, 'Business name cannot be more than 100 characters']
    },
    billingAddress: {
      street: {
        type: String,
        trim: true,
        maxlength: [100, 'Street address cannot be more than 100 characters']
      },
      city: {
        type: String,
        trim: true,
        maxlength: [50, 'City name cannot be more than 50 characters']
      },
      province: {
        type: String,
        trim: true,
        maxlength: [50, 'Province name cannot be more than 50 characters']
      },
      postalCode: {
        type: String,
        trim: true,
        uppercase: true,
        validate: {
          validator: function(value) {
            // Allow null/undefined/empty values (for incomplete registrations)
            if (value === null || value === undefined || value === '') {
              return true;
            }
            // Otherwise, validate Canadian postal code format
            return /^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(value);
          },
          message: 'Please enter a valid Canadian postal code (e.g., H3A 1B2)'
        }
      },
      country: {
        type: String,
        trim: true,
        default: 'Canada',
        maxlength: [50, 'Country name cannot be more than 50 characters']
      }
    },
    paymentMethod: {
      type: String,
      trim: true,
      maxlength: [100, 'Payment method cannot be more than 100 characters']
    },
    bankAccountInfo: {
      bankName: {
        type: String,
        trim: true,
        maxlength: [100, 'Bank name cannot be more than 100 characters']
      },
      accountType: {
        type: String,
        trim: true,
        default: null,
        validate: {
          validator: function(value) {
            // Allow null/undefined/empty values (for incomplete registrations)
            if (value === null || value === undefined || value === '') {
              return true;
            }
            // Otherwise, validate against allowed values
            return ['checking', 'savings', 'business'].includes(value);
          },
          message: 'Account type must be checking, savings, or business'
        }
      },
      routingNumber: {
        type: String,
        trim: true,
        validate: {
          validator: function(value) {
            // Allow null/undefined/empty values (for incomplete registrations)
            if (value === null || value === undefined || value === '') {
              return true;
            }
            // Otherwise, validate format
            return /^\d{9}$/.test(value);
          },
          message: 'Routing number must be 9 digits'
        }
      },
      accountNumber: {
        type: String,
        trim: true,
        validate: {
          validator: function(value) {
            // Allow null/undefined/empty values (for incomplete registrations)
            if (value === null || value === undefined || value === '') {
              return true;
            }
            // Otherwise, validate format
            return /^\d{8,17}$/.test(value);
          },
          message: 'Account number must be 8-17 digits'
        }
      }
    },
    taxInfo: {
      businessNumber: {
        type: String,
        trim: true,
        validate: {
          validator: function(value) {
            // Allow null/undefined/empty values (for incomplete registrations)
            if (value === null || value === undefined || value === '') {
              return true;
            }
            // Otherwise, validate format
            return /^\d{9}RP\d{4}$/.test(value);
          },
          message: 'Please enter a valid Canadian business number (e.g., 123456789RP0001)'
        }
      },
      gstHstNumber: {
        type: String,
        trim: true,
        validate: {
          validator: function(value) {
            // Allow null/undefined/empty values (for incomplete registrations)
            if (value === null || value === undefined || value === '') {
              return true;
            }
            // Otherwise, validate format
            return /^\d{9}RT\d{4}$/.test(value);
          },
          message: 'Please enter a valid GST/HST number (e.g., 123456789RT0001)'
        }
      },
      qstNumber: {
        type: String,
        trim: true,
        validate: {
          validator: function(value) {
            // Allow null/undefined/empty values (for incomplete registrations)
            if (value === null || value === undefined || value === '') {
              return true;
            }
            // Otherwise, validate format
            return /^\d{10}TQ\d{4}$/.test(value);
          },
          message: 'Please enter a valid QST number (e.g., 1234567890TQ0001)'
        }
      }
    },
    contactInfo: {
      billingEmail: {
        type: String,
        lowercase: true,
        trim: true,
        validate: {
          validator: function(value) {
            // Allow null/undefined/empty values (for incomplete registrations)
            if (value === null || value === undefined || value === '') {
              return true;
            }
            // Otherwise, validate email format
            return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
          },
          message: 'Please enter a valid billing email'
        }
      },
      billingPhone: {
        type: String,
        trim: true,
        validate: {
          validator: function(value) {
            // Allow null/undefined/empty values (for incomplete registrations)
            if (value === null || value === undefined || value === '') {
              return true;
            }
            // Otherwise, validate phone format
            return /^\+?[\d\s\-\(\)]+$/.test(value);
          },
          message: 'Please enter a valid billing phone number'
        }
      },
      contactPerson: {
        type: String,
        trim: true,
        maxlength: [100, 'Contact person name cannot be more than 100 characters']
      }
    }
  },
  registrationComplete: {
    type: Boolean,
    default: false
  },
  registrationStage: {
    type: Number,
    default: 2, // Stage 2 completed (basic info), Stage 3 pending (billing info)
    min: 1,
    max: 3
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address (global support)
restaurantSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.address.addressLine1,
    this.address.addressLine2,
    this.address.city,
    this.address.state,
    this.address.postalCode,
    this.getCountryName()
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Method to get country name from code
restaurantSchema.methods.getCountryName = function() {
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
  
  return countryNames[this.address.country] || this.address.country;
};

// Virtual for isOpen status
restaurantSchema.virtual('isOpen').get(function() {
  if (this.status !== 'active') return false;
  
  const now = new Date();
  const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = this.operatingHours[currentDay];
  if (!todayHours || todayHours.closed) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
});

// Virtual for isTopRated
restaurantSchema.virtual('isTopRated').get(function() {
  return this.rating >= 4.5 && this.reviewCount >= 50;
});

// Indexes for performance
restaurantSchema.index({ ownerId: 1 });
restaurantSchema.index({ status: 1 });
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ 'address.postalCode': 1 });
restaurantSchema.index({ 'address.coordinates': '2dsphere' });
restaurantSchema.index({ rating: -1, reviewCount: -1 });
restaurantSchema.index({ totalOrders: -1 });

// Pre-save middleware to set default operating hours
restaurantSchema.pre('save', function(next) {
  if (this.isNew && !this.operatingHours.monday) {
    const defaultHours = {
      open: '09:00',
      close: '22:00',
      closed: false
    };
    
    this.operatingHours = {
      monday: defaultHours,
      tuesday: defaultHours,
      wednesday: defaultHours,
      thursday: defaultHours,
      friday: defaultHours,
      saturday: defaultHours,
      sunday: defaultHours
    };
  }
  next();
});

// Instance method to check if restaurant delivers to a location
restaurantSchema.methods.deliversTo = function(coordinates) {
  if (!this.address.coordinates || !coordinates) return false;
  
  // Simple distance calculation (Haversine formula would be more accurate)
  const earthRadius = 6371; // km
  const dLat = (coordinates.lat - this.address.coordinates.lat) * Math.PI / 180;
  const dLng = (coordinates.lng - this.address.coordinates.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.address.coordinates.lat * Math.PI / 180) *
    Math.cos(coordinates.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;
  
  return distance <= this.deliverySettings.radius;
};

// Instance method to update rating
restaurantSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { restaurantId: this._id, status: 'approved' } },
    {
      $group: {
        _id: '$restaurantId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.rating = Math.round(stats[0].averageRating * 10) / 10;
    this.reviewCount = stats[0].totalReviews;
  } else {
    this.rating = 0;
    this.reviewCount = 0;
  }
  
  return this.save();
};

// Static method to find restaurants by location
restaurantSchema.statics.findByLocation = function(coordinates, radius = 10) {
  return this.find({
    status: 'active',
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [coordinates.lng, coordinates.lat]
        },
        $maxDistance: radius * 1000 // Convert km to meters
      }
    }
  });
};

// Static method to calculate distance between two coordinates (Haversine formula)
restaurantSchema.statics.calculateDistance = function(coord1, coord2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

// Static method to find restaurants by postal code with global support
restaurantSchema.statics.findNearbyByPostalCode = async function(postalCode, radius = 10, country = null) {
  try {
    // First try to find restaurants with the exact postal code
    const query = {
      status: 'active',
      'address.postalCode': postalCode.toUpperCase()
    };
    
    // Add country filter if provided
    if (country) {
      query['address.country'] = country.toUpperCase();
    }
    
    const exactMatches = await this.find(query).sort({ rating: -1, reviewCount: -1 });
    
    if (exactMatches.length > 0) {
      console.log(`✅ Found ${exactMatches.length} exact matches for ${postalCode}`);
      return exactMatches;
    }
    
    // Step 2: Detect country from postal code if not provided
    if (!country) {
      const { detectCountryFromPostalCode } = require('../services/globalGeocodingService');
      country = detectCountryFromPostalCode(postalCode);
      console.log(`🌍 Detected country from postal code: ${country}`);
    }
    
    // Step 3: Try postal code range matching (for numeric postal codes like India)
    if (postalCode.length === 6 && /^\d{6}$/.test(postalCode) && country === 'IN') {
      const baseCode = parseInt(postalCode);
      const rangeMatches = [];
      
      // Search within ±10 range for Indian postal codes
      for (let i = -10; i <= 10; i++) {
        const testCode = (baseCode + i).toString();
        if (testCode.length === 6) {
          const matches = await this.find({
            status: 'active',
            'address.postalCode': testCode,
            'address.country': 'IN'
          });
          rangeMatches.push(...matches);
        }
      }
      
      if (rangeMatches.length > 0) {
        console.log(`✅ Found ${rangeMatches.length} postal code range matches`);
        return rangeMatches.sort((a, b) => b.rating - a.rating);
      }
    }
    
    // Step 4: Try coordinate-based search using global geocoding
    const { geocodeGlobalAddress } = require('../services/globalGeocodingService');
    
    try {
      // Build address object for geocoding
      const addressObj = {
        country: country || 'US', // Default to US if no country detected
        postalCode: postalCode,
        city: '', // Will be filled by geocoding service
        state: '',
        addressLine1: ''
      };
      
      console.log('🌍 Using global coordinate-based search');
      const coordinates = await geocodeGlobalAddress(addressObj);
      
      // Enhanced proximity search with multiple methods
      let nearbyRestaurants = [];
      
      console.log(`🎯 Searching for restaurants near: ${coordinates.lat}, ${coordinates.lng} (${radius}km radius)`);
      
      // Method 1: Try $geoWithin first (more reliable than $near)
      try {
        console.log('🔍 Method 1: Using $geoWithin circular search');
        
        const geoWithinQuery = {
          status: 'active',
          'address.coordinates.lat': { $exists: true, $ne: null },
          'address.coordinates.lng': { $exists: true, $ne: null },
          'address.coordinates': {
            $geoWithin: {
              $centerSphere: [
                [coordinates.lng, coordinates.lat],
                radius / 6371 // Convert km to radians (Earth radius = 6371km)
              ]
            }
          }
        };
        
        // Add country filter
        if (country) {
          geoWithinQuery['address.country'] = country.toUpperCase();
        }
        
        nearbyRestaurants = await this.find(geoWithinQuery).limit(50);
        console.log(`✅ $geoWithin found ${nearbyRestaurants.length} restaurants`);
        
      } catch (geoWithinError) {
        console.warn('$geoWithin failed:', geoWithinError.message);
        
        // Method 2: Fallback to manual distance calculation
        try {
          console.log('🔍 Method 2: Using manual distance calculation');
          
          const allRestaurants = await this.find({
            status: 'active',
            'address.coordinates.lat': { $exists: true, $ne: null },
            'address.coordinates.lng': { $exists: true, $ne: null },
            ...(country && { 'address.country': country.toUpperCase() })
          });
          
          // Calculate distances manually using Haversine formula
          nearbyRestaurants = allRestaurants.filter(restaurant => {
            const rCoords = restaurant.address.coordinates;
            if (!rCoords || !rCoords.lat || !rCoords.lng) return false;
            
            const distance = this.calculateDistance(
              { lat: coordinates.lat, lng: coordinates.lng },
              { lat: rCoords.lat, lng: rCoords.lng }
            );
            
            return distance <= radius;
          });
          
          // Sort by distance
          nearbyRestaurants.sort((a, b) => {
            const distA = this.calculateDistance(
              { lat: coordinates.lat, lng: coordinates.lng },
              { lat: a.address.coordinates.lat, lng: a.address.coordinates.lng }
            );
            const distB = this.calculateDistance(
              { lat: coordinates.lat, lng: coordinates.lng },
              { lat: b.address.coordinates.lat, lng: b.address.coordinates.lng }
            );
            return distA - distB;
          });
          
          console.log(`✅ Manual calculation found ${nearbyRestaurants.length} restaurants`);
          
        } catch (manualError) {
          console.warn('Manual distance calculation failed:', manualError.message);
          nearbyRestaurants = [];
        }
      }
      
      console.log(`✅ Found ${nearbyRestaurants.length} restaurants within ${radius}km`);
      return nearbyRestaurants;
      
    } catch (geocodingError) {
      console.warn('Global geocoding failed:', geocodingError.message);
      
      // Step 5: Fallback to partial postal code matching within country
      const partialPostal = postalCode.toUpperCase().substring(0, Math.min(4, postalCode.length));
      const fallbackQuery = {
        status: 'active',
        'address.postalCode': { $regex: `^${partialPostal}`, $options: 'i' }
      };
      
      if (country) {
        fallbackQuery['address.country'] = country.toUpperCase();
      }
      
      const fallbackResults = await this.find(fallbackQuery).sort({ rating: -1, reviewCount: -1 });
      console.log(`✅ Fallback: Found ${fallbackResults.length} partial matches`);
      return fallbackResults;
    }
    
  } catch (error) {
    console.error('Error in global findNearbyByPostalCode:', error);
    return [];
  }
};

// Static method to get popular restaurants
restaurantSchema.statics.getPopular = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ totalOrders: -1, rating: -1 })
    .limit(limit);
};

// Static method to get top-rated restaurants
restaurantSchema.statics.getTopRated = function(limit = 10) {
  return this.find({ 
    status: 'active',
    rating: { $gte: 4.5 },
    reviewCount: { $gte: 10 }
  })
    .sort({ rating: -1, reviewCount: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Restaurant', restaurantSchema);
