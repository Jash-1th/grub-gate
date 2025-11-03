import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Loading from '../components/common/Loading';
import { getStorageItem } from '../utils/ssrSafeStorage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter, 
  faCalendarAlt, 
  faUtensils, 
  faClock, 
  faCheckCircle, 
  faBox, 
  faTruck, 
  faCheck, 
  faTimesCircle, 
  faQuestionCircle,
  faReceipt,
  faMapMarkerAlt,
  faStar,
  faStarHalfAlt
} from '@fortawesome/free-solid-svg-icons';
import apiClient from '../api/apiClient';
import subscriptionApi from '../api/subscriptionApi';
import mealCalendarApi from '../api/mealCalendarApi';

const YourOrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading, token, isAuthenticated } = useAuth();
  const { showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [mealItems, setMealItems] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  
  // Check subscription status when component mounts or user authentication changes
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (authLoading) {
        return;
      }
      
      if (!isAuthenticated || !user) {
        setSubscriptionInfo(null);
        return;
      }

      try {
        const response = await mealCalendarApi.getSubscriptionStatus();
        if (response.data.hasActiveSubscription) {
          setSubscriptionInfo(response.data.activeSubscription);
        } else {
          setSubscriptionInfo(null);
        }
      } catch (error) {
        setSubscriptionInfo(null);
      }
    };

    checkSubscriptionStatus();
  }, [authLoading, isAuthenticated, user]);

  const fetchMealCalendarItems = async () => {
    const effectiveUser = user || getStorageItem('user');
    const effectiveToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
    
    if (!effectiveUser || !effectiveToken) {
      return [];
    }
    
    try {
      if (!subscriptionInfo) {
        return [];
      }
      
      // Get date range for meal calendar (past 30 days to future 60 days)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 60);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const response = await mealCalendarApi.getMealCalendarRange(startDateStr, endDateStr);
      
      if (!response.success) {
        throw new Error('Failed to fetch meal calendar');
      }
      
      // Transform meal calendar entries to match order format
      const mealEntries = response.data?.meals || [];
      
      const transformedMeals = mealEntries.map(meal => ({
        _id: meal._id || `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: meal.status || 'scheduled',
        scheduledDate: meal.date,
        scheduledTime: meal.deliveryTime?.start || '12:00',
        restaurant: meal.restaurantId || { name: meal.restaurantName || 'Restaurant' },
        items: [{
          _id: meal.itemId || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: meal.mealName || 'Meal Item',
          price: 0,
          quantity: 1
        }],
        isSubscriptionMeal: true,
        mealType: meal.mealType || 'lunch',
        total: 0,
        orderNumber: meal._id ? `SUB-${meal._id.slice(-6)}` : `SUB-${Math.floor(Date.now() / 1000).toString(36).slice(-6)}`
      }));
      
      return transformedMeals;
    } catch (error) {
      return [];
    }
  };

  const fetchOrders = async (pageNum = 1, filter = null) => {
    const effectiveUser = user || getStorageItem('user');
    const effectiveToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
    
    if (!effectiveUser || !effectiveToken) {
      setLoading(false);
      setFilterLoading(false);
      return;
    }
    
    try {
      // Build API URL with appropriate parameters
      let apiUrl = `/orders?page=${pageNum}&limit=10&includeScheduled=true`;
      
      // If we're fetching for delivered orders, use status filter
      if (filter === 'delivered') {
        apiUrl = `/orders?status=delivered&page=${pageNum}&limit=50`;
      }
      
      // If we're fetching for confirmed orders, use status filter
      if (filter === 'confirmed') {
        apiUrl = `/orders?status=confirmed&page=${pageNum}&limit=50`;
      }
      
      // If no filter is specified but we want to see all orders including delivered ones,
      // we might need to fetch delivered orders separately
      const shouldFetchDelivered = !filter && activeFilter === 'delivered';
      if (shouldFetchDelivered) {
        apiUrl = `/orders?status=delivered&page=${pageNum}&limit=50`;
      }
      
      // Use apiClient instead of fetch to ensure proper baseURL and headers
      const response = await apiClient.get(apiUrl);
      
      // The response is already parsed by axios, so we can access response.data directly
      const data = response.data;
      
      // Check if response is successful
      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to fetch orders');
      }
      
      // Fetch meal calendar items
      const mealCalendarItems = await fetchMealCalendarItems();
      setMealItems(mealCalendarItems);
      
      // Combine regular orders with meal calendar items
      // Fix: Use data.data instead of data.orders since the API returns paginated data
      const ordersArray = Array.isArray(data.data) ? data.data : [];
      
      // Only update the main orders state if we're NOT fetching delivered or confirmed orders specifically
      // When fetching delivered or confirmed orders, we only want to update the filtered display
      if (filter !== 'delivered' && filter !== 'confirmed') {
        const allOrders = [...(pageNum === 1 ? [] : orders), ...ordersArray, ...mealCalendarItems];
        
        // Sort all orders by date and time (newest first)
        const sortedOrders = allOrders.sort((a, b) => {
          const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime || '00:00'}`);
          const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime || '00:00'}`);
          return dateB - dateA; // Descending order (newest first)
        });
        
        setOrders(sortedOrders);
        
        // Apply current filter to new orders
        if (activeFilter === 'all') {
          setFilteredOrders(sortedOrders);
        } else {
          const filtered = sortedOrders.filter(order => {
            const orderStatus = order.status || 'unknown';
            const matchesFilter = orderStatus === activeFilter;
            return matchesFilter;
          });
          setFilteredOrders(filtered);
        }
        
        // For all orders, check if there are more pages
        const hasMoreItems = ordersArray.length === 10;
        setHasMore(hasMoreItems);
      } else {
        // When fetching delivered or confirmed orders specifically, only update the filtered display
        // Don't update the main orders state
        const specificOrders = [...(pageNum === 1 ? [] : filteredOrders), ...ordersArray];
        const sortedSpecificOrders = specificOrders.sort((a, b) => {
          const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime || '00:00'}`);
          const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime || '00:00'}`);
          return dateB - dateA; // Descending order (newest first)
        });
        
        setFilteredOrders(sortedSpecificOrders);
        
        // For specific orders, check if there are more pages
        const hasMoreItems = ordersArray.length === 50;
        setHasMore(hasMoreItems);
      }
      
      setLoading(false);
      setFilterLoading(false); // Hide filter loading indicator
    } catch (error) {
      showError(t('common.error'), t('common.retry'));
      setLoading(false);
      setFilterLoading(false); // Hide filter loading indicator even on error
    }
  };

  const applyFilter = (filter) => {
    // Set the active filter first
    setActiveFilter(filter);
    
    // Show loading indicator when switching filters
    setFilterLoading(true);
    
    // Apply the filter to current orders
    if (filter === 'all') {
      setFilteredOrders(orders);
      // For "all" filter, determine if we have more orders based on pagination
      // If we have exactly N*10 orders, there might be more (assuming 10 per page)
      const mightHaveMore = orders.length > 0 && orders.length % 10 === 0;
      setHasMore(mightHaveMore);
      
      // Hide loading indicator after a short delay to ensure UI update
      setTimeout(() => {
        setFilterLoading(false);
      }, 300);
    } else {
      const filtered = orders.filter(order => {
        const orderStatus = order.status || 'unknown';
        const matchesFilter = orderStatus === filter;
        return matchesFilter;
      });
      setFilteredOrders(filtered);
      
      // If we're filtering by delivered and don't have many results, fetch more delivered orders
      if (filter === 'delivered' && filtered.length < 10) {
        fetchOrders(1, 'delivered');
        // Don't hide loading indicator yet, fetchOrders will handle it
        return;
      }
      
      // If we're filtering by confirmed and don't have many results, fetch more confirmed orders
      if (filter === 'confirmed' && filtered.length < 10) {
        fetchOrders(1, 'confirmed');
        // Don't hide loading indicator yet, fetchOrders will handle it
        return;
      }
      
      // For other filters, hide load more button (they show all matching orders)
      // Exception: Show load more for confirmed filter if there are many results
      if (filter === 'confirmed' && filtered.length >= 10) {
        setHasMore(true);
      } else {
        setHasMore(false);
      }
      
      // Hide loading indicator after a short delay to ensure UI update
      setTimeout(() => {
        setFilterLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    // Wait for auth loading to complete
    if (authLoading === true) {
      return;
    }
    
    // Check if we have auth context values or fallback to localStorage
    const effectiveUser = user || getStorageItem('user');
    const effectiveToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
    
    // If both user and token are null/undefined but authLoading is false,
    // it means there's no authenticated user
    if (!effectiveUser && !effectiveToken) {
      setLoading(false);
      return;
    }
    
    // If we have user and token, fetch orders
    if (effectiveUser && effectiveToken) {
      // Small delay to ensure everything is properly initialized
      setTimeout(() => {
        fetchOrders();
      }, 100);
    } else {
      setLoading(false);
    }
  }, [authLoading, user, token, isAuthenticated]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    // Preserve the active filter when loading more
    fetchOrders(nextPage, activeFilter === 'delivered' || activeFilter === 'confirmed' ? activeFilter : null);
  };

  // Group orders by date
  const groupOrdersByDate = (orders) => {
    const grouped = {};
    orders.forEach(order => {
      const date = new Date(order.scheduledDate || order.deliveryDate);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(order);
    });
    return grouped;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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

  // Show loading spinner while auth is loading or our component is loading
  if (authLoading || loading) {
    return <Loading />;
  }

  // Group filtered orders by date
  const groupedOrders = groupOrdersByDate(filteredOrders);

  // Render star rating component (matching FoodItemCard implementation)
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-fill-orders">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half-fill-orders)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-grub-red to-red-700">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t('yourOrders.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
            {t('yourOrders.subtitle')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 -mt-16 relative z-20">
        {/* Filter options */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-5">
          <div className="flex flex-wrap gap-2">
            {['all', 'scheduled', 'pending', 'confirmed', 'preparing', 'delivered', 'cancelled'].map((filter) => (
              <button
                key={filter}
                onClick={() => applyFilter(filter)}
                disabled={filterLoading}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === filter 
                    ? 'bg-grub-red text-white shadow-md' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } ${filterLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {filterLoading && activeFilter === filter ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white inline-block mr-2"></div>
                ) : null}
                {t(`yourOrders.filters.${filter}`) || filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="mx-auto max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                <FontAwesomeIcon icon={faReceipt} size="3x" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('yourOrders.noOrdersTitle') || 'No Orders Found'}</h3>
              <p className="text-gray-600 mb-8 text-lg">{t('yourOrders.noOrders')}</p>
              <button 
                onClick={() => navigate('/')}
                className="bg-grub-red hover:bg-red-700 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg"
              >
                {t('yourOrders.browseRestaurants') || 'Browse Restaurants'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {filterLoading ? (
              // Show loading skeleton when filter is loading
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-grub-red mb-4"></div>
                <p className="text-gray-600">{t('common.loading')}</p>
              </div>
            ) : (
              <>
                {/* Grouped orders by date */}
                {Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a)).map(dateKey => (
                  <div key={dateKey} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-grub-red" />
                        {formatDate(dateKey)}
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {groupedOrders[dateKey].map(order => (
                        <div 
                          key={order._id} 
                          className="p-6 hover:bg-gray-50 transition-all duration-300 cursor-pointer border-l-4 border-l-grub-red rounded-r-lg shadow-sm hover:shadow-md bg-white"
                          onClick={() => {
                            // Navigate to order details page
                            navigate(`/order/${order._id}`);
                          }}
                        >
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-3">
                                <div className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faReceipt} className="text-grub-red" />
                                  <span className="font-bold text-gray-900">#{order.orderNumber || 'N/A'}</span>
                                </div>
                                {order.status && (
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(order.status)}`}>
                                    <FontAwesomeIcon icon={getStatusIcon(order.status)} className="text-sm" />
                                    {order.status ? t(`yourOrders.status.${order.status}`) : 'Unknown Status'}
                                  </span>
                                )}
                                {order.isSubscriptionMeal && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 shadow-sm">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-sm" />
                                    {t('yourOrders.subscriptionMeal')}
                                  </span>
                                )}
                              </div>
                              
                              {/* Main Order Items Display */}
                              <div className="mb-4">
                                <div className="font-semibold text-gray-900 mb-2 text-lg">
                                  {order.items?.length > 1 
                                    ? `${order.items?.length} items ordered` 
                                    : order.items?.[0]?.name || 'Order items'}
                                </div>
                                {order.items?.length > 1 ? (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {order.items?.slice(0, 3).map((item, index) => (
                                      <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                        {item.name}
                                      </span>
                                    ))}
                                    {order.items?.length > 3 && (
                                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                        +{order.items.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                ) : order.items?.length === 1 ? (
                                  <div className="flex items-center gap-3 text-gray-700 mb-3 bg-gray-50 p-3 rounded-lg">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                                    <div>
                                      <div className="font-bold text-gray-900">{order.items[0].name}</div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="font-medium">Qty: {order.items[0].quantity || 1}</span>
                                        <span>•</span>
                                        <span>${typeof order.items[0].price === 'number' ? order.items[0].price.toFixed(2) : '0.00'} each</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                              
                              {/* Restaurant and Rating Information */}
                              <div className="flex flex-wrap items-center gap-4 text-gray-600 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faUtensils} className="text-gray-400" />
                                  <span className="font-medium">{order.restaurantId?.name || order.restaurantName || order.restaurant?.name || 'Restaurant'}</span>
                                </div>
                                {/* Debug: Show what rating data is available */}
                                {/* <div className="text-xs text-gray-500">
                                  Rating: {order.restaurantId?.rating || 'N/A'}, 
                                  Restaurant Rating: {order.restaurant?.rating || 'N/A'},
                                  RestaurantId: {order.restaurantId ? 'Yes' : 'No'},
                                  Restaurant: {order.restaurant ? 'Yes' : 'No'}
                                </div> */}
                                {(order.restaurantId?.rating || order.restaurant?.rating) && (
                                  <div className="flex items-center gap-1">
                                    <div className="flex text-yellow-400">
                                      {renderStars(order.restaurantId?.rating || order.restaurant?.rating)}
                                    </div>
                                    <span className="font-medium text-gray-700">{(order.restaurantId?.rating || order.restaurant?.rating || 0).toFixed(1)}</span>
                                    <span className="text-gray-400">({order.restaurantId?.reviewCount || order.restaurant?.reviewCount || 0} reviews)</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900 mb-2">
                                ${(order.total || 0).toFixed(2)}
                              </div>
                              <div className="text-gray-600 mb-3">
                                {formatDate(order.scheduledDate || order.deliveryDate)}
                              </div>
                              {order.scheduledTime && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                  <FontAwesomeIcon icon={faClock} className="text-gray-500" />
                                  <span>{order.scheduledTime}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {hasMore && (activeFilter === 'all' || activeFilter === 'delivered' || activeFilter === 'confirmed') && (
                  <div className="text-center py-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="bg-grub-red hover:bg-red-700 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          {t('common.loading')}
                        </div>
                      ) : (
                        t('common.loadMore')
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default YourOrdersPage;