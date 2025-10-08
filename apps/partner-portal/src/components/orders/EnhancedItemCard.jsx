// FILE: src/components/orders/EnhancedItemCard.jsx
import React from 'react';
import { Clock, ChefHat, AlertTriangle, Leaf, Flame } from 'lucide-react';

/**
 * Enhanced item card component for partner portal
 * Shows detailed item information for better order preparation
 */
const EnhancedItemCard = ({ item, index }) => {
  // Helper function to render spice level
  const renderSpiceLevel = (level) => {
    if (!level || level === 0) return null;
    
    const spiceIcons = '🌶️'.repeat(Math.min(level, 5));
    const spiceText = ['Mild', 'Medium', 'Hot', 'Very Hot', 'Extremely Hot'][level - 1] || 'Hot';
    
    return (
      <div className="flex items-center">
        <Flame className="h-3 w-3 text-red-500 mr-1" />
        <span className="text-xs text-gray-600">{spiceIcons} {spiceText}</span>
      </div>
    );
  };

  // Helper function to render dietary tags
  const renderDietaryTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1">
        {tags.map(tag => (
          <span 
            key={tag} 
            className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center"
          >
            <Leaf className="h-2.5 w-2.5 mr-1" />
            {tag}
          </span>
        ))}
      </div>
    );
  };

  // Helper function to render allergen warnings
  const renderAllergens = (allergens) => {
    if (!allergens || allergens.length === 0) return null;
    
    return (
      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center mb-1">
          <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
          <span className="font-medium text-red-700 text-xs">Allergen Warning</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {allergens.map(allergen => (
            <span 
              key={allergen} 
              className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium"
            >
              {allergen}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-sm transition-shadow">
      {/* Item Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
          {item.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>
        <div className="text-right ml-3 flex-shrink-0">
          <div className="font-bold text-grub-red text-sm">${item.price?.toFixed(2)}</div>
          <div className="text-xs text-gray-500">× {item.quantity}</div>
          <div className="font-bold text-gray-900 text-sm mt-1">
            ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Preparation Time */}
        <div className="flex items-center">
          <Clock className="h-3 w-3 text-blue-500 mr-1" />
          <span className="text-xs text-gray-600">
            {item.prepTime || 15} min prep
          </span>
        </div>
        
        {/* Category */}
        <div className="flex items-center">
          <ChefHat className="h-3 w-3 text-purple-500 mr-1" />
          <span className="text-xs text-gray-600">
            {item.category || 'Main Course'}
          </span>
        </div>
        
        {/* Spice Level */}
        {item.spiceLevel && (
          <div className="col-span-2">
            {renderSpiceLevel(item.spiceLevel)}
          </div>
        )}
      </div>

      {/* Dietary Tags */}
      {(item.dietaryTags || item.isVegetarian || item.isVegan || item.isGlutenFree) && (
        <div className="mb-3">
          {renderDietaryTags([
            ...(item.dietaryTags || []),
            ...(item.isVegetarian ? ['Vegetarian'] : []),
            ...(item.isVegan ? ['Vegan'] : []),
            ...(item.isGlutenFree ? ['Gluten-Free'] : [])
          ])}
        </div>
      )}

      {/* Ingredients */}
      {item.ingredients && item.ingredients.length > 0 && (
        <div className="mb-3 pt-2 border-t border-gray-100">
          <span className="font-medium text-gray-700 text-xs">Key Ingredients:</span>
          <p className="text-xs text-gray-600 mt-1">
            {Array.isArray(item.ingredients) 
              ? item.ingredients.slice(0, 5).join(', ') + (item.ingredients.length > 5 ? '...' : '')
              : item.ingredients
            }
          </p>
        </div>
      )}

      {/* Special Instructions - Highlighted */}
      {item.specialInstructions && (
        <div className="mb-3 pt-2 border-t border-gray-100">
          <span className="font-medium text-orange-700 text-xs">📝 Special Instructions:</span>
          <div className="text-xs text-gray-800 mt-1 bg-yellow-50 border-l-3 border-yellow-400 p-2 rounded">
            <span className="font-medium">{item.specialInstructions}</span>
          </div>
        </div>
      )}

      {/* Allergen Warnings */}
      {renderAllergens(item.allergens)}

      {/* Cooking Notes */}
      {item.cookingNotes && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="font-medium text-blue-700 text-xs">👨‍🍳 Chef Notes:</span>
          <p className="text-xs text-gray-600 mt-1 italic bg-blue-50 p-2 rounded">
            {item.cookingNotes}
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedItemCard;
