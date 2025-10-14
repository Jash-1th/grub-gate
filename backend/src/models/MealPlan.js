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
        date: String, // YYYY-MM-DD format - calculated delivery date
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
        date: String, // YYYY-MM-DD format - calculated delivery date
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
         date: String, // YYYY-MM-DD format - calculated delivery date
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
      thursday: {
         date: String, // YYYY-MM-DD format - calculated delivery date
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
      friday: {
         date: String, // YYYY-MM-DD format - calculated delivery date
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
      saturday: {
         date: String, // YYYY-MM-DD format - calculated delivery date
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
      sunday: {
        date: String, // YYYY-MM-DD format - calculated delivery date
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
      }
    },
    week1: {
      monday: {
        date: String, // YYYY-MM-DD format - calculated delivery date
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
      tuesday: {
        date: String, // YYYY-MM-DD format - calculated delivery date
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
        date: String, // YYYY-MM-DD format - calculated delivery date
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
      thursday: {
         date: String, // YYYY-MM-DD format - calculated delivery date
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
      friday: {
         date: String, // YYYY-MM-DD format - calculated delivery date
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
      saturday: {
        date: String, // YYYY-MM-DD format - calculated delivery date
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
      sunday: {
         date: String, // YYYY-MM-DD format - calculated delivery date
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
      }
    }
  },
  totalItems: {
    type: Number,
    default: 0
  },
  // Restaurant selection tracking
  selectedRestaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
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
  // Date calculation tracking
  datesCalculatedAt: {
    type: Date,
    default: null
  },
  // Metadata
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
    // Create minimal empty meal plan structure (no empty days)
    mealPlan = new this({
      userId,
      weeklyPlans: {
        week0: {},
        week1: {}
      },
      totalItems: 0
    });
    
    await mealPlan.save();
  }
  
  return mealPlan;
};

module.exports = mongoose.model('MealPlan', mealPlanSchema);
