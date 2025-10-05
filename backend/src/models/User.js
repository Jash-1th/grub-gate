// FILE: src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  province: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
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
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['customer', 'partner', 'admin'],
    default: 'customer',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  addresses: [addressSchema],
  preferences: {
    dietary: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'spicy']
    }],
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      enum: ['en', 'fr'],
      default: 'en'
    }
  },
  lastLoginAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Instance method to generate email verification token
userSchema.methods.getEmailVerificationToken = function() {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  return verificationToken;
};

// Instance method to generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to passwordResetToken field
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Instance method to add address
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

// Instance method to update address
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

// Instance method to remove address
userSchema.methods.removeAddress = function(addressId) {
  this.addresses.pull(addressId);
  return this.save();
};

// Instance method to get default address
userSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};

module.exports = mongoose.model('User', userSchema);
