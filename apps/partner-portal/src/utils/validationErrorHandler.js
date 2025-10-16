// FILE: apps/partner-portal/src/utils/validationErrorHandler.js

/**
 * Enhanced validation error handler for Partner Portal
 * Matches backend Joi schemas and provides user-friendly error messages
 */

// Import validation schemas from existing file
import validationSchemas from './validation/schemas.js';

// Error message templates based on Joi schema patterns
const ERROR_MESSAGES = {
  // User validation messages
  firstName: {
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required'
  },
  lastName: {
    'string.empty': 'Last name is required',
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required'
  },
  email: {
    'string.empty': 'Email address is required',
    'string.email': 'Please enter a valid email address (e.g., user@example.com)',
    'any.required': 'Email address is required'
  },
  password: {
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  },
  confirmPassword: {
    'any.only': 'Passwords do not match',
    'any.required': 'Please confirm your password'
  },
  phoneNumber: {
    'string.empty': 'Phone number is required',
    'string.pattern.base': 'Please enter a valid phone number (e.g., +1-234-567-8900)',
    'any.required': 'Phone number is required'
  },
  
  identifier: {
    'string.empty': 'Email or phone number is required',
    'any.required': 'Email or phone number is required',
    'identifier.invalid': 'Please enter a valid email address (e.g., user@example.com) or phone number (e.g., +1-234-567-8900)'
  },
  
  otp: {
    'string.empty': 'Verification code is required',
    'string.length': 'Verification code must be exactly 6 digits',
    'string.pattern.base': 'Verification code must contain only numbers (0-9)',
    'any.required': 'Verification code is required'
  },
  
  // Restaurant validation messages
  restaurantName: {
    'string.empty': 'Restaurant name is required',
    'string.min': 'Restaurant name must be at least 2 characters long',
    'string.max': 'Restaurant name cannot exceed 100 characters',
    'any.required': 'Restaurant name is required'
  },
  description: {
    'string.max': 'Description cannot exceed 500 characters'
  },
  cuisine: {
    'string.empty': 'Cuisine type is required',
    'any.required': 'Cuisine type is required',
    'array.min': 'Please select at least one cuisine type'
  },
  businessType: {
    'any.only': 'Business type must be one of: restaurant, cafe, bakery, food_truck, catering, other',
    'any.required': 'Business type is required'
  },
  businessPhone: {
    'string.empty': 'Business phone is required',
    'string.pattern.base': 'Please enter a valid business phone number',
    'any.required': 'Business phone is required'
  },
  businessEmail: {
    'string.email': 'Please enter a valid business email address'
  },
  website: {
    'string.pattern.base': 'Please enter a valid URL (e.g., https://yourrestaurant.com)'
  },
  
  // Address validation messages
  street: {
    'string.empty': 'Street address is required',
    'string.min': 'Street address must be at least 2 characters',
    'any.required': 'Street address is required'
  },
  city: {
    'string.empty': 'City is required',
    'string.min': 'City must be at least 2 characters',
    'any.required': 'City is required'
  },
  province: {
    'string.empty': 'Province is required',
    'any.required': 'Province is required'
  },
  postalCode: {
    'string.empty': 'Postal code is required',
    'alternatives.match': 'Please enter a valid postal code (e.g., M5V 3A8 or 515671)',
    'any.required': 'Postal code is required'
  },
  country: {
    'string.empty': 'Country is required',
    'any.required': 'Country is required'
  },
  
  // Delivery settings validation
  deliveryRadius: {
    'number.min': 'Delivery radius must be at least 1 km',
    'number.max': 'Delivery radius cannot exceed 50 km',
    'any.required': 'Delivery radius is required'
  },
  deliveryFee: {
    'number.min': 'Delivery fee cannot be negative',
    'any.required': 'Delivery fee is required'
  },
  minOrderAmount: {
    'number.min': 'Minimum order amount cannot be negative',
    'any.required': 'Minimum order amount is required'
  },
  avgDeliveryTime: {
    'number.min': 'Average delivery time must be at least 10 minutes',
    'number.max': 'Average delivery time cannot exceed 120 minutes',
    'any.required': 'Average delivery time is required'
  },
  
  // Billing information validation
  businessName: {
    'string.empty': 'Business name is required',
    'string.max': 'Business name cannot exceed 100 characters',
    'any.required': 'Business name is required'
  },
  contactPerson: {
    'string.max': 'Contact person name cannot exceed 100 characters'
  },
  billingEmail: {
    'string.email': 'Please enter a valid billing email address',
    'any.required': 'Billing email is required'
  },
  billingPhone: {
    'string.pattern.base': 'Please enter a valid billing phone number',
    'any.required': 'Billing phone is required'
  },
  bankName: {
    'string.empty': 'Bank name is required',
    'string.min': 'Bank name must be at least 2 characters',
    'any.required': 'Bank name is required'
  },
  accountType: {
    'any.only': 'Account type must be checking, savings, or business',
    'any.required': 'Account type is required'
  },
  routingNumber: {
    'string.pattern.base': 'Routing number must be 9 digits',
    'any.required': 'Routing number is required'
  },
  accountNumber: {
    'string.pattern.base': 'Account number must be 8-17 digits',
    'any.required': 'Account number is required'
  },
  businessNumber: {
    'string.pattern.base': 'Please enter a valid Canadian business number (e.g., 123456789RP0001)'
  },
  gstHstNumber: {
    'string.pattern.base': 'Please enter a valid GST/HST number (e.g., 123456789RT0001)'
  }
};

/**
 * Validates a form using existing Joi schemas
 * @param {object} formData - Form data to validate
 * @param {string} schemaType - Type of schema to use (e.g., 'businessDetails', 'billingDetails')
 * @returns {object} Object containing validation errors
 */
export const validateFormWithSchema = (formData, schemaType) => {
  try {
    // Get the appropriate schema
    let schema;
    
    switch (schemaType) {
      case 'businessDetails':
        schema = validationSchemas.registrationSchemas.businessDetails;
        break;
      case 'billingDetails':
        schema = validationSchemas.registrationSchemas.billingDetails;
        break;
      case 'personalInfo':
        schema = validationSchemas.userSchemas.personalInfo;
        break;
      case 'restaurantBasicInfo':
        schema = validationSchemas.restaurantSchemas.basicInfo;
        break;
      case 'restaurantDeliverySettings':
        schema = validationSchemas.restaurantSchemas.deliverySettings;
        break;
      case 'completeMenuItem':
        schema = validationSchemas.registrationSchemas.completeMenuItem;
        break;
      case 'profileSettings':
        schema = validationSchemas.registrationSchemas.profileSettings;
        break;
      case 'deliverySettings':
        schema = validationSchemas.registrationSchemas.deliverySettings;
        break;
      case 'notificationSettings':
        schema = validationSchemas.registrationSchemas.notificationSettings;
        break;
      case 'billingSettings':
        schema = validationSchemas.registrationSchemas.billingSettings;
        break;
      default:
        console.warn(`Unknown schema type: ${schemaType}`);
        return {};
    }

    if (!schema) {
      console.warn(`Schema not found for type: ${schemaType}`);
      return {};
    }

    // Validate using Joi
    const { error } = schema.validate(formData, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: false
    });

    if (!error) {
      return {}; // No errors
    }

    // Convert Joi errors to user-friendly format
    const errors = {};
    error.details.forEach(detail => {
      const fieldName = detail.path.join('.');
      const errorType = detail.type;
      
      // Try to get user-friendly message
      const fieldMessages = ERROR_MESSAGES[fieldName];
      if (fieldMessages && fieldMessages[errorType]) {
        errors[fieldName] = fieldMessages[errorType];
      } else {
        // Fallback to Joi message with cleanup
        errors[fieldName] = detail.message.replace(/"/g, '');
      }
    });

    return errors;
  } catch (err) {
    console.error('Validation error:', err);
    return { general: 'Validation failed. Please check your input.' };
  }
};

/**
 * Validates a single field
 * @param {string} fieldName - Name of the field
 * @param {any} value - Value to validate
 * @param {object} rules - Validation rules
 * @returns {string|null} Error message or null if valid
 */
export const validateField = (fieldName, value, rules = {}) => {
  // Basic required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    const fieldMessages = ERROR_MESSAGES[fieldName];
    return fieldMessages?.['string.empty'] || fieldMessages?.['any.required'] || `${fieldName} is required`;
  }

  // Skip further validation if field is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // Length validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      const fieldMessages = ERROR_MESSAGES[fieldName];
      return fieldMessages?.['string.min'] || `${fieldName} must be at least ${rules.minLength} characters long`;
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      const fieldMessages = ERROR_MESSAGES[fieldName];
      return fieldMessages?.['string.max'] || `${fieldName} cannot exceed ${rules.maxLength} characters`;
    }
  }

  // Pattern validations
  if (rules.pattern && typeof value === 'string') {
    if (!rules.pattern.test(value)) {
      const fieldMessages = ERROR_MESSAGES[fieldName];
      return fieldMessages?.['string.pattern.base'] || `Please enter a valid ${fieldName}`;
    }
  }

  // Email validation
  if (fieldName.includes('email') || fieldName.includes('Email')) {
    const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailPattern.test(value)) {
      const fieldMessages = ERROR_MESSAGES[fieldName];
      return fieldMessages?.['string.email'] || 'Please enter a valid email address';
    }
  }

  // Number validations
  if (typeof value === 'number' || !isNaN(parseFloat(value))) {
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    
    if (rules.min !== undefined && numValue < rules.min) {
      const fieldMessages = ERROR_MESSAGES[fieldName];
      return fieldMessages?.['number.min'] || `${fieldName} must be at least ${rules.min}`;
    }
    if (rules.max !== undefined && numValue > rules.max) {
      const fieldMessages = ERROR_MESSAGES[fieldName];
      return fieldMessages?.['number.max'] || `${fieldName} cannot exceed ${rules.max}`;
    }
  }

  return null;
};

/**
 * Formats backend Joi validation errors for frontend display
 * @param {array} backendErrors - Array of Joi validation errors from backend
 * @returns {object} Object containing formatted field errors
 */
export const formatBackendErrors = (backendErrors) => {
  const errors = {};

  if (Array.isArray(backendErrors)) {
    backendErrors.forEach(error => {
      const fieldName = error.field || error.path;
      const errorType = error.type || 'validation.error';
      
      // Try to get user-friendly message from our templates
      const fieldMessages = ERROR_MESSAGES[fieldName];
      if (fieldMessages && fieldMessages[errorType]) {
        errors[fieldName] = fieldMessages[errorType];
      } else {
        // Fallback to backend message or generic message
        errors[fieldName] = error.message || `${fieldName} is invalid`;
      }
    });
  }

  return errors;
};

/**
 * Validation rules for common form types
 */
export const VALIDATION_RULES = {
  // Business details form
  businessDetails: {
    firstName: { required: true, minLength: 2, maxLength: 50 },
    lastName: { required: true, minLength: 2, maxLength: 50 },
    email: { required: true },
    password: { required: true, minLength: 8 },
    restaurantName: { required: true, minLength: 2, maxLength: 100 },
    cuisine: { required: true },
    businessType: { required: true },
    street: { required: true, minLength: 2 },
    city: { required: true, minLength: 2 },
    province: { required: true },
    postalCode: { required: true },
    businessPhone: { required: true },
    deliveryRadius: { required: true, min: 1, max: 50 },
    deliveryFee: { required: true, min: 0 },
    minOrderAmount: { required: true, min: 0 },
    avgDeliveryTime: { required: true, min: 10, max: 120 }
  },

  // Billing details form
  billingDetails: {
    businessName: { required: true, maxLength: 100 },
    billingEmail: { required: true },
    billingPhone: { required: true },
    billingStreet: { required: true },
    billingCity: { required: true },
    billingProvince: { required: true },
    billingPostalCode: { required: true },
    bankName: { required: true },
    accountType: { required: true },
    routingNumber: { required: true },
    accountNumber: { required: true }
  },

  // Restaurant basic info
  restaurantBasicInfo: {
    name: { required: true, minLength: 2, maxLength: 100 },
    description: { maxLength: 500 },
    cuisine: { required: true },
    businessType: { required: true },
    phone: { required: true },
    email: { required: true }
  }
};

export default {
  validateFormWithSchema,
  validateField,
  formatBackendErrors,
  VALIDATION_RULES,
  ERROR_MESSAGES
};
