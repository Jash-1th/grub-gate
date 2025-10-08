const mongoose = require('mongoose');

/**
 * Partner Info Schema for Partner-specific user data
 * Contains restaurant reference and partner-specific settings
 */
const partnerInfoSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required for partners'],
    index: true
  },
  notificationPreferences: {
    orderAlerts: {
      type: Boolean,
      default: true,
      description: 'Receive notifications for new orders'
    },
    systemUpdates: {
      type: Boolean,
      default: true,
      description: 'Receive system updates and announcements'
    },
    promotionalEmails: {
      type: Boolean,
      default: false,
      description: 'Receive promotional emails and marketing content'
    },
    weeklyReports: {
      type: Boolean,
      default: true,
      description: 'Receive weekly performance reports'
    }
  },
  billingInfo: {
    paymentMethod: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Payment method cannot exceed 100 characters']
    },
    taxId: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'Tax ID cannot exceed 50 characters']
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'Canada' }
    },
    bankAccount: {
      accountNumber: {
        type: String,
        trim: true,
        select: false // Sensitive data, exclude by default
      },
      routingNumber: {
        type: String,
        trim: true,
        select: false // Sensitive data, exclude by default
      },
      bankName: String
    }
  },
  partnerStatus: {
    type: String,
    enum: ['pending', 'approved', 'suspended', 'rejected'],
    default: 'pending'
  },
  approvedAt: Date,
  suspendedAt: Date,
  partnerSince: {
    type: Date,
    default: Date.now
  },
  commissionRate: {
    type: Number,
    min: [0, 'Commission rate cannot be negative'],
    max: [100, 'Commission rate cannot exceed 100%'],
    default: 15 // 15% default commission
  }
}, {
  timestamps: true,
  _id: false // This is embedded in User, no separate ID needed
});

// Index for faster partner queries
partnerInfoSchema.index({ partnerStatus: 1 });
partnerInfoSchema.index({ restaurantId: 1 });

// Virtual for partner display status
partnerInfoSchema.virtual('isActivePartner').get(function() {
  return this.partnerStatus === 'approved';
});

// Method to approve partner
partnerInfoSchema.methods.approve = function() {
  this.partnerStatus = 'approved';
  this.approvedAt = new Date();
  return this.parent().save(); // Save the parent User document
};

// Method to suspend partner
partnerInfoSchema.methods.suspend = function(reason) {
  this.partnerStatus = 'suspended';
  this.suspendedAt = new Date();
  this.suspensionReason = reason;
  return this.parent().save();
};

module.exports = partnerInfoSchema;
