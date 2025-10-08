// FILE: src/middlewares/joiValidation.js
const Joi = require('joi');

// Middleware to handle Joi validation
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Handle different schema structures
      let validationSchema;
      
      if (schema.body) {
        // Schema has body property (e.g., { body: Joi.object({...}) })
        validationSchema = schema.body;
      } else if (typeof schema.validate === 'function') {
        // Schema is a direct Joi schema
        validationSchema = schema;
      } else {
        console.error('Invalid schema structure:', schema);
        return res.status(500).json({
          status: 'error',
          message: 'Invalid validation schema configuration'
        });
      }

      const { error, value } = validationSchema.validate(req.body, { 
        abortEarly: false, // Return all errors, not just the first one
        allowUnknown: true, // Allow unknown fields
        stripUnknown: true // Remove unknown fields
      });

      if (error) {
        const formattedErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/"/g, ''), // Remove quotes from error messages
          value: detail.context?.value
        }));

        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: formattedErrors
        });
      }

      // Replace req.body with validated and sanitized data
      req.body = value;
      next();
    } catch (err) {
      console.error('Validation middleware error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal validation error',
        details: err.message
      });
    }
  };
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'First name is required',
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .min(6)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),
    
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    
    role: Joi.string()
      .valid('customer', 'partner')
      .default('customer')
      .messages({
        'any.only': 'Role must be either customer or partner'
      })
  }),

  login: Joi.object({
    identifier: Joi.string()
      .required()
      .custom((value, helpers) => {
        // Check if it's a valid email
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        // Check if it's a valid phone number (E.164 format)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        
        if (!emailRegex.test(value) && !phoneRegex.test(value)) {
          return helpers.error('identifier.invalid');
        }
        
        return value;
      })
      .messages({
        'string.empty': 'Email or phone number is required',
        'any.required': 'Email or phone number is required',
        'identifier.invalid': 'Please provide a valid email address or phone number'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
      })
  }),

  requestOTP: Joi.object({
    identifier: Joi.string()
      .required()
      .custom((value, helpers) => {
        // Check if it's a valid email
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        // Check if it's a valid phone number (E.164 format)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        
        if (!emailRegex.test(value) && !phoneRegex.test(value)) {
          return helpers.error('identifier.invalid');
        }
        return value;
      })
      .messages({
        'string.empty': 'Email or phone number is required',
        'any.required': 'Email or phone number is required',
        'identifier.invalid': 'Please provide a valid email address or phone number'
      }),
    
    channel: Joi.string()
      .valid('email', 'sms')
      .required()
      .messages({
        'string.empty': 'Channel is required',
        'any.only': 'Channel must be either email or sms',
        'any.required': 'Channel is required'
      })
  }),

  verifyOTP: Joi.object({
    identifier: Joi.string()
      .required()
      .custom((value, helpers) => {
        // Check if it's a valid email
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        // Check if it's a valid phone number (E.164 format)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        
        if (!emailRegex.test(value) && !phoneRegex.test(value)) {
          return helpers.error('identifier.invalid');
        }
        return value;
      })
      .messages({
        'string.empty': 'Email or phone number is required',
        'any.required': 'Email or phone number is required',
        'identifier.invalid': 'Please provide a valid email address or phone number'
      }),
    
    otp: Joi.string()
      .length(6)
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.empty': 'OTP is required',
        'string.length': 'OTP must be exactly 6 digits',
        'string.pattern.base': 'OTP must contain only numbers',
        'any.required': 'OTP is required'
      }),
    
    userType: Joi.string()
      .valid('customer', 'partner')
      .optional()
      .messages({
        'any.only': 'User type must be either customer or partner'
      }),
    
    firstName: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'First name is required',
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      }),
    
    email: Joi.string()
      .email()
      .optional()
      .allow('')
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    
    phoneNumber: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
      }),
    
    username: Joi.string()
      .min(3)
      .max(30)
      .alphanum()
      .optional()
      .allow('')
      .messages({
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'string.alphanum': 'Username must contain only letters and numbers'
      })
  }),

  // Partner-specific OTP verification (includes userType)
  verifyPartnerOTP: Joi.object({
    identifier: Joi.string()
      .required()
      .custom((value, helpers) => {
        // Check if it's a valid email
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        // Check if it's a valid phone number (E.164 format)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        
        if (!emailRegex.test(value) && !phoneRegex.test(value)) {
          return helpers.error('identifier.invalid');
        }
        return value;
      })
      .messages({
        'string.empty': 'Email or phone number is required',
        'any.required': 'Email or phone number is required',
        'identifier.invalid': 'Please provide a valid email address or phone number'
      }),
    
    otp: Joi.string()
      .length(6)
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.empty': 'OTP is required',
        'string.length': 'OTP must be exactly 6 digits',
        'string.pattern.base': 'OTP must contain only numbers',
        'any.required': 'OTP is required'
      }),
    
    userType: Joi.string()
      .valid('customer', 'partner')
      .default('partner')
      .messages({
        'any.only': 'User type must be either customer or partner'
      }),
    
    firstName: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'First name is required',
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      }),
    
    email: Joi.string()
      .email()
      .optional()
      .allow('')
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    
    phoneNumber: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
      }),
    
    username: Joi.string()
      .min(3)
      .max(30)
      .alphanum()
      .optional()
      .allow('')
      .messages({
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'string.alphanum': 'Username must contain only letters and numbers'
      }),
    
    // Restaurant details for partner accounts
    restaurantDetails: Joi.object({
      restaurantName: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .required()
        .messages({
          'string.empty': 'Restaurant name is required',
          'string.min': 'Restaurant name must be at least 2 characters long',
          'string.max': 'Restaurant name cannot exceed 100 characters',
          'any.required': 'Restaurant name is required for partner accounts'
        }),
      
      businessType: Joi.string()
        .valid('restaurant', 'cafe', 'bakery', 'food_truck', 'catering', 'other')
        .required()
        .messages({
          'any.only': 'Business type must be one of: restaurant, cafe, bakery, food_truck, catering, other',
          'any.required': 'Business type is required for partner accounts'
        }),
      
      cuisineType: Joi.array()
        .items(Joi.string().trim())
        .min(1)
        .required()
        .messages({
          'array.min': 'At least one cuisine type is required',
          'any.required': 'Cuisine type is required for partner accounts'
        }),
      
      businessAddress: Joi.object({
        street: Joi.string().trim().required(),
        city: Joi.string().trim().required(),
        province: Joi.string().trim().required(),
        postalCode: Joi.string().trim().required()
      }).required(),
      
      businessPhone: Joi.string().trim().required(),
      businessEmail: Joi.string().email().trim().required(),
      website: Joi.string().uri().trim().optional().allow(''),
      description: Joi.string().max(500).trim().optional().allow(''),
      averageOrderValue: Joi.number().min(0).optional(),
      monthlyOrderVolume: Joi.number().min(0).optional(),
      hasDelivery: Joi.boolean().optional(),
      deliveryRadius: Joi.number().min(0).optional(),
      businessLicense: Joi.string().trim().optional().allow(''),
      taxId: Joi.string().trim().optional().allow('')
    }).when('userType', {
      is: 'partner',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  })
};

// Restaurant validation schemas
const restaurantSchemas = {
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.empty': 'Restaurant name is required',
        'string.min': 'Restaurant name must be at least 2 characters long',
        'string.max': 'Restaurant name cannot exceed 100 characters',
        'any.required': 'Restaurant name is required'
      }),
    
    description: Joi.string()
      .max(500)
      .trim()
      .optional()
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    
    cuisine: Joi.string()
      .trim()
      .required()
      .messages({
        'string.empty': 'Cuisine type is required',
        'any.required': 'Cuisine type is required'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .required()
      .messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Please provide a valid phone number',
        'any.required': 'Phone number is required'
      }),
    
    address: Joi.object({
      street: Joi.string().trim().required().messages({
        'string.empty': 'Street address is required',
        'any.required': 'Street address is required'
      }),
      city: Joi.string().trim().required().messages({
        'string.empty': 'City is required',
        'any.required': 'City is required'
      }),
      province: Joi.string().trim().required().messages({
        'string.empty': 'Province is required',
        'any.required': 'Province is required'
      }),
      postalCode: Joi.string().trim().required().messages({
        'string.empty': 'Postal code is required',
        'any.required': 'Postal code is required'
      })
    }).required(),
    
    deliverySettings: Joi.object({
      radius: Joi.number().min(1).max(50).required().messages({
        'number.min': 'Delivery radius must be at least 1 km',
        'number.max': 'Delivery radius cannot exceed 50 km',
        'any.required': 'Delivery radius is required'
      }),
      fee: Joi.number().min(0).required().messages({
        'number.min': 'Delivery fee must be a positive number',
        'any.required': 'Delivery fee is required'
      }),
      minOrderAmount: Joi.number().min(0).required().messages({
        'number.min': 'Minimum order amount must be a positive number',
        'any.required': 'Minimum order amount is required'
      }),
      avgDeliveryTime: Joi.number().min(10).max(120).required().messages({
        'number.min': 'Average delivery time must be at least 10 minutes',
        'number.max': 'Average delivery time cannot exceed 120 minutes',
        'any.required': 'Average delivery time is required'
      })
    }).required()
  })
};

// Partner registration validation schema
const partnerSchemas = {
  // Partner OTP verification with comprehensive restaurant details
  verifyPartnerOTP: Joi.object({
    // OTP verification fields
    identifier: Joi.string()
      .required()
      .custom((value, helpers) => {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        
        if (!emailRegex.test(value) && !phoneRegex.test(value)) {
          return helpers.error('identifier.invalid');
        }
        return value;
      })
      .messages({
        'string.empty': 'Email or phone number is required',
        'any.required': 'Email or phone number is required',
        'identifier.invalid': 'Please provide a valid email address or phone number'
      }),
    
    otp: Joi.string()
      .length(6)
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.empty': 'OTP is required',
        'string.length': 'OTP must be exactly 6 digits',
        'string.pattern.base': 'OTP must contain only numbers',
        'any.required': 'OTP is required'
      }),
    
    // Flags for different verification modes
    verifyOnly: Joi.boolean().optional(),
    skipOtpVerification: Joi.boolean().optional(),
    
    // User details (optional when verifyOnly is true)
    firstName: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .when('verifyOnly', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required()
      })
      .messages({
        'string.empty': 'First name is required',
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .when('verifyOnly', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required()
      })
      .messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      }),
    
    email: Joi.string()
      .email()
      .optional()
      .allow('')
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    
    phoneNumber: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    
    password: Joi.string()
      .min(6)
      .when('verifyOnly', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required()
      })
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
      }),
    
    // Restaurant details (flat structure - optional when verifyOnly is true)
    restaurantName: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .when('verifyOnly', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required()
      })
      .messages({
        'string.empty': 'Restaurant name is required',
        'string.min': 'Restaurant name must be at least 2 characters long',
        'string.max': 'Restaurant name cannot exceed 100 characters',
        'any.required': 'Restaurant name is required'
      }),
    
    description: Joi.string()
      .max(500)
      .trim()
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    
    cuisine: Joi.alternatives()
      .try(
        Joi.string().trim(),
        Joi.array().items(Joi.string().trim()).min(1)
      )
      .when('verifyOnly', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required()
      })
      .messages({
        'alternatives.match': 'Cuisine must be a string or array of strings',
        'array.min': 'At least one cuisine type is required',
        'any.required': 'Cuisine type is required'
      }),
    
    businessType: Joi.string()
      .valid('restaurant', 'cafe', 'bakery', 'food_truck', 'catering', 'other')
      .when('verifyOnly', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required()
      })
      .messages({
        'any.only': 'Business type must be one of: restaurant, cafe, bakery, food_truck, catering, other',
        'any.required': 'Business type is required'
      }),
    
    cuisineType: Joi.alternatives()
      .try(
        Joi.string().trim(),
        Joi.array().items(Joi.string().trim())
      )
      .when('verifyOnly', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required()
      })
      .messages({
        'any.required': 'Cuisine type is required'
      }),
    
    // Address fields (optional when verifyOnly is true)
    street: Joi.string()
      .trim()
      .when('verifyOnly', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required()
      })
      .messages({
        'string.empty': 'Street address is required',
        'any.required': 'Street address is required'
      }),
    
    city: Joi.string()
      .trim()
      .when('verifyOnly', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required()
      })
      .messages({
        'string.empty': 'City is required',
        'any.required': 'City is required'
      }),
    
    province: Joi.string()
      .trim()
      .when('verifyOnly', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required()
      })
      .messages({
        'string.empty': 'Province is required',
        'any.required': 'Province is required'
      }),
    
    postalCode: Joi.string()
      .trim()
      .when('verifyOnly', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required()
      })
      .messages({
        'string.empty': 'Postal code is required',
        'any.required': 'Postal code is required'
      }),
    
    // Contact details (optional when verifyOnly is true)
    businessPhone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .when('verifyOnly', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required()
      })
      .messages({
        'string.empty': 'Business phone is required',
        'string.pattern.base': 'Please provide a valid business phone number',
        'any.required': 'Business phone is required'
      }),
    
    businessEmail: Joi.string()
      .email()
      .optional()
      .allow('')
      .messages({
        'string.email': 'Please provide a valid business email address'
      }),
    
    website: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Please provide a valid website URL'
      }),
    
    // Operating hours (optional, will use defaults if not provided)
    operatingHours: Joi.object({
      monday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean().default(false)
      }),
      tuesday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean().default(false)
      }),
      wednesday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean().default(false)
      }),
      thursday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean().default(false)
      }),
      friday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean().default(false)
      }),
      saturday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean().default(false)
      }),
      sunday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean().default(false)
      })
    }).optional(),
    
    // Delivery settings
    deliveryRadius: Joi.number()
      .min(1)
      .max(50)
      .optional()
      .messages({
        'number.min': 'Delivery radius must be at least 1 km',
        'number.max': 'Delivery radius cannot exceed 50 km'
      }),
    
    deliveryFee: Joi.number()
      .min(0)
      .optional()
      .messages({
        'number.min': 'Delivery fee must be a positive number'
      }),
    
    minOrderAmount: Joi.number()
      .min(0)
      .optional()
      .messages({
        'number.min': 'Minimum order amount must be a positive number'
      }),
    
    avgDeliveryTime: Joi.number()
      .min(10)
      .max(120)
      .optional()
      .messages({
        'number.min': 'Average delivery time must be at least 10 minutes',
        'number.max': 'Average delivery time cannot exceed 120 minutes'
      }),
    
    // Business info
    businessLicense: Joi.string()
      .trim()
      .optional()
      .allow(''),
    
    taxId: Joi.string()
      .trim()
      .optional()
      .allow('')
  }),
  
  register: Joi.object({
    // User details
    firstName: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'First name is required',
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      }),
    
    email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    phoneNumber: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required()
      .messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Please provide a valid phone number',
        'any.required': 'Phone number is required'
      }),
    
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    
    // Restaurant details
    restaurantName: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.empty': 'Restaurant name is required',
        'string.min': 'Restaurant name must be at least 2 characters long',
        'string.max': 'Restaurant name cannot exceed 100 characters',
        'any.required': 'Restaurant name is required'
      }),
    
    description: Joi.string()
      .max(500)
      .trim()
      .optional()
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    
    cuisine: Joi.string()
      .trim()
      .required()
      .messages({
        'string.empty': 'Cuisine type is required',
        'any.required': 'Cuisine type is required'
      }),
    
    businessType: Joi.string()
      .valid('restaurant', 'cafe', 'bakery', 'food_truck', 'catering', 'other')
      .required()
      .messages({
        'any.only': 'Business type must be one of: restaurant, cafe, bakery, food_truck, catering, other',
        'any.required': 'Business type is required'
      }),
    
    cuisineType: Joi.alternatives()
      .try(
        Joi.string().trim(),
        Joi.array().items(Joi.string().trim())
      )
      .required()
      .messages({
        'any.required': 'Cuisine type is required'
      }),
    
    // Address
    street: Joi.string()
      .trim()
      .required()
      .messages({
        'string.empty': 'Street address is required',
        'any.required': 'Street address is required'
      }),
    
    city: Joi.string()
      .trim()
      .required()
      .messages({
        'string.empty': 'City is required',
        'any.required': 'City is required'
      }),
    
    province: Joi.string()
      .trim()
      .required()
      .messages({
        'string.empty': 'Province is required',
        'any.required': 'Province is required'
      }),
    
    postalCode: Joi.string()
      .trim()
      .required()
      .messages({
        'string.empty': 'Postal code is required',
        'any.required': 'Postal code is required'
      }),
    
    // Contact details
    businessPhone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .required()
      .messages({
        'string.empty': 'Business phone is required',
        'string.pattern.base': 'Please provide a valid business phone number',
        'any.required': 'Business phone is required'
      }),
    
    businessEmail: Joi.string()
      .email()
      .lowercase()
      .trim()
      .optional()
      .messages({
        'string.email': 'Please provide a valid business email address'
      }),
    
    website: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Please provide a valid website URL'
      }),
    
    // Operating hours (optional, will use defaults if not provided)
    operatingHours: Joi.object({
      monday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean().default(false)
      }),
      tuesday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean().default(false)
      }),
      wednesday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean().default(false)
      }),
      thursday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean().default(false)
      }),
      friday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean().default(false)
      }),
      saturday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean().default(false)
      }),
      sunday: Joi.object({
        open: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean().default(false)
      })
    }).optional(),
    
    // Delivery settings
    deliveryRadius: Joi.number()
      .min(1)
      .max(50)
      .default(5)
      .messages({
        'number.min': 'Delivery radius must be at least 1 km',
        'number.max': 'Delivery radius cannot exceed 50 km'
      }),
    
    deliveryFee: Joi.number()
      .min(0)
      .default(0)
      .messages({
        'number.min': 'Delivery fee must be a positive number'
      }),
    
    minOrderAmount: Joi.number()
      .min(0)
      .default(0)
      .messages({
        'number.min': 'Minimum order amount must be a positive number'
      }),
    
    avgDeliveryTime: Joi.number()
      .min(10)
      .max(120)
      .default(30)
      .messages({
        'number.min': 'Average delivery time must be at least 10 minutes',
        'number.max': 'Average delivery time cannot exceed 120 minutes'
      }),
    
    // Business info
    businessLicenseText: Joi.string()
      .trim()
      .optional(),
    
    taxId: Joi.string()
      .trim()
      .optional()
  })
};

module.exports = {
  validateRequest,
  userSchemas,
  restaurantSchemas,
  partnerSchemas
};
