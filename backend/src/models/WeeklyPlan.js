// FILE: src/models/WeeklyPlan.js
const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
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
  deliveryTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  }
}, { _id: false });

const dayMealsSchema = new mongoose.Schema({
  lunch: mealSchema,
  dinner: mealSchema
}, { _id: false });

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

const weeklyPlanSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  planType: {
    type: String,
    enum: ['weekly', 'bi-weekly'],
    required: true,
    default: 'weekly'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'paused'],
    default: 'active'
  },
  deliveryAddress: deliveryAddressSchema,
  meals: {
    monday: dayMealsSchema,
    tuesday: dayMealsSchema,
    wednesday: dayMealsSchema,
    thursday: dayMealsSchema,
    friday: dayMealsSchema,
    saturday: dayMealsSchema,
    sunday: dayMealsSchema
  },
  totalWeeklyValue: {
    type: Number,
    default: 0,
    min: [0, 'Total weekly value cannot be negative']
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  generatedOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  isOrdersGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total meals count
weeklyPlanSchema.virtual('totalMeals').get(function() {
  let count = 0;
  Object.values(this.meals).forEach(day => {
    if (day.lunch) count++;
    if (day.dinner) count++;
  });
  return count;
});

// Virtual for days with meals
weeklyPlanSchema.virtual('activeDays').get(function() {
  const days = [];
  Object.entries(this.meals).forEach(([dayName, dayMeals]) => {
    if (dayMeals.lunch || dayMeals.dinner) {
      days.push(dayName);
    }
  });
  return days;
});

// Virtual for plan duration in days
weeklyPlanSchema.virtual('durationDays').get(function() {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Virtual for is current week
weeklyPlanSchema.virtual('isCurrentWeek').get(function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

// Indexes for performance
weeklyPlanSchema.index({ customerId: 1, status: 1 });
weeklyPlanSchema.index({ restaurantId: 1, status: 1 });
weeklyPlanSchema.index({ startDate: 1, endDate: 1 });
weeklyPlanSchema.index({ subscriptionId: 1 });
weeklyPlanSchema.index({ status: 1, startDate: 1 });

// Pre-save middleware to calculate total weekly value
weeklyPlanSchema.pre('save', function(next) {
  let total = 0;
  
  Object.values(this.meals).forEach(day => {
    if (day.lunch) total += day.lunch.price;
    if (day.dinner) total += day.dinner.price;
  });
  
  this.totalWeeklyValue = Math.round(total * 100) / 100;
  next();
});

// Pre-save middleware to validate date range
weeklyPlanSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  
  const daysDiff = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  
  if (this.planType === 'weekly' && daysDiff !== 7) {
    return next(new Error('Weekly plan must be exactly 7 days'));
  }
  
  if (this.planType === 'bi-weekly' && daysDiff !== 14) {
    return next(new Error('Bi-weekly plan must be exactly 14 days'));
  }
  
  next();
});

// Instance method to add meal to specific day
weeklyPlanSchema.methods.addMeal = function(day, mealType, menuItem, deliveryTime) {
  if (!this.meals[day]) {
    this.meals[day] = {};
  }
  
  this.meals[day][mealType] = {
    menuItemId: menuItem._id,
    name: menuItem.name,
    price: menuItem.price,
    deliveryTime: deliveryTime
  };
  
  return this.save();
};

// Instance method to remove meal from specific day
weeklyPlanSchema.methods.removeMeal = function(day, mealType) {
  if (this.meals[day] && this.meals[day][mealType]) {
    this.meals[day][mealType] = undefined;
    
    // If day has no meals, remove the day
    if (!this.meals[day].lunch && !this.meals[day].dinner) {
      this.meals[day] = undefined;
    }
  }
  
  return this.save();
};

// Instance method to clear all meals for a specific day
weeklyPlanSchema.methods.clearDay = function(day) {
  this.meals[day] = undefined;
  return this.save();
};

// Instance method to generate orders for the week
weeklyPlanSchema.methods.generateOrders = async function() {
  if (this.isOrdersGenerated) {
    throw new Error('Orders have already been generated for this weekly plan');
  }

  const Order = mongoose.model('Order');
  const generatedOrders = [];

  // Get customer and restaurant info
  await this.populate(['customerId', 'restaurantId']);

  // Generate orders for each day with meals
  for (const [dayName, dayMeals] of Object.entries(this.meals)) {
    if (!dayMeals) continue;

    // Calculate delivery date for this day
    const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayName);
    const deliveryDate = new Date(this.startDate);
    deliveryDate.setDate(this.startDate.getDate() + dayIndex);

    // Generate lunch order
    if (dayMeals.lunch) {
      const lunchOrder = new Order({
        customerId: this.customerId._id,
        restaurantId: this.restaurantId._id,
        type: 'weekly-plan',
        weeklyPlanId: this._id,
        mealType: 'lunch',
        items: [{
          menuItemId: dayMeals.lunch.menuItemId,
          name: dayMeals.lunch.name,
          price: dayMeals.lunch.price,
          quantity: 1
        }],
        deliveryAddress: this.deliveryAddress,
        specialInstructions: this.specialInstructions,
        deliveryTime: {
          requested: new Date(deliveryDate.toDateString() + ' ' + dayMeals.lunch.deliveryTime)
        }
      });

      lunchOrder.calculateTotals(this.restaurantId.deliverySettings.fee);
      await lunchOrder.save();
      generatedOrders.push(lunchOrder._id);
    }

    // Generate dinner order
    if (dayMeals.dinner) {
      const dinnerOrder = new Order({
        customerId: this.customerId._id,
        restaurantId: this.restaurantId._id,
        type: 'weekly-plan',
        weeklyPlanId: this._id,
        mealType: 'dinner',
        items: [{
          menuItemId: dayMeals.dinner.menuItemId,
          name: dayMeals.dinner.name,
          price: dayMeals.dinner.price,
          quantity: 1
        }],
        deliveryAddress: this.deliveryAddress,
        specialInstructions: this.specialInstructions,
        deliveryTime: {
          requested: new Date(deliveryDate.toDateString() + ' ' + dayMeals.dinner.deliveryTime)
        }
      });

      dinnerOrder.calculateTotals(this.restaurantId.deliverySettings.fee);
      await dinnerOrder.save();
      generatedOrders.push(dinnerOrder._id);
    }
  }

  // Update weekly plan with generated orders
  this.generatedOrders = generatedOrders;
  this.isOrdersGenerated = true;
  
  return this.save();
};

// Instance method to cancel weekly plan
weeklyPlanSchema.methods.cancel = async function(reason = 'Cancelled by customer') {
  if (this.status === 'cancelled') {
    throw new Error('Weekly plan is already cancelled');
  }

  // Cancel all pending/confirmed orders
  const Order = mongoose.model('Order');
  await Order.updateMany(
    {
      weeklyPlanId: this._id,
      status: { $in: ['pending', 'confirmed'] }
    },
    {
      status: 'cancelled',
      cancelReason: reason,
      cancelledAt: new Date()
    }
  );

  this.status = 'cancelled';
  return this.save();
};

// Instance method to pause weekly plan
weeklyPlanSchema.methods.pause = function() {
  if (this.status !== 'active') {
    throw new Error('Only active weekly plans can be paused');
  }
  
  this.status = 'paused';
  return this.save();
};

// Instance method to resume weekly plan
weeklyPlanSchema.methods.resume = function() {
  if (this.status !== 'paused') {
    throw new Error('Only paused weekly plans can be resumed');
  }
  
  this.status = 'active';
  return this.save();
};

// Static method to get active plans for customer
weeklyPlanSchema.statics.getActiveForCustomer = function(customerId) {
  return this.find({
    customerId,
    status: 'active',
    endDate: { $gte: new Date() }
  }).sort({ startDate: 1 });
};

// Static method to get plans for restaurant
weeklyPlanSchema.statics.getForRestaurant = function(restaurantId, status = null) {
  const query = { restaurantId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('customerId', 'firstName lastName email phone')
    .sort({ startDate: -1 });
};

// Static method to get plans by date range
weeklyPlanSchema.statics.getByDateRange = function(startDate, endDate, restaurantId = null) {
  const query = {
    $or: [
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
      { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
    ]
  };
  
  if (restaurantId) {
    query.restaurantId = restaurantId;
  }
  
  return this.find(query).sort({ startDate: 1 });
};

module.exports = mongoose.model('WeeklyPlan', weeklyPlanSchema);
