import React, { useEffect, useRef, useState } from 'react';
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

  // Fetch reviews for the menu item
  useEffect(() => {
    if (isOpen && item) {
      // Reset pagination and fetch first page of reviews
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false
      });
      fetchReviews(1, false);
      // Only check user review status if user is authenticated
      if (isAuthenticated && user) {
        checkUserReviewStatus();
      } else {
        // Reset the state if user is not authenticated
        setUserHasReviewed(false);
      }
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
  }, [isOpen, item, user, isAuthenticated]);

  const checkUserReviewStatus = async () => {
    // Only check if user is authenticated and we have an item
    if (!isAuthenticated || !user || !item?._id) return;
    
    // Check if user has first and last name
    if (!user.firstName || !user.lastName) return;
    
    setCheckingReviewStatus(true);
    try {
      // We need to check if user has reviewed this specific menu item
      // Since there's no direct API for this, we'll fetch reviews and check if any belong to the current user
      const response = await reviewApi.getMenuItemReviews(item._id, { limit: 100 });
      
      // If there are no reviews at all, user couldn't have reviewed the item
      if (!response.data?.reviews || response.data.reviews.length === 0) {
        setUserHasReviewed(false);
        return;
      }
      
      // Check if any review belongs to the current user by matching user ID
      const userReviews = response.data.reviews.filter(review => 
        review.customerId === user._id
      ) || [];
      
      setUserHasReviewed(userReviews.length > 0);
    } catch (error) {
      console.error('Error checking user review status:', error);
      setUserHasReviewed(false);
    } finally {
      setCheckingReviewStatus(false);
    }
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
        setReviews(prevReviews => [...prevReviews, ...reviewsData]);
      } else {
        // Replace reviews
        setReviews(reviewsData);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 pt-4 pb-20 sm:pb-4" role="dialog" data-modal="item-details">
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-5xl w-full max-h-full sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative py-6 flex justify-center">
          <div className="w-11/12 max-w-3xl rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            <img
              src={item.image || '/images/grub-gate-default-img.jpg'}
              alt={item.name}
              className="w-full h-56 sm:h-64 md:h-72 object-cover"
              onError={(e) => {
                e.target.src = '/images/grub-gate-default-img.jpg';
              }}
            />
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white bg-opacity-90 text-gray-800 p-2 sm:p-3 rounded-full hover:bg-opacity-100 transition-all touch-manipulation shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8 pb-6 sm:pb-6">
          {/* Title and Price */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2 sm:gap-0">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight">{item.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span className="capitalize">{item.category}</span>
                {item.cuisine && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{item.cuisine}</span>
                  </>
                )}
              </div>
              {/* Rating and Reviews */}
              {item.rating > 0 && (
                <div className="flex items-center gap-2 mb-2">
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
                  <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                  {item.reviewCount > 0 && (
                    <span className="text-sm text-gray-500">({item.reviewCount} reviews)</span>
                  )}
                </div>
              )}
              {/* Popularity and Orders */}
              {item.totalOrders > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>{item.totalOrders} orders</span>
                  {item.isPopular && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      Popular
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <div className="text-xl sm:text-2xl font-bold text-green-600">${item.price}</div>
              {/* Prep Time and Servings */}
              <div className="flex flex-col gap-1 mt-2 text-sm text-gray-600">
                {item.prepTime && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{item.prepTime} min</span>
                  </div>
                )}
                {item.servings && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{item.servings} servings</span>
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
              <h4 className="font-semibold text-gray-900 mb-2">Ingredients:</h4>
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
                  <h4 className="font-semibold text-blue-900">Contains Allergens:</h4>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Nutrition Information
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {item.nutritionInfo.calories && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="font-bold text-xl text-blue-900">{item.nutritionInfo.calories}</div>
                    <div className="text-sm text-blue-700">Calories</div>
                  </div>
                )}
                {item.nutritionInfo.protein && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="font-bold text-xl text-green-900">{item.nutritionInfo.protein}</div>
                    <div className="text-sm text-green-700">Protein</div>
                  </div>
                )}
                {item.nutritionInfo.carbs && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <div className="font-bold text-xl text-yellow-900">{item.nutritionInfo.carbs}</div>
                    <div className="text-sm text-yellow-700">Carbs</div>
                  </div>
                )}
                {item.nutritionInfo.fat && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="font-bold text-xl text-purple-900">{item.nutritionInfo.fat}</div>
                    <div className="text-sm text-purple-700">Fat</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Customer Reviews
            </h4>
            
            {loadingReviews || checkingReviewStatus ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-grub-red"></div>
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">
                        {review.customerName || 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mb-2">
                      {renderStarRating(review.rating)}
                    </div>
                    {review.title && (
                      <h5 className="font-medium text-gray-800 mb-1">{review.title}</h5>
                    )}
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                    {review.photos && review.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {review.photos.slice(0, 3).map((photo, index) => (
                          <img 
                            key={index} 
                            src={photo} 
                            alt="Review" 
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {pagination.hasNextPage && (
                  <div className="col-span-full flex justify-center mt-4">
                    <button
                      onClick={loadMoreReviews}
                      disabled={loadingMore}
                      className="px-6 py-2 bg-grub-red text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          Load More Reviews
                        </>
                      )}
                    </button>
                  </div>
                )}
                <div className="col-span-full text-center text-sm text-gray-500 mt-2">
                  Showing {reviews.length} of {pagination.totalItems} reviews
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {userHasReviewed ? (
                  <p>You've already reviewed this item!</p>
                ) : (
                  <p>No reviews yet. Be the first to review this item!</p>
                )}
              </div>
            )}
          </div>

          {/* Meal Planning Section - Enhanced for both user types */}
          {isMealPlanningEnabled && (
            <div className="mb-6">
            {/* Show current selection for all users */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <span className="text-blue-600"></span>
                  <span>Adding to your meal plan</span>
                </h4>
                {isPro && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                    PRO
                  </span>
                )}
              </div>
              
              {/* Current Selection Display */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center space-x-2 px-3 py-2 bg-white border border-blue-200 rounded-lg shadow-sm">
                  <span className="text-blue-600"></span>
                  <span className="font-medium text-gray-900">
                    {DAYS_OF_WEEK.find(d => d.id === activeDay)?.name || 'Select Day'}
                  </span>
                </div>
                
                <div className={`flex items-center space-x-2 px-3 py-2 border rounded-lg shadow-sm ${
                  selectedMealType === 'lunch' 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                    : 'bg-orange-50 border-orange-200 text-orange-800'
                }`}>
                  <span></span>
                  <span className="font-medium capitalize">{selectedMealType || 'meal'}</span>
                </div>
                
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                  <span className="text-green-600"></span>
                  <span className="font-bold text-green-800">${item.price}</span>
                </div>
              </div>
            </div>

            {/* Day and Meal Selection - For Normal Users or when not from MenuSelection */}
            {(userType === 'normal' && !isFromMenuSelection) && (
              <div className="space-y-4">
                {/* Day Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Choose Day:</label>
                  <select 
                    value={activeDay} 
                    onChange={(e) => onDayChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.id} value={day.id}>{day.name}</option>
                    ))}
                  </select>
                </div>

                {/* Meal Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Choose Meal:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onMealTypeChange('lunch')}
                      className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 border-2 ${
                        selectedMealType === 'lunch'
                          ? 'bg-yellow-500 text-white border-yellow-500 shadow-lg transform scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                      }`}
                    >
                      <span className="text-lg"></span>
                      <span>Lunch</span>
                    </button>
                    <button
                      onClick={() => onMealTypeChange('dinner')}
                      className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 border-2 ${
                        selectedMealType === 'dinner'
                          ? 'bg-orange-500 text-white border-orange-500 shadow-lg transform scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <span className="text-lg"></span>
                      <span>Dinner</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Info message for users coming from weekly menu */}
            {isFromMenuSelection && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5"></span>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">This item will be added to your selected time slot</p>
                    <p className="text-blue-600 mt-1">
                      You can change the day and meal type from your weekly meal plan later.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

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