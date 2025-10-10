import { useState, useCallback, useMemo } from 'react';
import validator from '../utils/validation/validator.js';

/**
 * Custom hook for form validation with real-time feedback
 * Provides comprehensive form validation with user-friendly error messages
 * 
 * @param {Object} initialData - Initial form data
 * @param {Object} validationSchema - Joi validation schema
 * @param {Object} options - Validation options
 * @returns {Object} - Form validation utilities and state
 */
export const useFormValidation = (initialData = {}, validationSchema = null, options = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);

  const defaultOptions = {
    validateOnChange: true,
    validateOnBlur: true,
    showErrorsOnlyAfterTouch: true,
    debounceMs: 300,
    ...options
  };

  // Debounced validation function
  const debouncedValidate = useMemo(() => {
    let timeoutId;
    return (data, schema, fieldName = null) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (fieldName) {
          validateSingleField(fieldName, data[fieldName], schema);
        } else {
          validateForm(data, schema);
        }
      }, defaultOptions.debounceMs);
    };
  }, [defaultOptions.debounceMs]);

  /**
   * Validate entire form
   * @param {Object} data - Form data to validate
   * @param {Object} schema - Validation schema
   * @returns {Object} - Validation result
   */
  const validateForm = useCallback((data = formData, schema = validationSchema) => {
    if (!schema) {
      console.warn('No validation schema provided');
      return { isValid: true, errors: {}, data };
    }

    setIsValidating(true);
    const result = validator.validate(data, schema);
    
    setErrors(result.errors);
    setIsValidating(false);
    setHasValidated(true);

    return result;
  }, [formData, validationSchema]);

  /**
   * Validate single field
   * @param {string} fieldName - Name of field to validate
   * @param {any} value - Value to validate
   * @param {Object} schema - Validation schema
   */
  const validateSingleField = useCallback((fieldName, value, schema = validationSchema) => {
    if (!schema) return;

    try {
      const result = validator.validateField(fieldName, value, schema);
      
      setErrors(prev => ({
        ...prev,
        [fieldName]: result.error || ''
      }));
    } catch (error) {
      console.warn(`Could not validate field ${fieldName}:`, error);
    }
  }, [validationSchema]);

  /**
   * Handle input change with validation
   * @param {string} fieldName - Name of the field
   * @param {any} value - New value
   */
  const handleChange = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error when user starts typing (if field was touched)
    if (touched[fieldName] && errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }

    // Validate on change if enabled
    if (defaultOptions.validateOnChange && validationSchema) {
      debouncedValidate({ ...formData, [fieldName]: value }, validationSchema, fieldName);
    }
  }, [formData, touched, errors, defaultOptions.validateOnChange, validationSchema, debouncedValidate]);

  /**
   * Handle field blur with validation
   * @param {string} fieldName - Name of the field
   */
  const handleBlur = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Validate on blur if enabled
    if (defaultOptions.validateOnBlur && validationSchema) {
      validateSingleField(fieldName, formData[fieldName], validationSchema);
    }
  }, [formData, defaultOptions.validateOnBlur, validationSchema, validateSingleField]);

  /**
   * Handle form submission with validation
   * @param {Function} onSubmit - Submit handler function
   * @returns {Function} - Form submit handler
   */
  const handleSubmit = useCallback((onSubmit) => {
    return async (event) => {
      if (event) {
        event.preventDefault();
      }

      const result = validateForm();
      
      // Mark all fields as touched
      const allFieldsTouched = Object.keys(formData).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allFieldsTouched);

      if (result.isValid) {
        try {
          await onSubmit(result.data, result);
        } catch (error) {
          console.error('Form submission error:', error);
          // You might want to set form-level errors here
        }
      } else {
        console.log('Form validation failed:', validator.getValidationSummary(result));
      }

      return result;
    };
  }, [formData, validateForm]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setHasValidated(false);
  }, [initialData]);

  /**
   * Set form data programmatically
   * @param {Object} newData - New form data
   * @param {boolean} shouldValidate - Whether to validate after setting
   */
  const setData = useCallback((newData, shouldValidate = false) => {
    setFormData(newData);
    
    if (shouldValidate && validationSchema) {
      validateForm(newData, validationSchema);
    }
  }, [validationSchema, validateForm]);

  /**
   * Set specific field value
   * @param {string} fieldName - Field name
   * @param {any} value - Field value
   */
  const setFieldValue = useCallback((fieldName, value) => {
    handleChange(fieldName, value);
  }, [handleChange]);

  /**
   * Set field error manually
   * @param {string} fieldName - Field name
   * @param {string} error - Error message
   */
  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  /**
   * Clear specific field error
   * @param {string} fieldName - Field name
   */
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Get field props for easy integration with form inputs
   * @param {string} fieldName - Field name
   * @returns {Object} - Props to spread on input component
   */
  const getFieldProps = useCallback((fieldName) => {
    const hasError = !!(errors[fieldName] && (touched[fieldName] || !defaultOptions.showErrorsOnlyAfterTouch));
    
    return {
      name: fieldName,
      value: formData[fieldName] || '',
      onChange: (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        handleChange(fieldName, value);
      },
      onBlur: () => handleBlur(fieldName),
      error: hasError,
      helperText: hasError ? errors[fieldName] : '',
      'aria-invalid': hasError,
      'aria-describedby': hasError ? `${fieldName}-error` : undefined
    };
  }, [formData, errors, touched, defaultOptions.showErrorsOnlyAfterTouch, handleChange, handleBlur]);

  /**
   * Check if form is valid
   */
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 || Object.values(errors).every(error => !error);
  }, [errors]);

  /**
   * Check if form has any errors
   */
  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => error && error.length > 0);
  }, [errors]);

  /**
   * Get visible errors (considering touch state)
   */
  const visibleErrors = useMemo(() => {
    if (!defaultOptions.showErrorsOnlyAfterTouch) {
      return errors;
    }

    return Object.keys(errors).reduce((acc, fieldName) => {
      if (touched[fieldName] && errors[fieldName]) {
        acc[fieldName] = errors[fieldName];
      }
      return acc;
    }, {});
  }, [errors, touched, defaultOptions.showErrorsOnlyAfterTouch]);

  /**
   * Get form validation summary
   */
  const validationSummary = useMemo(() => {
    if (isValid) {
      return '✅ Form is valid';
    }

    const errorCount = Object.keys(visibleErrors).length;
    return `❌ ${errorCount} validation error(s) found`;
  }, [isValid, visibleErrors]);

  return {
    // Form data
    formData,
    setFormData: setData,
    
    // Field operations
    setFieldValue,
    getFieldProps,
    
    // Validation state
    errors,
    visibleErrors,
    setFieldError,
    clearFieldError,
    clearErrors,
    
    // Form state
    touched,
    isValid,
    hasErrors,
    isValidating,
    hasValidated,
    validationSummary,
    
    // Form operations
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    validateSingleField,
    resetForm,
    
    // Utilities
    validator
  };
};

export default useFormValidation;
