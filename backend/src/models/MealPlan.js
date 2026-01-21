const mongoose = require('mongoose');

// Common meal item schema with restaurant support
const mealItemSchema = new mongoose.Schema({
  id: String,
  planId: String,
  name: String,
  price: Number,
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: false // Made optional to handle legacy data and partial saves
  },
  restaurantName: String,
  addedAt: Date,
  // Store full item data for offline access
  description: String,
  image: String,
  category: String,
  dietaryPreferences: [String],
  spiceLevel: Number
}, { _id: false });

// Day meals schema
const dayMealsSchema = new mongoose.Schema({
  date: String, // YYYY-MM-DD format - calculated delivery date
  lunch: [mealItemSchema],
  dinner: [mealItemSchema]
}, { _id: false });

const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  weeklyPlans: {
    week0: {
      monday: dayMealsSchema,
      tuesday: dayMealsSchema,
      wednesday: dayMealsSchema,
      thursday: dayMealsSchema,
      friday: dayMealsSchema,
      saturday: dayMealsSchema,
      sunday: dayMealsSchema
    },
    week1: {
      monday: dayMealsSchema,
      tuesday: dayMealsSchema,
      wednesday: dayMealsSchema,
      thursday: dayMealsSchema,
      friday: dayMealsSchema,
      saturday: dayMealsSchema,
      sunday: dayMealsSchema
    }
  },
  totalItems: {
    type: Number,
    default: 0
  },
  // Multi-restaurant selection tracking - maximum 2 restaurants
  selectedRestaurants: [{
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    restaurantName: {
      type: String,
      required: true,
      trim: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxRestaurants: {
    type: Number,
    default: 2,
    min: [0, 'Cannot have negative restaurants']
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

// Pre-save validation for restaurant limit
mealPlanSchema.pre('save', function(next) {
  if (this.maxRestaurants !== null && this.maxRestaurants !== undefined && this.selectedRestaurants.length > this.maxRestaurants) {
    return next(new Error(`Maximum ${this.maxRestaurants} restaurants allowed`));
  }
  next();
});

// Update lastUpdated on save
mealPlanSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Instance method to add restaurant
mealPlanSchema.methods.addRestaurant = function(restaurantId, restaurantName) {
  // Check if restaurant already exists
  const exists = this.selectedRestaurants.some(r => 
    r.restaurantId.toString() === restaurantId.toString()
  );
  
  if (exists) {
    throw new Error('Restaurant already selected');
  }
  
  if (this.maxRestaurants !== null && this.maxRestaurants !== undefined && this.selectedRestaurants.length >= this.maxRestaurants) {
    throw new Error(`Maximum ${this.maxRestaurants} restaurants allowed`);
  }
  
  this.selectedRestaurants.push({
    restaurantId,
    restaurantName,
    addedAt: new Date()
  });
  
  return this.save();
};

// Instance method to remove restaurant
mealPlanSchema.methods.removeRestaurant = function(restaurantId) {
  this.selectedRestaurants = this.selectedRestaurants.filter(r => 
    r.restaurantId.toString() !== restaurantId.toString()
  );
  
  return this.save();
};

// Instance method to replace restaurant
mealPlanSchema.methods.replaceRestaurant = function(oldRestaurantId, newRestaurantId, newRestaurantName) {
  const index = this.selectedRestaurants.findIndex(r => 
    r.restaurantId.toString() === oldRestaurantId.toString()
  );
  
  if (index === -1) {
    throw new Error('Restaurant to replace not found');
  }
  
  this.selectedRestaurants[index] = {
    restaurantId: newRestaurantId,
    restaurantName: newRestaurantName,
    addedAt: new Date()
  };
  
  return this.save();
};

// Instance method to get restaurant IDs array
mealPlanSchema.methods.getRestaurantIds = function() {
  return this.selectedRestaurants.map(r => r.restaurantId);
};

// Instance method to check if restaurant is selected
mealPlanSchema.methods.isRestaurantSelected = function(restaurantId) {
  return this.selectedRestaurants.some(r => 
    r.restaurantId.toString() === restaurantId.toString()
  );
};

// Virtual to get count of selected restaurants
mealPlanSchema.virtual('restaurantCount').get(function() {
  return this.selectedRestaurants.length;
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
