// FILE: apps/customer-app/src/services/addressService.js
/**
 * Address Service
 * Handles all address-related API calls
 * Provides centralized address management functionality
 */

import apiClient from '../api/apiClient';

class AddressService {
  /**
   * Get all user addresses
   * @returns {Promise<Array>} Array of user addresses
   */
  async getAddresses() {
    try {
      const response = await apiClient.get('/users/addresses');
      return response.data.data.addresses || [];
    } catch (error) {
      console.error('Get addresses error:', error);
      throw new Error(error.response?.data?.message || 'Failed to load addresses');
    }
  }

  /**
   * Add new address
   * @param {Object} address - Address data to add
   * @returns {Promise<Array>} Updated addresses array
   */
  async addAddress(address) {
    try {
      const response = await apiClient.post('/users/addresses', address);
      return response.data.data.addresses || [];
    } catch (error) {
      console.error('Add address error:', error);
      throw new Error(error.response?.data?.message || 'Failed to add address');
    }
  }

  /**
   * Update existing address
   * @param {string} addressId - Address ID to update
   * @param {Object} address - Updated address data
   * @returns {Promise<Array>} Updated addresses array
   */
  async updateAddress(addressId, address) {
    try {
      const response = await apiClient.patch(`/users/addresses/${addressId}`, address);
      return response.data.data.addresses || [];
    } catch (error) {
      console.error('Update address error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update address');
    }
  }

  /**
   * Delete address
   * @param {string} addressId - Address ID to delete
   * @returns {Promise<Array>} Updated addresses array
   */
  async deleteAddress(addressId) {
    try {
      const response = await apiClient.delete(`/users/addresses/${addressId}`);
      return response.data.data.addresses || [];
    } catch (error) {
      console.error('Delete address error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete address');
    }
  }

  /**
   * Set address as default
   * @param {string} addressId - Address ID to set as default
   * @returns {Promise<Array>} Updated addresses array
   */
  async setDefaultAddress(addressId) {
    try {
      const response = await apiClient.patch(`/users/addresses/${addressId}/default`);
      return response.data.data.addresses || [];
    } catch (error) {
      console.error('Set default address error:', error);
      throw new Error(error.response?.data?.message || 'Failed to set default address');
    }
  }

  /**
   * Get default address
   * @returns {Promise<Object|null>} Default address or null
   */
  async getDefaultAddress() {
    try {
      const addresses = await this.getAddresses();
      return addresses.find(addr => addr.isDefault) || addresses[0] || null;
    } catch (error) {
      console.error('Get default address error:', error);
      return null;
    }
  }

  /**
   * Validate address with delivery zone check
   * @param {Object} address - Address to validate
   * @param {string} restaurantId - Restaurant ID for delivery zone check
   * @returns {Promise<Object>} Validation result
   */
  async validateAddressForDelivery(address, restaurantId) {
    try {
      const response = await apiClient.post('/geocoding/check-delivery', {
        address,
        restaurantId
      });
      
      return {
        isValid: true,
        canDeliver: response.data.data.canDeliver,
        distance: response.data.data.distance,
        deliveryFee: response.data.data.deliveryFee,
        estimatedTime: response.data.data.estimatedTime
      };
    } catch (error) {
      console.error('Address delivery validation error:', error);
      return {
        isValid: false,
        canDeliver: false,
        error: error.response?.data?.message || 'Unable to validate delivery address'
      };
    }
  }

  /**
   * Format address for display
   * @param {Object} address - Address object
   * @returns {string} Formatted address string
   */
  formatAddressForDisplay(address) {
    if (!address) return '';

    const parts = [];
    
    if (address.street) parts.push(address.street);
    if (address.addressLine2) parts.push(address.addressLine2);
    
    const cityLine = [];
    if (address.city) cityLine.push(address.city);
    if (address.province || address.state) cityLine.push(address.province || address.state);
    if (address.postalCode) cityLine.push(address.postalCode);
    
    if (cityLine.length > 0) parts.push(cityLine.join(', '));
    
    return parts.join(', ');
  }

  /**
   * Get address by ID from addresses array
   * @param {Array} addresses - Array of addresses
   * @param {string} addressId - Address ID to find
   * @returns {Object|null} Found address or null
   */
  getAddressById(addresses, addressId) {
    return addresses.find(addr => addr._id === addressId) || null;
  }

  /**
   * Group addresses by type
   * @param {Array} addresses - Array of addresses
   * @returns {Object} Grouped addresses by type
   */
  groupAddressesByType(addresses) {
    return addresses.reduce((groups, address) => {
      const type = address.type || 'other';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(address);
      return groups;
    }, {});
  }

  /**
   * Check if address is complete
   * @param {Object} address - Address to check
   * @returns {boolean} Whether address has all required fields
   */
  isAddressComplete(address) {
    if (!address) return false;
    
    const requiredFields = ['street', 'city', 'postalCode'];
    return requiredFields.every(field => address[field] && address[field].trim().length > 0);
  }

  /**
   * Get address suggestions for autocomplete
   * @param {string} query - Search query
   * @param {string} country - Country code (optional)
   * @returns {Promise<Array>} Array of address suggestions
   */
  async getAddressSuggestions(query, country = null) {
    if (!query || query.length < 3) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        q: query,
        limit: 5
      });

      if (country) {
        params.append('country', country);
      }

      const response = await apiClient.get(`/geocoding/suggestions?${params}`);
      return response.data.data.suggestions || [];
    } catch (error) {
      console.warn('Address suggestions error:', error);
      return [];
    }
  }
}

// Create singleton instance
const addressService = new AddressService();

export default addressService;
