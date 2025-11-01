// FILE: src/models/MenuItem.js
const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  lunch: {
    type: Boolean,
    default: true
  },
  dinner: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [100, 'Menu item name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  longDescription: {
    type: String,
    trim: true,
    maxlength: [1000, 'Long description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: [
      'appetizer', 'main', 'dessert', 'beverage', 'salad', 'soup', 
      'pasta', 'pizza', 'burger', 'sandwich', 'seafood', 'vegetarian',
      'always-available', 'special'
    ]
  },
  cuisine: {
    type: String,
    required: [true, 'Cuisine is required'],
    trim: true,
    lowercase: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  prepTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [180, 'Preparation time cannot exceed 180 minutes']
  },
  servings: {
    type: Number,
    default: 1,
    min: [1, 'Servings must be at least 1']
  },
  dietaryPreferences: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'spicy', 'keto', 'low-carb', 'halal', 'kosher'],
    lowercase: true
  }],
  ingredients: [{
    type: String,
    trim: true,
    maxlength: [50, 'Ingredient name cannot be more than 50 characters']
  }],
  allergens: [{
    type: String,
    enum: [
      'gluten', 'dairy', 'eggs', 'fish', 'shellfish', 'nuts', 'peanuts', 
      'soy', 'sesame', 'alcohol', 'sulfites'
    ],
    lowercase: true
  }],
  nutritionInfo: {
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative']
    },
    protein: {
      type: String,
      trim: true
    },
    carbs: {
      type: String,
      trim: true
    },
    fat: {
      type: String,
      trim: true
    }
  },
  spiceLevel: {
    type: Number,
    default: 0,
    min: [0, 'Spice level cannot be less than 0'],
    max: [5, 'Spice level cannot be more than 5']
  },
  image: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  availability: {
    monday: availabilitySchema,
    tuesday: availabilitySchema,
    wednesday: availabilitySchema,
    thursday: availabilitySchema,
    friday: availabilitySchema,
    saturday: availabilitySchema,
    sunday: availabilitySchema
  },
  status: {
    type: String,
    enum: ['available', 'unavailable', 'out-of-stock'],
    default: 'available'
  },
  totalOrders: {
    type: Number,
    default: 0,
    min: [0, 'Total orders cannot be negative']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: [0, 'Review count cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted price
menuItemSchema.virtual('formattedPrice').get(function() {
  if (this.price === undefined || this.price === null) {
    return '$0.00';
  }
  return `$${this.price.toFixed(2)}`;
});

// Virtual for isPopular
menuItemSchema.virtual('isPopular').get(function() {
  if (this.totalOrders === undefined || this.rating === undefined) {
    return false;
  }
  return this.totalOrders >= 50 && this.rating >= 4.0;
});

// Virtual for isAvailableToday
menuItemSchema.virtual('isAvailableToday').get(function() {
  if (this.status !== 'available') return false;
  
  // Check if availability data is available
  if (!this.availability) return false;
  
  const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
  const todayAvailability = this.availability[today];
  
  if (!todayAvailability) return false;
  
  const currentHour = new Date().getHours();
  const isLunchTime = currentHour >= 11 && currentHour < 16;
  const isDinnerTime = currentHour >= 16 && currentHour < 23;
  
  return (isLunchTime && todayAvailability.lunch) || (isDinnerTime && todayAvailability.dinner);
});

// Indexes for performance
menuItemSchema.index({ restaurantId: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ status: 1 });
menuItemSchema.index({ dietaryPreferences: 1 });
menuItemSchema.index({ price: 1 });
menuItemSchema.index({ rating: -1, totalOrders: -1 });
menuItemSchema.index({ restaurantId: 1, status: 1, category: 1 });

// Text index for search functionality
menuItemSchema.index({
  name: 'text',
  description: 'text',
  ingredients: 'text'
});

// Pre-save middleware to set default availability
menuItemSchema.pre('save', function(next) {
  if (this.isNew && !this.availability.monday) {
    const defaultAvailability = { lunch: true, dinner: true };
    
    this.availability = {
      monday: defaultAvailability,
      tuesday: defaultAvailability,
      wednesday: defaultAvailability,
      thursday: defaultAvailability,
      friday: defaultAvailability,
      saturday: defaultAvailability,
      sunday: defaultAvailability
    };
  }
  next();
});

// Instance method to check availability for specific day and meal type
menuItemSchema.methods.isAvailableFor = function(day, mealType) {
  if (this.status !== 'available') return false;
  
  const dayAvailability = this.availability[day.toLowerCase()];
  if (!dayAvailability) return false;
  
  return dayAvailability[mealType.toLowerCase()] === true;
};

// Instance method to update rating
menuItemSchema.methods.updateRating = async function() {
  console.log('🔍 MenuItem.updateRating: Updating rating for menu item', this._id);
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { menuItemId: this._id, status: 'approved' } },
    {
      $group: {
        _id: '$menuItemId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  console.log('📊 MenuItem.updateRating: Aggregation result', stats);
  
  if (stats.length > 0) {
    this.rating = Math.round(stats[0].averageRating * 10) / 10;
    this.reviewCount = stats[0].totalReviews;
    console.log('✅ MenuItem.updateRating: Updated rating to', this.rating, 'with', this.reviewCount, 'reviews');
  } else {
    this.rating = 0;
    this.reviewCount = 0;
    console.log('⚠️ MenuItem.updateRating: No approved reviews found, setting rating to 0');
  }
  
  const result = await this.save();
  console.log('💾 MenuItem.updateRating: Saved menu item rating update');
  return result;
};

// Instance method to increment order count
menuItemSchema.methods.incrementOrderCount = function(quantity = 1) {
  this.totalOrders += quantity;
  return this.save();
};

// Static method to find by dietary preferences
menuItemSchema.statics.findByDietaryPreferences = function(preferences, restaurantId = null) {
  const query = {
    status: 'available',
    dietaryPreferences: { $in: preferences }
  };
  
  if (restaurantId) {
    query.restaurantId = restaurantId;
  }
  
  return this.find(query);
};

// Static method to find popular items
menuItemSchema.statics.getPopular = function(restaurantId = null, limit = 10) {
  const query = { status: 'available' };
  
  if (restaurantId) {
    query.restaurantId = restaurantId;
  }
  
  return this.find(query)
    .sort({ totalOrders: -1, rating: -1 })
    .limit(limit);
};

// Static method to find by price range
menuItemSchema.statics.findByPriceRange = function(minPrice, maxPrice, restaurantId = null) {
  const query = {
    status: 'available',
    price: { $gte: minPrice, $lte: maxPrice }
  };
  
  if (restaurantId) {
    query.restaurantId = restaurantId;
  }
  
  return this.find(query);
};

// Static method to search menu items
menuItemSchema.statics.searchItems = function(searchTerm, restaurantId = null) {
  const query = {
    status: 'available',
    $text: { $search: searchTerm }
  };
  
  if (restaurantId) {
    query.restaurantId = restaurantId;
  }
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

// Static method to find items available for all days and all meal slots (for normal users)
menuItemSchema.statics.findAlwaysAvailable = function(restaurantId = null) {
  const query = {
    status: 'available',
    // Items that are available for lunch and dinner on all days
    'availability.monday.lunch': true,
    'availability.monday.dinner': true,
    'availability.tuesday.lunch': true,
    'availability.tuesday.dinner': true,
    'availability.wednesday.lunch': true,
    'availability.wednesday.dinner': true,
    'availability.thursday.lunch': true,
    'availability.thursday.dinner': true,
    'availability.friday.lunch': true,
    'availability.friday.dinner': true,
    'availability.saturday.lunch': true,
    'availability.saturday.dinner': true,
    'availability.sunday.lunch': true,
    'availability.sunday.dinner': true
  };
  
  if (restaurantId) {
    query.restaurantId = restaurantId;
  }
  
  return this.find(query);
};

module.exports = mongoose.model('MenuItem', menuItemSchema);
