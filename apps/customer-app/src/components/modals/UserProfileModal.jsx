import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import addressService from '../../services/addressService';

const UserProfileModal = () => {
  const { isUserProfileModalOpen, closeUserProfileModal } = useModal();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [addresses, setAddresses] = useState([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState(null);

  useEffect(() => {
    if (!isUserProfileModalOpen) return;

    setActiveTab('profile');
    setAddresses([]);
    setIsAddressesLoading(false);
    setAddressesError(null);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeUserProfileModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUserProfileModalOpen, closeUserProfileModal]);

  useEffect(() => {
    if (!isUserProfileModalOpen) return;
    if (activeTab !== 'addresses') return;

    let cancelled = false;

    (async () => {
      setIsAddressesLoading(true);
      setAddressesError(null);
      try {
        const res = await addressService.getAddresses();
        if (!cancelled) {
          setAddresses(Array.isArray(res) ? res : []);
        }
      } catch (e) {
        if (!cancelled) {
          setAddressesError(e?.message || 'Failed to load saved locations');
        }
      } finally {
        if (!cancelled) {
          setIsAddressesLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab, isUserProfileModalOpen]);

  if (!isUserProfileModalOpen) return null;

  const displayName =
    user?.firstName || user?.name || (user?.email ? user.email.split('@')[0] : 'User');
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  const items = useMemo(() => (
    [
      { label: 'User ID', value: user?._id || user?.id },
      { label: 'Full name', value: fullName || null },
      { label: 'Display name', value: displayName || null },
      { label: 'Email', value: user?.email || null },
      { label: 'Phone', value: user?.phone || null },
      { label: 'Role', value: user?.role || null },
      { label: 'User type', value: user?.userType || null },
      { label: 'Created', value: user?.createdAt ? new Date(user.createdAt).toLocaleString() : null },
      { label: 'Updated', value: user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : null },
    ].filter((x) => x.value)
  ), [user, fullName, displayName]);

  const fallbackAddress = user?.address || user?.deliveryAddress || null;
  const membership = user?.membership || user?.membershipStatus || user?.subscriptionTier || null;
  const membershipExpiry = user?.membershipExpiry || user?.membershipExpiresAt || user?.membershipValidTill || null;

  const goTo = (path) => {
    closeUserProfileModal();
    navigate(path);
  };

  const tabButtonClass = (tab) => (
    `flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
      activeTab === tab
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="User profile"
      onClick={closeUserProfileModal}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-grub-red to-red-600 px-5 py-4 text-white sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-semibold sm:h-11 sm:w-11">
                  {(displayName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold sm:text-xl">{displayName}</h2>
                  {user?.email && (
                    <p className="truncate text-xs text-white/80 sm:text-sm">{user.email}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goTo('/profile/edit')}
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={closeUserProfileModal}
                className="rounded-lg p-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-white/10 p-1">
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                className={tabButtonClass('profile')}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
              <button
                type="button"
                className={tabButtonClass('addresses')}
                onClick={() => setActiveTab('addresses')}
              >
                Addresses
              </button>
              <button
                type="button"
                className={tabButtonClass('orders')}
                onClick={() => setActiveTab('orders')}
              >
                Orders
              </button>
              <button
                type="button"
                className={tabButtonClass('social')}
                onClick={() => setActiveTab('social')}
              >
                Social
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 sm:px-6 sm:py-5">
          {activeTab === 'profile' && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {items.map((item) => (
                  <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-xs font-medium text-gray-500">{item.label}</p>
                    <p className="mt-1 break-words text-sm font-semibold text-gray-900">{String(item.value)}</p>
                  </div>
                ))}
              </div>

              {fallbackAddress && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-grub-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 0 1 6 0z"
                      />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-900">Address</h3>
                  </div>

                  <div className="mt-3 text-sm text-gray-700">
                    {typeof fallbackAddress === 'string' ? (
                      <p className="break-words">{fallbackAddress}</p>
                    ) : (
                      <div className="space-y-1">
                        {fallbackAddress.street && <p className="break-words">{fallbackAddress.street}</p>}
                        {(fallbackAddress.city || fallbackAddress.province || fallbackAddress.postalCode) && (
                          <p className="break-words">
                            {[fallbackAddress.city, fallbackAddress.province, fallbackAddress.postalCode]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        )}
                        {fallbackAddress.country && <p className="break-words">{fallbackAddress.country}</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'addresses' && (
            <>
              <div className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">Address Book (Saved Locations)</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Manage your delivery locations and set a default address.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => goTo('/addresses')}
                  className="shrink-0 rounded-lg bg-grub-red px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red"
                >
                  Open Address Book
                </button>
              </div>

              <div className="mt-4">
                {isAddressesLoading && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-grub-red" />
                      Loading saved locations...
                    </div>
                  </div>
                )}

                {!isAddressesLoading && addressesError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-700">{addressesError}</p>
                    <p className="mt-1 text-sm text-red-600">You can still open the Address Book to manage your locations.</p>
                  </div>
                )}

                {!isAddressesLoading && !addressesError && (
                  <div className="grid grid-cols-1 gap-3">
                    {addresses.length === 0 ? (
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-sm font-semibold text-gray-900">No saved locations yet</p>
                        <p className="mt-1 text-sm text-gray-600">Add your home/work addresses to speed up checkout.</p>
                      </div>
                    ) : (
                      addresses.slice(0, 3).map((addr) => (
                        <div key={addr._id || `${addr.street}-${addr.postalCode}`} className="rounded-xl border border-gray-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 break-words">
                                {addressService.formatAddressForDisplay(addr) || 'Saved location'}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {addr.type ? String(addr.type).toUpperCase() : 'OTHER'}
                                {addr.isDefault ? ' • DEFAULT' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {addresses.length > 3 && (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm text-gray-700">And {addresses.length - 3} more saved locations...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-900">Orders</h3>
                <p className="mt-1 text-sm text-gray-600">
                  View your order history, track deliveries, and reorder your favourites.
                </p>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => goTo('/your-orders')}
                    className="w-full rounded-lg bg-grub-red px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red"
                  >
                    Your Orders
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-gray-900">Reviews & Ratings</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Reviews you have written will appear here.
                </p>
                <div className="mt-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                  <p className="text-sm text-gray-700">No reviews found yet.</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-gray-900">Photos Uploaded</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Food photos you share will show up here.
                </p>
                <div className="mt-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                  <p className="text-sm text-gray-700">No photos uploaded yet.</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-gray-900">Membership Status</h3>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-xs font-medium text-gray-500">Plan</p>
                    <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                      {membership ? String(membership) : 'Standard'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-xs font-medium text-gray-500">Expiry</p>
                    <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                      {membershipExpiry ? new Date(membershipExpiry).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <p className="text-sm text-gray-700">
                    Benefits will be shown here when membership details are available.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={closeUserProfileModal}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
