// FILE: apps/customer-app/src/components/location/CurrentLocationButton.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import geolocationService from '../../services/geolocationService';

/**
 * Current Location Button Component
 * Handles browser geolocation with proper error handling and UX
 * SSR-safe implementation
 */
const CurrentLocationButton = ({ 
  onLocationFound, 
  onError, 
  className = '',
  disabled = false,
  size = 'medium' // small, medium, large
}) => {
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState('prompt');
  const [isClient, setIsClient] = useState(false);

  // SSR safety
  useEffect(() => {
    setIsClient(true);
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const permissionState = await geolocationService.checkPermission();
      setPermission(permissionState);
    } catch (error) {
      setPermission('denied');
    }
  };

  const handleGetLocation = async () => {
    if (!isClient || loading || disabled) return;

    setLoading(true);

    try {
      const location = await geolocationService.getCurrentLocation();
      
      // Format the location data for the parent component
      const formattedLocation = {
        coordinates: location.coordinates,
        address: location.address || {},
        accuracy: location.accuracy,
        source: 'geolocation'
      };

      onLocationFound?.(formattedLocation);
      
      // Update permission state after successful use
      setPermission('granted');
    } catch (error) {
      console.error('Geolocation error:', error);
      
      // Update permission state based on error
      if (error.message.includes('denied')) {
        setPermission('denied');
      }
      
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Don't render during SSR
  if (!isClient) {
    return (
      <button 
        className={`current-location-btn loading ${className}`}
        disabled
      >
        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
        Loading...
      </button>
    );
  }

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  };

  // Icon size classes
  const iconSizes = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  // Button state classes
  const getButtonClasses = () => {
    const baseClasses = `
      current-location-btn
      inline-flex items-center justify-center
      font-medium rounded-xl
      transition-all duration-300
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      shadow-lg hover:shadow-xl
      transform hover:-translate-y-0.5
      ${sizeClasses[size]}
      ${className}
    `;

    if (loading) {
      return `${baseClasses} 
        bg-blue-400 text-white cursor-not-allowed
        transform-none shadow-lg
      `;
    }

    if (disabled || permission === 'denied') {
      return `${baseClasses}
        bg-gray-300 text-gray-500 cursor-not-allowed
        transform-none shadow-md
      `;
    }

    return `${baseClasses}
      bg-gradient-to-r from-blue-500 to-blue-600 text-white
      hover:from-blue-600 hover:to-blue-700
      active:from-blue-700 active:to-blue-800
    `;
  };

  // Button content based on state
  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <FontAwesomeIcon 
            icon={faSpinner} 
            className={`animate-spin mr-2 ${iconSizes[size]}`} 
          />
          <span className="animate-pulse">Getting location...</span>
        </>
      );
    }

    if (permission === 'denied') {
      return (
        <>
          <FontAwesomeIcon 
            icon={faExclamationTriangle} 
            className={`mr-2 ${iconSizes[size]}`} 
          />
          Location Denied
        </>
      );
    }

    return (
      <>
        <div className="relative mr-2">
          <FontAwesomeIcon 
            icon={faLocationDot} 
            className={`transition-all duration-300 group-hover:scale-110 ${iconSizes[size]}`} 
          />
          
          {/* Pulsing dot effect */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping ${
              size === 'small' ? 'w-1 h-1' : size === 'large' ? 'w-2 h-2' : 'w-1.5 h-1.5'
            }`}></div>
          </div>
        </div>
        
        <span className="relative">
          Use Current Location
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        </span>
      </>
    );
  };

  return (
    <button
      onClick={handleGetLocation}
      disabled={loading || disabled || permission === 'denied'}
      className={`group ${getButtonClasses()}`}
      title={
        permission === 'denied' 
          ? 'Location access denied. Please enable location permissions in your browser.'
          : 'Get your current location automatically'
      }
    >
      {getButtonContent()}
    </button>
  );
};

export default CurrentLocationButton;
