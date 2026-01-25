import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import useFormValidation from '../hooks/useFormValidation';
import ValidatedInput from '../components/common/ValidatedInput';
import schemas from '../utils/validation/schemas';

/**
 * Example of how to integrate Joi validation into MenuPage
 * This shows the enhanced menu item form with comprehensive validation
 */
const MenuFormExample = ({ onSave, onCancel, initialData = null, isLoading = false }) => {
  
  // Initial form data for menu item
  const initialFormData = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    longDescription: initialData?.longDescription || '',
    category: initialData?.category || '',
    cuisine: initialData?.cuisine || '',
    price: initialData?.price || '',
    prepTime: initialData?.prepTime || 30,
    servings: initialData?.servings || 1,
    spiceLevel: initialData?.spiceLevel || 0,
    dietaryPreferences: initialData?.dietaryPreferences || [],
    ingredients: initialData?.ingredients || [],
    allergens: initialData?.allergens || [],
    calories: initialData?.nutritionInfo?.calories || '',
    protein: initialData?.nutritionInfo?.protein || '',
    carbs: initialData?.nutritionInfo?.carbs || '',
    fat: initialData?.nutritionInfo?.fat || '',
    status: initialData?.status || 'available'
  };

  // Form validation hook
  const {
    formData,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldProps,
    setFieldValue,
    errors: validationErrors,
    isValid,
    hasErrors,
    validationSummary
  } = useFormValidation(
    initialFormData,
    schemas.menuItemSchemas.basicInfo,
    {
      validateOnChange: true,
      validateOnBlur: true,
      showErrorsOnlyAfterTouch: true,
      debounceMs: 300
    }
  );

  // Additional state for complex fields
  const [ingredientsText, setIngredientsText] = useState(
    initialData?.ingredients?.join(', ') || ''
  );

  // Options for dropdowns
  const categoryOptions = [
    { value: 'appetizer', label: 'Appetizer' },
    { value: 'main', label: 'Main Course' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'beverage', label: 'Beverage' },
    { value: 'salad', label: 'Salad' },
    { value: 'soup', label: 'Soup' },
    { value: 'pasta', label: 'Pasta' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'burger', label: 'Burger' },
    { value: 'sandwich', label: 'Sandwich' },
    { value: 'seafood', label: 'Seafood' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'always-available', label: 'Always Available' },
    { value: 'special', label: 'Special' }
  ];

  const cuisineOptions = [
    'Italian', 'Chinese', 'Mexican', 'Indian', 'French', 'Japanese', 
    'Thai', 'Mediterranean', 'American', 'Greek', 'Lebanese', 'Vietnamese',
    'Korean', 'Spanish', 'Turkish', 'Moroccan', 'Ethiopian', 'Other'
  ];

  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten-Free' },
    { value: 'dairy-free', label: 'Dairy-Free' },
    { value: 'spicy', label: 'Spicy' },
    { value: 'keto', label: 'Keto' },
    { value: 'low-carb', label: 'Low-Carb' },
    { value: 'non-veg', label: 'Non-Veg' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' }
  ];

  const allergenOptions = [
    { value: 'gluten', label: 'Gluten' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'fish', label: 'Fish' },
    { value: 'shellfish', label: 'Shellfish' },
    { value: 'nuts', label: 'Nuts' },
    { value: 'peanuts', label: 'Peanuts' },
    { value: 'soy', label: 'Soy' },
    { value: 'sesame', label: 'Sesame' },
    { value: 'alcohol', label: 'Alcohol' },
    { value: 'sulfites', label: 'Sulfites' }
  ];

  // Handle ingredients text change
  const handleIngredientsChange = (e) => {
    const value = e.target.value;
    setIngredientsText(value);
    
    // Convert comma-separated text to array
    const ingredientsArray = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    setFieldValue('ingredients', ingredientsArray);
  };

  // Handle checkbox arrays (dietary preferences, allergens)
  const handleArrayChange = (fieldName, value, checked) => {
    const currentArray = formData[fieldName] || [];
    let newArray;
    
    if (checked) {
      newArray = [...currentArray, value];
    } else {
      newArray = currentArray.filter(item => item !== value);
    }
    
    setFieldValue(fieldName, newArray);
  };

  // Handle form submission
  const onSubmit = handleSubmit(async (validatedData) => {
    try {
      // Prepare data for API
      const menuItemData = {
        ...validatedData,
        nutritionInfo: {
          calories: validatedData.calories ? parseInt(validatedData.calories) : null,
          protein: validatedData.protein,
          carbs: validatedData.carbs,
          fat: validatedData.fat
        }
      };

      // Remove nutrition fields from root level
      delete menuItemData.calories;
      delete menuItemData.protein;
      delete menuItemData.carbs;
      delete menuItemData.fat;

      await onSave(menuItemData);
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Validation Summary (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">{validationSummary}</p>
              {hasErrors && (
                <details className="mt-2">
                  <summary className="text-xs text-blue-600 cursor-pointer">View validation errors</summary>
                  <pre className="text-xs mt-1 text-blue-700">{JSON.stringify(validationErrors, null, 2)}</pre>
                </details>
              )}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <ValidatedInput
              label="Menu Item Name"
              name="name"
              required
              disabled={isLoading}
              placeholder="e.g., Chicken Tikka Masala"
              {...getFieldProps('name')}
            />

            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput
                label="Category"
                name="category"
                type="select"
                required
                disabled={isLoading}
                placeholder="Select category"
                options={categoryOptions}
                {...getFieldProps('category')}
              />
              
              <ValidatedInput
                label="Cuisine"
                name="cuisine"
                type="select"
                required
                disabled={isLoading}
                placeholder="Select cuisine"
                options={cuisineOptions}
                {...getFieldProps('cuisine')}
              />
            </div>

            <ValidatedInput
              label="Description"
              name="description"
              type="textarea"
              required
              disabled={isLoading}
              rows={3}
              placeholder="Brief description of the dish..."
              helperText="This will be shown in the menu listing"
              {...getFieldProps('description')}
            />

            <ValidatedInput
              label="Detailed Description"
              name="longDescription"
              type="textarea"
              disabled={isLoading}
              rows={4}
              placeholder="Detailed description with cooking method, ingredients, etc..."
              helperText="Optional: More detailed description for the item page"
              {...getFieldProps('longDescription')}
            />
          </div>

          {/* Pricing and Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Pricing & Details</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <ValidatedInput
                label="Price ($)"
                name="price"
                type="number"
                required
                disabled={isLoading}
                min="0"
                step="0.01"
                placeholder="0.00"
                {...getFieldProps('price')}
              />
              
              <ValidatedInput
                label="Prep Time (minutes)"
                name="prepTime"
                type="number"
                required
                disabled={isLoading}
                min="5"
                max="180"
                {...getFieldProps('prepTime')}
              />
              
              <ValidatedInput
                label="Servings"
                name="servings"
                type="number"
                disabled={isLoading}
                min="1"
                {...getFieldProps('servings')}
              />
            </div>

            <ValidatedInput
              label="Spice Level"
              name="spiceLevel"
              type="select"
              disabled={isLoading}
              options={[
                { value: 0, label: 'No Spice' },
                { value: 1, label: 'Mild' },
                { value: 2, label: 'Medium' },
                { value: 3, label: 'Hot' },
                { value: 4, label: 'Very Hot' },
                { value: 5, label: 'Extremely Hot' }
              ]}
              {...getFieldProps('spiceLevel')}
            />
          </div>

          {/* Ingredients */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>
            
            <ValidatedInput
              label="Ingredients"
              name="ingredientsText"
              type="textarea"
              disabled={isLoading}
              rows={2}
              value={ingredientsText}
              onChange={(e) => handleIngredientsChange(e)}
              placeholder="chicken, rice, spices, onions..."
              helperText="Separate ingredients with commas"
            />
          </div>

          {/* Dietary Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Dietary Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Preferences
              </label>
              <div className="grid grid-cols-3 gap-2">
                {dietaryOptions.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.dietaryPreferences?.includes(option.value) || false}
                      onChange={(e) => handleArrayChange('dietaryPreferences', option.value, e.target.checked)}
                      disabled={isLoading}
                      className="h-4 w-4 text-grub-red border-gray-300 rounded focus:ring-grub-red"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergens
              </label>
              <div className="grid grid-cols-3 gap-2">
                {allergenOptions.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allergens?.includes(option.value) || false}
                      onChange={(e) => handleArrayChange('allergens', option.value, e.target.checked)}
                      disabled={isLoading}
                      className="h-4 w-4 text-grub-red border-gray-300 rounded focus:ring-grub-red"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Nutrition Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Nutrition Information (Optional)</h3>
            
            <div className="grid grid-cols-4 gap-4">
              <ValidatedInput
                label="Calories"
                name="calories"
                type="number"
                disabled={isLoading}
                min="0"
                placeholder="0"
                {...getFieldProps('calories')}
              />
              
              <ValidatedInput
                label="Protein"
                name="protein"
                disabled={isLoading}
                placeholder="e.g., 25g"
                {...getFieldProps('protein')}
              />
              
              <ValidatedInput
                label="Carbohydrates"
                name="carbs"
                disabled={isLoading}
                placeholder="e.g., 45g"
                {...getFieldProps('carbs')}
              />
              
              <ValidatedInput
                label="Fat"
                name="fat"
                disabled={isLoading}
                placeholder="e.g., 15g"
                {...getFieldProps('fat')}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Availability</h3>
            
            <ValidatedInput
              label="Status"
              name="status"
              type="select"
              disabled={isLoading}
              options={[
                { value: 'available', label: 'Available' },
                { value: 'unavailable', label: 'Unavailable' },
                { value: 'out-of-stock', label: 'Out of Stock' }
              ]}
              {...getFieldProps('status')}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isLoading || !isValid
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-grub-red text-white hover:bg-red-700 hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  {initialData ? 'Update Item' : 'Add Item'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuFormExample;
