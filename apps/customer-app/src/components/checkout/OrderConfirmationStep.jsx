// FILE: apps/customer-app/src/components/checkout/OrderConfirmationStep.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faSpinner,
  faReceipt,
  faMapMarkerAlt,
  faClock,
  faPhone,
  faEnvelope,
  faHome,
  faUtensils
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/apiClient';

/**
 * Order Confirmation Step
 * Final step showing order summary and creating the actual order
 * Handles order creation and displays confirmation details
 */
const OrderConfirmationStep = ({ checkoutData, onPrevious, isLoading, setLoading }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Create order when component mounts
  useEffect(() => {
    if (!orderCreated && !creatingOrder) {
      createOrder();
    }
  }, []);

  // Create order in backend
  const createOrder = async () => {
    setCreatingOrder(true);
    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        restaurantId: checkoutData.restaurant?.id || checkoutData.restaurant?._id,
        items: checkoutData.items.map(item => ({
          menuItemId: item.menuItemId || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          specialInstructions: item.specialInstructions || ''
        })),
        deliveryAddress: {
          street: checkoutData.deliveryAddress.street,
          city: checkoutData.deliveryAddress.city,
          province: checkoutData.deliveryAddress.province || checkoutData.deliveryAddress.state,
          postalCode: checkoutData.deliveryAddress.postalCode,
          instructions: checkoutData.deliveryAddress.instructions || ''
        },
        paymentMethod: checkoutData.paymentMethod || 'card',
        paymentStatus: 'paid', // Since we processed payment in previous step
        specialInstructions: checkoutData.specialInstructions || '',
        orderType: checkoutData.orderType || 'single',
        subtotal: checkoutData.subtotal,
        deliveryFee: checkoutData.deliveryFee,
        tax: checkoutData.tax,
        total: checkoutData.total
      };

      // Create order via API
      const response = await apiClient.post('/orders', orderData);

      if (response.data.success) {
        const order = response.data.data.order;
        setOrderDetails(order);
        setOrderCreated(true);
        
        showSuccess(
          'Order Placed Successfully!', 
          `Your order #${order.orderNumber} has been confirmed.`
        );
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }

    } catch (error) {
      console.error('Order creation error:', error);
      showError(
        'Order Failed', 
        error.response?.data?.message || 'Unable to create your order. Please try again.'
      );
      
      // Allow user to go back and retry
      setOrderCreated(false);
    } finally {
      setCreatingOrder(false);
      setLoading(false);
    }
  };

  // Handle navigation actions
  const handleViewOrderDetails = () => {
    if (orderDetails) {
      navigate(`/orders/${orderDetails._id}`);
    }
  };

  const handleTrackOrder = () => {
    if (orderDetails) {
      navigate(`/orders/${orderDetails._id}/track`);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleOrderAgain = () => {
    // Navigate back to restaurant or meal planning
    if (checkoutData.orderType === 'subscription') {
      navigate('/plan');
    } else {
      navigate(`/restaurants/${checkoutData.restaurant?.id || checkoutData.restaurant?._id}`);
    }
  };

  // Format estimated delivery time
  const getEstimatedDeliveryTime = () => {
    if (!orderDetails) return 'Calculating...';
    
    const estimatedMinutes = checkoutData.estimatedDeliveryTime || 30;
    const deliveryTime = new Date(Date.now() + estimatedMinutes * 60000);
    
    return deliveryTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Show loading state while creating order
  if (creatingOrder || (!orderCreated && !orderDetails)) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-6xl text-blue-600 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Creating Your Order...
          </h2>
          <p className="text-gray-600 mb-6">
            Please wait while we process your order and send confirmation to the restaurant.
          </p>
          <div className="max-w-md mx-auto bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              🍽️ Preparing your order details<br/>
              💳 Processing payment confirmation<br/>
              📧 Sending notifications<br/>
              ✅ Almost done...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if order creation failed
  if (!orderCreated && !creatingOrder) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faReceipt} className="text-2xl text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Creation Failed
          </h2>
          <p className="text-gray-600 mb-6">
            We encountered an issue while creating your order. Please try again.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onPrevious}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              Back to Payment
            </button>
            <button
              onClick={createOrder}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show success confirmation
  return (
    <div className="p-6">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Order Confirmed! 🎉
        </h2>
        <p className="text-xl text-gray-600 mb-2">
          Order #{orderDetails?.orderNumber || 'Processing'}
        </p>
        <p className="text-gray-500">
          Thank you for your order! We've sent a confirmation to your email.
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        
        {/* Restaurant Info */}
        <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
          <FontAwesomeIcon icon={faUtensils} className="text-blue-600 mr-3" />
          <div>
            <p className="font-medium text-gray-900">
              {checkoutData.restaurant?.name || 'Restaurant'}
            </p>
            <p className="text-sm text-gray-600">
              {checkoutData.orderType === 'subscription' ? 'Subscription Order' : 'Single Order'}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-4">
          {checkoutData.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                {item.deliveryDay && item.mealType && (
                  <p className="text-sm text-blue-600">
                    {item.deliveryDay} {item.mealType} • {item.deliveryTime}
                  </p>
                )}
                {item.quantity > 1 && (
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                )}
              </div>
              <p className="font-medium text-gray-900">
                ${(item.price * (item.quantity || 1)).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>${checkoutData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee</span>
            <span>${checkoutData.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span>${checkoutData.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total</span>
            <span>${checkoutData.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Delivery Address */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-blue-600" />
            Delivery Address
          </h4>
          <p className="text-gray-700">
            {checkoutData.deliveryAddress.street}
            {checkoutData.deliveryAddress.addressLine2 && (
              <>, {checkoutData.deliveryAddress.addressLine2}</>
            )}
          </p>
          <p className="text-gray-700">
            {checkoutData.deliveryAddress.city}, {checkoutData.deliveryAddress.province} {checkoutData.deliveryAddress.postalCode}
          </p>
          {checkoutData.deliveryAddress.instructions && (
            <p className="text-sm text-gray-600 mt-2">
              <strong>Instructions:</strong> {checkoutData.deliveryAddress.instructions}
            </p>
          )}
        </div>

        {/* Delivery Time */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <FontAwesomeIcon icon={faClock} className="mr-2 text-green-600" />
            Estimated Delivery
          </h4>
          <p className="text-2xl font-bold text-green-600">
            {getEstimatedDeliveryTime()}
          </p>
          <p className="text-sm text-gray-600">
            {checkoutData.estimatedDeliveryTime || 30} minutes from now
          </p>
          <p className="text-xs text-gray-500 mt-2">
            You'll receive SMS updates about your order status
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-3">We'll Keep You Updated</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-blue-800">
            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
            <span>Email confirmation sent to {user?.email}</span>
          </div>
          <div className="flex items-center text-blue-800">
            <FontAwesomeIcon icon={faPhone} className="mr-2" />
            <span>SMS updates to {user?.phoneNumber}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={handleTrackOrder}
          className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faClock} className="mr-2" />
          Track Order
        </button>
        
        <button
          onClick={handleViewOrderDetails}
          className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faReceipt} className="mr-2" />
          View Details
        </button>
        
        <button
          onClick={handleOrderAgain}
          className="flex items-center justify-center px-4 py-3 border border-green-300 text-green-700 font-medium rounded-xl hover:bg-green-50 transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faUtensils} className="mr-2" />
          Order Again
        </button>
        
        <button
          onClick={handleBackToHome}
          className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faHome} className="mr-2" />
          Back to Home
        </button>
      </div>

      {/* Additional Information */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Need help with your order? Contact us at{' '}
          <a href="tel:+1-800-GRUBGATE" className="text-blue-600 hover:underline">
            +1-800-GRUBGATE
          </a>
          {' '}or{' '}
          <a href="mailto:support@grubgate.com" className="text-blue-600 hover:underline">
            support@grubgate.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmationStep;
