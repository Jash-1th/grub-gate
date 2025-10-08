const mongoose = require('mongoose');

/**
 * User Preferences Schema
 * Contains dietary preferences, notification settings, and user preferences
 */
const preferencesSchema = new mongoose.Schema({
  dietary: [{
    type: String,
    enum: [
      'vegetarian',
      'vegan', 
      'gluten-free',
      'dairy-free',
      'keto',
      'halal',
      'kosher',
      'nut-free',
      'low-sodium',
      'organic'
    ],
    lowercase: true
  }],
  notifications: {
    email: {
      type: Boolean,
      default: true,
      description: 'Receive email notifications'
    },
    sms: {
      type: Boolean,
      default: false,
      description: 'Receive SMS notifications'
    },
    push: {
      type: Boolean,
      default: true,
      description: 'Receive push notifications'
    },
    orderUpdates: {
      type: Boolean,
      default: true,
      description: 'Receive order status updates'
    },
    promotions: {
      type: Boolean,
      default: false,
      description: 'Receive promotional offers'
    },
    newsletter: {
      type: Boolean,
      default: false,
      description: 'Subscribe to newsletter'
    }
  },
  language: {
    type: String,
    enum: ['en', 'fr', 'es'],
    default: 'en',
    lowercase: true
  },
  currency: {
    type: String,
    enum: ['CAD', 'USD', 'EUR'],
    default: 'CAD',
    uppercase: true
  },
  timezone: {
    type: String,
    default: 'America/Toronto',
    validate: {
      validator: function(v) {
        // Basic timezone validation
        return /^[A-Za-z_]+\/[A-Za-z_]+$/.test(v);
      },
      message: 'Invalid timezone format'
    }
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'auto'
  },
  deliveryPreferences: {
    defaultTip: {
      type: Number,
      min: [0, 'Tip percentage cannot be negative'],
      max: [50, 'Tip percentage cannot exceed 50%'],
      default: 15
    },
    preferredDeliveryTime: {
      type: String,
      enum: ['asap', 'scheduled'],
      default: 'asap'
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [500, 'Special instructions cannot exceed 500 characters']
    }
  }
}, {
  timestamps: true,
  _id: false // This is embedded in User, no separate ID needed
});

// Method to add dietary preference
preferencesSchema.methods.addDietaryPreference = function(preference) {
  if (!this.dietary.includes(preference)) {
    this.dietary.push(preference);
  }
  return this.parent().save();
};

// Method to remove dietary preference
preferencesSchema.methods.removeDietaryPreference = function(preference) {
  this.dietary = this.dietary.filter(pref => pref !== preference);
  return this.parent().save();
};

// Method to update notification preferences
preferencesSchema.methods.updateNotifications = function(updates) {
  Object.keys(updates).forEach(key => {
    if (this.notifications.hasOwnProperty(key)) {
      this.notifications[key] = updates[key];
    }
  });
  return this.parent().save();
};

// Virtual to check if user has dietary restrictions
preferencesSchema.virtual('hasDietaryRestrictions').get(function() {
  return this.dietary && this.dietary.length > 0;
});

// Virtual to get notification summary
preferencesSchema.virtual('notificationSummary').get(function() {
  const enabled = Object.keys(this.notifications).filter(
    key => this.notifications[key] === true
  );
  return {
    enabled: enabled.length,
    total: Object.keys(this.notifications).length,
    types: enabled
  };
});

module.exports = preferencesSchema;
