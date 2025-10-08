const mongoose = require('mongoose');

// Import sub-schemas
const addressSchema = require('./schemas/addressSchema');
const partnerInfoSchema = require('./schemas/partnerInfoSchema');
const preferencesSchema = require('./schemas/preferencesSchema');

// Import authentication plugin
const authPlugin = require('./plugins/authPlugin');

/**
 * Refactored User Model
 * Clean, modular structure with sub-schemas and plugins
 */
const userSchema = new mongoose.Schema({
  // Basic user information
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow null values while maintaining uniqueness
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true, // Allow null values while maintaining uniqueness
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number in E.164 format']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allow null values while maintaining uniqueness
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot be more than 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },

  // User roles and status
  roles: {
    type: [String],
    enum: ['customer', 'partner', 'admin'],
    default: ['customer'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },

  // Sub-schemas
  addresses: [addressSchema],
  preferences: {
    type: preferencesSchema,
    default: () => ({}) // Initialize with default values
  },
  partnerInfo: {
    type: partnerInfoSchema,
    required: function() {
      return this.roles && this.roles.includes('partner');
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Apply authentication plugin
userSchema.plugin(authPlugin);

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual to check if user is a partner
userSchema.virtual('isPartner').get(function() {
  return this.roles && this.roles.includes('partner');
});

// Virtual to check if user is an admin
userSchema.virtual('isAdmin').get(function() {
  return this.roles && this.roles.includes('admin');
});

// Virtual to get primary role
userSchema.virtual('primaryRole').get(function() {
  if (this.roles && this.roles.length > 0) {
    // Priority: admin > partner > customer
    if (this.roles.includes('admin')) return 'admin';
    if (this.roles.includes('partner')) return 'partner';
    return 'customer';
  }
  return 'customer';
});

// Custom validation to ensure at least one identifier exists
userSchema.pre('validate', function(next) {
  // For customer accounts created via customer app, require both email and phone
  if (this.roles && this.roles.includes('customer') && this.isNew) {
    if (!this.email) {
      this.invalidate('email', 'Email is required for customer accounts');
    }
    if (!this.phoneNumber) {
      this.invalidate('phoneNumber', 'Phone number is required for customer accounts');
    }
  } else {
    // For other cases, require at least one identifier
    if (!this.email && !this.phoneNumber) {
      this.invalidate('email', 'Either email or phone number is required');
      this.invalidate('phoneNumber', 'Either email or phone number is required');
    }
  }
  next();
});

// Validation for partner users
userSchema.pre('validate', function(next) {
  if (this.roles && this.roles.includes('partner')) {
    if (!this.partnerInfo) {
      this.invalidate('partnerInfo', 'Partner information is required for partner accounts');
    }
  }
  next();
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ roles: 1, status: 1 });
userSchema.index({ 'partnerInfo.restaurantId': 1 });
userSchema.index({ 'partnerInfo.partnerStatus': 1 });

// Address management methods
userSchema.methods.addAddress = function(addressData) {
  // If this is set as default, unset all other defaults
  if (addressData.isDefault) {
    this.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  this.addresses.push(addressData);
  return this.save();
};

userSchema.methods.updateAddress = function(addressId, updateData) {
  const address = this.addresses.id(addressId);
  if (!address) {
    throw new Error('Address not found');
  }

  // If setting as default, unset all other defaults
  if (updateData.isDefault) {
    this.addresses.forEach(addr => {
      if (addr._id.toString() !== addressId) {
        addr.isDefault = false;
      }
    });
  }

  Object.assign(address, updateData);
  return this.save();
};

userSchema.methods.removeAddress = function(addressId) {
  this.addresses.pull(addressId);
  return this.save();
};

userSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};

// Partner-specific methods
userSchema.methods.addPartnerRole = function(partnerData) {
  if (!this.roles.includes('partner')) {
    this.roles.push('partner');
  }
  
  if (partnerData) {
    this.partnerInfo = partnerData;
  }
  
  return this.save();
};

userSchema.methods.removePartnerRole = function() {
  this.roles = this.roles.filter(role => role !== 'partner');
  this.partnerInfo = undefined;
  return this.save();
};

// Static method to find partners by restaurant
userSchema.statics.findPartnersByRestaurant = function(restaurantId) {
  return this.find({
    roles: 'partner',
    'partnerInfo.restaurantId': restaurantId,
    status: 'active'
  });
};

// Static method to find active partners
userSchema.statics.findActivePartners = function() {
  return this.find({
    roles: 'partner',
    'partnerInfo.partnerStatus': 'approved',
    status: 'active'
  });
};

module.exports = mongoose.model('User', userSchema);
