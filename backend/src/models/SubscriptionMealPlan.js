const mongoose = require('mongoose');
const { findSubscriptionDayForDate, getNextSunday, getSubscriptionStartSunday, getWeekDateRange } = require('../utils/dateHelpers');
const User = require('./User');
const { emptyNutritionTotals, addNutritionFromItem, roundNutritionTotals } = require('../utils/nutritionTotals');

// Individual meal item schema
const mealItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  planId: {
    type: String,
    required: true
  },
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
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
  },
  deliveryTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  // Store full item data for offline access and orders
  description: String,
  image: String,
  category: String,
  dietaryPreferences: [String],
  spiceLevel: Number,
  prepTime: Number,
  servings: Number,
  ingredients: [String],
  allergens: [String],
  nutritionInfo: {
    calories: Number,
    protein: String,
    carbs: String,
    fat: String
  }
}, { _id: false });

// Day meals schema
const dayMealsSchema = new mongoose.Schema({
  lunch: [mealItemSchema],
  dinner: [mealItemSchema]
}, { _id: false });

// Week schema for multi-week support
const weekSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: true,
    min: 0
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  meals: {
    monday: dayMealsSchema,
    tuesday: dayMealsSchema,
    wednesday: dayMealsSchema,
    thursday: dayMealsSchema,
    friday: dayMealsSchema,
    saturday: dayMealsSchema,
    sunday: dayMealsSchema
  },
  originalWeekIndex: {
    type: Number,
    required: false,
    min: 0
  },
  isRepeated: {
    type: Boolean,
    default: false
  },
  weekTotalValue: {
    type: Number,
    default: 0,
    min: [0, 'Week total value cannot be negative']
  },
  weekTotalItems: {
    type: Number,
    default: 0,
    min: [0, 'Week total items cannot be negative']
  },
  weekTotalNutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  }
}, { _id: false });

// Delivery address schema
const deliveryAddressSchema = new mongoose.Schema({
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
    trim: true,
    uppercase: true
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [200, 'Delivery instructions cannot exceed 200 characters']
  }
}, { _id: false });

// Main subscription meal plan schema
const subscriptionMealPlanSchema = new mongoose.Schema({
  // Core Plan Information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required'],
    index: true
  },
  // Multi-restaurant support - maximum 2 restaurants
  restaurants: [{
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
    totalMeals: {
      type: Number,
      default: 0,
      min: [0, 'Total meals cannot be negative']
    },
    totalValue: {
      type: Number,
      default: 0,
      min: [0, 'Total value cannot be negative']
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxRestaurants: {
    type: Number,
    default: 2,
    min: [1, 'At least 1 restaurant required']
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: false, // Optional - SubscriptionMealPlan can be standalone
    index: true
  },
  
  // Plan Type and Duration
  planType: {
    type: String,
    enum: ['bi-weekly', 'monthly', 'quarterly'],
    required: true,
    default: 'bi-weekly'
  },
  
  // Date Management (crucial for orders page)
  planStartDate: {
    type: Date,
    required: [true, 'Plan start date is required']
  },
  planEndDate: {
    type: Date,
    required: [true, 'Plan end date is required']
  },
  weekStartDates: [{
    type: Date,
    required: true
  }],
  currentWeekIndex: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Multi-week meal planning structure
  weeks: [weekSchema],
  
  // Customer & Delivery Info (needed for orders)
  deliveryAddress: deliveryAddressSchema,
  customerPhone: {
    type: String,
    trim: true
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  },
  
  // Order Generation & Tracking
  generatedOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  isOrdersGenerated: {
    type: Boolean,
    default: false
  },
  lastOrderGenerationDate: {
    type: Date
  },
  
  // Status & Management
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active',
    index: true
  },
  totalPlanValue: {
    type: Number,
    default: 0,
    min: [0, 'Total plan value cannot be negative']
  },
  totalMealsCount: {
    type: Number,
    default: 0,
    min: [0, 'Total meals count cannot be negative']
  },
  totalNutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  
  // Subscription Integration
  billingCycle: {
    type: String,
    enum: ['bi-weekly', 'monthly', 'quarterly'],
    required: true
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  
  // Restaurant selection tracking (for frontend compatibility)
  selectedRestaurantId: {
    type: String
  },
  selectedRestaurantName: {
    type: String
  },
  selectedRestaurantData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
subscriptionMealPlanSchema.index({ customerId: 1, status: 1 });
subscriptionMealPlanSchema.index({ 'restaurants.restaurantId': 1, status: 1 });
subscriptionMealPlanSchema.index({ subscriptionId: 1 });
subscriptionMealPlanSchema.index({ planStartDate: 1, planEndDate: 1 });
subscriptionMealPlanSchema.index({ status: 1, planStartDate: 1 });
subscriptionMealPlanSchema.index({ nextBillingDate: 1, autoRenew: 1 });

// Virtual for current week
subscriptionMealPlanSchema.virtual('currentWeek').get(function() {
  if (this.weeks && this.weeks.length > this.currentWeekIndex) {
    return this.weeks[this.currentWeekIndex];
  }
  return null;
});

// Virtual for is current plan active
subscriptionMealPlanSchema.virtual('isCurrentPlan').get(function() {
  const now = new Date();
  return now >= this.planStartDate && now <= this.planEndDate && this.status === 'active';
});

// Virtual for days remaining in plan
subscriptionMealPlanSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  if (now > this.planEndDate) return 0;
  return Math.ceil((this.planEndDate - now) / (1000 * 60 * 60 * 24));
});

// Virtual for plan duration in days
subscriptionMealPlanSchema.virtual('planDurationDays').get(function() {
  return Math.ceil((this.planEndDate - this.planStartDate) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to calculate totals including restaurant-specific data
subscriptionMealPlanSchema.pre('save', function(next) {
  let totalValue = 0;
  let totalItems = 0;
  const totalNutrition = emptyNutritionTotals();
  
  // Initialize restaurant tracking
  const restaurantStats = new Map();
  
  // Calculate totals for each week
  this.weeks.forEach(week => {
    let weekValue = 0;
    let weekItems = 0;
    const weekNutrition = emptyNutritionTotals();
    
    Object.values(week.meals).forEach(dayMeals => {
      if (dayMeals.lunch) {
        dayMeals.lunch.forEach(item => {
          weekValue += item.price;
          weekItems++;
          addNutritionFromItem(weekNutrition, item);
          addNutritionFromItem(totalNutrition, item);
          
          // Track per restaurant
          const restaurantId = item.restaurantId ? item.restaurantId.toString() : null;
          if (restaurantId) {
            if (!restaurantStats.has(restaurantId)) {
              restaurantStats.set(restaurantId, { totalMeals: 0, totalValue: 0, restaurantName: item.restaurantName });
            }
            const stats = restaurantStats.get(restaurantId);
            stats.totalMeals++;
            stats.totalValue += item.price;
          }
        });
      }
      if (dayMeals.dinner) {
        dayMeals.dinner.forEach(item => {
          weekValue += item.price;
          weekItems++;
          addNutritionFromItem(weekNutrition, item);
          addNutritionFromItem(totalNutrition, item);
          
          // Track per restaurant
          const restaurantId = item.restaurantId ? item.restaurantId.toString() : null;
          if (restaurantId) {
            if (!restaurantStats.has(restaurantId)) {
              restaurantStats.set(restaurantId, { totalMeals: 0, totalValue: 0, restaurantName: item.restaurantName });
            }
            const stats = restaurantStats.get(restaurantId);
            stats.totalMeals++;
            stats.totalValue += item.price;
          }
        });
      }
    });
    
    week.weekTotalValue = Math.round(weekValue * 100) / 100;
    week.weekTotalItems = weekItems;
    week.weekTotalNutrition = roundNutritionTotals(weekNutrition);
    
    totalValue += weekValue;
    totalItems += weekItems;
  });
  
  // Update restaurant statistics
  this.restaurants.forEach(restaurant => {
    const restaurantId = restaurant.restaurantId.toString();
    const stats = restaurantStats.get(restaurantId);
    if (stats) {
      restaurant.totalMeals = stats.totalMeals;
      restaurant.totalValue = Math.round(stats.totalValue * 100) / 100;
      restaurant.restaurantName = stats.restaurantName;
    }
  });
  
  this.totalPlanValue = Math.round(totalValue * 100) / 100;
  this.totalMealsCount = totalItems;
  this.totalNutrition = roundNutritionTotals(totalNutrition);
  
  next();
});

// Pre-save middleware to validate date ranges
subscriptionMealPlanSchema.pre('save', function(next) {
  if (this.planStartDate >= this.planEndDate) {
    return next(new Error('Plan end date must be after start date'));
  }
  
  // Validate week dates
  for (let i = 0; i < this.weeks.length; i++) {
    const week = this.weeks[i];
    if (week.weekStartDate >= week.weekEndDate) {
      return next(new Error(`Week ${i + 1} end date must be after start date`));
    }
  }
  
  next();
});

// Instance method to get today's meals for orders page
subscriptionMealPlanSchema.methods.getTodaysMeals = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaysMeals = [];
  
  // Find which subscription day corresponds to today's calendar date
  const subscriptionDay = findSubscriptionDayForDate(today, this.weeks);
  
  if (!subscriptionDay) {
    return todaysMeals; // Today is not in any subscription week
  }
  
  // Find the week that contains today
  const currentWeek = this.weeks.find(week => {
    const weekStart = new Date(week.weekStartDate);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(week.weekEndDate);
    weekEnd.setHours(23, 59, 59, 999);
    return today >= weekStart && today <= weekEnd;
  });
  
  if (!currentWeek || !currentWeek.meals[subscriptionDay]) {
    return todaysMeals;
  }
  
  const dayMeals = currentWeek.meals[subscriptionDay];
  
  // Add lunch meals
  if (dayMeals.lunch && dayMeals.lunch.length > 0) {
    dayMeals.lunch.forEach(meal => {
      todaysMeals.push({
        id: `${this._id}_${subscriptionDay}_lunch_${meal.planId}`,
        planId: this._id,
        customerId: this.customerId,
        restaurantId: meal.restaurantId,
        mealType: 'lunch',
        item: meal,
        deliveryTime: meal.deliveryTime,
        deliveryAddress: this.deliveryAddress,
        specialInstructions: this.specialInstructions,
        status: 'pending',
        orderDate: new Date(),
        deliveryDate: today,
        isSubscriptionMeal: true
      });
    });
  }
  
  // Add dinner meals
  if (dayMeals.dinner && dayMeals.dinner.length > 0) {
    dayMeals.dinner.forEach(meal => {
      todaysMeals.push({
        id: `${this._id}_${subscriptionDay}_dinner_${meal.planId}`,
        planId: this._id,
        customerId: this.customerId,
        restaurantId: meal.restaurantId,
        mealType: 'dinner',
        item: meal,
        deliveryTime: meal.deliveryTime,
        deliveryAddress: this.deliveryAddress,
        specialInstructions: this.specialInstructions,
        status: 'pending',
        orderDate: new Date(),
        deliveryDate: today,
        isSubscriptionMeal: true
      });
    });
  }
  
  return todaysMeals;
};

// Instance method to add meal to specific week and day
subscriptionMealPlanSchema.methods.addMeal = function(weekIndex, day, mealType, menuItem, deliveryTime, restaurantId, restaurantName) {
  if (!this.weeks[weekIndex]) {
    throw new Error(`Week ${weekIndex} does not exist in this plan`);
  }
  
  if (!this.weeks[weekIndex].meals[day]) {
    this.weeks[weekIndex].meals[day] = { lunch: [], dinner: [] };
  }
  
  const mealItem = {
    id: menuItem._id.toString(),
    planId: `${this._id}_${weekIndex}_${day}_${mealType}_${Date.now()}`,
    menuItemId: menuItem._id,
    name: menuItem.name,
    price: menuItem.price,
    restaurantId: restaurantId,
    restaurantName: restaurantName || 'Restaurant',
    addedAt: new Date(),
    deliveryTime: deliveryTime,
    description: menuItem.description,
    image: menuItem.image,
    category: menuItem.category,
    dietaryPreferences: menuItem.dietaryPreferences,
    spiceLevel: menuItem.spiceLevel,
    prepTime: menuItem.prepTime,
    servings: menuItem.servings,
    ingredients: menuItem.ingredients,
    allergens: menuItem.allergens,
    nutritionInfo: menuItem.nutritionInfo
  };
  
  this.weeks[weekIndex].meals[day][mealType].push(mealItem);
  return this.save();
};

// Instance method to remove meal from specific week and day
subscriptionMealPlanSchema.methods.removeMeal = function(weekIndex, day, mealType, planId) {
  if (!this.weeks[weekIndex] || !this.weeks[weekIndex].meals[day]) {
    return this.save();
  }
  
  const meals = this.weeks[weekIndex].meals[day][mealType];
  const mealIndex = meals.findIndex(meal => meal.planId === planId);
  
  if (mealIndex > -1) {
    meals.splice(mealIndex, 1);
  }
  
  return this.save();
};

// Instance method to clear all meals for a specific week
subscriptionMealPlanSchema.methods.clearWeek = function(weekIndex) {
  if (!this.weeks[weekIndex]) {
    throw new Error(`Week ${weekIndex} does not exist in this plan`);
  }
  
  const emptyMeals = {
    monday: { lunch: [], dinner: [] },
    tuesday: { lunch: [], dinner: [] },
    wednesday: { lunch: [], dinner: [] },
    thursday: { lunch: [], dinner: [] },
    friday: { lunch: [], dinner: [] },
    saturday: { lunch: [], dinner: [] },
    sunday: { lunch: [], dinner: [] }
  };
  
  this.weeks[weekIndex].meals = emptyMeals;
  return this.save();
};

// Static method to find or create meal plan for user
subscriptionMealPlanSchema.statics.findOrCreateForUser = async function(userId, subscriptionId, restaurants, planType = 'bi-weekly') {
  let mealPlan = await this.findOne({ 
    customerId: userId, 
    subscriptionId: subscriptionId,
    status: 'active'
  });

  const user = await User.findById(userId).select('isGrubPass');
  const maxRestaurants = user?.isGrubPass ? null : 2;
  
  if (!mealPlan) {
    // Calculate plan dates based on type - FIXED: Use proper subscription start calculation
    const startDate = getSubscriptionStartSunday(); // Start on next upcoming Sunday with proper notice
    const endDate = new Date(startDate);
    let weekCount = 1;
    
    switch (planType) {
      case 'bi-weekly':
        endDate.setDate(startDate.getDate() + 13); // 14 days = 2 weeks, but end on Saturday (13 days from Sunday)
        weekCount = 2;
        break;
      case 'monthly':
        endDate.setDate(startDate.getDate() + 27); // 4 weeks = 28 days, but end on Saturday (27 days from Sunday)
        weekCount = 4;
        break;
      case 'quarterly':
        endDate.setDate(startDate.getDate() + 83); // 12 weeks = 84 days, but end on Saturday (83 days from Sunday)
        weekCount = 12;
        break;
    }
    
    // Generate week start dates using proper Sunday-based calculation
    const weekStartDates = [];
    const weeks = [];
    
    for (let i = 0; i < weekCount; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (i * 7)); // Each week starts on Sunday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Each week ends on Saturday
      weekEnd.setHours(23, 59, 59, 999); // End of Saturday
      
      weekStartDates.push(weekStart);
      
      weeks.push({
        weekNumber: i,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        meals: {
          monday: { lunch: [], dinner: [] },
          tuesday: { lunch: [], dinner: [] },
          wednesday: { lunch: [], dinner: [] },
          thursday: { lunch: [], dinner: [] },
          friday: { lunch: [], dinner: [] },
          saturday: { lunch: [], dinner: [] },
          sunday: { lunch: [], dinner: [] }
        }
      });
    }
    
    // Calculate next billing date
    const nextBilling = new Date(endDate);
    nextBilling.setDate(endDate.getDate() + 1);
    
    // Ensure restaurants is an array and validate max 2 restaurants
    const restaurantsArray = Array.isArray(restaurants) ? restaurants : [restaurants];
    if (!user?.isGrubPass && restaurantsArray.length > 2) {
      throw new Error('Maximum 2 restaurants allowed per meal plan');
    }
    
    // Format restaurants for schema
    const formattedRestaurants = restaurantsArray.map(restaurant => ({
      restaurantId: restaurant.restaurantId || restaurant._id || restaurant,
      restaurantName: restaurant.restaurantName || restaurant.name || 'Restaurant',
      totalMeals: 0,
      totalValue: 0,
      addedAt: new Date()
    }));
    
    mealPlan = new this({
      customerId: userId,
      restaurants: formattedRestaurants,
      maxRestaurants,
      subscriptionId: subscriptionId,
      planType: planType,
      planStartDate: startDate,
      planEndDate: endDate,
      weekStartDates: weekStartDates,
      weeks: weeks,
      billingCycle: planType,
      nextBillingDate: nextBilling,
      deliveryAddress: {
        street: '',
        city: '',
        province: '',
        postalCode: '',
        instructions: ''
      }
    });
    
    await mealPlan.save();
  } else {
    mealPlan.maxRestaurants = maxRestaurants;
  }
  
  return mealPlan;
};

// Static method to get active plans for customer
subscriptionMealPlanSchema.statics.getActiveForCustomer = function(customerId) {
  return this.find({
    customerId,
    status: 'active',
    planEndDate: { $gte: new Date() }
  }).sort({ planStartDate: 1 });
};

// Static method to get plans for restaurant (for partner dashboard)
subscriptionMealPlanSchema.statics.getForRestaurant = function(restaurantId, status = null) {
  const query = { 'restaurants.restaurantId': restaurantId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('customerId', 'firstName lastName email phone')
    .populate('subscriptionId')
    .populate('restaurants.restaurantId', 'name cuisine')
    .sort({ planStartDate: -1 });
};

// Static method to get today's meals for all active plans (for partner orders page)
subscriptionMealPlanSchema.statics.getTodaysOrdersForRestaurant = async function(restaurantId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const activePlans = await this.find({
    'restaurants.restaurantId': restaurantId,
    status: 'active',
    planStartDate: { $lte: today },
    planEndDate: { $gte: today }
  }).populate('customerId', 'firstName lastName email phone');
  
  const todaysOrders = [];
  
  activePlans.forEach(plan => {
    const todaysMeals = plan.getTodaysMeals();
    // Filter meals for only this restaurant
    const restaurantMeals = todaysMeals.filter(meal => 
      meal.restaurantId.toString() === restaurantId.toString()
    );
    todaysOrders.push(...restaurantMeals);
  });
  
  return todaysOrders;
};

module.exports = mongoose.model('SubscriptionMealPlan', subscriptionMealPlanSchema);
