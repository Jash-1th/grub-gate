const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  weeklyPlans: {
    week0: {
      monday: {
        lunch: [{
          id: String,
          planId: String,
          name: String,
          price: Number,
          restaurantName: String,
          addedAt: Date,
          // Store full item data for offline access
          description: String,
          image: String,
          category: String,
          dietaryPreferences: [String],
          spiceLevel: Number
        }],
        dinner: [{
          id: String,
          planId: String,
          name: String,
          price: Number,
          restaurantName: String,
          addedAt: Date,
          description: String,
          image: String,
          category: String,
          dietaryPreferences: [String],
          spiceLevel: Number
        }]
      },
      tuesday: {
        lunch: [{
          id: String,
          planId: String,
          name: String,
          price: Number,
          restaurantName: String,
          addedAt: Date,
          description: String,
          image: String,
          category: String,
          dietaryPreferences: [String],
          spiceLevel: Number
        }],
        dinner: [{
          id: String,
          planId: String,
          name: String,
          price: Number,
          restaurantName: String,
          addedAt: Date,
          description: String,
          image: String,
          category: String,
          dietaryPreferences: [String],
          spiceLevel: Number
        }]
      },
      wednesday: {
        lunch: [{ type: mongoose.Schema.Types.Mixed }],
        dinner: [{ type: mongoose.Schema.Types.Mixed }]
      },
      thursday: {
        lunch: [{ type: mongoose.Schema.Types.Mixed }],
        dinner: [{ type: mongoose.Schema.Types.Mixed }]
      },
      friday: {
        lunch: [{ type: mongoose.Schema.Types.Mixed }],
        dinner: [{ type: mongoose.Schema.Types.Mixed }]
      },
      saturday: {
        lunch: [{ type: mongoose.Schema.Types.Mixed }],
        dinner: [{ type: mongoose.Schema.Types.Mixed }]
      },
      sunday: {
        lunch: [{ type: mongoose.Schema.Types.Mixed }],
        dinner: [{ type: mongoose.Schema.Types.Mixed }]
      }
    },
    week1: {
      monday: {
        lunch: [{ type: mongoose.Schema.Types.Mixed }],
        dinner: [{ type: mongoose.Schema.Types.Mixed }]
      },
      tuesday: {
        lunch: [{ type: mongoose.Schema.Types.Mixed }],
        dinner: [{ type: mongoose.Schema.Types.Mixed }]
      },
      wednesday: {
        lunch: [{ type: mongoose.Schema.Types.Mixed }],
        dinner: [{ type: mongoose.Schema.Types.Mixed }]
      },
      thursday: {
        lunch: [{ type: mongoose.Schema.Types.Mixed }],
        dinner: [{ type: mongoose.Schema.Types.Mixed }]
      },
      friday: {
        lunch: [{ type: mongoose.Schema.Types.Mixed }],
        dinner: [{ type: mongoose.Schema.Types.Mixed }]
      },
      saturday: {
        lunch: [{ type: mongoose.Schema.Types.Mixed }],
        dinner: [{ type: mongoose.Schema.Types.Mixed }]
      },
      sunday: {
        lunch: [{ type: mongoose.Schema.Types.Mixed }],
        dinner: [{ type: mongoose.Schema.Types.Mixed }]
      }
    }
  },
  totalItems: {
    type: Number,
    default: 0
  },
  // Restaurant selection tracking
  selectedRestaurantId: {
    type: String,
    default: null
  },
  selectedRestaurantName: {
    type: String,
    default: null
  },
  selectedRestaurantData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastUpdated on save
mealPlanSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to find or create meal plan for user
mealPlanSchema.statics.findOrCreateForUser = async function(userId) {
  let mealPlan = await this.findOne({ userId });
  
  if (!mealPlan) {
    // Create default empty meal plan structure
    const defaultWeekStructure = {
      monday: { lunch: [], dinner: [] },
      tuesday: { lunch: [], dinner: [] },
      wednesday: { lunch: [], dinner: [] },
      thursday: { lunch: [], dinner: [] },
      friday: { lunch: [], dinner: [] },
      saturday: { lunch: [], dinner: [] },
      sunday: { lunch: [], dinner: [] }
    };

    mealPlan = new this({
      userId,
      weeklyPlans: {
        week0: defaultWeekStructure,
        week1: defaultWeekStructure
      },
      totalItems: 0
    });
    
    await mealPlan.save();
  }
  
  return mealPlan;
};

module.exports = mongoose.model('MealPlan', mealPlanSchema);
