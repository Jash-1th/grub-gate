// FILE: src/middlewares/joiValidation.js
const Joi = require('joi');

// Middleware to handle Joi validation
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { 
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

    next();
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
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
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

module.exports = {
  validateRequest,
  userSchemas,
  restaurantSchemas
};
