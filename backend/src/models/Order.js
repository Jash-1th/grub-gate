// FILE: src/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [200, 'Special instructions cannot exceed 200 characters']
  },
  description: String,
  category: String,
  prepTime: Number,
  spiceLevel: Number,
  ingredients: [String],
  allergens: [String],
  nutritionInfo: {
    calories: Number,
    protein: String,
    carbs: String,
    fat: String
  }
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

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
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
  type: {
    type: String,
    enum: ['single', 'weekly-plan'],
    required: true,
    default: 'single'
  },
  isSubscriptionOrder: {
    type: Boolean,
    default: false,
    index: true // Index for efficient querying
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  deliveryFee: {
    type: Number,
    required: true,
    min: [0, 'Delivery fee cannot be negative']
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['scheduled', 'pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled', 'completed'],
    default: 'scheduled'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'paid'
  },
  scheduledDate: {
    type: Date,
    required: true,
    index: true
  },
  activationDate: {
    type: Date,
    required: true,
    index: true
  },
  isScheduledOrder: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'digital-wallet'],
    default: 'card'
  },
  paymentIntentId: {
    type: String,
    trim: true
  },
  deliveryAddress: deliveryAddressSchema,
  deliveryTime: {
    requested: Date,
    estimated: Date,
    actual: Date
  },
  mealType: {
    type: String,
    enum: ['lunch', 'dinner'],
    required: function() {
      return this.type === 'weekly-plan';
    }
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  weeklyPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionMealPlan',
    required: function() {
      return this.type === 'weekly-plan';
    }
  },
  cancelReason: {
    type: String,
    trim: true
  },
  cancelledAt: Date,
  estimatedDeliveryTime: {
    type: Number, // in minutes
    min: [10, 'Estimated delivery time must be at least 10 minutes']
  },
  
  // Dasher/Delivery Driver Information
  dasherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true  // Only assigned orders will have this
  },
  
  dasherAssignedAt: Date,
  dasherAcceptedAt: Date,
  dasherPickedUpAt: Date,
  dasherDeliveredAt: Date,
  
  dasherLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      default: [0, 0]
    },
    lastUpdated: Date
  },
  
  deliveryNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Delivery notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted order number
orderSchema.virtual('formattedOrderNumber').get(function() {
  return `#${this.orderNumber}`;
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for delivery status
orderSchema.virtual('deliveryStatus').get(function() {
  switch (this.status) {
    case 'pending':
    case 'confirmed':
      return 'Order received';
    case 'preparing':
      return 'Being prepared';
    case 'ready':
      return 'Ready for pickup';
    case 'out-for-delivery':
      return 'Out for delivery';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
});

// Virtual for can be cancelled
orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

// Indexes for performance
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ weeklyPlanId: 1 });
orderSchema.index({ type: 1, status: 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    this.orderNumber = `GG${dateStr}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Pre-save middleware to calculate estimated delivery time
orderSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('restaurantId')) {
    try {
      const Restaurant = mongoose.model('Restaurant');
      const restaurant = await Restaurant.findById(this.restaurantId);
      if (restaurant) {
        this.estimatedDeliveryTime = restaurant.deliverySettings.avgDeliveryTime;
        
        // Set estimated delivery time if not already set
        if (!this.deliveryTime.estimated) {
          this.deliveryTime.estimated = new Date(Date.now() + this.estimatedDeliveryTime * 60000);
        }
      }
    } catch (error) {
      console.error('Error calculating estimated delivery time:', error);
    }
  }
  next();
});

// Instance method to calculate totals
orderSchema.methods.calculateTotals = function(deliveryFee = 0, taxRate = 0.13) {
  this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.deliveryFee = deliveryFee;
  this.tax = Math.round((this.subtotal + this.deliveryFee) * taxRate * 100) / 100;
  this.total = Math.round((this.subtotal + this.deliveryFee + this.tax) * 100) / 100;
  return this;
};

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus, notes = '') {
  // Enhanced valid transitions including scheduled status for subscription orders
  const validTransitions = {
    'scheduled': ['preparing', 'cancelled'],
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['ready', 'cancelled'],
    'ready': ['out-for-delivery', 'delivered'],
    'out-for-delivery': ['delivered'],
    'delivered': [],
    'cancelled': []
  };

  // Check if transition is valid
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }

  // Time-based validation for subscription orders
  if (this.isScheduledOrder && this.scheduledDate) {
    const now = new Date();
    const deliveryDate = new Date(this.scheduledDate);
    
    // Create day before date more carefully to handle timezone issues
    const dayBefore = new Date(deliveryDate.getFullYear(), deliveryDate.getMonth(), deliveryDate.getDate() - 1);
    
    // Get current date components for comparison (timezone-safe)
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();
    
    const deliveryYear = deliveryDate.getFullYear();
    const deliveryMonth = deliveryDate.getMonth();
    const deliveryDay = deliveryDate.getDate();
    
    const dayBeforeYear = dayBefore.getFullYear();
    const dayBeforeMonth = dayBefore.getMonth();
    const dayBeforeDay = dayBefore.getDate();
    
    // Compare dates using date components instead of toDateString() to avoid timezone issues
    const isDeliveryDay = (currentYear === deliveryYear && currentMonth === deliveryMonth && currentDate === deliveryDay);
    const isDayBefore = (currentYear === dayBeforeYear && currentMonth === dayBeforeMonth && currentDate === dayBeforeDay);
    const isAfterDayBefore = now >= dayBefore;
    
    // Debug logging for time validation
    console.log(`🕐 DEBUG Time Validation for ${this.orderNumber}:`);
    console.log(`   Current time: ${now.toISOString()} (${now.toDateString()})`);
    console.log(`   Current date components: ${currentYear}-${currentMonth + 1}-${currentDate}`);
    console.log(`   Delivery date: ${deliveryDate.toISOString()} (${deliveryDate.toDateString()})`);
    console.log(`   Delivery date components: ${deliveryYear}-${deliveryMonth + 1}-${deliveryDay}`);
    console.log(`   Day before: ${dayBefore.toISOString()} (${dayBefore.toDateString()})`);
    console.log(`   Day before components: ${dayBeforeYear}-${dayBeforeMonth + 1}-${dayBeforeDay}`);
    console.log(`   isDayBefore: ${isDayBefore}`);
    console.log(`   isDeliveryDay: ${isDeliveryDay}`);
    console.log(`   isAfterDayBefore: ${isAfterDayBefore}`);
    
    // Validate timing based on new status
    switch(newStatus) {
      case 'preparing':
        // More lenient validation: allow preparing if current date is same or after day before delivery
        const currentDateOnly = new Date(currentYear, currentMonth, currentDate);
        const dayBeforeOnly = new Date(dayBeforeYear, dayBeforeMonth, dayBeforeDay);
        const isAllowedForPreparing = currentDateOnly >= dayBeforeOnly;
        
        if (!isAllowedForPreparing) {
          console.log(`❌ VALIDATION FAILED: Current date ${currentDateOnly.toDateString()} is before allowed date ${dayBeforeOnly.toDateString()}`);
          throw new Error(`Cannot set to "Preparing" - only allowed 1 day before delivery (${dayBefore.toDateString()}) or on delivery day (${deliveryDate.toDateString()})`);
        }
        console.log(`✅ VALIDATION PASSED: Preparing status allowed (current: ${currentDateOnly.toDateString()}, allowed from: ${dayBeforeOnly.toDateString()})`);
        break;
        
      case 'ready':
        if (!isDeliveryDay) {
          throw new Error(`Cannot set to "Ready" - only allowed on delivery day (${deliveryDate.toDateString()})`);
        }
        break;
        
      case 'delivered':
        if (!isDeliveryDay) {
          throw new Error(`Cannot set to "Delivered" - only allowed on delivery day (${deliveryDate.toDateString()})`);
        }
        // Additional check for delivery time window (optional - can be enhanced later)
        break;
        
      case 'cancelled':
        // Cancellation allowed anytime before delivery
        if (now > deliveryDate) {
          throw new Error(`Cannot cancel order - delivery time has passed`);
        }
        break;
    }
    
    console.log(`🕐 Time validation passed for ${this.orderNumber}: ${this.status} → ${newStatus} (Delivery: ${deliveryDate.toDateString()})`);
  }

  // Update status
  this.status = newStatus;
  
  // Handle special status updates
  if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
    this.cancelReason = notes;
  }
  
  if (newStatus === 'delivered') {
    this.deliveryTime.actual = new Date();
  }

  return this.save();
};

// Instance method to cancel order
orderSchema.methods.cancel = function(reason = 'Cancelled by customer') {
  if (!this.canBeCancelled) {
    throw new Error('Order cannot be cancelled at this stage');
  }
  
  return this.updateStatus('cancelled', reason);
};

// Instance method to add item
orderSchema.methods.addItem = function(menuItem, quantity = 1, specialInstructions = '') {
  const existingItemIndex = this.items.findIndex(
    item => item.menuItemId.toString() === menuItem._id.toString()
  );

  if (existingItemIndex > -1) {
    this.items[existingItemIndex].quantity += quantity;
  } else {
    this.items.push({
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      specialInstructions
    });
  }

  return this;
};

// Instance method to remove item
orderSchema.methods.removeItem = function(menuItemId) {
  this.items = this.items.filter(
    item => item.menuItemId.toString() !== menuItemId.toString()
  );
  return this;
};

// Static method to get orders by date range
orderSchema.statics.getOrdersByDateRange = function(startDate, endDate, restaurantId = null) {
  const query = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  if (restaurantId) {
    query.restaurantId = restaurantId;
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get revenue stats
orderSchema.statics.getRevenueStats = function(restaurantId, startDate, endDate) {
  const matchQuery = {
    restaurantId: new mongoose.Types.ObjectId(restaurantId),
    paymentStatus: 'paid',
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        // Calculate true payout: subtotal + tax + deliveryFee (excludes platform fees)
        totalRevenue: { 
          $sum: { 
            $add: [
              { $ifNull: ['$subtotal', 0] },
              { $ifNull: ['$tax', 0] },
              { $ifNull: ['$deliveryFee', 0] }
            ]
          }
        },
        totalOrders: { $sum: 1 },
        averageOrderValue: { 
          $avg: { 
            $add: [
              { $ifNull: ['$subtotal', 0] },
              { $ifNull: ['$tax', 0] },
              { $ifNull: ['$deliveryFee', 0] }
            ]
          }
        }
      }
    }
  ]);
};

// Static method to get popular items
orderSchema.statics.getPopularItems = function(restaurantId, limit = 10) {
  return this.aggregate([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        status: { $ne: 'cancelled' }
      }
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.menuItemId',
        name: { $first: '$items.name' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
