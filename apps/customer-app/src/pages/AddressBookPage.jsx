// FILE: apps/customer-app/src/pages/AddressBookPage.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faSpinner, 
  faMapMarkerAlt,
  faExclamationCircle,
  faHome
} from '@fortawesome/free-solid-svg-icons';
import AddressCard from '../components/address/AddressCard';
import AddressForm from '../components/address/AddressForm';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/apiClient';

/**
 * Address Book Page
 * Manage user's saved addresses with full CRUD operations
 * SSR-safe implementation
 */
const AddressBookPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isClient, setIsClient] = useState(false);
  
  // State management
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // SSR safety
  useEffect(() => {
    setIsClient(true);
    loadAddresses();
  }, []);

  // Load addresses from API
  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users/addresses');
      
      if (response.data.success) {
        setAddresses(response.data.data.addresses || []);
      } else {
        throw new Error(response.data.message || 'Failed to load addresses');
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      showError('Load Failed', 'Unable to load your addresses. Please try again.');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding new address
  const handleAddAddress = async (addressData) => {
    try {
      const response = await apiClient.post('/users/addresses', addressData);
      
      if (response.data.success) {
        setAddresses(response.data.data.addresses);
        setShowAddForm(false);
        showSuccess('Address Added', 'Your new address has been saved successfully.');
      } else {
        throw new Error(response.data.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      throw new Error(error.response?.data?.message || 'Failed to add address');
    }
  };

  // Handle editing address
  const handleEditAddress = async (addressData) => {
    if (!editingAddress) return;

    try {
      const response = await apiClient.patch(`/users/addresses/${editingAddress._id}`, addressData);
      
      if (response.data.success) {
        setAddresses(response.data.data.addresses);
        setEditingAddress(null);
        showSuccess('Address Updated', 'Your address has been updated successfully.');
      } else {
        throw new Error(response.data.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      throw new Error(error.response?.data?.message || 'Failed to update address');
    }
  };

  // Handle deleting address
  const handleDeleteAddress = async (address) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    const addressId = address._id;
    setActionLoading(prev => ({ ...prev, [addressId]: 'delete' }));

    try {
      const response = await apiClient.delete(`/users/addresses/${addressId}`);
      
      if (response.data.success) {
        setAddresses(response.data.data.addresses);
        showSuccess('Address Deleted', 'The address has been removed from your account.');
      } else {
        throw new Error(response.data.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      showError('Delete Failed', error.response?.data?.message || 'Failed to delete address');
    } finally {
      setActionLoading(prev => ({ ...prev, [addressId]: null }));
    }
  };

  // Handle setting default address
  const handleSetDefaultAddress = async (address) => {
    const addressId = address._id;
    setActionLoading(prev => ({ ...prev, [addressId]: 'setDefault' }));

    try {
      const response = await apiClient.patch(`/users/addresses/${addressId}/default`);
      
      if (response.data.success) {
        setAddresses(response.data.data.addresses);
        showSuccess('Default Updated', 'Your default address has been updated.');
      } else {
        throw new Error(response.data.message || 'Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      showError('Update Failed', error.response?.data?.message || 'Failed to update default address');
    } finally {
      setActionLoading(prev => ({ ...prev, [addressId]: null }));
    }
  };

  // Handle edit button click
  const handleEditClick = (address) => {
    setEditingAddress(address);
    setShowAddForm(false);
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingAddress(null);
  };

  // SSR loading state
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 text-blue-600" />
                My Addresses
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your delivery addresses for faster checkout
              </p>
            </div>
            
            {/* Add Address Button */}
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingAddress(null);
              }}
              className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add New Address
            </button>
          </div>
        </div>

        {/* Add/Edit Address Form */}
        {(showAddForm || editingAddress) && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              
              <AddressForm
                address={editingAddress}
                onSave={editingAddress ? handleEditAddress : handleAddAddress}
                onCancel={handleCancelForm}
                showTypeSelection={true}
                showInstructions={true}
                showCurrentLocation={true}
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-blue-600 mb-4" />
              <p className="text-gray-600">Loading your addresses...</p>
            </div>
          </div>
        )}

        {/* Address List */}
        {!loading && (
          <>
            {addresses.length === 0 ? (
              // Empty State
              <div className="text-center py-12">
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <FontAwesomeIcon icon={faHome} className="text-6xl text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No addresses saved yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Add your first address to make ordering faster and easier
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add Your First Address
                  </button>
                </div>
              </div>
            ) : (
              // Address Grid
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <AddressCard
                    key={address._id}
                    address={address}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteAddress}
                    onSetDefault={handleSetDefaultAddress}
                    showActions={true}
                    showSelectButton={false}
                    loading={actionLoading[address._id]}
                    className="bg-white shadow-sm hover:shadow-md"
                  />
                ))}
              </div>
            )}

            {/* Address Statistics */}
            {addresses.length > 0 && (
              <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Address Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {addresses.length}
                    </div>
                    <div className="text-sm text-blue-800">
                      Total Addresses
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {addresses.filter(addr => addr.type === 'home').length}
                    </div>
                    <div className="text-sm text-green-800">
                      Home Addresses
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {addresses.filter(addr => addr.type === 'work').length}
                    </div>
                    <div className="text-sm text-purple-800">
                      Work Addresses
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faExclamationCircle} className="mr-2 text-blue-600" />
            Tips for Better Delivery
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start">
              <span className="font-medium text-blue-600 mr-2">•</span>
              <span>Include apartment/unit numbers for accurate delivery</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium text-blue-600 mr-2">•</span>
              <span>Add delivery instructions for special access requirements</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium text-blue-600 mr-2">•</span>
              <span>Set your most frequently used address as default</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium text-blue-600 mr-2">•</span>
              <span>Keep your addresses up to date for smooth deliveries</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressBookPage;
