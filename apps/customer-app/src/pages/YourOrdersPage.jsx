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
  const [loadingMore, setLoadingMore] = useState(false);
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
      // Fetch all orders at once for faster client-side filtering
      // Increase limit to get more orders in one request
      let apiUrl = `/orders?page=${pageNum}&limit=50&includeScheduled=true`;
      
      // Use apiClient instead of fetch to ensure proper baseURL and headers
      const response = await apiClient.get(apiUrl);
      
      // The response is already parsed by axios, so we can access response.data directly
      const data = response.data;
      
      // Check if response is successful
      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to fetch orders');
      }
      
      // Combine regular orders with meal calendar items
      const ordersArray = Array.isArray(data.data) ? data.data : [];
      
      // Only fetch meal calendar items on first page load
      let mealCalendarItems = [];
      if (pageNum === 1) {
        mealCalendarItems = await fetchMealCalendarItems();
        setMealItems(mealCalendarItems);
      }
      
      // Combine with existing orders if loading more pages
      let allOrders;
      if (pageNum === 1) {
        // First page: combine new orders with meal calendar items
        allOrders = [...ordersArray, ...mealCalendarItems];
      } else {
        // Subsequent pages: append to existing orders (don't add meal items again)
        allOrders = [...orders, ...ordersArray];
      }
      
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
          return orderStatus === activeFilter;
        });
        setFilteredOrders(filtered);
      }
      
      // Check if there are more pages
      // If we got a full page (50 items), there might be more
      const hasMoreItems = ordersArray.length >= 50;
      setHasMore(hasMoreItems);
      
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
    
    // Apply the filter to current orders (client-side filtering - instant!)
    if (filter === 'all') {
      setFilteredOrders(orders);
      // For "all" filter, determine if we have more orders based on pagination
      const mightHaveMore = orders.length > 0 && orders.length % 10 === 0;
      setHasMore(mightHaveMore);
    } else {
      // Filter from already loaded orders - no API call needed
      const filtered = orders.filter(order => {
        const orderStatus = order.status || 'unknown';
        return orderStatus === filter;
      });
      setFilteredOrders(filtered);
      
      // Don't show "load more" for filtered views since we're showing all matching orders from cache
      setHasMore(false);
    }
    
    // Hide loading indicator immediately since filtering is instant
    setTimeout(() => {
      setFilterLoading(false);
    }, 100);
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

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    // Fetch more orders (no filter needed, we filter client-side)
    await fetchOrders(nextPage);
    setLoadingMore(false);
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

  // Show loading skeleton while auth is loading or our component is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section Skeleton */}
        <section className="relative py-8 xs:py-10 sm:py-12 md:py-16 bg-gradient-to-r from-grub-red via-grub-red to-grub-red">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMC0ydjJoLTJ2LTJoMnptLTItMmgydjJoLTJ2LTJ6bTItMmgydjJoLTJ2LTJ6bTAtMmgydjJoLTJ2LTJ6bTItMmgydjJoLTJ2LTJ6bTAtMmgydjJoLTJ2LTJ6bTItMmgydjJoLTJ2LTJ6bTAtMmgydjJoLTJ2LTJ6bTItMmgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 text-center">
            <div className="h-10 xs:h-12 sm:h-14 md:h-16 bg-white/20 rounded-lg mx-auto mb-2 xs:mb-3 sm:mb-4 max-w-md animate-pulse"></div>
            <div className="h-6 xs:h-7 sm:h-8 bg-white/10 rounded-lg mx-auto max-w-2xl animate-pulse"></div>
          </div>
        </section>

        {/* Main Content Skeleton */}
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 md:px-8 py-6 xs:py-8 -mt-8 xs:-mt-10 sm:-mt-12 md:-mt-16 relative z-20">
          {/* Filter Skeleton */}
          <div className="mb-6 xs:mb-8 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 xs:p-5 sm:p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-3 xs:mb-4"></div>
            <div className="flex flex-wrap gap-2 xs:gap-2.5 sm:gap-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-full w-20 xs:w-24"></div>
              ))}
            </div>
          </div>

          {/* Orders Skeleton */}
          <div className="space-y-6 xs:space-y-8">
            {[1, 2].map((group) => (
              <div key={group} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="p-3 xs:p-4 sm:p-5 md:p-6 space-y-4 xs:space-y-5 sm:space-y-6">
                  {[1, 2].map((order) => (
                    <div key={order} className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden">
                      {/* Order Header Skeleton */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 xs:px-5 sm:px-6 py-3 xs:py-4 border-b-2 border-gray-200">
                        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3">
                          <div className="h-6 bg-gray-200 rounded w-32"></div>
                          <div className="flex gap-2">
                            <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                          </div>
                        </div>
                      </div>

                      {/* Order Body Skeleton */}
                      <div className="p-4 xs:p-5 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 sm:gap-5 lg:gap-6">
                          <div className="flex-1 space-y-3 xs:space-y-4">
                            {/* Restaurant Info Skeleton */}
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-xl"></div>
                              <div className="flex-1">
                                <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                              </div>
                            </div>

                            {/* Order Items Skeleton */}
                            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 xs:p-4">
                              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                              <div className="space-y-2">
                                {[1, 2].map((item) => (
                                  <div key={item} className="flex items-center justify-between bg-white p-2 xs:p-3 rounded-lg">
                                    <div className="flex items-center gap-2 xs:gap-3 flex-1">
                                      <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gray-200 rounded-lg"></div>
                                      <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                                      </div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right Section Skeleton */}
                          <div className="lg:w-44 xl:w-48 flex flex-row lg:flex-col justify-between lg:justify-start gap-3 xs:gap-4 lg:gap-5">
                            <div className="flex-1 lg:flex-none bg-gray-200 rounded-xl h-24"></div>
                            <div className="flex-1 lg:flex-none bg-gray-200 rounded-xl h-24"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Loading Indicator */}
          <div className="flex flex-col items-center justify-center py-12 mt-8">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-grub-red rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-red-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium text-lg animate-pulse">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative py-8 xs:py-10 sm:py-12 md:py-16 bg-gradient-to-r from-grub-red via-grub-red to-grub-red">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMC0ydjJoLTJ2LTJoMnptLTItMmgydjJoLTJ2LTJ6bTItMmgydjJoLTJ2LTJ6bTAtMmgydjJoLTJ2LTJ6bTItMmgydjJoLTJ2LTJ6bTAtMmgydjJoLTJ2LTJ6bTItMmgydjJoLTJ2LTJ6bTAtMmgydjJoLTJ2LTJ6bTItMmgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 text-center">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 xs:mb-3 sm:mb-4">
            {t('yourOrders.title')}
          </h1>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-100 max-w-3xl mx-auto px-2">
            {t('yourOrders.subtitle')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-3 xs:px-4 sm:px-6 md:px-8 py-6 xs:py-8 -mt-8 xs:-mt-10 sm:-mt-12 md:-mt-16 relative z-20">
        {/* Filter options */}
        <div className="mb-6 xs:mb-8 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 xs:p-5 sm:p-6">
          <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
            <FontAwesomeIcon icon={faFilter} className="text-grub-red text-lg xs:text-xl" />
            <h2 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900">{t('yourOrders.filterBy') || 'Filter Orders'}</h2>
          </div>
          <div className="flex flex-wrap gap-2 xs:gap-2.5 sm:gap-3">
            {['all', 'scheduled', 'pending', 'confirmed', 'preparing', 'delivered', 'cancelled'].map((filter) => (
              <button
                key={filter}
                onClick={() => applyFilter(filter)}
                disabled={filterLoading}
                className={`px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 rounded-full text-xs xs:text-sm sm:text-base font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeFilter === filter 
                    ? 'bg-gradient-to-r from-grub-red via-grub-red to-grub-red text-white shadow-lg shadow-grub-red/20' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                } ${filterLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {filterLoading && activeFilter === filter ? (
                  <div className="animate-spin rounded-full h-3 w-3 xs:h-4 xs:w-4 border-t-2 border-b-2 border-white inline-block mr-1.5 xs:mr-2"></div>
                ) : null}
                {t(`yourOrders.filters.${filter}`) || filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 xs:p-10 sm:p-12 md:p-16 text-center">
            <div className="mx-auto max-w-md">
              <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 mx-auto mb-4 xs:mb-5 sm:mb-6 text-gray-300">
                <FontAwesomeIcon icon={faReceipt} className="w-full h-full" />
              </div>
              <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-3 xs:mb-4">{t('yourOrders.noOrdersTitle') || 'No Orders Found'}</h3>
              <p className="text-sm xs:text-base sm:text-lg text-gray-600 mb-6 xs:mb-7 sm:mb-8 leading-relaxed">{t('yourOrders.noOrders')}</p>
              <button 
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-grub-red via-grub-red to-grub-red text-white px-6 xs:px-7 sm:px-8 py-3 xs:py-3.5 sm:py-4 rounded-lg sm:rounded-xl hover:shadow-xl hover:shadow-grub-red/20 transition-all duration-300 font-semibold text-sm xs:text-base sm:text-lg transform hover:scale-105"
              >
                {t('yourOrders.browseRestaurants') || 'Browse Restaurants'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 xs:space-y-8">
            {filterLoading ? (
              // Show loading skeleton when filter is loading
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 xs:h-10 xs:w-10 border-t-2 border-b-2 border-grub-red mb-4"></div>
                <p className="text-sm xs:text-base text-gray-600">{t('common.loading')}</p>
              </div>
            ) : (
              <>
                {/* Grouped orders by date */}
                {Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a)).map(dateKey => (
                  <div key={dateKey} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-grub-red" />
                        {formatDate(dateKey)}
                      </h3>
                    </div>
                    <div className="p-3 xs:p-4 sm:p-5 md:p-6 space-y-4 xs:space-y-5 sm:space-y-6">
                      {groupedOrders[dateKey].map(order => (
                        <div 
                          key={order._id} 
                          className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden hover:border-grub-red hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          {/* Order Header */}
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 xs:px-5 sm:px-6 py-3 xs:py-4 border-b-2 border-gray-200">
                            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3">
                              <div className="flex items-center gap-2 xs:gap-3">
                                <FontAwesomeIcon icon={faReceipt} className="text-grub-red text-base xs:text-lg" />
                                <span className="font-bold text-gray-900 text-sm xs:text-base sm:text-lg">Order #{order.orderNumber || 'N/A'}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {order.status && (
                                  <span className={`inline-flex items-center gap-1 xs:gap-1.5 px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-bold ${getStatusColor(order.status)}`}>
                                    <FontAwesomeIcon icon={getStatusIcon(order.status)} className="text-xs" />
                                    {order.status ? t(`yourOrders.status.${order.status}`) : 'Unknown'}
                                  </span>
                                )}
                                {order.isSubscriptionMeal && (
                                  <span className="inline-flex items-center gap-1 xs:gap-1.5 px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-bold bg-blue-100 text-blue-800">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
                                    Subscription
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Order Body */}
                          <div className="p-4 xs:p-5 sm:p-6">
                            <div className="flex flex-col lg:flex-row lg:justify-between gap-4 sm:gap-5 lg:gap-6">
                              {/* Left Section - Order Details */}
                              <div className="flex-1 space-y-3 xs:space-y-4">
                                {/* Restaurant Info */}
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-grub-red via-grub-red to-grub-red rounded-xl flex items-center justify-center text-white font-bold text-lg xs:text-xl sm:text-2xl shadow-md">
                                    {(order.restaurantId?.name || order.restaurantName || order.restaurant?.name || 'R').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 text-base xs:text-lg sm:text-xl mb-1 truncate">
                                      {order.restaurantId?.name || order.restaurantName || order.restaurant?.name || 'Restaurant'}
                                    </h3>
                                    {(order.restaurantId?.rating || order.restaurant?.rating) && (
                                      <div className="flex items-center gap-1.5 xs:gap-2">
                                        <div className="flex text-yellow-400">
                                          {renderStars(order.restaurantId?.rating || order.restaurant?.rating)}
                                        </div>
                                        <span className="font-semibold text-gray-700 text-xs xs:text-sm">{(order.restaurantId?.rating || order.restaurant?.rating || 0).toFixed(1)}</span>
                                        <span className="text-gray-400 text-xs">({order.restaurantId?.reviewCount || order.restaurant?.reviewCount || 0})</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Order Items */}
                                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 xs:p-4">
                                  <h4 className="font-semibold text-gray-700 text-xs xs:text-sm mb-2 xs:mb-3">Order Items:</h4>
                                  {order.items?.length > 0 ? (
                                    <div className="space-y-2">
                                      {order.items.slice(0, 2).map((item, index) => {
                                        const itemRating = item.menuItemId?.rating || item.rating || 0;
                                        return (
                                          <div key={index} className="flex items-center justify-between bg-white p-2 xs:p-3 rounded-lg">
                                            <div className="flex items-center gap-2 xs:gap-3 flex-1 min-w-0">
                                              <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                                              <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 text-xs xs:text-sm sm:text-base truncate">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                  <p className="text-gray-500 text-xs">Qty: {item.quantity || 1}</p>
                                                  {itemRating > 0 && (
                                                    <div className="flex items-center gap-1">
                                                      <div className="flex">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                          <svg
                                                            key={star}
                                                            className={`w-3 h-3 ${star <= itemRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                          >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                          </svg>
                                                        ))}
                                                      </div>
                                                      <span className="text-xs text-gray-600 font-medium">{itemRating.toFixed(1)}</span>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                            {item.price && (
                                              <span className="font-bold text-gray-900 text-xs xs:text-sm ml-2">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                                            )}
                                          </div>
                                        );
                                      })}
                                      {order.items.length > 2 && (
                                        <div className="text-center py-2 text-xs xs:text-sm text-gray-600 font-medium">
                                          +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-gray-500 text-sm">No items</p>
                                  )}
                                </div>
                              </div>

                              {/* Right Section - Price & Time */}
                              <div className="lg:w-44 xl:w-48 flex flex-row lg:flex-col justify-between lg:justify-start gap-3 xs:gap-4 lg:gap-5">
                                {/* Total Price */}
                                <div className="flex-1 lg:flex-none bg-gradient-to-br from-grub-red via-grub-red to-grub-red rounded-xl p-3 xs:p-4 text-white text-center lg:text-left">
                                  <p className="text-xs opacity-90 mb-1">Total Amount</p>
                                  <p className="text-xl xs:text-2xl sm:text-3xl font-bold">${(order.total || 0).toFixed(2)}</p>
                                </div>

                                {/* Delivery Time */}
                                {order.scheduledTime && (
                                  <div className="flex-1 lg:flex-none bg-blue-50 border-2 border-blue-200 rounded-xl p-3 xs:p-4 text-center lg:text-left">
                                    <p className="text-xs text-blue-600 font-semibold mb-1">Delivery Time</p>
                                    <div className="flex items-center justify-center lg:justify-start gap-1.5 xs:gap-2">
                                      <FontAwesomeIcon icon={faClock} className="text-blue-600 text-sm xs:text-base" />
                                      <span className="font-bold text-blue-900 text-sm xs:text-base sm:text-lg">{order.scheduledTime}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {hasMore && activeFilter === 'all' && (
                  <div className="text-center py-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="bg-grub-red hover:bg-grub-red text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
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