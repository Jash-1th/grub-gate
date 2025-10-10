import Joi from 'joi';

// Custom validation messages for better UX
const customMessages = {
  'string.empty': '{#label} is required',
  'string.min': '{#label} must be at least {#limit} characters long',
  'string.max': '{#label} cannot exceed {#limit} characters',
  'string.email': 'Please enter a valid email address',
  'string.pattern.base': '{#label} format is invalid',
  'number.base': '{#label} must be a number',
  'number.min': '{#label} must be at least {#limit}',
  'number.max': '{#label} cannot exceed {#limit}',
  'array.min': 'Please select at least {#limit} option(s)',
  'any.required': '{#label} is required',
  'any.only': '{#label} must be one of the allowed values'
};

// Common patterns
const patterns = {
  phone: /^\+?[\d\s\-\(\)]+$/,
  email: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  postalCode: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
  indianPostalCode: /^\d{6}$/,
  time: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  url: /^https?:\/\/.+/,
  businessNumber: /^\d{9}RP\d{4}$/,
  gstHstNumber: /^\d{9}RT\d{4}$/,
  qstNumber: /^\d{10}TQ\d{4}$/,
  routingNumber: /^\d{9}$/,
  accountNumber: /^\d{8,17}$/,
  username: /^[a-zA-Z0-9_]+$/
};

// User validation schemas
export const userSchemas = {
  // Personal information
  personalInfo: Joi.object({
    firstName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .label('First name')
      .messages(customMessages),
    
    lastName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .label('Last name')
      .messages(customMessages),
    
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .lowercase()
      .trim()
      .label('Email')
      .messages({
        ...customMessages,
        'string.email': 'Please enter a valid email address (e.g., user@example.com)'
      }),
    
    phoneNumber: Joi.string()
      .pattern(patterns.phone)
      .trim()
      .label('Phone number')
      .messages({
        ...customMessages,
        'string.pattern.base': 'Please enter a valid phone number (e.g., +1-234-567-8900)'
      }),
    
    username: Joi.string()
      .pattern(patterns.username)
      .min(3)
      .max(30)
      .trim()
      .label('Username')
      .messages({
        ...customMessages,
        'string.pattern.base': 'Username can only contain letters, numbers, and underscores'
      })
  }),

  // Password validation
  password: Joi.object({
    password: Joi.string()
      .min(8)
      .max(128)
      .required()
      .label('Password')
      .messages({
        ...customMessages,
        'string.min': 'Password must be at least 8 characters long'
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .label('Confirm password')
      .messages({
        ...customMessages,
        'any.only': 'Passwords do not match'
      })
  }),

  // Address validation
  address: Joi.object({
    type: Joi.string()
      .valid('home', 'work', 'other')
      .default('home')
      .label('Address type'),
    
    street: Joi.string()
      .trim()
      .min(1)
      .max(200)
      .required()
      .label('Street address')
      .messages(customMessages),
    
    city: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .label('City')
      .messages(customMessages),
    
    province: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .label('Province')
      .messages(customMessages),
    
    postalCode: Joi.alternatives()
      .try(
        Joi.string().pattern(patterns.postalCode).label('Canadian postal code'),
        Joi.string().pattern(patterns.indianPostalCode).label('Indian postal code')
      )
      .required()
      .label('Postal code')
      .messages({
        ...customMessages,
        'alternatives.match': 'Please enter a valid postal code (e.g., M5V 3A8 or 515671)'
      }),
    
    instructions: Joi.string()
      .trim()
      .max(200)
      .allow('')
      .label('Delivery instructions')
      .messages(customMessages),
    
    isDefault: Joi.boolean()
      .default(false)
      .label('Default address')
  })
};

// Restaurant validation schemas
export const restaurantSchemas = {
  // Basic restaurant info
  basicInfo: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .label('Restaurant name')
      .messages(customMessages),
    
    description: Joi.string()
      .trim()
      .max(500)
      .allow('')
      .label('Description')
      .messages(customMessages),
    
    cuisine: Joi.array()
      .items(Joi.string().trim())
      .min(1)
      .required()
      .label('Cuisine types')
      .messages({
        ...customMessages,
        'array.min': 'Please select at least one cuisine type'
      }),
    
    businessType: Joi.string()
      .valid('restaurant', 'cafe', 'bakery', 'food_truck', 'catering', 'other')
      .required()
      .label('Business type')
      .messages(customMessages),
    
    phone: Joi.string()
      .pattern(patterns.phone)
      .trim()
      .required()
      .label('Restaurant phone')
      .messages({
        ...customMessages,
        'string.pattern.base': 'Please enter a valid phone number'
      }),
    
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .lowercase()
      .trim()
      .required()
      .label('Restaurant email')
      .messages({
        ...customMessages,
        'string.email': 'Please enter a valid email address'
      }),
    
    website: Joi.string()
      .pattern(patterns.url)
      .trim()
      .allow('')
      .label('Website')
      .messages({
        ...customMessages,
        'string.pattern.base': 'Please enter a valid URL (e.g., https://yourrestaurant.com)'
      })
  }),

  // Operating hours
  operatingHours: Joi.object({
    monday: Joi.object({
      open: Joi.string().pattern(patterns.time).required().label('Opening time'),
      close: Joi.string().pattern(patterns.time).required().label('Closing time'),
      closed: Joi.boolean().default(false)
    }),
    tuesday: Joi.object({
      open: Joi.string().pattern(patterns.time).required().label('Opening time'),
      close: Joi.string().pattern(patterns.time).required().label('Closing time'),
      closed: Joi.boolean().default(false)
    }),
    wednesday: Joi.object({
      open: Joi.string().pattern(patterns.time).required().label('Opening time'),
      close: Joi.string().pattern(patterns.time).required().label('Closing time'),
      closed: Joi.boolean().default(false)
    }),
    thursday: Joi.object({
      open: Joi.string().pattern(patterns.time).required().label('Opening time'),
      close: Joi.string().pattern(patterns.time).required().label('Closing time'),
      closed: Joi.boolean().default(false)
    }),
    friday: Joi.object({
      open: Joi.string().pattern(patterns.time).required().label('Opening time'),
      close: Joi.string().pattern(patterns.time).required().label('Closing time'),
      closed: Joi.boolean().default(false)
    }),
    saturday: Joi.object({
      open: Joi.string().pattern(patterns.time).required().label('Opening time'),
      close: Joi.string().pattern(patterns.time).required().label('Closing time'),
      closed: Joi.boolean().default(false)
    }),
    sunday: Joi.object({
      open: Joi.string().pattern(patterns.time).required().label('Opening time'),
      close: Joi.string().pattern(patterns.time).required().label('Closing time'),
      closed: Joi.boolean().default(false)
    })
  }).messages({
    ...customMessages,
    'string.pattern.base': 'Please enter time in HH:MM format (e.g., 09:00)'
  }),

  // Delivery settings
  deliverySettings: Joi.object({
    radius: Joi.number()
      .min(1)
      .max(50)
      .required()
      .label('Delivery radius')
      .messages({
        ...customMessages,
        'number.min': 'Delivery radius must be at least 1 km',
        'number.max': 'Delivery radius cannot exceed 50 km'
      }),
    
    fee: Joi.number()
      .min(0)
      .required()
      .label('Delivery fee')
      .messages({
        ...customMessages,
        'number.min': 'Delivery fee cannot be negative'
      }),
    
    minOrderAmount: Joi.number()
      .min(0)
      .required()
      .label('Minimum order amount')
      .messages({
        ...customMessages,
        'number.min': 'Minimum order amount cannot be negative'
      }),
    
    avgDeliveryTime: Joi.number()
      .min(10)
      .max(120)
      .required()
      .label('Average delivery time')
      .messages({
        ...customMessages,
        'number.min': 'Average delivery time must be at least 10 minutes',
        'number.max': 'Average delivery time cannot exceed 120 minutes'
      })
  }),

  // Billing information
  billingInfo: Joi.object({
    businessName: Joi.string()
      .trim()
      .max(100)
      .allow('')
      .label('Business name')
      .messages(customMessages),
    
    billingAddress: Joi.object({
      street: Joi.string()
        .trim()
        .max(100)
        .allow('')
        .label('Billing street address')
        .messages(customMessages),
      
      city: Joi.string()
        .trim()
        .max(50)
        .allow('')
        .label('Billing city')
        .messages(customMessages),
      
      province: Joi.string()
        .trim()
        .max(50)
        .allow('')
        .label('Billing province')
        .messages(customMessages),
      
      postalCode: Joi.alternatives()
        .try(
          Joi.string().pattern(patterns.postalCode),
          Joi.string().pattern(patterns.indianPostalCode),
          Joi.string().allow('')
        )
        .label('Billing postal code')
        .messages({
          ...customMessages,
          'alternatives.match': 'Please enter a valid postal code'
        }),
      
      country: Joi.string()
        .trim()
        .max(50)
        .default('Canada')
        .label('Country')
        .messages(customMessages)
    }),
    
    paymentMethod: Joi.string()
      .trim()
      .max(100)
      .allow('')
      .label('Payment method')
      .messages(customMessages),
    
    bankAccountInfo: Joi.object({
      bankName: Joi.string()
        .trim()
        .max(100)
        .allow('')
        .label('Bank name')
        .messages(customMessages),
      
      accountType: Joi.string()
        .valid('checking', 'savings', 'business', '')
        .allow('')
        .label('Account type')
        .messages({
          ...customMessages,
          'any.only': 'Account type must be checking, savings, or business'
        }),
      
      routingNumber: Joi.alternatives()
        .try(
          Joi.string().pattern(patterns.routingNumber),
          Joi.string().allow('')
        )
        .label('Routing number')
        .messages({
          ...customMessages,
          'string.pattern.base': 'Routing number must be 9 digits'
        }),
      
      accountNumber: Joi.alternatives()
        .try(
          Joi.string().pattern(patterns.accountNumber),
          Joi.string().allow('')
        )
        .label('Account number')
        .messages({
          ...customMessages,
          'string.pattern.base': 'Account number must be 8-17 digits'
        })
    }),
    
    taxInfo: Joi.object({
      businessNumber: Joi.alternatives()
        .try(
          Joi.string().pattern(patterns.businessNumber),
          Joi.string().allow('')
        )
        .label('Business number')
        .messages({
          ...customMessages,
          'string.pattern.base': 'Please enter a valid Canadian business number (e.g., 123456789RP0001)'
        }),
      
      gstHstNumber: Joi.alternatives()
        .try(
          Joi.string().pattern(patterns.gstHstNumber),
          Joi.string().allow('')
        )
        .label('GST/HST number')
        .messages({
          ...customMessages,
          'string.pattern.base': 'Please enter a valid GST/HST number (e.g., 123456789RT0001)'
        }),
      
      qstNumber: Joi.alternatives()
        .try(
          Joi.string().pattern(patterns.qstNumber),
          Joi.string().allow('')
        )
        .label('QST number')
        .messages({
          ...customMessages,
          'string.pattern.base': 'Please enter a valid QST number (e.g., 1234567890TQ0001)'
        })
    }),
    
    contactInfo: Joi.object({
      billingEmail: Joi.alternatives()
        .try(
          Joi.string().email({ tlds: { allow: false } }),
          Joi.string().allow('')
        )
        .label('Billing email')
        .messages({
          ...customMessages,
          'string.email': 'Please enter a valid billing email'
        }),
      
      billingPhone: Joi.alternatives()
        .try(
          Joi.string().pattern(patterns.phone),
          Joi.string().allow('')
        )
        .label('Billing phone')
        .messages({
          ...customMessages,
          'string.pattern.base': 'Please enter a valid billing phone number'
        }),
      
      contactPerson: Joi.string()
        .trim()
        .max(100)
        .allow('')
        .label('Contact person')
        .messages(customMessages)
    })
  })
};

// Menu item validation schemas
export const menuItemSchemas = {
  // Basic menu item info
  basicInfo: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .label('Menu item name')
      .messages(customMessages),
    
    description: Joi.string()
      .trim()
      .min(1)
      .max(500)
      .required()
      .label('Description')
      .messages(customMessages),
    
    longDescription: Joi.string()
      .trim()
      .max(1000)
      .allow('')
      .label('Long description')
      .messages(customMessages),
    
    category: Joi.string()
      .valid(
        'appetizer', 'main', 'dessert', 'beverage', 'salad', 'soup',
        'pasta', 'pizza', 'burger', 'sandwich', 'seafood', 'vegetarian',
        'always-available', 'special'
      )
      .required()
      .label('Category')
      .messages(customMessages),
    
    cuisine: Joi.string()
      .trim()
      .lowercase()
      .required()
      .label('Cuisine')
      .messages(customMessages),
    
    price: Joi.number()
      .min(0)
      .precision(2)
      .required()
      .label('Price')
      .messages({
        ...customMessages,
        'number.min': 'Price cannot be negative'
      }),
    
    prepTime: Joi.number()
      .integer()
      .min(5)
      .max(180)
      .required()
      .label('Preparation time')
      .messages({
        ...customMessages,
        'number.min': 'Preparation time must be at least 5 minutes',
        'number.max': 'Preparation time cannot exceed 180 minutes'
      }),
    
    servings: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .label('Servings')
      .messages({
        ...customMessages,
        'number.min': 'Servings must be at least 1'
      }),
    
    spiceLevel: Joi.number()
      .integer()
      .min(0)
      .max(5)
      .default(0)
      .label('Spice level')
      .messages({
        ...customMessages,
        'number.min': 'Spice level cannot be less than 0',
        'number.max': 'Spice level cannot be more than 5'
      })
  }),

  // Dietary and ingredient info
  dietaryInfo: Joi.object({
    dietaryPreferences: Joi.array()
      .items(
        Joi.string().valid(
          'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'spicy',
          'keto', 'low-carb', 'halal', 'kosher'
        )
      )
      .unique()
      .label('Dietary preferences')
      .messages({
        ...customMessages,
        'array.unique': 'Duplicate dietary preferences are not allowed'
      }),
    
    ingredients: Joi.array()
      .items(
        Joi.string()
          .trim()
          .max(50)
          .messages({
            ...customMessages,
            'string.max': 'Each ingredient name cannot exceed 50 characters'
          })
      )
      .label('Ingredients')
      .messages(customMessages),
    
    allergens: Joi.array()
      .items(
        Joi.string().valid(
          'gluten', 'dairy', 'eggs', 'fish', 'shellfish', 'nuts',
          'peanuts', 'soy', 'sesame', 'alcohol', 'sulfites'
        )
      )
      .unique()
      .label('Allergens')
      .messages({
        ...customMessages,
        'array.unique': 'Duplicate allergens are not allowed'
      })
  }),

  // Nutrition information
  nutritionInfo: Joi.object({
    calories: Joi.number()
      .integer()
      .min(0)
      .allow(null)
      .label('Calories')
      .messages({
        ...customMessages,
        'number.min': 'Calories cannot be negative'
      }),
    
    protein: Joi.string()
      .trim()
      .allow('')
      .label('Protein')
      .messages(customMessages),
    
    carbs: Joi.string()
      .trim()
      .allow('')
      .label('Carbohydrates')
      .messages(customMessages),
    
    fat: Joi.string()
      .trim()
      .allow('')
      .label('Fat')
      .messages(customMessages)
  }),

  // Availability settings
  availability: Joi.object({
    status: Joi.string()
      .valid('available', 'unavailable', 'out-of-stock')
      .default('available')
      .label('Status')
      .messages(customMessages),
    
    monday: Joi.object({
      lunch: Joi.boolean().default(true),
      dinner: Joi.boolean().default(true)
    }),
    tuesday: Joi.object({
      lunch: Joi.boolean().default(true),
      dinner: Joi.boolean().default(true)
    }),
    wednesday: Joi.object({
      lunch: Joi.boolean().default(true),
      dinner: Joi.boolean().default(true)
    }),
    thursday: Joi.object({
      lunch: Joi.boolean().default(true),
      dinner: Joi.boolean().default(true)
    }),
    friday: Joi.object({
      lunch: Joi.boolean().default(true),
      dinner: Joi.boolean().default(true)
    }),
    saturday: Joi.object({
      lunch: Joi.boolean().default(true),
      dinner: Joi.boolean().default(true)
    }),
    sunday: Joi.object({
      lunch: Joi.boolean().default(true),
      dinner: Joi.boolean().default(true)
    })
  })
};

// Authentication schemas
export const authSchemas = {
  // OTP request
  otpRequest: Joi.object({
    identifier: Joi.alternatives()
      .try(
        Joi.string().email({ tlds: { allow: false } }).label('Email'),
        Joi.string().pattern(patterns.phone).label('Phone number')
      )
      .required()
      .label('Email or phone number')
      .messages({
        ...customMessages,
        'alternatives.match': 'Please enter a valid email address or phone number'
      }),
    
    channel: Joi.string()
      .valid('email', 'sms')
      .required()
      .label('Verification channel')
      .messages(customMessages)
  }),

  // OTP verification
  otpVerification: Joi.object({
    identifier: Joi.alternatives()
      .try(
        Joi.string().email({ tlds: { allow: false } }),
        Joi.string().pattern(patterns.phone)
      )
      .required()
      .label('Email or phone number')
      .messages({
        ...customMessages,
        'alternatives.match': 'Please enter a valid email address or phone number'
      }),
    
    otp: Joi.string()
      .length(6)
      .pattern(/^\d{6}$/)
      .required()
      .label('OTP')
      .messages({
        ...customMessages,
        'string.length': 'OTP must be exactly 6 digits',
        'string.pattern.base': 'OTP must contain only numbers'
      })
  }),

  // Login
  login: Joi.object({
    identifier: Joi.alternatives()
      .try(
        Joi.string().email({ tlds: { allow: false } }),
        Joi.string().pattern(patterns.phone),
        Joi.string().pattern(patterns.username)
      )
      .required()
      .label('Email, phone, or username')
      .messages({
        ...customMessages,
        'alternatives.match': 'Please enter a valid email, phone number, or username'
      }),
    
    password: Joi.string()
      .min(1)
      .required()
      .label('Password')
      .messages(customMessages)
  })
};

// Combined registration schemas
export const registrationSchemas = {
  // Business details step
  businessDetails: Joi.object({
    // Personal info
    ...userSchemas.personalInfo.describe().keys,
    ...userSchemas.password.describe().keys,
    
    // Restaurant basic info
    restaurantName: restaurantSchemas.basicInfo.extract('name').required(),
    description: restaurantSchemas.basicInfo.extract('description'),
    cuisine: Joi.string().required().label('Cuisine type').messages(customMessages),
    businessType: restaurantSchemas.basicInfo.extract('businessType'),
    
    // Address
    street: userSchemas.address.extract('street'),
    city: userSchemas.address.extract('city'),
    province: userSchemas.address.extract('province'),
    postalCode: userSchemas.address.extract('postalCode'),
    
    // Contact
    businessPhone: restaurantSchemas.basicInfo.extract('phone').label('Business phone'),
    businessEmail: restaurantSchemas.basicInfo.extract('email').allow('').label('Business email'),
    website: restaurantSchemas.basicInfo.extract('website'),
    
    // Delivery settings
    deliveryRadius: restaurantSchemas.deliverySettings.extract('radius'),
    deliveryFee: restaurantSchemas.deliverySettings.extract('fee'),
    minOrderAmount: restaurantSchemas.deliverySettings.extract('minOrderAmount'),
    avgDeliveryTime: restaurantSchemas.deliverySettings.extract('avgDeliveryTime'),
    
    // Business info
    businessLicense: Joi.string().trim().allow('').label('Business license'),
    taxId: Joi.string().trim().allow('').label('Tax ID')
  }),

  // Billing details step
  billingDetails: Joi.object({
    // Business info
    businessName: Joi.string().trim().max(100).required().label('Business name').messages(customMessages),
    contactPerson: Joi.string().trim().max(100).allow('').label('Contact person').messages(customMessages),
    billingEmail: Joi.string().email({ tlds: { allow: false } }).required().label('Billing email').messages(customMessages),
    billingPhone: Joi.string().pattern(patterns.phone).required().label('Billing phone').messages(customMessages),
    
    // Billing address
    billingStreet: Joi.string().trim().min(1).required().label('Billing street address').messages(customMessages),
    billingCity: Joi.string().trim().min(1).required().label('Billing city').messages(customMessages),
    billingProvince: Joi.string().trim().min(1).required().label('Billing province').messages(customMessages),
    billingPostalCode: userSchemas.address.extract('postalCode').label('Billing postal code'),
    billingCountry: Joi.string().trim().default('Canada').label('Billing country').messages(customMessages),
    
    // Bank info
    bankName: Joi.string().trim().min(1).required().label('Bank name').messages(customMessages),
    accountType: Joi.string().valid('checking', 'savings', 'business').default('business').label('Account type').messages(customMessages),
    routingNumber: Joi.string().pattern(patterns.routingNumber).required().label('Routing number').messages(customMessages),
    accountNumber: Joi.string().pattern(patterns.accountNumber).required().label('Account number').messages(customMessages),
    
    // Tax info (optional)
    businessNumber: Joi.alternatives().try(
      Joi.string().pattern(patterns.businessNumber),
      Joi.string().allow('')
    ).label('Business number').messages(customMessages),
    gstHstNumber: Joi.alternatives().try(
      Joi.string().pattern(patterns.gstHstNumber),
      Joi.string().allow('')
    ).label('GST/HST number').messages(customMessages),
    
    // Payment method
    paymentMethod: Joi.string().valid('bank_transfer', 'direct_deposit', 'check').default('bank_transfer').label('Payment method').messages(customMessages)
  })
};

// Export all schemas
export default {
  userSchemas,
  restaurantSchemas,
  menuItemSchemas,
  authSchemas,
  registrationSchemas,
  patterns,
  customMessages
};
