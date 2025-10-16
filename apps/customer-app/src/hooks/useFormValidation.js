// FILE: apps/customer-app/src/hooks/useFormValidation.js

import { useState, useEffect } from 'react';
import { validateFormData, validateField } from '../utils/validation/joiSchemas';

/**
 * Custom hook for form validation using Joi schemas
 * Provides real-time validation, error handling, and form state management
 * 
 * @param {object} initialData - Initial form data
 * @param {object} schema - Joi validation schema
 * @param {object} options - Configuration options
 * @returns {object} Form validation state and handlers
 */
export const useFormValidation = (initialData = {}, schema, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    showErrorsOnTouch = true,
    debounceMs = 300
  } = options;

  // Form state
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce timer for real-time validation
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Validate entire form
  const validateForm = () => {
    if (!schema) return { isValid: true, errors: {} };
    
    const { isValid: formIsValid, formattedErrors } = validateFormData(formData, schema);
    setErrors(formattedErrors);
    setIsValid(formIsValid);
    
    return { isValid: formIsValid, errors: formattedErrors };
  };

  // Validate single field
  const validateSingleField = (fieldName, value) => {
    if (!schema) return null;
    
    const fieldError = validateField(fieldName, value, schema);
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldError
    }));
    
    return fieldError;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Real-time validation with debouncing
    if (validateOnChange) {
      // Clear previous timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set new timer
      const newTimer = setTimeout(() => {
        if (touchedFields[name] || !showErrorsOnTouch) {
          validateSingleField(name, fieldValue);
        }
      }, debounceMs);

      setDebounceTimer(newTimer);
    }
  };

  // Handle field blur
  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate on blur
    if (validateOnBlur) {
      validateSingleField(name, value);
    }
  };

  // Handle form submission
  const handleSubmit = async (submitFunction) => {
    return async (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Mark all fields as touched
      const allFields = Object.keys(formData);
      const touchedState = {};
      allFields.forEach(field => {
        touchedState[field] = true;
      });
      setTouchedFields(touchedState);

      // Validate form
      const { isValid: formIsValid, errors: formErrors } = validateForm();
      
      if (!formIsValid) {
        return { success: false, errors: formErrors };
      }

      // Submit form
      setIsSubmitting(true);
      try {
        const result = await submitFunction(formData);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message || 'Submission failed' };
      } finally {
        setIsSubmitting(false);
      }
    };
  };

  // Reset form
  const resetForm = () => {
    setFormData(initialData);
    setErrors({});
    setTouchedFields({});
    setIsValid(false);
    setIsSubmitting(false);
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  };

  // Set field value programmatically
  const setFieldValue = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Validate if field is touched
    if (touchedFields[fieldName]) {
      validateSingleField(fieldName, value);
    }
  };

  // Set field error programmatically
  const setFieldError = (fieldName, error) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  // Clear field error
  const clearFieldError = (fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Get field props for easy integration
  const getFieldProps = (fieldName) => ({
    name: fieldName,
    value: formData[fieldName] || '',
    onChange: handleInputChange,
    onBlur: handleFieldBlur,
    error: errors[fieldName],
    touched: touchedFields[fieldName]
  });

  // Get field styling based on validation state
  const getFieldStyling = (fieldName) => {
    const hasError = errors[fieldName];
    const isTouched = touchedFields[fieldName];
    const hasValue = formData[fieldName] && formData[fieldName].toString().length > 0;
    const fieldIsValid = isTouched && hasValue && !hasError;
    
    if (hasError && (isTouched || !showErrorsOnTouch)) {
      return 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500';
    } else if (fieldIsValid) {
      return 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500';
    } else {
      return 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    }
  };

  // Get validation icon
  const getValidationIcon = (fieldName) => {
    const hasError = errors[fieldName];
    const isTouched = touchedFields[fieldName];
    const hasValue = formData[fieldName] && formData[fieldName].toString().length > 0;
    const fieldIsValid = isTouched && hasValue && !hasError;
    
    if (hasError && (isTouched || !showErrorsOnTouch)) {
      return 'error';
    } else if (fieldIsValid) {
      return 'success';
    }
    return null;
  };

  // Update form validity when form data or errors change
  useEffect(() => {
    if (schema) {
      const { isValid: formIsValid } = validateFormData(formData, schema);
      setIsValid(formIsValid);
    }
  }, [formData, errors, schema]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    // Form state
    formData,
    errors,
    touchedFields,
    isValid,
    isSubmitting,
    
    // Handlers
    handleInputChange,
    handleFieldBlur,
    handleSubmit,
    
    // Utilities
    resetForm,
    validateForm,
    setFieldValue,
    setFieldError,
    clearFieldError,
    getFieldProps,
    getFieldStyling,
    getValidationIcon,
    
    // Validation methods
    validateSingleField
  };
};

export default useFormValidation;
