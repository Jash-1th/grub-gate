// FILE: src/api/menuApi.js
import { apiClient } from './client';

/**
 * Get all menu items for partner's restaurant
 */
export const getMenuItems = async (restaurantId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 50,
      ...(params.category && params.category !== 'all' && { category: params.category }),
      ...(params.status && params.status !== 'all' && { status: params.status }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
      ...(params.search && { search: params.search })
    });

    const response = await apiClient.get(
      `/partner/restaurants/${restaurantId}/menu-items?${queryParams}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
};

/**
 * Get single menu item
 */
export const getMenuItem = async (restaurantId, itemId) => {
  try {
    const response = await apiClient.get(
      `/partner/restaurants/${restaurantId}/menu-items/${itemId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching menu item:', error);
    throw error;
  }
};

/**
 * Create new menu item with image upload
 */
export const createMenuItem = async (restaurantId, formData) => {
  try {
    const response = await apiClient.post(
      `/partner/restaurants/${restaurantId}/menu-items`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating menu item:', error);
    throw error;
  }
};

/**
 * Update menu item with optional image upload
 */
export const updateMenuItem = async (restaurantId, itemId, formData) => {
  try {
    const response = await apiClient.patch(
      `/partner/restaurants/${restaurantId}/menu-items/${itemId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};

/**
 * Delete menu item
 */
export const deleteMenuItem = async (restaurantId, itemId) => {
  try {
    const response = await apiClient.delete(
      `/partner/restaurants/${restaurantId}/menu-items/${itemId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

/**
 * Toggle menu item status
 */
export const toggleMenuItemStatus = async (restaurantId, itemId, status) => {
  try {
    const response = await apiClient.patch(
      `/partner/restaurants/${restaurantId}/menu-items/${itemId}/status`,
      { status }
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling menu item status:', error);
    throw error;
  }
};

/**
 * Update menu item availability
 */
export const updateMenuItemAvailability = async (restaurantId, itemId, availability) => {
  try {
    const response = await apiClient.patch(
      `/partner/restaurants/${restaurantId}/menu-items/${itemId}/availability`,
      { availability }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating menu item availability:', error);
    throw error;
  }
};

/**
 * Get menu categories for restaurant
 */
export const getMenuCategories = async (restaurantId) => {
  try {
    const response = await apiClient.get(
      `/partner/restaurants/${restaurantId}/menu-items/categories`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    throw error;
  }
};

/**
 * Helper function to create FormData from menu item data
 */
export const createMenuItemFormData = (itemData, imageFile = null) => {
  const formData = new FormData();
  
  // Add all text fields
  Object.keys(itemData).forEach(key => {
    if (itemData[key] !== null && itemData[key] !== undefined) {
      if (Array.isArray(itemData[key])) {
        // Handle arrays (dietaryPreferences, ingredients, allergens)
        console.log(`📤 Processing array field ${key}:`, itemData[key]);
        itemData[key].forEach(item => {
          if (item && item.trim && item.trim() !== '') {
            formData.append(`${key}[]`, item.trim());
          }
        });
      } else if (typeof itemData[key] === 'object' && key === 'availability') {
        // Handle availability object - ensure boolean types are preserved
        console.log('📤 Processing availability for FormData:', itemData[key]);
        
        // Ensure all values are proper booleans
        const cleanedAvailability = {};
        Object.keys(itemData[key]).forEach(day => {
          cleanedAvailability[day] = {
            lunch: Boolean(itemData[key][day]?.lunch),
            dinner: Boolean(itemData[key][day]?.dinner)
          };
        });
        
        console.log('📤 Cleaned availability:', cleanedAvailability);
        const availabilityString = JSON.stringify(cleanedAvailability);
        console.log('📤 Availability JSON string:', availabilityString);
        
        formData.append(key, availabilityString);
      } else if (typeof itemData[key] === 'object' && key === 'nutritionInfo') {
        // Handle nutrition info object
        formData.append(key, JSON.stringify(itemData[key]));
      } else {
        // Handle other fields with proper type conversion
        let value = itemData[key];
        
        // Ensure numeric fields are properly formatted
        if (key === 'price' && value !== '') {
          value = parseFloat(value).toString();
          console.log(`📤 Converted ${key} to:`, value);
        } else if (['prepTime', 'servings', 'spiceLevel'].includes(key) && value !== '') {
          value = parseInt(value).toString();
          console.log(`📤 Converted ${key} to:`, value);
        }
        
        formData.append(key, value);
      }
    }
  });
  
  // Add image file if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  return formData;
};

/**
 * Helper function to parse form data for menu item
 */
export const parseMenuItemFormData = (formData) => {
  const data = {};
  
  // Basic fields
  data.name = formData.get('name')?.trim();
  data.description = formData.get('description')?.trim();
  data.category = formData.get('category');
  data.cuisine = formData.get('cuisine')?.trim();
  data.price = parseFloat(formData.get('price'));
  data.prepTime = parseInt(formData.get('prepTime'));
  data.servings = parseInt(formData.get('servings')) || 1;
  data.status = formData.get('status') || 'available';
  data.spiceLevel = parseInt(formData.get('spiceLevel')) || 0;
  
  // Handle arrays
  const dietaryPreferences = formData.getAll('dietaryPreferences[]');
  if (dietaryPreferences.length > 0) {
    data.dietaryPreferences = dietaryPreferences;
  }
  
  const ingredients = formData.getAll('ingredients[]');
  if (ingredients.length > 0) {
    data.ingredients = ingredients;
  }
  
  const allergens = formData.getAll('allergens[]');
  if (allergens.length > 0) {
    data.allergens = allergens;
  }
  
  // Handle availability object
  const availabilityStr = formData.get('availability');
  if (availabilityStr) {
    try {
      data.availability = JSON.parse(availabilityStr);
    } catch (e) {
      console.error('Error parsing availability:', e);
    }
  }
  
  // Handle nutrition info
  const nutritionStr = formData.get('nutritionInfo');
  if (nutritionStr) {
    try {
      data.nutritionInfo = JSON.parse(nutritionStr);
    } catch (e) {
      console.error('Error parsing nutrition info:', e);
    }
  }
  
  return data;
};
