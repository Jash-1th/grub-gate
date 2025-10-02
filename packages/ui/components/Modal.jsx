import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  closeOnOverlayClick = true,
  showCloseButton = true,
  ...props
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl'
  };
  
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50"
      onClick={handleOverlayClick}
      {...props}
    >
      <div className={clsx(
        'bg-white rounded-lg shadow-xl w-full max-h-[85vh] lg:max-h-[95vh] flex flex-col',
        sizes[size],
        className
      )}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const ModalHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={clsx('mb-4', className)} {...props}>
      {children}
    </div>
  );
};

const ModalBody = ({ children, className = '', ...props }) => {
  return (
    <div className={clsx('', className)} {...props}>
      {children}
    </div>
  );
};

const ModalFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={clsx('flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200', className)} {...props}>
      {children}
    </div>
  );
};

export { Modal, ModalHeader, ModalBody, ModalFooter };
export default Modal;