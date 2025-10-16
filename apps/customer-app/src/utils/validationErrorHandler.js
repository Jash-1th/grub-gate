// FILE: apps/customer-app/src/utils/validationErrorHandler.js

/**
 * Enhanced validation error handler that matches backend Joi schemas
 * Provides user-friendly error messages based on field types and validation rules
 */

// Error message templates based on Joi schema patterns
const ERROR_MESSAGES = {
  // User validation messages (matching backend userSchemas)
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
    'string.min': 'Password must be at least 6 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'any.required': 'Password is required'
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
    'string.pattern.base': 'Please provide a valid postal code',
    'any.required': 'Postal code is required'
  },
  country: {
    'string.empty': 'Country is required',
    'any.required': 'Country is required'
  },
  
  // Restaurant validation messages (for partner forms)
  restaurantName: {
    'string.empty': 'Restaurant name is required',
    'string.min': 'Restaurant name must be at least 2 characters long',
    'string.max': 'Restaurant name cannot exceed 100 characters',
    'any.required': 'Restaurant name is required'
  },
  cuisine: {
    'string.empty': 'Cuisine type is required',
    'any.required': 'Cuisine type is required'
  },
  businessType: {
    'any.only': 'Business type must be one of: restaurant, cafe, bakery, food_truck, catering, other',
    'any.required': 'Business type is required'
  },
  businessPhone: {
    'string.empty': 'Business phone is required',
    'string.pattern.base': 'Please provide a valid business phone number',
    'any.required': 'Business phone is required'
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
  }
};

// Field-specific validation patterns
const VALIDATION_PATTERNS = {
  email: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  canadianPostal: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
  indianPostal: /^\d{6}$/,
  usZip: /^\d{5}(-\d{4})?$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  otp: /^\d{6}$/
};

/**
 * Validates a single field based on its type and value
 * @param {string} fieldName - Name of the field to validate
 * @param {any} value - Value to validate
 * @param {object} options - Additional validation options
 * @returns {string|null} Error message or null if valid
 */
export const validateField = (fieldName, value, options = {}) => {
  const messages = ERROR_MESSAGES[fieldName];
  if (!messages) return null;

  // Check if required field is empty
  if (options.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return messages['string.empty'] || messages['any.required'] || `${fieldName} is required`;
  }

  // Skip further validation if field is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // Length validations
  if (typeof value === 'string') {
    if (options.minLength && value.length < options.minLength) {
      return messages['string.min'] || `${fieldName} must be at least ${options.minLength} characters long`;
    }
    if (options.maxLength && value.length > options.maxLength) {
      return messages['string.max'] || `${fieldName} cannot exceed ${options.maxLength} characters`;
    }
  }

  // Pattern validations
  switch (fieldName) {
    case 'email':
      if (!VALIDATION_PATTERNS.email.test(value)) {
        return messages['string.email'] || 'Please provide a valid email address';
      }
      break;
    
    case 'phoneNumber':
    case 'businessPhone':
      if (!VALIDATION_PATTERNS.phone.test(value.replace(/[\s\-\(\)]/g, ''))) {
        return messages['string.pattern.base'] || 'Please provide a valid phone number';
      }
      break;
    
    case 'password':
      if (value.length < 6) {
        return messages['string.min'] || 'Password must be at least 6 characters long';
      }
      if (!VALIDATION_PATTERNS.password.test(value)) {
        return messages['string.pattern.base'] || 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
      break;
    
    case 'otp':
      if (!VALIDATION_PATTERNS.otp.test(value)) {
        return messages['string.pattern.base'] || 'OTP must be exactly 6 digits';
      }
      break;
    
    case 'postalCode':
      const country = options.country || 'CA';
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
        return messages['string.pattern.base'] || 'Please provide a valid postal code';
      }
      break;
  }

  // Number validations
  if (typeof value === 'number' || !isNaN(parseFloat(value))) {
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    
    if (options.min !== undefined && numValue < options.min) {
      return messages['number.min'] || `${fieldName} must be at least ${options.min}`;
    }
    if (options.max !== undefined && numValue > options.max) {
      return messages['number.max'] || `${fieldName} cannot exceed ${options.max}`;
    }
  }

  return null;
};

/**
 * Validates multiple fields at once
 * @param {object} formData - Object containing form field values
 * @param {object} validationRules - Object containing validation rules for each field
 * @returns {object} Object containing field errors
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach(fieldName => {
    const value = formData[fieldName];
    const rules = validationRules[fieldName];
    
    const error = validateField(fieldName, value, rules);
    if (error) {
      errors[fieldName] = error;
    }
  });

  // Custom validation for password confirmation
  if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Custom validation for identifier (email or phone)
  if (formData.identifier && validationRules.identifier) {
    const isEmail = VALIDATION_PATTERNS.email.test(formData.identifier);
    const isPhone = VALIDATION_PATTERNS.phone.test(formData.identifier);
    
    if (!isEmail && !isPhone) {
      errors.identifier = 'Please provide a valid email address or phone number';
    }
  }

  return errors;
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
 * Real-time field validation hook
 * @param {string} fieldName - Name of the field
 * @param {any} value - Current field value
 * @param {object} rules - Validation rules for the field
 * @param {number} debounceMs - Debounce delay in milliseconds
 * @returns {string|null} Current error message or null
 */
export const useFieldValidation = (fieldName, value, rules, debounceMs = 300) => {
  const [error, setError] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout for validation
    const newTimeoutId = setTimeout(() => {
      const validationError = validateField(fieldName, value, rules);
      setError(validationError);
    }, debounceMs);

    setTimeoutId(newTimeoutId);

    // Cleanup
    return () => {
      if (newTimeoutId) {
        clearTimeout(newTimeoutId);
      }
    };
  }, [fieldName, value, rules, debounceMs]);

  return error;
};

/**
 * Validation rules for common form types
 */
export const VALIDATION_RULES = {
  // User registration form
  userRegistration: {
    firstName: { required: true, minLength: 2, maxLength: 50 },
    lastName: { required: true, minLength: 2, maxLength: 50 },
    email: { required: true },
    password: { required: true, minLength: 6 },
    phoneNumber: { required: true }
  },

  // OTP verification form
  otpVerification: {
    identifier: { required: true },
    otp: { required: true }
  },

  // Address form
  address: {
    street: { required: true, minLength: 2 },
    city: { required: true, minLength: 2 },
    province: { required: true },
    postalCode: { required: true },
    country: { required: true }
  },

  // Restaurant registration form
  restaurantRegistration: {
    restaurantName: { required: true, minLength: 2, maxLength: 100 },
    cuisine: { required: true },
    businessType: { required: true },
    businessPhone: { required: true },
    deliveryRadius: { required: true, min: 1, max: 50 },
    deliveryFee: { required: true, min: 0 },
    minOrderAmount: { required: true, min: 0 },
    avgDeliveryTime: { required: true, min: 10, max: 120 }
  }
};

export default {
  validateField,
  validateForm,
  formatBackendErrors,
  useFieldValidation,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  VALIDATION_PATTERNS
};
