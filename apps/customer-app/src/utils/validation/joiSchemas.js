// FILE: apps/customer-app/src/utils/validation/joiSchemas.js

import Joi from 'joi';

/**
 * Joi validation schemas for customer app forms
 * These schemas match the backend User model validation rules
 */

// Custom validation patterns matching backend
const VALIDATION_PATTERNS = {
  email: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  phoneNumber: /^\+?[1-9]\d{1,14}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  canadianPostal: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
  indianPostal: /^\d{6}$/,
  usZip: /^\d{5}(-\d{4})?$/
};

// User registration schema (matches backend User model)
export const userRegistrationSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .pattern(/^[a-zA-Z\s'-]+$/)
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 1 character long',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters, spaces, hyphens, and apostrophes',
      'any.required': 'First name is required'
    }),
    
  lastName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .pattern(/^[a-zA-Z\s'-]+$/)
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 1 character long',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters, spaces, hyphens, and apostrophes',
      'any.required': 'Last name is required'
    }),
    
  email: Joi.string()
    .trim()
    .lowercase()
    .pattern(VALIDATION_PATTERNS.email)
    .required()
    .messages({
      'string.empty': 'Email address is required',
      'string.pattern.base': 'Please enter a valid email address (e.g., user@example.com)',
      'any.required': 'Email address is required'
    }),
    
  password: Joi.string()
    .min(6)
    .pattern(VALIDATION_PATTERNS.password)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
    
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'string.empty': 'Please confirm your password',
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your password'
    }),
    
  phoneNumber: Joi.string()
    .trim()
    .pattern(VALIDATION_PATTERNS.phoneNumber)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number (e.g., +1-234-567-8900)'
    }),
    
  role: Joi.string()
    .valid('customer', 'partner', 'admin')
    .default('customer')
    .messages({
      'any.only': 'Invalid user role'
    })
});

// Simplified signup schema for modal (name field combines firstName + lastName)
export const signupModalSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .pattern(/^[a-zA-Z\s'-]+\s+[a-zA-Z\s'-]+$/)
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'string.pattern.base': 'Please enter both first and last name (e.g., John Doe)',
      'any.required': 'Full name is required'
    }),
    
  email: Joi.string()
    .trim()
    .lowercase()
    .pattern(VALIDATION_PATTERNS.email)
    .required()
    .messages({
      'string.empty': 'Email address is required',
      'string.pattern.base': 'Please enter a valid email address (e.g., user@example.com)',
      'any.required': 'Email address is required'
    }),
    
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'string.empty': 'Please confirm your password',
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your password'
    })
});

// Login schema
export const loginSchema = Joi.object({
  identifier: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      const isEmail = VALIDATION_PATTERNS.email.test(value);
      const isPhone = VALIDATION_PATTERNS.phoneNumber.test(value);
      
      if (!isEmail && !isPhone) {
        return helpers.error('identifier.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'Email or phone number is required',
      'any.required': 'Email or phone number is required',
      'identifier.invalid': 'Please enter a valid email address or phone number'
    }),
    
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    })
});

// OTP verification schema
export const otpVerificationSchema = Joi.object({
  identifier: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      const isEmail = VALIDATION_PATTERNS.email.test(value);
      const isPhone = VALIDATION_PATTERNS.phoneNumber.test(value);
      
      if (!isEmail && !isPhone) {
        return helpers.error('identifier.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'Email or phone number is required',
      'any.required': 'Email or phone number is required',
      'identifier.invalid': 'Please enter a valid email address or phone number'
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
    })
});

// Address schema (matches backend User.addresses)
export const addressSchema = Joi.object({
  type: Joi.string()
    .valid('home', 'work', 'other')
    .default('home')
    .messages({
      'any.only': 'Address type must be home, work, or other'
    }),
    
  street: Joi.string()
    .trim()
    .min(2)
    .required()
    .messages({
      'string.empty': 'Street address is required',
      'string.min': 'Street address must be at least 2 characters',
      'any.required': 'Street address is required'
    }),
    
  city: Joi.string()
    .trim()
    .min(2)
    .required()
    .messages({
      'string.empty': 'City is required',
      'string.min': 'City must be at least 2 characters',
      'any.required': 'City is required'
    }),
    
  province: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Province/State is required',
      'any.required': 'Province/State is required'
    }),
    
  postalCode: Joi.string()
    .trim()
    .uppercase()
    .custom((value, helpers) => {
      const country = helpers.state.ancestors[0].country || 'CA';
      let isValid = false;
      
      switch (country) {
        case 'CA':
          isValid = VALIDATION_PATTERNS.canadianPostal.test(value);
          break;
        case 'US':
          isValid = VALIDATION_PATTERNS.usZip.test(value);
          break;
        case 'IN':
          isValid = VALIDATION_PATTERNS.indianPostal.test(value);
          break;
        default:
          isValid = value.length >= 3; // Basic validation for other countries
      }
      
      if (!isValid) {
        return helpers.error('postalCode.invalid');
      }
      return value;
    })
    .required()
    .messages({
      'string.empty': 'Postal code is required',
      'postalCode.invalid': 'Please enter a valid postal code for your country',
      'any.required': 'Postal code is required'
    }),
    
  country: Joi.string()
    .trim()
    .uppercase()
    .valid('CA', 'US', 'IN', 'UK', 'AU', 'DE', 'FR', 'JP', 'BR', 'MX')
    .default('CA')
    .messages({
      'any.only': 'Please select a supported country'
    }),
    
  coordinates: Joi.object({
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180)
  }).optional(),
  
  formattedAddress: Joi.string().trim().optional(),
  
  instructions: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Delivery instructions cannot exceed 200 characters'
    }),
    
  isDefault: Joi.boolean().default(false)
});

// Password reset schema
export const passwordResetSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .pattern(VALIDATION_PATTERNS.email)
    .required()
    .messages({
      'string.empty': 'Email address is required',
      'string.pattern.base': 'Please enter a valid email address',
      'any.required': 'Email address is required'
    })
});

// Change password schema
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'Current password is required',
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Current password is required'
    }),
    
  newPassword: Joi.string()
    .min(6)
    .pattern(VALIDATION_PATTERNS.password)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters long',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'New password is required'
    }),
    
  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'string.empty': 'Please confirm your new password',
      'any.only': 'New passwords do not match',
      'any.required': 'Please confirm your new password'
    })
});

/**
 * Utility function to validate form data against a schema
 * @param {object} data - Form data to validate
 * @param {object} schema - Joi schema to validate against
 * @returns {object} { isValid, errors, formattedErrors }
 */
export const validateFormData = (data, schema) => {
  const { error, value } = schema.validate(data, { 
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });
  
  if (!error) {
    return {
      isValid: true,
      errors: null,
      formattedErrors: {},
      validatedData: value
    };
  }
  
  // Format errors for frontend display
  const formattedErrors = {};
  error.details.forEach(detail => {
    const fieldName = detail.path.join('.');
    formattedErrors[fieldName] = detail.message;
  });
  
  return {
    isValid: false,
    errors: error.details,
    formattedErrors,
    validatedData: null
  };
};

/**
 * Real-time field validation
 * @param {string} fieldName - Name of the field to validate
 * @param {any} value - Value to validate
 * @param {object} schema - Joi schema containing the field
 * @returns {string|null} Error message or null if valid
 */
export const validateField = (fieldName, value, schema) => {
  try {
    // Create a partial object with just this field
    const partialData = { [fieldName]: value };
    
    // Validate the partial data against the full schema
    const { error } = schema.validate(partialData, { 
      abortEarly: true,
      allowUnknown: true,
      stripUnknown: false
    });
    
    if (!error) return null;
    
    // Find the error for this specific field
    const fieldError = error.details.find(detail => 
      detail.path.join('.') === fieldName
    );
    
    return fieldError ? fieldError.message : null;
  } catch (err) {
    console.error('Validation error for field:', fieldName, err);
    return null;
  }
};

export default {
  userRegistrationSchema,
  signupModalSchema,
  loginSchema,
  otpVerificationSchema,
  addressSchema,
  passwordResetSchema,
  changePasswordSchema,
  validateFormData,
  validateField,
  VALIDATION_PATTERNS
};
