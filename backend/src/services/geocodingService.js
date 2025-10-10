// FILE: src/services/geocodingService.js
const axios = require('axios');

/**
 * Geocoding Service
 * Supports multiple providers: Google Maps, OpenStreetMap Nominatim, and MapBox
 */

class GeocodingService {
  constructor() {
    this.providers = {
      google: this.geocodeWithGoogle.bind(this),
      nominatim: this.geocodeWithNominatim.bind(this),
      mapbox: this.geocodeWithMapbox.bind(this)
    };
    
    // Priority order of providers
    this.providerOrder = ['google', 'mapbox', 'nominatim'];
  }

  /**
   * Main geocoding function with fallback providers
   * @param {string} postalCode - Postal code
   * @param {string} city - City name
   * @param {string} province - Province/State
   * @param {string} country - Country (default: Canada)
   * @returns {Promise<{lat: number, lng: number, provider: string}>}
   */
  async geocodeAddress(postalCode, city, province, country = 'Canada') {
    const address = `${postalCode}, ${city}, ${province}, ${country}`;
    let lastError = null;

    // Try each provider in order
    for (const providerName of this.providerOrder) {
      try {
        const provider = this.providers[providerName];
        if (!provider) continue;

        console.log(`🌍 Attempting geocoding with ${providerName} for: ${address}`);
        const result = await provider(address, postalCode, city, province, country);
        
        if (result && result.lat && result.lng) {
          console.log(`✅ Geocoding successful with ${providerName}:`, result);
          return {
            ...result,
            provider: providerName,
            address: address
          };
        }
      } catch (error) {
        console.warn(`⚠️ Geocoding failed with ${providerName}:`, error.message);
        lastError = error;
        continue;
      }
    }

    // If all providers fail, throw the last error
    throw new Error(`Geocoding failed for address: ${address}. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Google Maps Geocoding API
   * Most accurate but requires API key and has usage limits
   */
  async geocodeWithGoogle(address, postalCode, city, province, country) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const url = 'https://maps.googleapis.com/maps/api/geocode/json';
    const params = {
      address: address,
      key: apiKey,
      region: country.toLowerCase() === 'canada' ? 'ca' : 'us'
    };

    const response = await axios.get(url, { 
      params,
      timeout: 10000 // 10 second timeout
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Geocoding API error: ${response.data.status}`);
    }

    if (!response.data.results || response.data.results.length === 0) {
      throw new Error('No results found from Google Geocoding API');
    }

    const location = response.data.results[0].geometry.location;
    const formattedAddress = response.data.results[0].formatted_address;

    return {
      lat: location.lat,
      lng: location.lng,
      formatted_address: formattedAddress,
      accuracy: 'high'
    };
  }

  /**
   * MapBox Geocoding API
   * Good accuracy and generous free tier
   */
  async geocodeWithMapbox(address, postalCode, city, province, country) {
    const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('MapBox access token not configured');
    }

    // Improve query format for better accuracy
    let searchQuery = address;
    
    // For Indian addresses, use better format
    if (country.toLowerCase() === 'india') {
      if (postalCode && city && province) {
        // Format: "PostalCode City Province India" works best for Indian locations
        searchQuery = `${postalCode} ${city} ${province} India`;
      }
    }

    const encodedAddress = encodeURIComponent(searchQuery);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json`;
    
    // Set country code based on country
    let countryCode = 'us'; // default
    if (country.toLowerCase() === 'canada') countryCode = 'ca';
    if (country.toLowerCase() === 'india') countryCode = 'in';
    
    const params = {
      access_token: accessToken,
      country: countryCode,
      limit: 1,
      types: 'postcode,place,address,region'
    };

    const response = await axios.get(url, { 
      params,
      timeout: 10000
    });

    if (!response.data.features || response.data.features.length === 0) {
      throw new Error('No results found from MapBox Geocoding API');
    }

    const feature = response.data.features[0];
    const [lng, lat] = feature.center;

    // Validate coordinates are in expected country bounds
    if (country.toLowerCase() === 'india') {
      // India bounds: lat 6-37, lng 68-97
      if (lat < 6 || lat > 37 || lng < 68 || lng > 97) {
        throw new Error('MapBox returned coordinates outside India');
      }
    }

    return {
      lat: lat,
      lng: lng,
      formatted_address: feature.place_name,
      accuracy: feature.relevance >= 0.8 ? 'high' : 'medium'
    };
  }

  /**
   * OpenStreetMap Nominatim (Free)
   * Free service but lower accuracy and rate limits
   */
  async geocodeWithNominatim(address, postalCode, city, province, country) {
    const url = 'https://nominatim.openstreetmap.org/search';
    const params = {
      q: address,
      format: 'json',
      limit: 1,
      countrycodes: country.toLowerCase() === 'canada' ? 'ca' : 'us',
      addressdetails: 1
    };

    // Add User-Agent header as required by Nominatim
    const headers = {
      'User-Agent': 'GrubGate-Restaurant-App/1.0 (contact@grubgate.com)'
    };

    const response = await axios.get(url, { 
      params, 
      headers,
      timeout: 15000 // Nominatim can be slower
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No results found from Nominatim');
    }

    const result = response.data[0];
    
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      formatted_address: result.display_name,
      accuracy: 'medium'
    };
  }

  /**
   * Validate coordinates
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {boolean}
   */
  validateCoordinates(lat, lng) {
    return (
      typeof lat === 'number' && 
      typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180 &&
      !isNaN(lat) && !isNaN(lng)
    );
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {Object} coord1 - {lat, lng}
   * @param {Object} coord2 - {lat, lng}
   * @returns {number} Distance in kilometers
   */
  calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees
   * @returns {number}
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

// Create singleton instance
const geocodingService = new GeocodingService();

// Export functions for backward compatibility
const geocodeAddress = (postalCode, city, province, country) => {
  return geocodingService.geocodeAddress(postalCode, city, province, country);
};

const calculateDistance = (coord1, coord2) => {
  return geocodingService.calculateDistance(coord1, coord2);
};

const validateCoordinates = (lat, lng) => {
  return geocodingService.validateCoordinates(lat, lng);
};

module.exports = {
  geocodingService,
  geocodeAddress,
  calculateDistance,
  validateCoordinates
};
