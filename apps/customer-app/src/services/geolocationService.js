// FILE: apps/customer-app/src/services/geolocationService.js
/**
 * Geolocation Service
 * Handles browser geolocation with fallbacks and error handling
 * SSR-safe implementation
 */

class GeolocationService {
  constructor() {
    this.isClient = typeof window !== 'undefined';
    this.hasGeolocation = this.isClient && 'geolocation' in navigator;
  }

  /**
   * Get current location using browser geolocation
   * @returns {Promise<{coordinates: {lat: number, lng: number}, address?: object}>}
   */
  async getCurrentLocation() {
    if (!this.isClient) {
      throw new Error('Geolocation is not available during server-side rendering');
    }

    if (!this.hasGeolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    return new Promise((resolve, reject) => {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Get address from coordinates using reverse geocoding
            const address = await this.reverseGeocode(latitude, longitude);
            
            resolve({
              coordinates: { 
                lat: latitude, 
                lng: longitude 
              },
              address,
              accuracy: position.coords.accuracy
            });
          } catch (error) {
            // Return coordinates even if reverse geocoding fails
            resolve({
              coordinates: { 
                lat: position.coords.latitude, 
                lng: position.coords.longitude 
              },
              accuracy: position.coords.accuracy
            });
          }
        },
        (error) => {
          reject(new Error(this.getLocationErrorMessage(error.code)));
        },
        options
      );
    });
  }

  /**
   * Reverse geocode coordinates to address
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<object>} Address object
   */
  async reverseGeocode(lat, lng) {
    if (!this.isClient) {
      throw new Error('Reverse geocoding not available during SSR');
    }

    try {
      const response = await fetch(`/api/v1/geocoding/reverse?lat=${lat}&lng=${lng}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data.address;
    } catch (error) {
      console.warn('Reverse geocoding failed:', error.message);
      // Return basic structure if reverse geocoding fails
      return {
        street: '',
        city: '',
        province: '',
        postalCode: '',
        country: ''
      };
    }
  }

  /**
   * Check if geolocation is available and permission granted
   * @returns {Promise<string>} Permission state: 'granted', 'denied', 'prompt'
   */
  async checkPermission() {
    if (!this.isClient || !this.hasGeolocation) {
      return 'denied';
    }

    try {
      // Check if permissions API is available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state;
      }
      
      // Fallback: assume prompt if permissions API not available
      return 'prompt';
    } catch (error) {
      return 'prompt';
    }
  }

  /**
   * Get user-friendly error message for geolocation errors
   * @param {number} code - Error code from GeolocationPositionError
   * @returns {string} User-friendly error message
   */
  getLocationErrorMessage(code) {
    switch (code) {
      case 1: // PERMISSION_DENIED
        return 'Location access denied. Please enable location permissions in your browser settings and try again.';
      case 2: // POSITION_UNAVAILABLE
        return 'Location unavailable. Please check your GPS/location services and try again.';
      case 3: // TIMEOUT
        return 'Location request timed out. Please try again or enter your address manually.';
      default:
        return 'Unable to get your location. Please enter your address manually.';
    }
  }

  /**
   * Watch position changes (for future use in delivery tracking)
   * @param {Function} callback - Callback function for position updates
   * @param {Function} errorCallback - Callback function for errors
   * @returns {number|null} Watch ID for clearing the watch
   */
  watchPosition(callback, errorCallback) {
    if (!this.isClient || !this.hasGeolocation) {
      errorCallback?.(new Error('Geolocation not available'));
      return null;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000 // 1 minute
    };

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        errorCallback?.(new Error(this.getLocationErrorMessage(error.code)));
      },
      options
    );
  }

  /**
   * Clear position watch
   * @param {number} watchId - Watch ID returned by watchPosition
   */
  clearWatch(watchId) {
    if (this.isClient && this.hasGeolocation && watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
  }
}

// Create singleton instance
const geolocationService = new GeolocationService();

export default geolocationService;
