import React, { forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faCheckCircle, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

/**
 * Enhanced input component with built-in validation display
 * Provides consistent styling and error handling across all forms
 */
const ValidatedInput = forwardRef(({
  label,
  name,
  type = 'text',
  value = '',
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  className = '',
  inputClassName = '',
  labelClassName = '',
  errorClassName = '',
  helperClassName = '',
  showValidIcon = false,
  showPasswordToggle = false,
  icon,
  prefix,
  suffix,
  rows,
  options = [], // For select inputs
  multiple = false,
  accept, // For file inputs
  min,
  max,
  step,
  pattern,
  autoComplete,
  autoFocus = false,
  readOnly = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const inputId = `input-${name}`;
  const errorId = `${name}-error`;
  const helperId = `${name}-helper`;

  const hasError = !!(error && error.length > 0);
  const hasValue = !!(value && value.toString().length > 0);
  const isValid = !hasError && hasValue && showValidIcon;

  // Handle input change
  const handleChange = (e) => {
    if (onChange) {
      const newValue = type === 'checkbox' ? e.target.checked : e.target.value;
      onChange(e, newValue);
    }
  };

  // Handle input blur
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  // Handle input focus
  const handleFocus = (e) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Get input type (handle password toggle)
  const getInputType = () => {
    if (type === 'password' && showPasswordToggle) {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  // Base input classes
  const baseInputClasses = `
    w-full px-3 py-2 border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${hasError 
      ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400' 
      : isValid
        ? 'border-green-300 bg-green-50'
        : 'border-gray-300 bg-white'
    }
    ${isFocused ? 'ring-2 ring-grub-red ring-opacity-20' : ''}
    ${prefix ? 'pl-10' : ''}
    ${suffix || (type === 'password' && showPasswordToggle) || isValid || hasError ? 'pr-10' : ''}
    ${inputClassName}
  `.trim().replace(/\s+/g, ' ');

  // Label classes
  const labelClasses = `
    block text-sm font-medium mb-1 transition-colors duration-200
    ${hasError ? 'text-red-700' : 'text-gray-700'}
    ${labelClassName}
  `.trim().replace(/\s+/g, ' ');

  // Error message classes
  const errorClasses = `
    mt-1 text-sm text-red-600 flex items-center gap-1
    ${errorClassName}
  `.trim().replace(/\s+/g, ' ');

  // Helper text classes
  const helperClasses = `
    mt-1 text-sm text-gray-500
    ${helperClassName}
  `.trim().replace(/\s+/g, ' ');

  // Render different input types
  const renderInput = () => {
    const commonProps = {
      id: inputId,
      name,
      value,
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      disabled,
      required,
      placeholder,
      className: baseInputClasses,
      'aria-invalid': hasError,
      'aria-describedby': [
        hasError ? errorId : null,
        helperText ? helperId : null
      ].filter(Boolean).join(' ') || undefined,
      autoComplete,
      autoFocus,
      readOnly,
      ref,
      ...props
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows || 3}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            multiple={multiple}
          >
            {placeholder && !multiple && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value || option}
                value={option.value || option}
                disabled={option.disabled}
              >
                {option.label || option}
              </option>
            ))}
          </select>
        );

      case 'file':
        return (
          <input
            {...commonProps}
            type="file"
            accept={accept}
            multiple={multiple}
            className={`${baseInputClasses} file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-grub-red file:text-white hover:file:bg-red-700`}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              {...commonProps}
              type="checkbox"
              checked={value}
              className="h-4 w-4 text-grub-red border-gray-300 rounded focus:ring-grub-red focus:ring-2"
            />
            {label && (
              <label htmlFor={inputId} className="ml-2 text-sm text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.value || option} className="flex items-center">
                <input
                  {...commonProps}
                  type="radio"
                  value={option.value || option}
                  checked={value === (option.value || option)}
                  className="h-4 w-4 text-grub-red border-gray-300 focus:ring-grub-red focus:ring-2"
                />
                <label htmlFor={`${inputId}-${option.value || option}`} className="ml-2 text-sm text-gray-700">
                  {option.label || option}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            {...commonProps}
            type={getInputType()}
            min={min}
            max={max}
            step={step}
            pattern={pattern}
          />
        );
    }
  };

  // Don't render label for checkbox (it's handled inline)
  const shouldRenderLabel = type !== 'checkbox' && label;

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {shouldRenderLabel && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Prefix Icon */}
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">{prefix}</span>
          </div>
        )}

        {/* Icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={icon} className="h-4 w-4 text-gray-400" />
          </div>
        )}

        {/* Input */}
        {renderInput()}

        {/* Suffix Icons */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
          {/* Password Toggle */}
          {type === 'password' && showPasswordToggle && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              <FontAwesomeIcon 
                icon={showPassword ? faEyeSlash : faEye} 
                className="h-4 w-4"
              />
            </button>
          )}

          {/* Validation Icons */}
          {hasError && (
            <FontAwesomeIcon 
              icon={faExclamationCircle} 
              className="h-4 w-4 text-red-500"
            />
          )}
          
          {isValid && (
            <FontAwesomeIcon 
              icon={faCheckCircle} 
              className="h-4 w-4 text-green-500"
            />
          )}

          {/* Suffix */}
          {suffix && (
            <span className="text-gray-400 text-sm">{suffix}</span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {hasError && (
        <div id={errorId} className={errorClasses}>
          <FontAwesomeIcon icon={faExclamationCircle} className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !hasError && (
        <div id={helperId} className={helperClasses}>
          {helperText}
        </div>
      )}
    </div>
  );
});

ValidatedInput.displayName = 'ValidatedInput';

export default ValidatedInput;
