import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faCheckCircle, 
  faExclamationTriangle,
  faPlus,
  faTimes,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import AddressCard from '../address/AddressCard';
import AddressForm from '../address/AddressForm';
import CurrentLocationButton from '../location/CurrentLocationButton';
import addressService from '../../services/addressService';
import addressValidationService from '../../services/addressValidationService';
import { useToast } from '../../contexts/ToastContext';

/**
 * Address Selection Step for Checkout
 * Allows users to select existing address or add new one
 * Validates delivery zone for selected restaurant
 */
const AddressSelectionStep = ({ checkoutData, onNext, onPrevious, isLoading, setLoading }) => {
  const { showSuccess, showError, showWarning } = useToast();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [validatingDelivery, setValidatingDelivery] = useState(false);
  const [deliveryValidation, setDeliveryValidation] = useState(null);
  const [lastValidatedAddress, setLastValidatedAddress] = useState(null);

  // Load user addresses on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  // Validate delivery when address is selected
  useEffect(() => {
    if (selectedAddress && checkoutData.restaurant && !validatingDelivery) {
      // Add a small delay to prevent duplicate calls
      const timeoutId = setTimeout(() => {
        validateDeliveryZone(selectedAddress);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedAddress, checkoutData.restaurant?.id, checkoutData.restaurant?.name]); // Use stable properties instead of whole object

  // Load user addresses
  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const userAddresses = await addressService.getAddresses();
      setAddresses(userAddresses);
      
      // Auto-select default address if available
      const defaultAddress = userAddresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      showError('Load Failed', 'Unable to load your addresses. You can still add a new address.');
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Validate delivery zone for selected address
  const validateDeliveryZone = async (address) => {
    if (!address || !checkoutData.restaurant) return;

    // Check if we already validated this exact address
    const addressKey = JSON.stringify({
      coordinates: address.coordinates,
      fullAddress: address.fullAddress
    });
    
    if (lastValidatedAddress === addressKey) {
      console.log('🔄 Address already validated, skipping duplicate validation');
      return;
    }

    console.log('🚚 === FRONTEND DELIVERY VALIDATION START ===');
    console.log('📍 Selected Address:', JSON.stringify(address, null, 2));
    console.log('🏪 Restaurant Data:', JSON.stringify(checkoutData.restaurant, null, 2));

    setValidatingDelivery(true);
    setDeliveryValidation(null);
    setLastValidatedAddress(addressKey);

    try {
      console.log('🔄 Calling addressValidationService.checkDeliveryZone...');
      const validation = await addressValidationService.checkDeliveryZone(
        address, 
        checkoutData.restaurant.id || checkoutData.restaurant._id
      );

      console.log('✅ Delivery validation result:', JSON.stringify(validation, null, 2));
      console.log('🔍 Distance value:', validation.distance, 'Type:', typeof validation.distance);
      console.log('🔍 Max distance:', validation.maxDistance, 'Type:', typeof validation.maxDistance);
      
      setDeliveryValidation(validation);

      // Show appropriate message based on delivery result
      if (!validation.canDeliver) {
        console.log('❌ Delivery not available - showing warning');
        
        // Create better distance message
        let distanceMsg = 'This restaurant does not deliver to the selected address.';
        if (validation.distance && validation.maxDistance) {
          distanceMsg = `Distance: ${Math.round(validation.distance)}km (Max delivery: ${validation.maxDistance}km)`;
        } else if (validation.note) {
          distanceMsg = validation.note;
        }
        
        showWarning('Delivery Not Available', distanceMsg);
      } else {
        console.log('✅ Delivery available!');
        // Don't show success toast for delivery validation to avoid confusion
        // The location success toast is already shown
      }
    } catch (error) {
      console.error('❌ Delivery validation error:', error);
      setDeliveryValidation({
        canDeliver: true, // Assume delivery is possible if validation fails
        error: 'Unable to verify delivery zone'
      });
    } finally {
      setValidatingDelivery(false);
      console.log('🚚 === FRONTEND DELIVERY VALIDATION END ===');
    }
  };

  // Handle address selection
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowAddForm(false);
  };

  // Handle adding new address
  const handleAddAddress = async (addressData) => {
    try {
      const updatedAddresses = await addressService.addAddress(addressData);
      setAddresses(updatedAddresses);
      
      // Select the newly added address
      const newAddress = updatedAddresses[updatedAddresses.length - 1];
      setSelectedAddress(newAddress);
      setShowAddForm(false);
      
      showSuccess('Address Added', 'Your new address has been saved and selected.');
    } catch (error) {
      throw error; // Let AddressForm handle the error display
    }
  };

  // Handle location found from current location button
  const handleLocationFound = (location) => {
    const { coordinates, address } = location;
    
    console.log('🎯 Location found:', { coordinates, address }); // Debug log
    
    // Create a temporary address object for immediate use
    const tempAddress = {
      type: 'current',
      label: 'Current Location',
      street: address.street || address.formattedAddress || 'Detected Location',
      city: address.city || address.locality || '',
      province: address.province || address.state || address.region || '',
      postalCode: address.postalCode || address.zipCode || '',
      country: address.country || '',
      coordinates,
      isTemporary: true,
      // Store full address for display
      fullAddress: address.formattedAddress || `${address.street || ''}, ${address.city || ''}, ${address.province || address.state || ''} ${address.postalCode || ''}`.trim(),
      // Store original geocoding response for debugging
      originalAddress: address
    };

    console.log('🏠 Created temp address:', tempAddress); // Debug log
    
    setSelectedAddress(tempAddress);
    
    // Create a better address display
    const displayAddress = tempAddress.fullAddress || 
      `${tempAddress.street || ''}, ${tempAddress.city || ''}, ${tempAddress.province || ''} ${tempAddress.postalCode || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '') ||
      'Current location detected';
    
    showSuccess(
      'Location Found', 
      `Address: ${displayAddress}`
    );
  };

  // Handle continue to next step
  const handleContinue = () => {
    if (!selectedAddress) {
      showError('Address Required', 'Please select a delivery address to continue.');
      return;
    }

    if (deliveryValidation && !deliveryValidation.canDeliver) {
      showError('Delivery Not Available', 'Please select an address within the delivery zone.');
      return;
    }

    // Pass selected address and delivery info to next step
    onNext({
      deliveryAddress: selectedAddress,
      deliveryFee: deliveryValidation?.fee || checkoutData.deliveryFee,
      estimatedDeliveryTime: deliveryValidation?.estimatedTime || 30
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Delivery Address
        </h2>
        <p className="text-gray-600">
          Choose where you'd like your order delivered
        </p>
      </div>

      {/* Current Location Option */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-3">Quick Options</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <CurrentLocationButton
              onLocationFound={handleLocationFound}
              onError={(error) => showError('Location Error', error)}
              size="medium"
              className="flex-1"
            />
            <button
              onClick={() => setShowAddForm(true)}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-white border border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add New Address
            </button>
          </div>
        </div>
      </div>

      {/* Add Address Form */}
      {showAddForm && (
        <div className="mb-6 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add New Address
          </h3>
          <AddressForm
            onSave={handleAddAddress}
            onCancel={() => setShowAddForm(false)}
            showTypeSelection={true}
            showInstructions={true}
            showCurrentLocation={false} // Already have current location button above
          />
        </div>
      )}

      {/* Saved Addresses */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Saved Addresses
        </h3>

        {loadingAddresses ? (
          <div className="flex items-center justify-center py-8">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-blue-600 mr-3" />
            <span className="text-gray-600">Loading your addresses...</span>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-4xl text-gray-300 mb-3" />
            <p className="text-gray-600 mb-4">No saved addresses found</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <AddressCard
                key={address._id}
                address={address}
                onSelect={handleAddressSelect}
                isSelected={selectedAddress?._id === address._id}
                showActions={false}
                showSelectButton={true}
                className="cursor-pointer hover:shadow-md transition-shadow duration-200"
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected Address & Delivery Validation */}
      {selectedAddress && (
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Selected Address
          </h3>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between sm:justify-start mb-2">
                  <p className="font-semibold text-blue-900 capitalize text-sm sm:text-base">
                    {selectedAddress.type} {selectedAddress.isTemporary && '(Current Location)'}
                  </p>
                  
                  {/* Remove Button - Mobile (top right) */}
                  <button
                    onClick={() => setSelectedAddress(null)}
                    className="sm:hidden p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                    title="Remove address"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-blue-800 text-sm sm:text-base leading-relaxed">
                  {addressService.formatAddressForDisplay(selectedAddress)}
                </p>
                {selectedAddress.instructions && (
                  <p className="text-xs sm:text-sm text-blue-700 mt-2 bg-blue-100 rounded-lg p-2">
                    <strong>Instructions:</strong> {selectedAddress.instructions}
                  </p>
                )}
              </div>
              
              {/* Remove Button and Delivery Status - Desktop */}
              <div className="hidden sm:flex ml-4 items-start space-x-2">
                {/* Remove Address Button */}
                <button
                  onClick={() => setSelectedAddress(null)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                  title="Remove address"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                </button>
                
                {/* Delivery Validation Status */}
                <div>
                  {validatingDelivery ? (
                  <div className="flex items-center text-blue-600">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    <span className="text-sm">Checking delivery...</span>
                  </div>
                ) : deliveryValidation ? (
                  deliveryValidation.canDeliver ? (
                    <div className="flex items-center text-green-600">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                      <div className="text-sm">
                        <div>Delivery Available</div>
                        {deliveryValidation.distance && deliveryValidation.distance > 0 ? (
                          <div className="text-xs text-green-700 font-medium">
                            📍 {Math.round(deliveryValidation.distance * 10) / 10} km away
                          </div>
                        ) : (
                          <div className="text-xs text-green-600">
                            📍 5 km away (estimated)
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                      <div className="text-sm">
                        <div>Outside delivery zone</div>
                        {deliveryValidation.distance && deliveryValidation.distance > 0 ? (
                          <div className="text-xs text-red-700 font-medium">
                            📍 {Math.round(deliveryValidation.distance * 10) / 10} km away (Max: {deliveryValidation.maxDistance || 'N/A'} km)
                          </div>
                        ) : (
                          <div className="text-xs text-red-600">
                            📍 5 km away (estimated)
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : null}
                </div>
              </div>
              
              {/* Delivery Status - Mobile (below address) */}
              <div className="sm:hidden">
                {validatingDelivery ? (
                  <div className="flex items-center justify-center text-blue-600 bg-blue-100 rounded-lg p-2.5">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    <span className="text-sm font-medium">Checking delivery...</span>
                  </div>
                ) : deliveryValidation ? (
                  deliveryValidation.canDeliver ? (
                    <div className="flex items-center justify-between bg-green-100 rounded-lg p-2.5">
                      <div className="flex items-center text-green-700">
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-lg" />
                        <div className="text-sm font-medium">
                          <div>Delivery Available</div>
                          {deliveryValidation.distance && deliveryValidation.distance > 0 ? (
                            <div className="text-xs text-green-600">
                              {Math.round(deliveryValidation.distance * 10) / 10} km away
                            </div>
                          ) : (
                            <div className="text-xs text-green-600">
                              5 km (estimated)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center bg-red-100 rounded-lg p-2.5">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-red-600 text-lg" />
                      <div className="text-sm text-red-700">
                        <div className="font-medium">Outside delivery zone</div>
                        {deliveryValidation.distance && deliveryValidation.distance > 0 && (
                          <div className="text-xs">
                            {Math.round(deliveryValidation.distance * 10) / 10} km away (Max: {deliveryValidation.maxDistance || 'N/A'} km)
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : null}
              </div>
            </div>

            {/* Delivery Details */}
            {deliveryValidation && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                {/* Distance Information */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {deliveryValidation.canDeliver ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-700 font-medium">Delivery Available</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-red-700 font-medium">Outside Delivery Zone</span>
                      </>
                    )}
                  </div>
                  
                  {/* Distance Display */}
                  <div className="text-sm text-gray-600">
                    {deliveryValidation.distance && deliveryValidation.distance > 0 ? (
                      <>
                        <span className="font-medium">{Math.round(deliveryValidation.distance * 10) / 10} km</span>
                        {deliveryValidation.maxDistance && (
                          <span className="text-gray-500"> / {deliveryValidation.maxDistance} km max</span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-500 italic">5 km (estimated)</span>
                    )}
                  </div>
                </div>

                {/* Additional Details for Available Delivery */}
                {deliveryValidation.canDeliver && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {deliveryValidation.fee && (
                      <div>
                        <span className="text-blue-700">Delivery Fee:</span>
                        <span className="font-medium text-blue-900 ml-1">
                          ${deliveryValidation.fee.toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {deliveryValidation.estimatedTime && (
                      <div>
                        <span className="text-blue-700">Est. Time:</span>
                        <span className="font-medium text-blue-900 ml-1">
                          {deliveryValidation.estimatedTime} mins
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={`flex flex-col sm:flex-row gap-3 ${onPrevious ? 'sm:justify-between' : 'sm:justify-end'}`}>
        {onPrevious && (
          <button
            onClick={onPrevious}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 touch-manipulation"
          >
            Back
          </button>
        )}
        
        <button
          onClick={handleContinue}
          disabled={!selectedAddress || validatingDelivery || (deliveryValidation && !deliveryValidation.canDeliver) || isLoading}
          className={`
            w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation
            ${!selectedAddress || validatingDelivery || (deliveryValidation && !deliveryValidation.canDeliver) || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
            }
          `}
        >
          {validatingDelivery ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Validating...
            </>
          ) : (
            'Continue to Payment'
          )}
        </button>
      </div>
    </div>
  );
};

export default AddressSelectionStep;
