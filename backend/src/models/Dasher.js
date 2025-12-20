// FILE: src/models/Dasher.js
const mongoose = require('mongoose');

const dasherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Vehicle Information
  vehicle: {
    type: {
      type: String,
      enum: ['bike', 'scooter', 'car', 'motorcycle'],
      required: true
    },
    make: {
      type: String,
      trim: true
    },
    model: {
      type: String,
      trim: true
    },
    year: {
      type: Number,
      min: 1990,
      max: new Date().getFullYear() + 1
    },
    licensePlate: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    color: {
      type: String,
      trim: true
    }
  },
  
  // Driver's License
  license: {
    number: {
      type: String,
      required: true,
      trim: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    frontImageUrl: {
      type: String,
      trim: true
    },
    backImageUrl: {
      type: String,
      trim: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Insurance
  insurance: {
    provider: {
      type: String,
      trim: true
    },
    policyNumber: {
      type: String,
      trim: true
    },
    expiryDate: Date,
    documentUrl: {
      type: String,
      trim: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date
  },
  
  // Banking Information (for payments)
  banking: {
    bankName: {
      type: String,
      trim: true
    },
    accountHolderName: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
      // TODO: Should be encrypted in production
    },
    routingNumber: {
      type: String,
      trim: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date
  },
  
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    }
  },
  
  // Service Area
  serviceArea: {
    city: {
      type: String,
      required: true,
      trim: true
    },
    province: {
      type: String,
      trim: true
    },
    radius: {
      type: Number,
      default: 10,  // km
      min: 5,
      max: 50
    },
    coordinates: {
      lat: {
        type: Number,
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  
  // Availability Schedule
  availability: {
    isAvailable: {
      type: Boolean,
      default: false
    },
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true
      },
      startTime: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
      },
      endTime: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
      }
    }]
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'inactive', 'suspended', 'rejected'],
    default: 'pending',
    required: true
  },
  
  // Verification & Background Check
  backgroundCheckStatus: {
    type: String,
    enum: ['pending', 'in-progress', 'approved', 'rejected'],
    default: 'pending'
  },
  
  backgroundCheckNotes: {
    type: String,
    trim: true
  },
  
  // Statistics
  stats: {
    totalDeliveries: {
      type: Number,
      default: 0,
      min: 0
    },
    completedDeliveries: {
      type: Number,
      default: 0,
      min: 0
    },
    cancelledDeliveries: {
      type: Number,
      default: 0,
      min: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: 0
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0
    },
    currentMonthEarnings: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Current Location (for real-time tracking)
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      default: [0, 0]
    },
    lastUpdated: Date
  },
  
  // Current Delivery Status
  currentDelivery: {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    status: {
      type: String,
      enum: ['idle', 'assigned', 'heading-to-restaurant', 'at-restaurant', 'picked-up', 'heading-to-customer'],
      default: 'idle'
    },
    assignedAt: Date
  },
  
  // Documents
  documents: {
    profilePhoto: {
      type: String,
      trim: true
    },
    vehicleRegistration: {
      type: String,
      trim: true
    }
  },
  
  // Onboarding
  onboardingComplete: {
    type: Boolean,
    default: false
  },
  
  onboardingStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  
  // Approval & Activation
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  rejectedAt: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  rejectionReason: {
    type: String,
    trim: true
  },
  
  activatedAt: Date,
  lastActiveAt: Date,
  
  // Ratings & Reviews
  reviews: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
dasherSchema.index({ userId: 1 });
dasherSchema.index({ status: 1 });
dasherSchema.index({ 'serviceArea.city': 1 });
dasherSchema.index({ 'availability.isAvailable': 1 });
dasherSchema.index({ 'currentLocation.coordinates': '2dsphere' });
dasherSchema.index({ 'stats.averageRating': -1 });

// Virtual for completion rate
dasherSchema.virtual('completionRate').get(function() {
  if (this.stats.totalDeliveries === 0) return 0;
  return ((this.stats.completedDeliveries / this.stats.totalDeliveries) * 100).toFixed(2);
});

// Virtual for full name (from User)
dasherSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Instance method to update rating
dasherSchema.methods.updateRating = function(newRating) {
  const totalRatings = this.stats.totalRatings + 1;
  const currentTotal = this.stats.averageRating * this.stats.totalRatings;
  const newAverage = (currentTotal + newRating) / totalRatings;
  
  this.stats.averageRating = parseFloat(newAverage.toFixed(2));
  this.stats.totalRatings = totalRatings;
  
  return this.save();
};

// Instance method to add earnings
dasherSchema.methods.addEarnings = function(amount) {
  this.stats.totalEarnings += amount;
  this.stats.currentMonthEarnings += amount;
  return this.save();
};

// Instance method to update location
dasherSchema.methods.updateLocation = function(lat, lng) {
  this.currentLocation = {
    type: 'Point',
    coordinates: [lng, lat],  // GeoJSON format: [longitude, latitude]
    lastUpdated: new Date()
  };
  this.lastActiveAt = new Date();
  return this.save();
};

// Instance method to toggle availability
dasherSchema.methods.toggleAvailability = function() {
  this.availability.isAvailable = !this.availability.isAvailable;
  if (this.availability.isAvailable) {
    this.lastActiveAt = new Date();
  }
  return this.save();
};

// Instance method to assign delivery
dasherSchema.methods.assignDelivery = function(orderId) {
  this.currentDelivery = {
    orderId,
    status: 'assigned',
    assignedAt: new Date()
  };
  return this.save();
};

// Instance method to complete delivery
dasherSchema.methods.completeDelivery = function() {
  this.stats.totalDeliveries += 1;
  this.stats.completedDeliveries += 1;
  this.currentDelivery = {
    status: 'idle'
  };
  return this.save();
};

// Static method to find available dashers near location
dasherSchema.statics.findAvailableNearby = function(lat, lng, maxDistance = 10000) {
  return this.find({
    status: 'active',
    'availability.isAvailable': true,
    'currentDelivery.status': 'idle',
    'currentLocation.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance  // in meters
      }
    }
  }).populate('userId', 'firstName lastName phoneNumber');
};

module.exports = mongoose.model('Dasher', dasherSchema);
