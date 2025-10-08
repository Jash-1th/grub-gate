const mongoose = require('mongoose');

/**
 * Address Schema for User addresses
 * Supports multiple addresses with one default
 */
const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true,
    maxlength: [200, 'Street address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [100, 'State name cannot exceed 100 characters']
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
    match: [/^[A-Za-z0-9\s-]{3,10}$/, 'Please enter a valid postal code']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'Canada',
    maxlength: [100, 'Country name cannot exceed 100 characters']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  deliveryInstructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Delivery instructions cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  _id: true // Each address gets its own ID
});

// Index for faster queries
addressSchema.index({ isDefault: 1 });

// Virtual for full address
addressSchema.virtual('fullAddress').get(function() {
  const parts = [this.street, this.city];
  if (this.state) parts.push(this.state);
  parts.push(this.postalCode, this.country);
  return parts.join(', ');
});

// Ensure only one default address per user (handled at user level)
addressSchema.pre('save', function(next) {
  // Validation can be added here if needed
  next();
});

module.exports = addressSchema;
