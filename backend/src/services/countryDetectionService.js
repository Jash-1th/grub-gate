// FILE: src/services/countryDetectionService.js
const axios = require('axios');

/**
 * Country Detection Service
 * Detects user's country from IP address, timezone, and other methods
 */

class CountryDetectionService {
  constructor() {
    this.countryData = this.initializeCountryData();
  }

  /**
   * Detect country from multiple sources
   * @param {Object} options - Detection options
   * @returns {Promise<Object>} Country information
   */
  async detectCountry(options = {}) {
    const { ip, timezone, acceptLanguage, postalCode } = options;
    
    const detectionResults = [];

    // Method 1: IP-based detection
    if (ip) {
      try {
        const ipResult = await this.detectFromIP(ip);
        detectionResults.push({ method: 'ip', ...ipResult, confidence: 0.8 });
      } catch (error) {
        console.warn('IP detection failed:', error.message);
      }
    }

    // Method 2: Timezone-based detection
    if (timezone) {
      try {
        const timezoneResult = this.detectFromTimezone(timezone);
        detectionResults.push({ method: 'timezone', ...timezoneResult, confidence: 0.6 });
      } catch (error) {
        console.warn('Timezone detection failed:', error.message);
      }
    }

    // Method 3: Language-based detection
    if (acceptLanguage) {
      try {
        const langResult = this.detectFromLanguage(acceptLanguage);
        detectionResults.push({ method: 'language', ...langResult, confidence: 0.4 });
      } catch (error) {
        console.warn('Language detection failed:', error.message);
      }
    }

    // Method 4: Postal code pattern detection
    if (postalCode) {
      try {
        const postalResult = this.detectFromPostalCode(postalCode);
        if (postalResult) {
          detectionResults.push({ method: 'postal', ...postalResult, confidence: 0.9 });
        }
      } catch (error) {
        console.warn('Postal code detection failed:', error.message);
      }
    }

    // Combine results and return best match
    return this.combineDetectionResults(detectionResults);
  }

  /**
   * Detect country from IP address using free services
   */
  async detectFromIP(ip) {
    // Skip private/local IPs
    if (this.isPrivateIP(ip)) {
      throw new Error('Cannot detect country from private IP');
    }

    const services = [
      {
        name: 'ipapi',
        url: `http://ip-api.com/json/${ip}`,
        parser: (data) => ({
          country: data.countryCode,
          countryName: data.country,
          city: data.city,
          region: data.regionName,
          timezone: data.timezone,
          currency: this.getCurrencyByCountry(data.countryCode)
        })
      },
      {
        name: 'ipinfo',
        url: `https://ipinfo.io/${ip}/json`,
        parser: (data) => ({
          country: data.country,
          countryName: this.getCountryName(data.country),
          city: data.city,
          region: data.region,
          timezone: data.timezone,
          currency: this.getCurrencyByCountry(data.country)
        })
      }
    ];

    for (const service of services) {
      try {
        console.log(`🌍 Detecting country from IP using ${service.name}`);
        const response = await axios.get(service.url, { timeout: 5000 });
        
        if (response.data && response.data.country) {
          const result = service.parser(response.data);
          console.log(`✅ IP detection successful:`, result);
          return result;
        }
      } catch (error) {
        console.warn(`⚠️ ${service.name} failed:`, error.message);
        continue;
      }
    }

    throw new Error('All IP detection services failed');
  }

  /**
   * Detect country from timezone
   */
  detectFromTimezone(timezone) {
    const timezoneCountryMap = {
      // North America
      'America/New_York': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Los_Angeles': 'US',
      'America/Toronto': 'CA',
      'America/Vancouver': 'CA',
      'America/Montreal': 'CA',
      'America/Mexico_City': 'MX',
      
      // Europe
      'Europe/London': 'UK',
      'Europe/Berlin': 'DE',
      'Europe/Paris': 'FR',
      'Europe/Rome': 'IT',
      'Europe/Madrid': 'ES',
      'Europe/Amsterdam': 'NL',
      
      // Asia
      'Asia/Kolkata': 'IN',
      'Asia/Mumbai': 'IN',
      'Asia/Delhi': 'IN',
      'Asia/Tokyo': 'JP',
      'Asia/Shanghai': 'CN',
      'Asia/Seoul': 'KR',
      'Asia/Singapore': 'SG',
      
      // Oceania
      'Australia/Sydney': 'AU',
      'Australia/Melbourne': 'AU',
      'Australia/Perth': 'AU',
      'Pacific/Auckland': 'NZ',
      
      // South America
      'America/Sao_Paulo': 'BR',
      'America/Buenos_Aires': 'AR',
      'America/Santiago': 'CL'
    };

    const country = timezoneCountryMap[timezone];
    if (!country) {
      throw new Error(`Unknown timezone: ${timezone}`);
    }

    return {
      country,
      countryName: this.getCountryName(country),
      timezone,
      currency: this.getCurrencyByCountry(country)
    };
  }

  /**
   * Detect country from Accept-Language header
   */
  detectFromLanguage(acceptLanguage) {
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,es;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.trim().split(';')[0])
      .map(lang => lang.split('-'));

    const languageCountryMap = {
      'en-US': 'US',
      'en-CA': 'CA',
      'en-GB': 'UK',
      'en-AU': 'AU',
      'fr-CA': 'CA',
      'fr-FR': 'FR',
      'es-ES': 'ES',
      'es-MX': 'MX',
      'de-DE': 'DE',
      'it-IT': 'IT',
      'pt-BR': 'BR',
      'ja-JP': 'JP',
      'ko-KR': 'KR',
      'zh-CN': 'CN',
      'hi-IN': 'IN',
      'ta-IN': 'IN',
      'te-IN': 'IN'
    };

    for (const [lang, region] of languages) {
      const langCode = region ? `${lang}-${region}` : lang;
      const country = languageCountryMap[langCode];
      
      if (country) {
        return {
          country,
          countryName: this.getCountryName(country),
          language: langCode,
          currency: this.getCurrencyByCountry(country)
        };
      }
    }

    throw new Error('Could not detect country from language');
  }

  /**
   * Detect country from postal code pattern
   */
  detectFromPostalCode(postalCode) {
    const patterns = {
      'US': /^\d{5}(-\d{4})?$/,
      'CA': /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
      'IN': /^\d{6}$/,
      'UK': /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i,
      'AU': /^\d{4}$/,
      'DE': /^\d{5}$/,
      'FR': /^\d{5}$/,
      'JP': /^\d{3}-\d{4}$/,
      'BR': /^\d{5}-\d{3}$/,
      'MX': /^\d{5}$/
    };

    for (const [country, pattern] of Object.entries(patterns)) {
      if (pattern.test(postalCode.trim())) {
        return {
          country,
          countryName: this.getCountryName(country),
          postalCode: postalCode.trim(),
          currency: this.getCurrencyByCountry(country)
        };
      }
    }

    return null;
  }

  /**
   * Combine detection results and return best match
   */
  combineDetectionResults(results) {
    if (results.length === 0) {
      return this.getDefaultCountry();
    }

    // Sort by confidence and return highest confidence result
    results.sort((a, b) => b.confidence - a.confidence);
    
    const bestResult = results[0];
    
    // Merge data from multiple sources
    const combinedResult = {
      country: bestResult.country,
      countryName: bestResult.countryName,
      confidence: bestResult.confidence,
      detectionMethods: results.map(r => r.method),
      currency: bestResult.currency,
      timezone: bestResult.timezone,
      city: bestResult.city,
      region: bestResult.region
    };

    console.log('🎯 Country detection result:', combinedResult);
    return combinedResult;
  }

  /**
   * Check if IP is private/local
   */
  isPrivateIP(ip) {
    const privateRanges = [
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^127\./,
      /^localhost$/,
      /^::1$/
    ];

    return privateRanges.some(range => range.test(ip));
  }

  /**
   * Get country name from code
   */
  getCountryName(countryCode) {
    return this.countryData[countryCode]?.name || countryCode;
  }

  /**
   * Get currency by country
   */
  getCurrencyByCountry(countryCode) {
    return this.countryData[countryCode]?.currency || 'USD';
  }

  /**
   * Get default country (US)
   */
  getDefaultCountry() {
    return {
      country: 'US',
      countryName: 'United States',
      currency: 'USD',
      confidence: 0.1,
      detectionMethods: ['default']
    };
  }

  /**
   * Initialize country data
   */
  initializeCountryData() {
    return {
      'US': { name: 'United States', currency: 'USD', timezone: 'America/New_York' },
      'CA': { name: 'Canada', currency: 'CAD', timezone: 'America/Toronto' },
      'IN': { name: 'India', currency: 'INR', timezone: 'Asia/Kolkata' },
      'UK': { name: 'United Kingdom', currency: 'GBP', timezone: 'Europe/London' },
      'AU': { name: 'Australia', currency: 'AUD', timezone: 'Australia/Sydney' },
      'DE': { name: 'Germany', currency: 'EUR', timezone: 'Europe/Berlin' },
      'FR': { name: 'France', currency: 'EUR', timezone: 'Europe/Paris' },
      'JP': { name: 'Japan', currency: 'JPY', timezone: 'Asia/Tokyo' },
      'BR': { name: 'Brazil', currency: 'BRL', timezone: 'America/Sao_Paulo' },
      'MX': { name: 'Mexico', currency: 'MXN', timezone: 'America/Mexico_City' },
      'ES': { name: 'Spain', currency: 'EUR', timezone: 'Europe/Madrid' },
      'IT': { name: 'Italy', currency: 'EUR', timezone: 'Europe/Rome' },
      'NL': { name: 'Netherlands', currency: 'EUR', timezone: 'Europe/Amsterdam' },
      'KR': { name: 'South Korea', currency: 'KRW', timezone: 'Asia/Seoul' },
      'SG': { name: 'Singapore', currency: 'SGD', timezone: 'Asia/Singapore' }
    };
  }
}

// Create singleton instance
const countryDetectionService = new CountryDetectionService();

// Export functions
const detectCountry = (options) => {
  return countryDetectionService.detectCountry(options);
};

const detectFromIP = (ip) => {
  return countryDetectionService.detectFromIP(ip);
};

module.exports = {
  countryDetectionService,
  detectCountry,
  detectFromIP
};
