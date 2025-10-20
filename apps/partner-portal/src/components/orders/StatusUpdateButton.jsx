// FILE: src/components/orders/StatusUpdateButton.jsx
import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from '@grub-gate/ui';
import { 
  faSpinner,
  faClock,
  faUtensils,
  faBox,
  faCheckCircle,
  faTimes,
  faExclamationTriangle,
  faChevronRight,
  faEdit
} from '@fortawesome/free-solid-svg-icons';

/**
 * Status update button component for partner order management
 * Handles time-based validation and status transitions
 */
const StatusUpdateButton = ({ order, onStatusUpdate, isLoading }) => {
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [justUpdated, setJustUpdated] = useState(false);

  // Calculate time-based availability
  const timeValidation = useMemo(() => {
    if (!order.isScheduledOrder || !order.scheduledDate) {
      return { canUpdate: true, restrictions: {} };
    }

    const now = new Date();
    const deliveryDate = new Date(order.scheduledDate);
    const dayBefore = new Date(deliveryDate);
    dayBefore.setDate(dayBefore.getDate() - 1);
    dayBefore.setHours(0, 0, 0, 0);

    const isDeliveryDay = now.toDateString() === deliveryDate.toDateString();
    const isDayBefore = now.toDateString() === dayBefore.toDateString();
    const isAfterDelivery = now > deliveryDate;

    return {
      canUpdate: !isAfterDelivery,
      restrictions: {
        preparing: isDayBefore || isDeliveryDay,
        ready: isDeliveryDay,
        delivered: isDeliveryDay,
        cancelled: !isAfterDelivery
      },
      deliveryDate: deliveryDate.toDateString(),
      dayBefore: dayBefore.toDateString(),
      isDeliveryDay,
      isDayBefore
    };
  }, [order.scheduledDate, order.isScheduledOrder]);

  // Define available status transitions
  const statusOptions = useMemo(() => {
    const validTransitions = {
      'scheduled': ['preparing', 'cancelled'],
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    const currentTransitions = validTransitions[order.status] || [];
    
    return currentTransitions.map(status => {
      const canUpdate = timeValidation.restrictions[status] !== false;
      let reason = '';
      
      if (!canUpdate) {
        switch(status) {
          case 'preparing':
            reason = `Available from ${timeValidation.dayBefore}`;
            break;
          case 'ready':
            reason = `Available on ${timeValidation.deliveryDate}`;
            break;
          case 'delivered':
            reason = `Available on ${timeValidation.deliveryDate}`;
            break;
          default:
            reason = 'Not available';
        }
      }

      return {
        value: status,
        label: getStatusLabel(status),
        icon: getStatusIcon(status),
        color: getStatusColor(status),
        available: canUpdate,
        reason
      };
    });
  }, [order.status, timeValidation]);

  // Helper functions for status display
  function getStatusLabel(status) {
    const labels = {
      'preparing': 'Start Preparing',
      'ready': 'Mark as Ready',
      'delivered': 'Mark as Delivered',
      'cancelled': 'Cancel Order'
    };
    return labels[status] || status;
  }

  function getStatusIcon(status) {
    const icons = {
      'preparing': faUtensils,
      'ready': faBox,
      'delivered': faCheckCircle,
      'cancelled': faTimes
    };
    return icons[status] || faClock;
  }

  function getStatusColor(status) {
    const colors = {
      'preparing': 'text-yellow-600',
      'ready': 'text-blue-600',
      'delivered': 'text-green-600',
      'cancelled': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  }

  function getCurrentStatusDisplay() {
    const displays = {
      'scheduled': { label: 'Scheduled', color: 'bg-gray-100 text-gray-800', icon: faClock },
      'preparing': { label: 'Preparing', color: 'bg-yellow-100 text-yellow-800', icon: faUtensils },
      'ready': { label: 'Ready', color: 'bg-blue-100 text-blue-800', icon: faBox },
      'delivered': { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: faCheckCircle },
      'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: faTimes }
    };
    return displays[order.status] || displays['scheduled'];
  }

  const handleStatusUpdate = async (newStatus) => {
    if (isLoading) return;
    
    try {
      await onStatusUpdate(order._id, newStatus, notes);
      
      // Show success animation
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 2000);
      
      setShowModal(false);
      setNotes('');
    } catch (error) {
      console.error('Status update failed:', error);
      // Error handling is done in parent component
    }
  };

  const currentStatus = getCurrentStatusDisplay();
  const hasAvailableActions = statusOptions.some(option => option.available);

  // Hide update buttons if it's too early (more than 1 day before delivery)
  const now = new Date();
  const deliveryDate = new Date(order.scheduledDate);
  const dayBefore = new Date(deliveryDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  dayBefore.setHours(0, 0, 0, 0);
  
  const isTooEarly = now < dayBefore;
  const isAfterDelivery = now > deliveryDate;

  if (isAfterDelivery) {
    return (
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
          <FontAwesomeIcon icon={currentStatus.icon} className="mr-1" />
          {currentStatus.label}
        </span>
        <span className="text-xs text-gray-500">Order completed</span>
      </div>
    );
  }

  if (isTooEarly) {
    return (
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
          <FontAwesomeIcon icon={currentStatus.icon} className="mr-1" />
          {currentStatus.label}
        </span>
        <span className="text-xs text-gray-500">
          Available from {dayBefore.toDateString()}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Enhanced Current Status Display */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium shadow-sm transition-all duration-200 ${currentStatus.color} ${
            justUpdated ? 'animate-pulse ring-2 ring-green-400 ring-opacity-75' : ''
          }`}>
            <FontAwesomeIcon 
              icon={justUpdated ? faCheckCircle : currentStatus.icon} 
              className={`mr-2 h-3 w-3 transition-all duration-200 ${
                justUpdated ? 'text-green-600 animate-bounce' : ''
              }`} 
            />
            {justUpdated ? 'Updated!' : currentStatus.label}
          </span>
          
          {/* Time indicator for mobile */}
          {order.isScheduledOrder && (
            <div className="sm:hidden">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {new Date(order.scheduledDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )}
        </div>
        
        {/* Enhanced Update Button */}
        {hasAvailableActions && (
          <button
            onClick={() => setShowModal(true)}
            disabled={isLoading}
            className={`group relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-grub-red to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg'
            } text-white disabled:opacity-50 disabled:transform-none`}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2 h-3 w-3" />
                <span className="hidden sm:inline">Updating...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUtensils} className="mr-2 h-3 w-3 transition-transform group-hover:rotate-12" />
                <span className="hidden sm:inline">Update Status</span>
                <span className="sm:hidden">Update</span>
                <FontAwesomeIcon icon={faChevronRight} className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setNotes('');
        }}
        title=""
        size="lg"
        className="max-w-2xl"
      >
        <div className="space-y-6">
          {/* Modal Header */}
          <div className="text-center border-b border-gray-200 pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="bg-grub-red/10 rounded-full p-3">
                <FontAwesomeIcon icon={faUtensils} className="h-6 w-6 text-grub-red" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Update Order Status</h3>
                <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
              </div>
            </div>
            
            {/* Current Status Display */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-sm text-gray-600">Current Status:</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
                <FontAwesomeIcon icon={currentStatus.icon} className="mr-2 h-3 w-3" />
                {currentStatus.label}
              </span>
            </div>
          </div>

          {/* Status Options Grid */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Choose New Status</h4>
            <div className="grid gap-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusUpdate(option.value)}
                  disabled={!option.available || isLoading}
                  className={`group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 ${
                    option.available 
                      ? 'border-gray-200 hover:border-grub-red hover:shadow-lg bg-white hover:bg-red-50 transform hover:scale-[1.02]' 
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full transition-colors ${
                        option.available 
                          ? 'bg-gray-100 group-hover:bg-white shadow-sm' 
                          : 'bg-gray-200'
                      }`}>
                        <FontAwesomeIcon 
                          icon={option.icon} 
                          className={`h-5 w-5 transition-colors ${
                            option.available ? option.color : 'text-gray-400'
                          }`} 
                        />
                      </div>
                      <div className="text-left">
                        <span className={`text-base font-semibold block ${
                          option.available ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {option.label}
                        </span>
                        {!option.available ? (
                          <span className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="h-3 w-3" />
                            {option.reason}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600">
                            Click to update to this status
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {option.available && (
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1">
                        <FontAwesomeIcon icon={faChevronRight} className="h-5 w-5 text-grub-red" />
                      </div>
                    )}
                  </div>
                  
                  {/* Hover effect */}
                  {option.available && (
                    <div className="absolute inset-0 bg-gradient-to-r from-grub-red/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Notes Input */}
          <div className="space-y-3">
            <label className="block text-base font-medium text-gray-900">
              <FontAwesomeIcon icon={faEdit} className="h-4 w-4 mr-2 text-grub-red" />
              Additional Notes (Optional)
            </label>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions, dietary requirements, or notes about this status update..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors min-h-[100px]"
                rows="4"
                maxLength={200}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-1 rounded">
                {notes.length}/200
              </div>
            </div>
          </div>

          {/* Enhanced Time Info */}
          {order.isScheduledOrder && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <div className="text-base font-semibold text-blue-900">
                    📅 Scheduled Delivery: {timeValidation.deliveryDate}
                  </div>
                  {timeValidation.isDayBefore && (
                    <div className="text-sm text-blue-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Can start preparing today (1 day advance preparation allowed)
                    </div>
                  )}
                  {timeValidation.isDeliveryDay && (
                    <div className="text-sm text-blue-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Delivery day - all status updates available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setNotes('');
              }}
              className="px-6 py-3 text-base font-medium text-grub-red hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
            >
              Clear Notes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StatusUpdateButton;
