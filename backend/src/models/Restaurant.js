// FILE: src/models/Restaurant.js
const mongoose = require('mongoose');

const operatingHoursSchema = new mongoose.Schema({
  open: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  close: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  closed: {
    type: Boolean,
    default: false
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
    type: String,
    required: [true, 'Cuisine type is required'],
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
      uppercase: true
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

// Virtual for full address
restaurantSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.province} ${this.address.postalCode}`;
});

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
