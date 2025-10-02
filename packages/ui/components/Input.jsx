import React from 'react';
import { clsx } from 'clsx';

const Input = React.forwardRef(({
  label,
  error,
  helperText,
  className = '',
  size = 'md',
  variant = 'default',
  ...props
}, ref) => {
  const baseClasses = 'block w-full border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';
  
  const variants = {
    default: 'border-gray-300 focus:border-grub-red focus:ring-grub-red',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  };
  
  const inputClasses = clsx(
    baseClasses,
    variants[error ? 'error' : variant],
    sizes[size],
    error && 'text-red-900 placeholder-red-300',
    className
  );
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  className = '',
  rows = 3,
  ...props
}, ref) => {
  const baseClasses = 'block w-full border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 resize-vertical';
  
  const variants = {
    default: 'border-gray-300 focus:border-grub-red focus:ring-grub-red',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500'
  };
  
  const textareaClasses = clsx(
    baseClasses,
    variants[error ? 'error' : 'default'],
    'px-3 py-2 text-base',
    error && 'text-red-900 placeholder-red-300',
    className
  );
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Input, Textarea };
export default Input;






