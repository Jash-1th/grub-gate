import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar as faStarRegular
} from '@fortawesome/free-regular-svg-icons';
import { 
  faCheck, 
  faHourglassHalf, 
  faConciergeBell, 
  faTruck, 
  faTimes, 
  faFilter,
  faStar,
  faStarHalfAlt,
  faMapMarkerAlt,
  faReceipt,
  faCalendarAlt,
  faCheckCircle,
  faBox,
  faTimesCircle,
  faQuestionCircle,
  faUtensils, 
  faTag, 
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import reviewApi from '../../api/reviewApi';

// Helper function to safely format dates
const formatDateSafely = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    // Use toLocaleDateString instead of format function
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting date:', error, 'Date string:', dateString);
    return 'Invalid Date';
  }
};

// Helper function to safely format delivery address
const formatDeliveryAddress = (address) => {
  if (!address) return 'Address not available';
  
  // If it's already a string, return it
  if (typeof address === 'string') return address;
  
  // If it's an object, format it properly
  if (typeof address === 'object') {
    const { street, city, province, postalCode, instructions } = address;
    const addressParts = [street, city, province, postalCode].filter(Boolean);
    return addressParts.join(', ') + (instructions ? ` (${instructions})` : '');
  }
  
  return 'Address not available';
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-indigo-100 text-indigo-800';
    case 'preparing':
      return 'bg-yellow-100 text-yellow-800';
    case 'ready':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get status icon
const getStatusIcon = (status) => {
  switch (status) {
    case 'scheduled':
      return faCalendarAlt;
    case 'pending':
      return faClock;
    case 'confirmed':
      return faCheckCircle;
    case 'preparing':
      return faUtensils;
    case 'ready':
      return faBox;
    case 'out-for-delivery':
      return faTruck;
    case 'delivered':
      return faCheck;
    case 'cancelled':
      return faTimesCircle;
    default:
      return faQuestionCircle;
  }
};

// Helper function to render star rating
const renderStarRating = (rating) => {
  if (!rating || rating < 1 || rating > 5) return null;
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <FontAwesomeIcon 
          key={i} 
          icon={i < Math.floor(rating) ? faStar : (i < rating ? faStarHalfAlt : faStarRegular)} 
          className={i < Math.floor(rating) ? "text-yellow-400" : (i < rating ? "text-yellow-400" : "text-gray-300")} 
        />
      ))}
      <span className="ml-2 text-gray-700 font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

const OrderHistoryCard = ({ order, onReviewClick, lastReviewSubmission }) => {
  const { t } = useTranslation();
  console.log('OrderHistoryCard: Received order:', order._id, 'with status:', order.status, 'reviewed:', order.reviewed, 'reviews:', order.reviews);
  console.log('OrderHistoryCard: RestaurantId data:', order.restaurantId);
  console.log('OrderHistoryCard: RestaurantId name:', order.restaurantId?.name);
  console.log('OrderHistoryCard: RestaurantName field:', order.restaurantName);
  
  // Fix: Check for both isSubscriptionMeal and isSubscriptionOrder
  const isSubscriptionMeal = order.isSubscriptionMeal || order.isSubscriptionOrder || false;
  
  // State for review status
  const [orderReviewStatus, setOrderReviewStatus] = useState({
    checked: false,
    hasReview: false,
    loading: false,
    rating: null
  });

  // Reset review status check when order ID changes (e.g., after review submission)
  useEffect(() => {
    setOrderReviewStatus({
      checked: false,
      hasReview: false,
      loading: false,
      rating: null
    });
  }, [order._id]);

  // Check if order has been reviewed when component mounts and order is delivered
  useEffect(() => {
    const checkOrderReviewStatus = async () => {
      // Only check for delivered orders
      const isOrderDelivered = order.status && typeof order.status === 'string' && order.status.toLowerCase() === 'delivered';
      
      if (isOrderDelivered && !orderReviewStatus.checked && !orderReviewStatus.loading) {
        setOrderReviewStatus(prev => ({ ...prev, loading: true }));
        try {
          console.log('🔍 OrderHistoryCard: Checking review status for order', order._id);
          const reviewData = await reviewApi.checkOrderReview(order._id);
          console.log('✅ OrderHistoryCard: Review status check result:', reviewData);
          
          setOrderReviewStatus({
            checked: true,
            hasReview: reviewData.data.hasReview,
            loading: false,
            rating: reviewData.data.hasReview ? reviewData.data.rating : null
          });
        } catch (error) {
          console.error('💥 OrderHistoryCard: Error checking review status:', error);
          setOrderReviewStatus({
            checked: true,
            hasReview: false,
            loading: false,
            rating: null
          });
        }
      }
    };
    
    checkOrderReviewStatus();
  }, [order._id, order.status, orderReviewStatus.checked, orderReviewStatus.loading, lastReviewSubmission]);

  // Get the appropriate date field
  const dateField = isSubscriptionMeal ? order.scheduledDate : order.deliveryDate;
  const formattedDate = formatDateSafely(dateField);

  // Check if order is delivered to show review button
  const isOrderDelivered = order.status && typeof order.status === 'string' && order.status.toLowerCase() === 'delivered';
  console.log('OrderHistoryCard: isOrderDelivered:', isOrderDelivered, 'order.status:', order.status, 'onReviewClick:', !!onReviewClick);
  
  // Check if order has already been reviewed
  // Check multiple possible sources for review status
  const isOrderReviewed = order.reviewed || order.hasReview || (order.reviews && order.reviews.length > 0) || orderReviewStatus.hasReview;
  console.log('OrderHistoryCard: isOrderReviewed:', isOrderReviewed, 'order.reviewed:', order.reviewed, 'order.hasReview:', order.hasReview, 'order.reviews:', order.reviews, 'orderReviewStatus.hasReview:', orderReviewStatus.hasReview);

  // Safely get order items with better error handling
  let orderItems = [];
  try {
    orderItems = Array.isArray(order.items) ? order.items : [];
    // Log items structure for debugging
    console.log('OrderHistoryCard: Processing order', order._id, 'items:', orderItems);
    
    // Ensure each item has the required properties and create unique identifiers
    const processedItems = [];
    const itemIds = new Set();
    
    orderItems.forEach((item, index) => {
      // If item is missing required properties, try to normalize it
      if (!item.hasOwnProperty('name') && !item.hasOwnProperty('quantity') && !item.hasOwnProperty('price')) {
        // Handle case where item might be nested or have different structure
        console.log(`OrderHistoryCard: Item ${index} structure:`, item);
      }
      
      // Check if item has been reviewed
      // First check if the item explicitly has a reviewed flag
      let isReviewed = item.reviewed || false;
      
      // If not explicitly marked as reviewed, check if there are reviews
      if (!isReviewed && item.reviews && item.reviews.length > 0) {
        isReviewed = true;
      }
      
      // If still not determined, check if the order has a reviewed flag
      if (!isReviewed && isOrderReviewed) {
        isReviewed = true;
      }
      
      console.log(`OrderHistoryCard: Item ${index} reviewed status:`, isReviewed, 'item.reviewed:', item.reviewed, 'item.reviews:', item.reviews, 'order.reviewed:', order.reviewed);
      
      // Try to get the actual menu item ID
      let menuItemId = item.menuItemId || item._id || item.id;
      
      // Create a unique identifier for this item
      let uniqueId = `${order._id}-${menuItemId || index}`;
      
      // If we've already seen this ID, make it unique
      let counter = 0;
      const originalId = uniqueId;
      while (itemIds.has(uniqueId)) {
        uniqueId = `${originalId}-${counter}`;
        counter++;
      }
      itemIds.add(uniqueId);
      
      processedItems.push({
        id: uniqueId,
        name: item.name || item.title || item.description || 'Unknown Item',
        quantity: item.quantity || item.qty || 1,
        price: item.price || item.cost || item.amount || 0,
        reviewed: isReviewed,
        menuItemId: item.menuItemId, // Keep the original menuItemId if it exists
        originalIndex: index, // Keep track of original index
        ...item // Keep all other properties
      });
    });
    
    orderItems = processedItems;
  } catch (error) {
    console.error('OrderHistoryCard: Error processing order items for order', order._id, ':', error);
    orderItems = [];
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 max-w-4xl mx-auto">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faUtensils} className="text-grub-red" />
                {isSubscriptionMeal ? (
                  <span className="flex items-center gap-2">
                    {order.restaurantId?.name || order.restaurantName || 'Restaurant'}
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {t('yourOrders.subscriptionMeal')}
                    </span>
                  </span>
                ) : (
                  order.restaurantId?.name || order.restaurantName || 'Restaurant'
                )}
              </h3>
              {order.status && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                  <FontAwesomeIcon icon={getStatusIcon(order.status)} />
                  {order.status ? t(`yourOrders.status.${order.status}`) : 'Unknown Status'}
                </span>
              )}
            </div>
            <p className="text-gray-600 flex items-center gap-2">
              <FontAwesomeIcon icon={faTag} className="text-gray-400" />
              <span className="font-medium">{t('orders.orderNumber')}: #{order.orderNumber || 'N/A'}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 flex flex-col">
              <span className="font-medium flex items-center gap-2 justify-end">
                <FontAwesomeIcon icon={isSubscriptionMeal ? faCalendarAlt : faClock} className="text-gray-400" />
                {isSubscriptionMeal ? t('yourOrders.scheduledFor') : t('orders.deliveredOn')}:
              </span>
              <span className="text-lg font-bold text-gray-900">{formattedDate}</span>
              {isSubscriptionMeal && order.scheduledTime && (
                <span className="text-gray-700">{order.scheduledTime}</span>
              )}
              {isSubscriptionMeal && order.mealType && (
                <span className="text-gray-700 capitalize">{t(`yourOrders.mealTypes.${order.mealType}`) || order.mealType}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items Section */}
      <div className="p-5">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faReceipt} className="text-grub-red" />
          {t('orders.items')}
        </h4>
        <div className="space-y-4">
          {orderItems.map((item, index) => (
            <div key={`${order._id}-${item.id || item._id || index}-${index}`} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{item.name || 'Item'}</p>
                    <p className="text-gray-600 mt-1">
                      <span className="font-medium">{t('orders.quantity')}: {item.quantity || 1}</span> 
                      {item.price && (
                        <span> × <span className="font-medium">${(item.price || 0).toFixed(2)}</span></span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              {/* Only show review button for the first item in the order, or if there's only one item */}
              {(index === 0 || orderItems.length === 1) && (
                <div className="flex items-center gap-3">
                  {onReviewClick && isOrderDelivered && !orderReviewStatus.loading && !isOrderReviewed && (
                    <button
                      onClick={() => {
                        console.log('OrderHistoryCard: Review button clicked for order:', order._id, 'item:', item);
                        console.log('OrderHistoryCard: onReviewClick function:', onReviewClick);
                        onReviewClick(order, item);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors font-medium"
                    >
                      <FontAwesomeIcon icon={faStar} />
                      <span>{t('reviews.leaveReview')}</span>
                    </button>
                  )}
                  {isOrderDelivered && orderReviewStatus.loading && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-600"></div>
                      <span>{t('reviews.loading')}</span>
                    </div>
                  )}
                  {isOrderReviewed && orderReviewStatus.rating && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium border border-green-200">
                      {renderStarRating(orderReviewStatus.rating)}
                    </div>
                  )}
                  {isOrderReviewed && !orderReviewStatus.rating && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium border border-green-200">
                      <FontAwesomeIcon icon={faStar} className="text-green-600" />
                      <span>{t('reviews.reviewed')}</span>
                    </div>
                  )}
                </div>
              )}
              {/* For items other than the first one in multi-item orders, show reviewed status if order is reviewed */}
              {index > 0 && orderItems.length > 1 && isOrderReviewed && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium border border-green-200">
                  {orderReviewStatus.rating ? (
                    renderStarRating(orderReviewStatus.rating)
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faStar} className="text-green-600" />
                      <span>{t('reviews.reviewed')}</span>
                    </>
                  )}
                </div>
              )}
              {/* Show loading indicator for additional items when checking review status */}
              {index > 0 && orderItems.length > 1 && isOrderDelivered && orderReviewStatus.loading && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-600"></div>
                  <span>{t('reviews.loading')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order Total and Delivery Address */}
      <div className="p-5 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-grub-red" />
              {t('orders.deliveryAddress')}
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed">{formatDeliveryAddress(order.deliveryAddress)}</p>
          </div>
          <div className="bg-gradient-to-br from-grub-red to-red-700 p-5 rounded-xl text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-200 text-sm">{t('orders.total')}</p>
                <p className="text-2xl font-bold">${(order.total || 0).toFixed(2)}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FontAwesomeIcon icon={faReceipt} className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryCard;