import schemas from './schemas.js';

/**
 * Enhanced validation utility with user-friendly error messages
 * Provides comprehensive form validation with detailed error reporting
 */
class FormValidator {
  constructor() {
    this.schemas = schemas;
  }

  /**
   * Validate data against a schema
   * @param {Object} data - Data to validate
   * @param {Object} schema - Joi schema to validate against
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result with errors and sanitized data
   */
  validate(data, schema, options = {}) {
    const defaultOptions = {
      abortEarly: false, // Return all errors, not just the first one
      allowUnknown: false, // Don't allow unknown fields
      stripUnknown: true, // Remove unknown fields from result
      convert: true, // Convert values to correct types
      ...options
    };

    const { error, value } = schema.validate(data, defaultOptions);

    if (error) {
      const formattedErrors = this.formatErrors(error.details);
      return {
        isValid: false,
        errors: formattedErrors,
        data: null,
        errorCount: Object.keys(formattedErrors).length
      };
    }

    return {
      isValid: true,
      errors: {},
      data: value,
      errorCount: 0
    };
  }

  /**
   * Format Joi validation errors into user-friendly messages
   * @param {Array} errorDetails - Joi error details array
   * @returns {Object} - Formatted errors object
   */
  formatErrors(errorDetails) {
    const errors = {};
    
    errorDetails.forEach(error => {
      const field = error.path.join('.');
      let message = error.message;

      // Custom error message formatting based on error type
      switch (error.type) {
        case 'string.empty':
          message = `${this.getFieldLabel(error.path)} is required`;
          break;
        
        case 'string.min':
          message = `${this.getFieldLabel(error.path)} must be at least ${error.context.limit} characters long`;
          break;
        
        case 'string.max':
          message = `${this.getFieldLabel(error.path)} cannot exceed ${error.context.limit} characters`;
          break;
        
        case 'string.email':
          message = `Please enter a valid email address`;
          break;
        
        case 'string.pattern.base':
          message = this.getPatternErrorMessage(error.path, error.context.pattern);
          break;
        
        case 'number.base':
          message = `${this.getFieldLabel(error.path)} must be a valid number`;
          break;
        
        case 'number.min':
          message = `${this.getFieldLabel(error.path)} must be at least ${error.context.limit}`;
          break;
        
        case 'number.max':
          message = `${this.getFieldLabel(error.path)} cannot exceed ${error.context.limit}`;
          break;
        
        case 'array.min':
          message = `Please select at least ${error.context.limit} option(s) for ${this.getFieldLabel(error.path)}`;
          break;
        
        case 'any.required':
          message = `${this.getFieldLabel(error.path)} is required`;
          break;
        
        case 'any.only':
          if (error.path[error.path.length - 1] === 'confirmPassword') {
            message = 'Passwords do not match';
          } else {
            message = `${this.getFieldLabel(error.path)} must be one of the allowed values`;
          }
          break;
        
        case 'alternatives.match':
          message = this.getAlternativesErrorMessage(error.path);
          break;
        
        default:
          // Use the original message if no custom formatting is available
          message = error.message;
      }

      errors[field] = message;
    });

    return errors;
  }

  /**
   * Get user-friendly field label from path
   * @param {Array} path - Field path array
   * @returns {string} - User-friendly field label
   */
  getFieldLabel(path) {
    const fieldName = path[path.length - 1];
    
    // Custom field label mappings
    const labelMappings = {
      firstName: 'First name',
      lastName: 'Last name',
      phoneNumber: 'Phone number',
      businessPhone: 'Business phone',
      businessEmail: 'Business email',
      restaurantName: 'Restaurant name',
      postalCode: 'Postal code',
      billingStreet: 'Billing street address',
      billingCity: 'Billing city',
      billingProvince: 'Billing province',
      billingPostalCode: 'Billing postal code',
      billingEmail: 'Billing email',
      billingPhone: 'Billing phone',
      bankName: 'Bank name',
      accountType: 'Account type',
      routingNumber: 'Routing number',
      accountNumber: 'Account number',
      businessNumber: 'Business number',
      gstHstNumber: 'GST/HST number',
      qstNumber: 'QST number',
      contactPerson: 'Contact person',
      paymentMethod: 'Payment method',
      deliveryRadius: 'Delivery radius',
      deliveryFee: 'Delivery fee',
      minOrderAmount: 'Minimum order amount',
      avgDeliveryTime: 'Average delivery time',
      prepTime: 'Preparation time',
      spiceLevel: 'Spice level',
      dietaryPreferences: 'Dietary preferences',
      confirmPassword: 'Confirm password'
    };

    return labelMappings[fieldName] || this.capitalizeWords(fieldName);
  }

  /**
   * Get pattern-specific error messages
   * @param {Array} path - Field path
   * @param {RegExp} pattern - The regex pattern that failed
   * @returns {string} - User-friendly error message
   */
  getPatternErrorMessage(path, pattern) {
    const fieldName = path[path.length - 1];
    
    const patternMessages = {
      phone: 'Please enter a valid phone number (e.g., +1-234-567-8900)',
      email: 'Please enter a valid email address (e.g., user@example.com)',
      postalCode: 'Please enter a valid postal code (e.g., M5V 3A8 or 515671)',
      time: 'Please enter time in HH:MM format (e.g., 09:00)',
      url: 'Please enter a valid URL (e.g., https://yourrestaurant.com)',
      businessNumber: 'Please enter a valid Canadian business number (e.g., 123456789RP0001)',
      gstHstNumber: 'Please enter a valid GST/HST number (e.g., 123456789RT0001)',
      qstNumber: 'Please enter a valid QST number (e.g., 1234567890TQ0001)',
      routingNumber: 'Routing number must be exactly 9 digits',
      accountNumber: 'Account number must be 8-17 digits',
      username: 'Username can only contain letters, numbers, and underscores'
    };

    // Check pattern string to determine message
    const patternStr = pattern.toString();
    
    if (patternStr.includes('\\+?[\\d\\s\\-\\(\\)]+')) {
      return patternMessages.phone;
    } else if (patternStr.includes('^\\d{9}$')) {
      return patternMessages.routingNumber;
    } else if (patternStr.includes('^\\d{8,17}$')) {
      return patternMessages.accountNumber;
    } else if (patternStr.includes('RP\\d{4}')) {
      return patternMessages.businessNumber;
    } else if (patternStr.includes('RT\\d{4}')) {
      return patternMessages.gstHstNumber;
    } else if (patternStr.includes('TQ\\d{4}')) {
      return patternMessages.qstNumber;
    } else if (patternStr.includes('[A-Z]\\d[A-Z]')) {
      return patternMessages.postalCode;
    } else if (patternStr.includes('^\\d{6}$')) {
      return 'Please enter a valid 6-digit postal code';
    } else if (patternStr.includes('([0-1]?[0-9]|2[0-3]):[0-5][0-9]')) {
      return patternMessages.time;
    } else if (patternStr.includes('https?')) {
      return patternMessages.url;
    } else if (patternStr.includes('[a-zA-Z0-9_]')) {
      return patternMessages.username;
    }

    return `${this.getFieldLabel(path)} format is invalid`;
  }

  /**
   * Get alternatives-specific error messages
   * @param {Array} path - Field path
   * @returns {string} - User-friendly error message
   */
  getAlternativesErrorMessage(path) {
    const fieldName = path[path.length - 1];
    
    const alternativesMessages = {
      identifier: 'Please enter a valid email address or phone number',
      postalCode: 'Please enter a valid postal code (Canadian: M5V 3A8, Indian: 515671)',
      routingNumber: 'Routing number must be exactly 9 digits',
      accountNumber: 'Account number must be 8-17 digits',
      businessNumber: 'Please enter a valid business number or leave empty',
      gstHstNumber: 'Please enter a valid GST/HST number or leave empty',
      qstNumber: 'Please enter a valid QST number or leave empty'
    };

    return alternativesMessages[fieldName] || `${this.getFieldLabel(path)} format is invalid`;
  }

  /**
   * Capitalize words for display
   * @param {string} str - String to capitalize
   * @returns {string} - Capitalized string
   */
  capitalizeWords(str) {
    return str
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  }

  /**
   * Validate specific form sections
   */
  validatePersonalInfo(data) {
    return this.validate(data, this.schemas.userSchemas.personalInfo);
  }

  validatePassword(data) {
    return this.validate(data, this.schemas.userSchemas.password);
  }

  validateAddress(data) {
    return this.validate(data, this.schemas.userSchemas.address);
  }

  validateRestaurantBasicInfo(data) {
    return this.validate(data, this.schemas.restaurantSchemas.basicInfo);
  }

  validateOperatingHours(data) {
    return this.validate(data, this.schemas.restaurantSchemas.operatingHours);
  }

  validateDeliverySettings(data) {
    return this.validate(data, this.schemas.restaurantSchemas.deliverySettings);
  }

  validateBillingInfo(data) {
    return this.validate(data, this.schemas.restaurantSchemas.billingInfo);
  }

  validateMenuItemBasicInfo(data) {
    return this.validate(data, this.schemas.menuItemSchemas.basicInfo);
  }

  validateMenuItemDietaryInfo(data) {
    return this.validate(data, this.schemas.menuItemSchemas.dietaryInfo);
  }

  validateMenuItemNutritionInfo(data) {
    return this.validate(data, this.schemas.menuItemSchemas.nutritionInfo);
  }

  validateMenuItemAvailability(data) {
    return this.validate(data, this.schemas.menuItemSchemas.availability);
  }

  validateOtpRequest(data) {
    return this.validate(data, this.schemas.authSchemas.otpRequest);
  }

  validateOtpVerification(data) {
    return this.validate(data, this.schemas.authSchemas.otpVerification);
  }

  validateLogin(data) {
    return this.validate(data, this.schemas.authSchemas.login);
  }

  validateBusinessDetails(data) {
    return this.validate(data, this.schemas.registrationSchemas.businessDetails);
  }

  validateBillingDetails(data) {
    return this.validate(data, this.schemas.registrationSchemas.billingDetails);
  }

  /**
   * Real-time field validation for better UX
   * @param {string} fieldName - Name of the field to validate
   * @param {any} value - Value to validate
   * @param {Object} schema - Schema to validate against
   * @returns {Object} - Validation result for single field
   */
  validateField(fieldName, value, schema) {
    const fieldSchema = schema.extract(fieldName);
    if (!fieldSchema) {
      return { isValid: true, error: null };
    }

    const { error } = fieldSchema.validate(value);
    
    if (error) {
      const formattedErrors = this.formatErrors(error.details);
      return {
        isValid: false,
        error: formattedErrors[fieldName] || error.message
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * Get validation summary for debugging
   * @param {Object} validationResult - Result from validate method
   * @returns {string} - Human-readable validation summary
   */
  getValidationSummary(validationResult) {
    if (validationResult.isValid) {
      return '✅ All fields are valid';
    }

    const errorFields = Object.keys(validationResult.errors);
    const summary = [
      `❌ Found ${validationResult.errorCount} validation error(s):`,
      ...errorFields.map(field => `  • ${field}: ${validationResult.errors[field]}`)
    ];

    return summary.join('\n');
  }
}

// Create singleton instance
const validator = new FormValidator();

// Export both the class and the singleton instance
export { FormValidator };
export default validator;
