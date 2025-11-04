// FILE: src/components/orders/EnhancedItemCard.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faUtensils, faExclamationTriangle, faLeaf, faFire } from '@fortawesome/free-solid-svg-icons';

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
        <FontAwesomeIcon icon={faFire} className="h-3 w-3 text-red-500 mr-1" />
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
            <FontAwesomeIcon icon={faLeaf} className="h-2.5 w-2.5 mr-1" />
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
          <FontAwesomeIcon icon={faExclamationTriangle} className="h-3 w-3 text-red-500 mr-1" />
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
    <div className="border border-gray-200 rounded-2xl p-4 bg-white hover:shadow-md transition-all duration-200 hover:border-gray-300">
      {/* Item Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h4>
          {item.description && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{item.description}</p>
          )}
        </div>
        <div className="text-right ml-4 flex-shrink-0">
          <div className="bg-grub-red text-white px-3 py-1 rounded-full text-sm font-bold">
            ${item.price?.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 mt-1">× {item.quantity}</div>
          <div className="font-bold text-gray-900 text-lg mt-2 bg-gray-100 px-3 py-1 rounded-full">
            ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Preparation Time */}
        <div className="bg-blue-50 rounded-xl p-3 flex items-center">
          <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-blue-600 mr-2" />
          <div>
            <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Prep Time</div>
            <div className="text-sm font-bold text-gray-900">{item.prepTime || 15} min</div>
          </div>
        </div>
        
        {/* Category */}
        <div className="bg-purple-50 rounded-xl p-3 flex items-center min-w-0">
          <FontAwesomeIcon icon={faUtensils} className="h-4 w-4 text-purple-600 mr-2 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-purple-600 font-medium uppercase tracking-wide">Category</div>
            <div className="text-sm font-bold text-gray-900 truncate">{item.category || 'Main Course'}</div>
          </div>
        </div>
        
        {/* Spice Level */}
        {item.spiceLevel && (
          <div className="col-span-2 bg-red-50 rounded-xl p-3">
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
        <div className="mb-4">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                <span className="text-orange-600 text-lg">📝</span>
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-orange-800 text-sm mb-2">Special Instructions</h5>
                <p className="text-gray-800 text-sm leading-relaxed font-medium">{item.specialInstructions}</p>
              </div>
            </div>
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
