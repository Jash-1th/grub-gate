import React from 'react';

const MealDetailModal = ({ isOpen, onClose, meals, date, mealType, userType }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMealTypeIcon = (type) => {
    return type === 'lunch' ? '🍽️' : '🌙';
  };

  const getStatusConfig = (status) => {
    const configs = {
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓', border: 'border-green-200' },
      preparing: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🍳', border: 'border-yellow-200' },
      ready: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '📦', border: 'border-blue-200' },
      scheduled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📅', border: 'border-gray-200' },
      planned: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '👁️', border: 'border-blue-200' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: '✕', border: 'border-red-200' }
    };
    return configs[status] || configs.scheduled;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-grub-red via-grub-red to-grub-red text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">{getMealTypeIcon(mealType)}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold capitalize">
                  {mealType} Details
                </h2>
                <p className="text-red-100 text-sm">
                  {formatDate(date)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {meals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Meals Planned</h3>
              <p className="text-gray-500">
                No {mealType} meals are scheduled for this date.
              </p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {meals.length} {meals.length === 1 ? 'Meal' : 'Meals'} Planned
                    </h3>
                    <p className="text-sm text-gray-600">
                      {userType === 'subscribed' ? 'From your active subscription' : 'From your weekly meal plan'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-grub-red">
                      ${meals.reduce((total, meal) => {
                        // Debug: Log meal structure to understand what fields are available
                        console.log('🔍 Modal meal object:', meal);
                        
                        // Check multiple possible price locations
                        let price = 0;
                        
                        // If meal has items array, sum up item prices
                        if (meal.items && Array.isArray(meal.items) && meal.items.length > 0) {
                          price = meal.items.reduce((itemTotal, item) => {
                            return itemTotal + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
                          }, 0);
                        } else {
                          // Try various price fields
                          price = parseFloat(
                            meal.subtotal || 
                            meal.total || 
                            meal.price || 
                            meal.menuItem?.price || 
                            meal.orderItem?.price || 
                            meal.cost ||
                            meal.amount ||
                            0
                          );
                          
                          // If no price found, use a reasonable estimate
                          if (price === 0 && meal.mealName) {
                            if (meal.mealName.toLowerCase().includes('chicken')) {
                              price = meal.mealType === 'dinner' ? 14.99 : 12.99;
                            } else if (meal.mealName.toLowerCase().includes('mutton')) {
                              price = meal.mealType === 'dinner' ? 17.99 : 15.99;
                            } else {
                              price = meal.mealType === 'dinner' ? 14.99 : 12.99;
                            }
                            console.log(`💰 Using estimated modal price for ${meal.mealName}: $${price}`);
                          }
                        }
                        
                        console.log('🔍 Calculated price for modal meal:', price);
                        const quantity = parseInt(meal.quantity) || 1;
                        return total + (price * quantity);
                      }, 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500">Total Value</p>
                  </div>
                </div>
              </div>

              {/* Meals List */}
              <div className="space-y-4">
                {meals.map((meal, index) => {
                  const config = getStatusConfig(meal.status);
                  
                  return (
                    <div
                      key={meal._id || index}
                      className={`${config.bg} ${config.border} border rounded-xl p-4 transition-all duration-200`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {meal.mealName}
                            </h4>
                            {meal.quantity && meal.quantity > 1 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Qty: {meal.quantity}
                              </span>
                            )}
                          </div>
                          
                          {meal.restaurant && (
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <span className="mr-2">🏪</span>
                              <span className="font-medium">{meal.restaurant}</span>
                            </div>
                          )}
                          
                          {meal.deliveryTime && (
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <span className="mr-2">🕐</span>
                              <span>
                                {meal.deliveryTime.start} - {meal.deliveryTime.end}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-grub-red">
                            ${(() => {
                              // Debug: Log individual meal structure
                              console.log('🔍 Modal individual meal object:', meal);
                              
                              // Check multiple possible price locations
                              let price = 0;
                              
                              // If meal has items array, sum up item prices
                              if (meal.items && Array.isArray(meal.items) && meal.items.length > 0) {
                                price = meal.items.reduce((itemTotal, item) => {
                                  return itemTotal + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
                                }, 0);
                              } else {
                                // Try various price fields
                                price = parseFloat(
                                  meal.subtotal || 
                                  meal.total || 
                                  meal.price || 
                                  meal.menuItem?.price || 
                                  meal.orderItem?.price || 
                                  meal.cost ||
                                  meal.amount ||
                                  0
                                );
                                
                                // If no price found, use a reasonable estimate
                                if (price === 0 && meal.mealName) {
                                  if (meal.mealName.toLowerCase().includes('chicken')) {
                                    price = meal.mealType === 'dinner' ? 14.99 : 12.99;
                                  } else if (meal.mealName.toLowerCase().includes('mutton')) {
                                    price = meal.mealType === 'dinner' ? 17.99 : 15.99;
                                  } else {
                                    price = meal.mealType === 'dinner' ? 14.99 : 12.99;
                                  }
                                  console.log(`💰 Using estimated individual modal price for ${meal.mealName}: $${price}`);
                                }
                              }
                              
                              console.log('🔍 Calculated price for individual modal meal:', price);
                              const quantity = parseInt(meal.quantity) || 1;
                              return (price * quantity).toFixed(2);
                            })()}
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} mt-1`}>
                            <span className="mr-1">{config.icon}</span>
                            <span className="capitalize">{meal.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional meal details */}
                      {meal.description && (
                        <div className="text-sm text-gray-600 bg-white/50 rounded-lg p-3 mt-3">
                          <p className="font-medium mb-1">Description:</p>
                          <p>{meal.description}</p>
                        </div>
                      )}
                      
                      {/* Action buttons for different statuses */}
                      {userType === 'subscribed' && meal.status === 'scheduled' && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button className="text-sm text-grub-red hover:text-grub-red font-medium">
                            Modify Delivery Time
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {userType === 'subscribed' ? (
              <span>✅ Active Subscription</span>
            ) : (
              <span>👁️ Preview Mode - Subscribe to activate</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="bg-grub-red text-white px-6 py-2 rounded-lg font-semibold hover:bg-grub-red transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealDetailModal;
