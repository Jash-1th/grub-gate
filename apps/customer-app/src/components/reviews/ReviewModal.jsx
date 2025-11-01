import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar as faStarSolid,
  faTimes,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import reviewApi from "../../api/reviewApi";

const ReviewModal = ({ isOpen, onClose, order, menuItem, onSubmit }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        showError(t('reviews.error'), t('reviews.invalidImageFormat'));
      }
      return isValid;
    });

    if (validFiles.length + images.length > 5) {
      showError(t('reviews.error'), t('reviews.maxImagesExceeded'));
      return;
    }

    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      showError(t('reviews.error'), t('reviews.ratingRequired'));
      return;
    }

    if (!order || !menuItem) {
      showError(t('reviews.error'), t('reviews.missingOrderOrItem'));
      return;
    }

    // Check if we already know this order has been reviewed
    if (order.reviewed) {
      showError(t('reviews.error'), t('reviews.reviewAlreadyExists'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Extract just the IDs, not the full objects
      console.log('📥 ReviewModal: Order data:', order);
      console.log('📥 ReviewModal: MenuItem data:', menuItem);
      
      // Extract restaurant ID
      let restaurantId = order.restaurantId || (order.restaurant && (order.restaurant._id || order.restaurant.id));
      
      // If restaurant is an object, extract just the ID
      if (order.restaurant && typeof order.restaurant === 'object') {
        restaurantId = order.restaurant._id || order.restaurant.id;
      }
      
      // Ensure we have a valid restaurant ID (string)
      if (typeof restaurantId === 'object' && restaurantId !== null) {
        restaurantId = restaurantId._id || restaurantId.id;
      }
      
      // Extract menu item ID
      let menuItemId = menuItem.menuItemId || menuItem._id || menuItem.id;
      
      const orderId = order._id;

      // Validate required IDs
      if (!orderId) {
        throw new Error('Order ID is missing');
      }
      if (!restaurantId) {
        throw new Error('Restaurant ID is missing');
      }
      if (!menuItemId) {
        throw new Error('Menu Item ID is missing');
      }
      
      // Validate ObjectId format for required fields
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(orderId)) {
        throw new Error(`Invalid order ID format: ${orderId}`);
      }
      if (!objectIdRegex.test(restaurantId)) {
        throw new Error(`Invalid restaurant ID format: ${restaurantId}`);
      }
      
      // For menu item ID, if it's not a valid ObjectId, we'll still send it
      // but log a warning. The backend might accept it or provide a better error message.
      if (!objectIdRegex.test(menuItemId)) {
        console.warn('Menu item ID might not be in valid ObjectId format:', menuItemId);
      }

      // Ensure all IDs are strings and rating is an integer
      const reviewData = {
        customerId: String(user._id),
        orderId: String(orderId),
        restaurantId: String(restaurantId),
        menuItemId: String(menuItemId),
        rating: parseInt(Number(rating)), // Ensure rating is an integer
        title: String(title),
        comment: String(comment),
        images: images
      };

      console.log('📤 ReviewModal: Submitting review data:', reviewData);
      
      // Log validation before sending
      console.log('🔍 ReviewModal: Pre-send validation:');
      console.log('   Customer ID:', reviewData.customerId);
      console.log('   Order ID:', reviewData.orderId, 'Valid:', objectIdRegex.test(reviewData.orderId));
      console.log('   Restaurant ID:', reviewData.restaurantId, 'Valid:', objectIdRegex.test(reviewData.restaurantId));
      console.log('   Menu Item ID:', reviewData.menuItemId, 'Valid:', objectIdRegex.test(reviewData.menuItemId) || 'May be flexible');
      console.log('   Rating:', reviewData.rating, 'Type:', typeof reviewData.rating, 'Valid:', reviewData.rating >= 1 && reviewData.rating <= 5);
      
      // Submit review via API
      const response = await reviewApi.createReview(reviewData);
      
      console.log('✅ ReviewModal: Review submitted successfully', response);
      showSuccess(t('reviews.success'), t('reviews.submitSuccess'));
      
      // Close modal and notify parent
      onClose();
      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (error) {
      console.error('💥 ReviewModal: Error submitting review:', error);
      let errorMessage = t('reviews.submitError');
      
      // Provide more specific error messages
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        // Handle specific error cases
        if (errorMessage.includes('Review already exists')) {
          errorMessage = t('reviews.reviewAlreadyExists');
        } else if (errorMessage.includes('Order not found or not delivered')) {
          errorMessage = t('reviews.orderNotDelivered');
        } else if (errorMessage.includes('Menu item was not part of this order')) {
          errorMessage = t('reviews.menuItemNotInOrder');
        } else if (errorMessage.includes('Restaurant does not match the order')) {
          errorMessage = t('reviews.restaurantMismatch');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(t('reviews.error'), errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg max-w-lg w-full mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">{t('reviews.leaveReview')}</h2>
        <p className="text-gray-600 mb-6">{menuItem?.name || t('reviews.unknownItem')}</p>

        <form onSubmit={handleSubmit}>
          {/* Rating */}
          <div className="flex items-center mb-6">
            <span className="mr-3 text-gray-700">{t('reviews.rating')}:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-2xl text-yellow-400 focus:outline-none"
              >
                <FontAwesomeIcon 
                  icon={(hoveredRating || rating) >= star ? faStarSolid : faStarRegular}
                  className="w-8 h-8"
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-gray-600">{rating} {t('reviews.stars')}</span>
            )}
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">{t('reviews.title')}</label>
            <input
              type="text"
              placeholder={t('reviews.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grub-red focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">{t('reviews.comment')}</label>
            <textarea
              placeholder={t('reviews.commentPlaceholder')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grub-red focus:border-transparent min-h-[120px]"
              maxLength={1000}
            />
          </div>

          {/* Image upload */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">{t('reviews.photos')}</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-grub-red hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    multiple
                  />
                  <FontAwesomeIcon icon={faUpload} className="w-6 h-6 text-gray-400" />
                </label>
              )}
            </div>
            <p className="text-sm text-gray-500">{t('reviews.maxImages')}</p>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-grub-red hover:bg-red-700 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                {t('reviews.submitting')}
              </div>
            ) : (
              t('reviews.submit')
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;