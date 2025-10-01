import React from 'react';
import { clsx } from 'clsx';

const Logo = ({ 
  size = 'md', 
  className = '', 
  showText = true,
  ...props 
}) => {
  // Logo image path - same as customer app
  const logoImage = '/icons/logo192.png';
  
  const imageSizes = {
    sm: 'h-6 w-12',
    md: 'h-8 w26',
    lg: 'h-12 w-32',
    xl: 'h-16 w-42'
  };
  
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };
  
  return (
    <div className={clsx('flex items-center', className)} {...props}>
      {/* Logo Image */}
      <img
        src={logoImage}
        alt="GrubGate Logo"
        className={clsx(
          'object-contain transition-all duration-300 ease-in-out',
          imageSizes[size]
        )}
        loading="lazy"
      />
      
      
    </div>
  );
};

export default Logo;

