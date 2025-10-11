// FILE: apps/customer-app/src/components/address/AddressCard.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBuilding, 
  faMapMarkerAlt,
  faEdit,
  faTrash,
  faStar,
  faCheck,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

/**
 * Address Card Component
 * Displays address information with action buttons
 * Used in address book and address selection
 */
const AddressCard = ({ 
  address, 
  onEdit, 
  onDelete, 
  onSetDefault, 
  onSelect, 
  isSelected = false,
  showActions = true,
  showSelectButton = false,
  className = '',
  loading = false
}) => {
  const [actionLoading, setActionLoading] = useState({
    edit: false,
    delete: false,
    setDefault: false,
    select: false
  });

  // Address type icons
  const getTypeIcon = (type) => {
    switch (type) {
      case 'home': return faHome;
      case 'work': return faBuilding;
      default: return faMapMarkerAlt;
    }
  };

  // Handle action with loading state
  const handleAction = async (action, callback) => {
    if (!callback || loading) return;

    setActionLoading(prev => ({ ...prev, [action]: true }));
    
    try {
      await callback(address);
    } catch (error) {
      console.error(`${action} action failed:`, error);
    } finally {
      setActionLoading(prev => ({ ...prev, [action]: false }));
    }
  };

  // Format address for display
  const formatAddress = () => {
    // If we have a fullAddress (from current location), use it
    if (address.fullAddress) {
      return [address.fullAddress];
    }
    
    const parts = [];
    
    if (address.street) parts.push(address.street);
    if (address.addressLine2) parts.push(address.addressLine2);
    
    const cityLine = [];
    if (address.city) cityLine.push(address.city);
    if (address.province || address.state) cityLine.push(address.province || address.state);
    if (address.postalCode) cityLine.push(address.postalCode);
    
    if (cityLine.length > 0) parts.push(cityLine.join(', '));
    
    // If no parts, show a fallback
    if (parts.length === 0 && address.type === 'current') {
      parts.push('Current Location (Address details being processed...)');
    }
    
    return parts;
  };

  const addressLines = formatAddress();

  return (
    <div className={`
      address-card
      relative p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer
      ${isSelected 
        ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200' 
        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }
      ${address.isDefault ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''}
      ${loading ? 'opacity-50 pointer-events-none' : ''}
      ${className}
    `}>
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl z-10">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500 text-xl" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Address Type Icon */}
          <div className={`
            p-2 rounded-lg
            ${address.type === 'home' ? 'bg-green-100 text-green-600' :
              address.type === 'work' ? 'bg-blue-100 text-blue-600' :
              'bg-gray-100 text-gray-600'
            }
          `}>
            <FontAwesomeIcon icon={getTypeIcon(address.type)} className="w-4 h-4" />
          </div>
          
          {/* Address Type Label */}
          <div>
            <h3 className="font-semibold text-gray-900 capitalize">
              {address.type}
              {address.isDefault && (
                <FontAwesomeIcon 
                  icon={faStar} 
                  className="ml-2 text-yellow-500" 
                  title="Default Address"
                />
              )}
            </h3>
            {address.isDefault && (
              <span className="text-xs text-yellow-600 font-medium">Default Address</span>
            )}
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full">
            <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Address Content */}
      <div className="space-y-1 mb-4">
        {addressLines.map((line, index) => (
          <p key={index} className={`
            ${index === 0 ? 'font-medium text-gray-900' : 'text-gray-600'}
            ${index === addressLines.length - 1 ? 'text-sm' : ''}
          `}>
            {line}
          </p>
        ))}
        
        {/* Delivery Instructions */}
        {address.instructions && (
          <p className="text-sm text-gray-500 italic mt-2 p-2 bg-gray-50 rounded">
            <strong>Instructions:</strong> {address.instructions}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {(showActions || showSelectButton) && (
        <div className="flex flex-wrap gap-2">
          {/* Select Button (for checkout/order flow) */}
          {showSelectButton && (
            <button
              onClick={() => handleAction('select', onSelect)}
              disabled={actionLoading.select || loading}
              className={`
                flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }
                ${actionLoading.select ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {actionLoading.select ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              ) : null}
              {isSelected ? 'Selected' : 'Deliver Here'}
            </button>
          )}

          {/* Management Actions */}
          {showActions && (
            <>
              {/* Edit Button */}
              <button
                onClick={() => handleAction('edit', onEdit)}
                disabled={actionLoading.edit || loading}
                className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Edit Address"
              >
                {actionLoading.edit ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />
                ) : (
                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                )}
              </button>

              {/* Set Default Button */}
              {!address.isDefault && onSetDefault && (
                <button
                  onClick={() => handleAction('setDefault', onSetDefault)}
                  disabled={actionLoading.setDefault || loading}
                  className="px-3 py-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                  title="Set as Default"
                >
                  {actionLoading.setDefault ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />
                  ) : (
                    <FontAwesomeIcon icon={faStar} className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Delete Button */}
              <button
                onClick={() => handleAction('delete', onDelete)}
                disabled={actionLoading.delete || loading}
                className="px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete Address"
              >
                {actionLoading.delete ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />
                ) : (
                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* Coordinate Info (for debugging - only in development) */}
      {process.env.NODE_ENV === 'development' && address.coordinates && (
        <div className="mt-2 text-xs text-gray-400 border-t pt-2">
          <span title="Coordinates">
            📍 {address.coordinates.lat.toFixed(6)}, {address.coordinates.lng.toFixed(6)}
          </span>
          {address.formattedAddress && (
            <div className="mt-1" title="Formatted Address">
              🗺️ {address.formattedAddress}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressCard;
