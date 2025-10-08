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
    
    phoneNumber: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required()
      .messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Please provide a valid phone number',
        'any.required': 'Phone number is required'
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
    
    // Flag for OTP-only verification (like partner flow)
    verifyOnly: Joi.boolean().optional(),
    
    firstName: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .when('verifyOnly', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.optional()
      })
      .messages({
        'string.empty': 'First name is required',
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters'
      }),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .when('verifyOnly', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.optional()
      })
      .messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters'
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

  // Simple OTP verification (just check if user exists)
  verifyOTPOnly: Joi.object({
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
      .when('skipOtpVerification', {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required()
      })
      .messages({
        'string.empty': 'OTP is required',
        'string.length': 'OTP must be exactly 6 digits',
        'string.pattern.base': 'OTP must contain only numbers',
        'any.required': 'OTP is required'
      }),
    
    // Flags for different verification modes
    verifyOnly: Joi.boolean().optional(),
    skipOtpVerification: Joi.boolean().optional(),
    otpVerificationToken: Joi.string().optional(),
    
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
  }),

  // Stage 3: Complete Partner Billing Information
  completePartnerBilling: Joi.object({
    // Verification fields
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

    otpVerificationToken: Joi.string()
      .required()
      .messages({
        'string.empty': 'Verification token is required',
        'any.required': 'Verification token is required'
      }),

    // Business billing info
    businessName: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.empty': 'Business name is required',
        'string.min': 'Business name must be at least 2 characters',
        'string.max': 'Business name cannot exceed 100 characters',
        'any.required': 'Business name is required'
      }),

    billingEmail: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Billing email is required',
        'string.email': 'Please provide a valid billing email address',
        'any.required': 'Billing email is required'
      }),

    billingPhone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .required()
      .messages({
        'string.empty': 'Billing phone is required',
        'string.pattern.base': 'Please provide a valid billing phone number',
        'any.required': 'Billing phone is required'
      }),

    contactPerson: Joi.string()
      .max(100)
      .trim()
      .optional(),

    // Billing address
    billingStreet: Joi.string()
      .min(5)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.empty': 'Billing street address is required',
        'string.min': 'Street address must be at least 5 characters',
        'string.max': 'Street address cannot exceed 100 characters',
        'any.required': 'Billing street address is required'
      }),

    billingCity: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'Billing city is required',
        'string.min': 'City must be at least 2 characters',
        'string.max': 'City cannot exceed 50 characters',
        'any.required': 'Billing city is required'
      }),

    billingProvince: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'Billing province is required',
        'string.min': 'Province must be at least 2 characters',
        'string.max': 'Province cannot exceed 50 characters',
        'any.required': 'Billing province is required'
      }),

    billingPostalCode: Joi.string()
      .pattern(/^[A-Z]\d[A-Z] \d[A-Z]\d$/)
      .required()
      .messages({
        'string.empty': 'Billing postal code is required',
        'string.pattern.base': 'Please provide a valid Canadian postal code (e.g., H3A 1B2)',
        'any.required': 'Billing postal code is required'
      }),

    billingCountry: Joi.string()
      .max(50)
      .trim()
      .default('Canada')
      .optional(),

    // Bank account info
    bankName: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.empty': 'Bank name is required',
        'string.min': 'Bank name must be at least 2 characters',
        'string.max': 'Bank name cannot exceed 100 characters',
        'any.required': 'Bank name is required'
      }),

    accountType: Joi.string()
      .valid('checking', 'savings', 'business')
      .required()
      .messages({
        'string.empty': 'Account type is required',
        'any.only': 'Account type must be checking, savings, or business',
        'any.required': 'Account type is required'
      }),

    routingNumber: Joi.string()
      .pattern(/^\d{9}$/)
      .required()
      .messages({
        'string.empty': 'Routing number is required',
        'string.pattern.base': 'Routing number must be exactly 9 digits',
        'any.required': 'Routing number is required'
      }),

    accountNumber: Joi.string()
      .pattern(/^\d{8,17}$/)
      .required()
      .messages({
        'string.empty': 'Account number is required',
        'string.pattern.base': 'Account number must be 8-17 digits',
        'any.required': 'Account number is required'
      }),

    // Tax info (optional)
    businessNumber: Joi.string()
      .pattern(/^\d{9}RP\d{4}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please enter a valid Canadian business number (e.g., 123456789RP0001)'
      }),

    gstHstNumber: Joi.string()
      .pattern(/^\d{9}RT\d{4}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please enter a valid GST/HST number (e.g., 123456789RT0001)'
      }),

    // Payment method
    paymentMethod: Joi.string()
      .valid('bank_transfer', 'direct_deposit', 'check')
      .default('bank_transfer')
      .optional()
  })
};

// Subscription Meal Plan validation schemas
const subscriptionMealPlanSchemas = {
  // Create subscription meal plan
  createPlan: Joi.object({
    subscriptionId: Joi.string()
      .required()
      .messages({
        'string.empty': 'Subscription ID is required',
        'any.required': 'Subscription ID is required'
      }),
    
    restaurantId: Joi.string()
      .required()
      .messages({
        'string.empty': 'Restaurant ID is required',
        'any.required': 'Restaurant ID is required'
      }),
    
    planType: Joi.string()
      .valid('bi-weekly', 'monthly', 'quarterly')
      .default('bi-weekly')
      .messages({
        'any.only': 'Plan type must be bi-weekly, monthly, or quarterly'
      }),
    
    deliveryAddress: Joi.object({
      street: Joi.string()
        .min(5)
        .max(200)
        .trim()
        .required()
        .messages({
          'string.empty': 'Street address is required',
          'string.min': 'Street address must be at least 5 characters',
          'string.max': 'Street address cannot exceed 200 characters',
          'any.required': 'Street address is required'
        }),
      
      city: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .required()
        .messages({
          'string.empty': 'City is required',
          'string.min': 'City must be at least 2 characters',
          'string.max': 'City cannot exceed 100 characters',
          'any.required': 'City is required'
        }),
      
      province: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .messages({
          'string.empty': 'Province is required',
          'string.min': 'Province must be at least 2 characters',
          'string.max': 'Province cannot exceed 50 characters',
          'any.required': 'Province is required'
        }),
      
      postalCode: Joi.string()
        .pattern(/^[A-Z]\d[A-Z] \d[A-Z]\d$/)
        .required()
        .messages({
          'string.empty': 'Postal code is required',
          'string.pattern.base': 'Please provide a valid Canadian postal code (e.g., H3A 1B2)',
          'any.required': 'Postal code is required'
        }),
      
      instructions: Joi.string()
        .max(200)
        .trim()
        .optional()
        .messages({
          'string.max': 'Delivery instructions cannot exceed 200 characters'
        })
    }).optional(),
    
    specialInstructions: Joi.string()
      .max(500)
      .trim()
      .optional()
      .messages({
        'string.max': 'Special instructions cannot exceed 500 characters'
      })
  }),
  
  // Update meal plan
  updatePlan: Joi.object({
    action: Joi.string()
      .valid('add', 'remove', 'clearWeek')
      .required()
      .messages({
        'string.empty': 'Action is required',
        'any.only': 'Action must be add, remove, or clearWeek',
        'any.required': 'Action is required'
      }),
    
    weekIndex: Joi.number()
      .integer()
      .min(0)
      .when('action', {
        is: Joi.valid('add', 'remove', 'clearWeek'),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'number.base': 'Week index must be a number',
        'number.integer': 'Week index must be an integer',
        'number.min': 'Week index must be 0 or greater',
        'any.required': 'Week index is required for this action'
      }),
    
    day: Joi.string()
      .valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
      .when('action', {
        is: Joi.valid('add', 'remove'),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'string.empty': 'Day is required',
        'any.only': 'Day must be a valid day of the week',
        'any.required': 'Day is required for add/remove actions'
      }),
    
    mealType: Joi.string()
      .valid('lunch', 'dinner')
      .when('action', {
        is: Joi.valid('add', 'remove'),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'string.empty': 'Meal type is required',
        'any.only': 'Meal type must be lunch or dinner',
        'any.required': 'Meal type is required for add/remove actions'
      }),
    
    menuItemId: Joi.string()
      .when('action', {
        is: 'add',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'string.empty': 'Menu item ID is required',
        'any.required': 'Menu item ID is required for add action'
      }),
    
    deliveryTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .when('action', {
        is: 'add',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'string.empty': 'Delivery time is required',
        'string.pattern.base': 'Please enter time in HH:MM format',
        'any.required': 'Delivery time is required for add action'
      }),
    
    planItemId: Joi.string()
      .when('action', {
        is: 'remove',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'string.empty': 'Plan item ID is required',
        'any.required': 'Plan item ID is required for remove action'
      })
  }),
  
  // Update meal plan status
  updateStatus: Joi.object({
    status: Joi.string()
      .valid('active', 'paused', 'completed', 'cancelled')
      .required()
      .messages({
        'string.empty': 'Status is required',
        'any.only': 'Status must be active, paused, completed, or cancelled',
        'any.required': 'Status is required'
      }),
    
    reason: Joi.string()
      .max(200)
      .trim()
      .optional()
      .messages({
        'string.max': 'Reason cannot exceed 200 characters'
      })
  }),
  
  // Update delivery address
  updateAddress: Joi.object({
    street: Joi.string()
      .min(5)
      .max(200)
      .trim()
      .required()
      .messages({
        'string.empty': 'Street address is required',
        'string.min': 'Street address must be at least 5 characters',
        'string.max': 'Street address cannot exceed 200 characters',
        'any.required': 'Street address is required'
      }),
    
    city: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.empty': 'City is required',
        'string.min': 'City must be at least 2 characters',
        'string.max': 'City cannot exceed 100 characters',
        'any.required': 'City is required'
      }),
    
    province: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'Province is required',
        'string.min': 'Province must be at least 2 characters',
        'string.max': 'Province cannot exceed 50 characters',
        'any.required': 'Province is required'
      }),
    
    postalCode: Joi.string()
      .pattern(/^[A-Z]\d[A-Z] \d[A-Z]\d$/)
      .required()
      .messages({
        'string.empty': 'Postal code is required',
        'string.pattern.base': 'Please provide a valid Canadian postal code (e.g., H3A 1B2)',
        'any.required': 'Postal code is required'
      }),
    
    instructions: Joi.string()
      .max(200)
      .trim()
      .optional()
      .messages({
        'string.max': 'Delivery instructions cannot exceed 200 characters'
      })
  })
};

module.exports = {
  validateRequest,
  userSchemas,
  restaurantSchemas,
  partnerSchemas,
  subscriptionMealPlanSchemas
};
