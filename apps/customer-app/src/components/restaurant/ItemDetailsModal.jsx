import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DAYS_OF_WEEK } from '../../utils/filteringAlgorithms';
import reviewApi from '../../api/reviewApi';
import { useAuth } from '../../contexts/AuthContext';

const ItemDetailsModal = ({ 
  isOpen, 
  item, 
  userType, 
  activeDay, 
  selectedMealType, 
  isFromMenuSelection = false,
  hideAddButton = false,
  isMealPlanningEnabled = true,
  onClose, 
  onAddToPlan, 
  onDayChange, 
  onMealTypeChange 
}) => {
  const { t } = useTranslation();
  const scrollPositionRef = useRef(0);
  const originalStylesRef = useRef({ body: '', html: '' });
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [checkingReviewStatus, setCheckingReviewStatus] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Fetch reviews for the menu item - optimized to run in parallel
  useEffect(() => {
    if (isOpen && item) {
      // Reset pagination
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false
      });
      
      // Fetch reviews and check user status in parallel for better performance
      fetchReviews(1, false);
      
      // Don't check user review status separately - we'll check from the fetched reviews
      setUserHasReviewed(false);
    } else {
      // Reset the state when modal is closed or item is not available
      setUserHasReviewed(false);
      setReviews([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false
      });
    }
  }, [isOpen, item]);

  // Check if user has reviewed from the already fetched reviews (no extra API call)
  const checkUserReviewFromFetchedData = (reviewsData) => {
    if (!isAuthenticated || !user || !reviewsData || reviewsData.length === 0) {
      setUserHasReviewed(false);
      return;
    }
    
    // Check if any review belongs to the current user
    const hasUserReview = reviewsData.some(review => 
      review.customerId === user._id || review.customerId?._id === user._id
    );
    
    setUserHasReviewed(hasUserReview);
  };

  const fetchReviews = async (page = 1, append = false) => {
    if (!item?._id) return;
    
    const isLoadingMore = page > 1;
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoadingReviews(true);
    }
    
    try {
      const response = await reviewApi.getMenuItemReviews(item._id, { 
        limit: 10,
        page: page
      });
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Pagination:', response.pagination);
      
      // Update pagination state
      setPagination({
        currentPage: response.pagination?.currentPage || 1,
        totalPages: response.pagination?.totalPages || 1,
        totalItems: response.pagination?.totalItems || 0,
        hasNextPage: response.pagination?.hasNextPage || false
      });
      
      // The reviews are in response.data (which is an array), not response.data.data
      const reviewsData = Array.isArray(response.data) ? response.data : [];
      console.log('Reviews data to set:', reviewsData);
      
      if (append) {
        // Append new reviews to existing ones
        setReviews(prevReviews => {
          const combined = [...prevReviews, ...reviewsData];
          // Check user review status from combined reviews
          checkUserReviewFromFetchedData(combined);
          return combined;
        });
      } else {
        // Replace reviews and check if user has reviewed
        setReviews(reviewsData);
        checkUserReviewFromFetchedData(reviewsData);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      if (!append) {
        setReviews([]);
      }
    } finally {
      if (isLoadingMore) {
        setLoadingMore(false);
      } else {
        setLoadingReviews(false);
      }
    }
  };

  const loadMoreReviews = () => {
    if (pagination.hasNextPage && !loadingMore) {
      fetchReviews(pagination.currentPage + 1, true);
    }
  };

  // Prevent background scrolling without position manipulation
  useEffect(() => {
    if (isOpen) {
      // Simply prevent scrolling without changing position
      const body = document.body;
      const originalOverflow = body.style.overflow;
      
      body.style.overflow = 'hidden';
      
      return () => {
        body.style.overflow = originalOverflow;
      };
    } else {
      // Reset user review status when modal is closed
      setUserHasReviewed(false);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  // Get icon for preference type
  const getPreferenceIcon = (preferenceId) => {
    const icons = {
      'vegetarian': '🥗',
      'vegan': '🌱',
      'gluten-free': '🌾',
      'dairy-free': '🥛',
      'keto': '🥑',
      'halal': '🕌',
      'kosher': '✡️'
    };
    return icons[preferenceId] || '🍽️';
  };

  const isPro = userType === 'pro';

  // Render star rating
  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-0 sm:p-4" role="dialog" data-modal="item-details" onClick={onClose}>
      <div className="bg-white rounded-none sm:rounded-2xl max-w-6xl w-full h-full sm:h-auto sm:max-h-[95vh] overflow-y-auto shadow-2xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        {/* Header with Image */}
        <div className="relative w-full h-56 sm:h-72 md:h-80 lg:h-96 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={item.image || '/images/grub-gate-default-img.jpg'}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              e.target.src = '/images/grub-gate-default-img.jpg';
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm text-gray-800 p-2.5 sm:p-3 rounded-full hover:bg-white hover:scale-110 transition-all duration-200 shadow-xl z-10 group"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Popular Badge */}
          {item.isPopular && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
              <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {t('itemDetails.popular')}
              </span>
            </div>
          )}
          
          {/* Price Badge */}
          <div className="absolute bottom-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 sm:px-5 sm:py-3 rounded-2xl shadow-2xl">
            <div className="text-2xl sm:text-3xl font-black">${item.price}</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 pb-6 sm:pb-8 space-y-6">
          {/* Title Section */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 leading-tight">{item.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-sm font-semibold rounded-full capitalize border border-blue-200">{item.category}</span>
              {item.cuisine && (
                <span className="px-3 py-1 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 text-sm font-semibold rounded-full capitalize border border-purple-200">{item.cuisine}</span>
              )}
            </div>
            {/* Rating and Reviews */}
            <div className="flex flex-wrap items-center gap-4">
              {item.rating > 0 && (
                <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-base font-bold text-gray-900">{item.rating}</span>
                  {item.reviewCount > 0 && (
                    <span className="text-sm font-medium text-gray-600">({item.reviewCount} {t('itemDetails.reviews')})</span>
                  )}
                </div>
              )}
              {/* Orders */}
              {item.totalOrders > 0 && (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-900">{item.totalOrders} {t('itemDetails.orders')}</span>
                </div>
              )}
              
              {/* Prep Time and Servings */}
              <div className="flex flex-wrap items-center gap-3">
                {item.prepTime && (
                  <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">{item.prepTime} min</span>
                  </div>
                )}
                {item.servings && (
                  <div className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">{item.servings} {t('itemDetails.servings')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">
              {item.longDescription || item.description}
            </p>
          </div>

          {/* Dietary Preferences & Spice Level */}
          <div className="flex flex-wrap gap-2 mb-4">
            {item.dietaryPreferences?.map(pref => (
              <span key={pref} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {getPreferenceIcon(pref)} {pref}
              </span>
            ))}
            {item.spiceLevel > 0 && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                🌶️ Spice Level: {item.spiceLevel}/5
              </span>
            )}
          </div>

          {/* Ingredients */}
          {item.ingredients && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">{t('itemDetails.ingredients')}:</h4>
              <div className="flex flex-wrap gap-1">
                {item.ingredients.map((ingredient, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens Warning */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-semibold text-blue-900">{t('itemDetails.containsAllergens')}:</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.allergens.map((allergen, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Availability Status */}
          {item.status && item.status !== 'available' && (
            <div className="mb-4">
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                item.status === 'out-of-stock' 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className={`font-semibold capitalize ${
                  item.status === 'out-of-stock' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {item.status.replace('-', ' ')}
                </span>
              </div>
            </div>
          )}

          {/* Nutrition Info */}
          {item.nutritionInfo && (Object.keys(item.nutritionInfo).length > 0) && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0h2a2 2 0 002 2v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 012 2h2a2 2 0 012 2v-2a2 2 0 01-2-2h-1z" />
                </svg>
                {t('itemDetails.nutritionInformation')}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {item.nutritionInfo.calories && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="font-bold text-xl text-blue-900">{item.nutritionInfo.calories}</div>
                    <div className="text-sm text-blue-700">{t('itemDetails.calories')}</div>
                  </div>
                )}
                {item.nutritionInfo.protein && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="font-bold text-xl text-green-900">{item.nutritionInfo.protein}</div>
                    <div className="text-sm text-green-700">{t('itemDetails.protein')}</div>
                  </div>
                )}
                {item.nutritionInfo.carbs && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <div className="font-bold text-xl text-yellow-900">{item.nutritionInfo.carbs}</div>
                    <div className="text-sm text-yellow-700">{t('itemDetails.carbs')}</div>
                  </div>
                )}
                {item.nutritionInfo.fat && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="font-bold text-xl text-purple-900">{item.nutritionInfo.fat}</div>
                    <div className="text-sm text-purple-700">{t('itemDetails.fat')}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews Section - Enhanced UI */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                <svg className="w-6 h-6 text-grub-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t('itemDetails.customerReviews')}
              </h4>
              {pagination.totalItems > 0 && (
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {pagination.totalItems} {pagination.totalItems === 1 ? t('itemDetails.review') : t('itemDetails.reviews')}
                </span>
              )}
            </div>
            
            {loadingReviews ? (
              <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-grub-red border-t-transparent mb-4"></div>
                <p className="text-gray-600 font-medium">{t('itemDetails.loadingReviews')}</p>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 sm:p-5 border-2 border-gray-100 hover:border-grub-red/30 hover:shadow-lg transition-all duration-300">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* User Avatar */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-grub-red to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                          {(review.customerName || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-base sm:text-lg">
                            {review.customerName || 'Anonymous'}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {renderStarRating(review.rating)}
                            <span className="text-sm font-medium text-gray-700">{review.rating}.0</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                    
                    {/* Review Title */}
                    {review.title && (
                      <h5 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">{review.title}</h5>
                    )}
                    
                    {/* Review Comment */}
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3">{review.comment}</p>
                    
                    {/* Review Photos */}
                    {review.photos && review.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {review.photos.slice(0, 4).map((photo, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={photo} 
                              alt={`Review photo ${index + 1}`}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-gray-200 group-hover:border-grub-red transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl"
                            />
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
                          </div>
                        ))}
                        {review.photos.length > 4 && (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-sm">
                            +{review.photos.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Load More Button */}
                {pagination.hasNextPage && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={loadMoreReviews}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-gradient-to-r from-grub-red to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>{t('itemDetails.loading')}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          <span>{t('itemDetails.loadMoreReviews')}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {/* Review Count */}
                <div className="text-center text-sm text-gray-600 mt-4 font-medium">
                  {t('itemDetails.showingReviews', { current: reviews.length, total: pagination.totalItems })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-semibold text-lg mb-2">
                  {userHasReviewed ? t('itemDetails.alreadyReviewed') : t('itemDetails.noReviewsYet')}
                </p>
                <p className="text-gray-500 text-sm">
                  {userHasReviewed ? t('itemDetails.thankYouFeedback') : t('itemDetails.beTheFirst')}
                </p>
              </div>
            )}
          </div>


          {/* Add to Plan Button - Show unless explicitly hidden and meal planning is enabled */}
          {!hideAddButton && isMealPlanningEnabled && (
            <button
              onClick={() => onAddToPlan(item)}
              className={`w-full font-semibold py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation ${
                isPro 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-center">
                {isPro 
                  ? `Add to ${DAYS_OF_WEEK.find(d => d.id === activeDay)?.name} ${selectedMealType ? selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1) : 'Meal'}` 
                  : `Add to ${DAYS_OF_WEEK.find(d => d.id === activeDay)?.name} ${selectedMealType ? selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1) : 'Meal'}`
                }
              </span>
            </button>
          )}
          
          {/* Extra spacing for mobile to ensure button is visible */}
          <div className="h-4 sm:h-0"></div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;