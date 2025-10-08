import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Example UserProfile Component Updated for Refactored User Model
 * Shows how to access nested user data in components
 */
const UserProfile = () => {
  const { 
    user, 
    partnerInfo, 
    getRestaurantId, 
    getPartnerStatus, 
    getCommissionRate,
    isApprovedPartner 
  } = useAuth();

  if (!user) {
    return <div>Please log in to view profile</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 bg-grub-red rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-medium text-gray-900">
            {user.fullName || `${user.firstName} ${user.lastName}`}
          </h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          
          {/* Partner Status Badge */}
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isApprovedPartner() 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {getPartnerStatus()?.charAt(0).toUpperCase() + getPartnerStatus()?.slice(1)} Partner
            </span>
          </div>
        </div>
      </div>

      {/* Partner Information Section */}
      {partnerInfo && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Partner Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Restaurant ID */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Restaurant ID</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {getRestaurantId() || 'Not assigned'}
              </dd>
            </div>

            {/* Commission Rate */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Commission Rate</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {getCommissionRate()}%
              </dd>
            </div>

            {/* Partner Since */}
            {partnerInfo.partnerSince && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Partner Since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(partnerInfo.partnerSince).toLocaleDateString()}
                </dd>
              </div>
            )}

            {/* Approval Date */}
            {partnerInfo.approvedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Approved On</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(partnerInfo.approvedAt).toLocaleDateString()}
                </dd>
              </div>
            )}
          </div>

          {/* Notification Preferences Summary */}
          {partnerInfo.notificationPreferences && (
            <div className="mt-4">
              <dt className="text-sm font-medium text-gray-500 mb-2">Notification Preferences</dt>
              <div className="flex flex-wrap gap-2">
                {Object.entries(partnerInfo.notificationPreferences).map(([key, enabled]) => (
                  <span
                    key={key}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    {enabled ? ' ✓' : ' ✗'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Billing Status */}
          {partnerInfo.billingInfo && (
            <div className="mt-4">
              <dt className="text-sm font-medium text-gray-500">Billing Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {partnerInfo.billingInfo.paymentMethod 
                  ? `Payment method: ${partnerInfo.billingInfo.paymentMethod}`
                  : 'No payment method configured'
                }
              </dd>
            </div>
          )}
        </div>
      )}

      {/* User Preferences Section */}
      {user.preferences && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">User Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Language</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.preferences.language?.toUpperCase() || 'EN'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Currency</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.preferences.currency || 'CAD'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Theme</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.preferences.theme?.charAt(0).toUpperCase() + user.preferences.theme?.slice(1) || 'Auto'}
              </dd>
            </div>
          </div>

          {/* Dietary Preferences */}
          {user.preferences.dietary && user.preferences.dietary.length > 0 && (
            <div className="mt-4">
              <dt className="text-sm font-medium text-gray-500 mb-2">Dietary Preferences</dt>
              <div className="flex flex-wrap gap-2">
                {user.preferences.dietary.map((preference) => (
                  <span
                    key={preference}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {preference.charAt(0).toUpperCase() + preference.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Addresses Section */}
      {user.addresses && user.addresses.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Addresses</h3>
          
          <div className="space-y-3">
            {user.addresses.map((address, index) => (
              <div key={address._id || index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    address.isDefault 
                      ? 'bg-grub-red text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {address.type?.charAt(0).toUpperCase() + address.type?.slice(1) || 'Address'}
                    {address.isDefault && ' (Default)'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {address.fullAddress || `${address.street}, ${address.city}, ${address.postalCode}`}
                  </p>
                  {address.deliveryInstructions && (
                    <p className="text-xs text-gray-500 mt-1">
                      Instructions: {address.deliveryInstructions}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
