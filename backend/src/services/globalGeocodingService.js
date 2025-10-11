// FILE: src/services/globalGeocodingService.js
const axios = require('axios');

/**
 * Global Geocoding Service
 * Supports worldwide address geocoding with country-specific optimizations
 */

class GlobalGeocodingService {
  constructor() {
    this.providers = {
      google: this.geocodeWithGoogle.bind(this),
      mapbox: this.geocodeWithMapbox.bind(this),
      nominatim: this.geocodeWithNominatim.bind(this)
    };
    
    // Country-specific provider preferences
    this.countryProviders = {
      'US': ['google', 'mapbox', 'nominatim'],
      'CA': ['google', 'mapbox', 'nominatim'],
      'IN': ['mapbox', 'google', 'nominatim'],
      'UK': ['google', 'mapbox', 'nominatim'],
      'AU': ['google', 'mapbox', 'nominatim'],
      'DE': ['mapbox', 'google', 'nominatim'],
      'FR': ['google', 'mapbox', 'nominatim'],
      'JP': ['google', 'mapbox', 'nominatim'],
      'BR': ['mapbox', 'google', 'nominatim'],
      'MX': ['google', 'mapbox', 'nominatim'],
      'default': ['mapbox', 'nominatim', 'google']
    };
  }

  /**
   * Main geocoding function with global support
   * @param {Object} address - Address object with country, city, state, postalCode
   * @returns {Promise<{lat: number, lng: number, provider: string, accuracy: string}>}
   */
  async geocodeGlobalAddress(address) {
    const { country, city, state, postalCode, addressLine1, addressLine2 } = address;
    
    // Build formatted address string
    const addressString = this.buildAddressString(address);
    
    // Get preferred providers for this country
    const providers = this.countryProviders[country] || this.countryProviders.default;
    
    let lastError = null;

    // Try each provider in order of preference
    for (const providerName of providers) {
      try {
        const provider = this.providers[providerName];
        if (!provider) continue;

        console.log(`🌍 Attempting geocoding with ${providerName} for ${country}: ${addressString}`);
        const result = await provider(address, addressString);
        
        if (result && result.lat && result.lng) {
          // Validate coordinates are in expected country bounds
          if (this.validateCoordinatesForCountry(result, country)) {
            console.log(`✅ Geocoding successful with ${providerName}:`, result);
            return {
              ...result,
              provider: providerName,
              country: country,
              formattedAddress: addressString
            };
          } else {
            console.warn(`⚠️ Coordinates outside expected bounds for ${country}`);
            continue;
          }
        }
      } catch (error) {
        console.warn(`⚠️ Geocoding failed with ${providerName}:`, error.message);
        lastError = error;
        continue;
      }
    }

    throw new Error(`Geocoding failed for ${country} address: ${addressString}. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Build address string based on country format
   */
  buildAddressString(address) {
    const { country, addressLine1, addressLine2, city, state, postalCode } = address;
    
    // Country-specific address formatting
    switch (country) {
      case 'US':
        return [addressLine1, addressLine2, city, state, postalCode].filter(Boolean).join(', ');
      
      case 'CA':
        return [addressLine1, addressLine2, city, state, postalCode, 'Canada'].filter(Boolean).join(', ');
      
      case 'IN':
        return [addressLine1, addressLine2, city, state, postalCode, 'India'].filter(Boolean).join(', ');
      
      case 'UK':
        return [addressLine1, addressLine2, city, postalCode, 'United Kingdom'].filter(Boolean).join(', ');
      
      case 'AU':
        return [addressLine1, addressLine2, city, state, postalCode, 'Australia'].filter(Boolean).join(', ');
      
      case 'DE':
        return [addressLine1, addressLine2, postalCode, city, 'Germany'].filter(Boolean).join(', ');
      
      default:
        return [addressLine1, addressLine2, city, state, postalCode, address.country].filter(Boolean).join(', ');
    }
  }

  /**
   * Google Maps Geocoding with global support
   */
  async geocodeWithGoogle(address, addressString) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const url = 'https://maps.googleapis.com/maps/api/geocode/json';
    const params = {
      address: addressString,
      key: apiKey,
      region: address.country.toLowerCase()
    };

    const response = await axios.get(url, { 
      params,
      timeout: 10000
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
   * MapBox Geocoding with global support
   */
  async geocodeWithMapbox(address, addressString) {
    const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('MapBox access token not configured');
    }

    const encodedAddress = encodeURIComponent(addressString);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json`;
    
    // Country code mapping
    const countryCodeMap = {
      'US': 'us', 'CA': 'ca', 'IN': 'in', 'UK': 'gb', 
      'AU': 'au', 'DE': 'de', 'FR': 'fr', 'JP': 'jp',
      'BR': 'br', 'MX': 'mx'
    };
    
    const params = {
      access_token: accessToken,
      country: countryCodeMap[address.country] || address.country.toLowerCase(),
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

    return {
      lat: lat,
      lng: lng,
      formatted_address: feature.place_name,
      accuracy: feature.relevance >= 0.8 ? 'high' : 'medium'
    };
  }

  /**
   * OpenStreetMap Nominatim with global support
   */
  async geocodeWithNominatim(address, addressString) {
    const url = 'https://nominatim.openstreetmap.org/search';
    
    // Country code mapping for Nominatim
    const countryCodeMap = {
      'US': 'us', 'CA': 'ca', 'IN': 'in', 'UK': 'gb',
      'AU': 'au', 'DE': 'de', 'FR': 'fr', 'JP': 'jp',
      'BR': 'br', 'MX': 'mx'
    };
    
    const params = {
      q: addressString,
      format: 'json',
      limit: 1,
      countrycodes: countryCodeMap[address.country] || address.country.toLowerCase(),
      addressdetails: 1
    };

    const headers = {
      'User-Agent': 'GrubGate-Global-App/1.0 (contact@grubgate.com)'
    };

    const response = await axios.get(url, { 
      params, 
      headers,
      timeout: 15000
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
   * Validate coordinates are within expected country bounds
   */
  validateCoordinatesForCountry(coordinates, country) {
    const countryBounds = {
      'US': { latMin: 24.396308, latMax: 49.384358, lngMin: -125.0, lngMax: -66.93457 },
      'CA': { latMin: 41.6751, latMax: 83.23324, lngMin: -141.0, lngMax: -52.6480987209 },
      'IN': { latMin: 6.4626999, latMax: 37.6, lngMin: 68.1766451354, lngMax: 97.4025614766 },
      'UK': { latMin: 49.959999905, latMax: 58.6350001085, lngMin: -7.57216793459, lngMax: 1.68153079591 },
      'AU': { latMin: -43.6345972634, latMax: -10.6681857235, lngMin: 113.338953078, lngMax: 153.569469029 },
      'DE': { latMin: 47.3024876979, latMax: 54.983104153, lngMin: 5.98865807458, lngMax: 15.0169958839 }
    };

    const bounds = countryBounds[country];
    if (!bounds) {
      return true; // Allow if no bounds defined
    }

    const { lat, lng } = coordinates;
    return lat >= bounds.latMin && lat <= bounds.latMax && 
           lng >= bounds.lngMin && lng <= bounds.lngMax;
  }

  /**
   * Detect country from postal code pattern
   */
  detectCountryFromPostalCode(postalCode) {
    const patterns = {
      'US': /^\d{5}(-\d{4})?$/,
      'CA': /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
      'IN': /^\d{6}$/,
      'UK': /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i,
      'AU': /^\d{4}$/,
      'DE': /^\d{5}$/,
      'FR': /^\d{5}$/,
      'JP': /^\d{3}-\d{4}$/,
      'BR': /^\d{5}-\d{3}$/
    };

    for (const [country, pattern] of Object.entries(patterns)) {
      if (pattern.test(postalCode)) {
        return country;
      }
    }

    return null; // Unknown format
  }

  /**
   * Reverse geocoding - convert coordinates to address
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<{address: Object}>}
   */
  async reverseGeocode(lat, lng) {
    // Try Nominatim first (free and reliable for reverse geocoding)
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          lat,
          lon: lng,
          format: 'json',
          addressdetails: 1,
          zoom: 18
        },
        headers: {
          'User-Agent': 'GrubGate/1.0 (contact@grubgate.com)'
        }
      });

      if (response.data && response.data.address) {
        const addr = response.data.address;
        
        return {
          address: {
            street: `${addr.house_number || ''} ${addr.road || ''}`.trim(),
            city: addr.city || addr.town || addr.village || addr.municipality || '',
            province: addr.state || addr.province || addr.region || '',
            postalCode: addr.postcode || '',
            country: addr.country || '',
            formattedAddress: response.data.display_name || `${lat}, ${lng}`,
            // Additional fields
            streetNumber: addr.house_number || '',
            streetName: addr.road || '',
            locality: addr.city || addr.town || addr.village || '',
            region: addr.state || addr.province || ''
          },
          provider: 'nominatim',
          coordinates: { lat, lng }
        };
      }
    } catch (error) {
      console.warn('Nominatim reverse geocoding failed:', error.message);
    }

    // Fallback: return coordinates as formatted address
    return {
      address: {
        street: '',
        city: '',
        province: '',
        postalCode: '',
        country: '',
        formattedAddress: `Location: ${lat}, ${lng}`
      },
      provider: 'fallback',
      coordinates: { lat, lng }
    };
  }
}

// Create singleton instance
const globalGeocodingService = new GlobalGeocodingService();

// Export functions for backward compatibility
const geocodeGlobalAddress = (address) => {
  return globalGeocodingService.geocodeGlobalAddress(address);
};

const detectCountryFromPostalCode = (postalCode) => {
  return globalGeocodingService.detectCountryFromPostalCode(postalCode);
};

const reverseGeocode = (lat, lng) => {
  return globalGeocodingService.reverseGeocode(lat, lng);
};

module.exports = {
  globalGeocodingService,
  geocodeGlobalAddress,
  detectCountryFromPostalCode,
  reverseGeocode
};
