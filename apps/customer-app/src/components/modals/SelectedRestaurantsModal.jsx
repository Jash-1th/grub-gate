
import React from 'react';

const SelectedRestaurantsModal = ({ isOpen, onClose, restaurants = [] }) => {
  if (!isOpen) return null;

  const list = Array.isArray(restaurants) ? restaurants : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Selected Restaurants</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {list.length === 0 ? (
            <div className="text-sm text-gray-600">No restaurants selected.</div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {list.map((r, idx) => {
                  const name = r?.restaurantName || r?.name || r;
                  return (
                    <span
                      key={`${name}-${idx}`}
                      className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-grub-red to-red-600 text-white text-xs sm:text-sm font-medium rounded-full shadow-sm"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>

              <div className="text-xs text-gray-600">Total: {list.length}</div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-semibold border border-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectedRestaurantsModal;

