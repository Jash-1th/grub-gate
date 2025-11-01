import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import OrderHistoryCard from '../components/orders/OrderHistoryCard';
import ReviewModal from '../components/reviews/ReviewModal';
import Loading from '../components/common/Loading';
import { getStorageItem } from '../utils/ssrSafeStorage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
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
  const [lastReviewSubmission, setLastReviewSubmission] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  
  // Check subscription status when component mounts or user authentication changes
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      console.log('🔍 YourOrdersPage: Auth loading state:', authLoading);
      console.log('🔍 YourOrdersPage: Is authenticated:', isAuthenticated);
      console.log('🔍 YourOrdersPage: User data:', user);
      
      if (authLoading) {
        console.log('⏳ YourOrdersPage: Auth still loading, waiting...');
        return;
      }
      
      if (!isAuthenticated || !user) {
        console.log('🚫 YourOrdersPage: User not authenticated or no user data, skipping subscription check');
        setSubscriptionInfo(null);
        return;
      }

      try {
        console.log('🔍 YourOrdersPage: Checking subscription status for user:', user._id);
        
        const response = await mealCalendarApi.getSubscriptionStatus();
        console.log('✅ YourOrdersPage: Subscription status received:', response);
        console.log('✅ YourOrdersPage: Subscription data:', response.data);
        
        if (response.data.hasActiveSubscription) {
          console.log('✅ YourOrdersPage: User has active subscription, setting subscriptionInfo');
          setSubscriptionInfo(response.data.activeSubscription);
        } else {
          console.log('⚠️ YourOrdersPage: User has no active subscription');
          setSubscriptionInfo(null);
        }
      } catch (error) {
        console.error('❌ YourOrdersPage: Error checking subscription status:', error);
        setSubscriptionInfo(null);
      }
    };

    checkSubscriptionStatus();
  }, [authLoading, isAuthenticated, user]);

  const checkUserSubscription = async () => {
    console.log('🔍 checkUserSubscription: Checking user subscription status');
    // Check if we have auth context values or fallback to localStorage
    const effectiveUser = user || getStorageItem('user');
    const effectiveToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
    
    if (!effectiveUser || !effectiveToken) {
      console.log('⚠️ checkUserSubscription: No user or token, skipping');
      return null;
    }
    
    try {
      // Check for active subscriptions
      console.log('🔍 checkUserSubscription: Fetching user subscriptions');
      const subscriptionResponse = await subscriptionApi.getUserSubscriptions({ status: 'active' });
      console.log('✅ checkUserSubscription: Subscription response:', subscriptionResponse);
      
      if (subscriptionResponse?.data?.subscriptions?.length > 0) {
        const activeSubscription = subscriptionResponse.data.subscriptions[0];
        console.log('✅ checkUserSubscription: Found active subscription:', activeSubscription);
        setSubscriptionInfo(activeSubscription);
        return activeSubscription;
      } else {
        console.log('⚠️ checkUserSubscription: No active subscriptions found');
        setSubscriptionInfo(null);
        return null;
      }
    } catch (error) {
      console.error('💥 checkUserSubscription: Error checking subscription:', error);
      setSubscriptionInfo(null);
      return null;
    }
  };

  const fetchMealCalendarItems = async () => {
    console.log('🔍 fetchMealCalendarItems: Starting meal calendar fetch');
    // Check if we have auth context values or fallback to localStorage
    const effectiveUser = user || getStorageItem('user');
    const effectiveToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
    
    if (!effectiveUser || !effectiveToken) {
      console.log('⚠️ fetchMealCalendarItems: User not authenticated, skipping fetch');
      return [];
    }
    
    try {
      // First check if user has an active subscription
      console.log('🔍 fetchMealCalendarItems: Checking subscription status');
      // Use the subscriptionInfo state instead of calling checkUserSubscription again
      console.log('🔍 fetchMealCalendarItems: Using existing subscription info:', subscriptionInfo);
      
      if (!subscriptionInfo) {
        console.log('⚠️ fetchMealCalendarItems: No active subscription, returning empty array');
        return [];
      }
      
      // Get date range for meal calendar (past 30 days to future 60 days)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 60);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      console.log('📅 fetchMealCalendarItems: Fetching meal calendar items for range:', { startDateStr, endDateStr });
      
      const response = await mealCalendarApi.getMealCalendarRange(startDateStr, endDateStr);
      
      console.log('✅ fetchMealCalendarItems: API response received', response);
      
      if (!response.success) {
        console.error('❌ fetchMealCalendarItems: Failed to fetch meal calendar', response);
        throw new Error('Failed to fetch meal calendar');
      }
      
      // Transform meal calendar entries to match order format
      const mealEntries = response.data?.meals || [];
      console.log('🍽️ fetchMealCalendarItems: Found meal entries:', mealEntries.length);
      
      const transformedMeals = mealEntries.map(meal => ({
        _id: meal._id || `meal-${Math.random().toString(36).substr(2, 9)}`,
        status: meal.status || 'scheduled',
        scheduledDate: meal.date,
        scheduledTime: meal.deliveryTime?.start || '12:00',
        restaurant: meal.restaurantId || { name: meal.restaurantName || 'Restaurant' },
        items: [{
          _id: meal.itemId || `item-${Math.random().toString(36).substr(2, 9)}`,
          name: meal.mealName || 'Meal Item',
          price: 0
        }],
        isSubscriptionMeal: true,
        mealType: meal.mealType || 'lunch'
      }));
      
      console.log('🔄 fetchMealCalendarItems: Transformed meals:', transformedMeals);
      return transformedMeals;
    } catch (error) {
      console.error('💥 fetchMealCalendarItems: Error fetching meal calendar items:', error);
      return [];
    }
  };

  const fetchOrders = async (pageNum = 1, filter = null) => {
    console.log('📥 fetchOrders: Starting orders fetch, page:', pageNum, 'filter:', filter);
    console.log('📥 fetchOrders: Auth state:', { user, token, isAuthenticated });
    
    // Check if we have auth context values or fallback to localStorage
    const effectiveUser = user || getStorageItem('user');
    const effectiveToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
    
    if (!effectiveUser || !effectiveToken) {
      console.log('⚠️ fetchOrders: User not authenticated, skipping fetch');
      setLoading(false);
      setFilterLoading(false); // Also hide filter loading
      return;
    }
    
    try {
      console.log('🔑 fetchOrders: Fetching with token:', effectiveToken ? 'Token exists' : 'No token');
      
      // Build API URL with appropriate parameters
      let apiUrl = `/api/v1/orders?page=${pageNum}&limit=10&includeScheduled=true`;
      
      // If we're fetching for delivered orders, use status filter
      if (filter === 'delivered') {
        apiUrl = `/api/v1/orders?status=delivered&page=${pageNum}&limit=50`;
      }
      
      // If we're fetching for confirmed orders, use status filter
      if (filter === 'confirmed') {
        apiUrl = `/api/v1/orders?status=confirmed&page=${pageNum}&limit=50`;
      }
      
      // If no filter is specified but we want to see all orders including delivered ones,
      // we might need to fetch delivered orders separately
      const shouldFetchDelivered = !filter && activeFilter === 'delivered';
      if (shouldFetchDelivered) {
        console.log('📥 fetchOrders: Also fetching delivered orders');
        apiUrl = `/api/v1/orders?status=delivered&page=${pageNum}&limit=50`;
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${effectiveToken}`
        }
      });
      
      console.log('🌐 fetchOrders: Orders API response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ fetchOrders: Failed to fetch orders, status:', response.status);
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      console.log('📦 fetchOrders: Orders data received:', data);
      
      // Check if response is successful
      if (data.status !== 'success') {
        console.error('❌ fetchOrders: API returned error status:', data);
        throw new Error(data.message || 'Failed to fetch orders');
      }
      
      // Fetch meal calendar items
      console.log('🔄 fetchOrders: Fetching meal calendar items...');
      const mealCalendarItems = await fetchMealCalendarItems();
      setMealItems(mealCalendarItems);
      console.log('✅ fetchOrders: Meal calendar items set:', mealCalendarItems.length);
      
      // Combine regular orders with meal calendar items
      // Fix: Use data.data instead of data.orders since the API returns paginated data
      const ordersArray = Array.isArray(data.data) ? data.data : [];
      
      // Add debugging to see the structure of orders
      console.log('📦 fetchOrders: Raw orders data:', ordersArray);
      ordersArray.forEach((order, index) => {
        console.log(`📦 fetchOrders: Order ${index} items:`, order.items);
      });
      
      // Only update the main orders state if we're NOT fetching delivered or confirmed orders specifically
      // When fetching delivered or confirmed orders, we only want to update the filtered display
      if (filter !== 'delivered' && filter !== 'confirmed') {
        const allOrders = [...(pageNum === 1 ? [] : orders), ...ordersArray, ...mealCalendarItems];
        console.log('📊 fetchOrders: Combined orders - Regular:', ordersArray.length, 'Meal calendar:', mealCalendarItems.length, 'Total:', allOrders.length);
        
        // Check if our specific delivered order is in the list
        const specificOrder = allOrders.find(order => order._id === '68fdd0ff8919b04b51d49054');
        if (specificOrder) {
          console.log('📊 fetchOrders: Found specific delivered order:', specificOrder);
        } else {
          console.log('📊 fetchOrders: Specific delivered order NOT found in list');
        }
        
        // Sort all orders by date and time (newest first)
        const sortedOrders = allOrders.sort((a, b) => {
          const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime || '00:00'}`);
          const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime || '00:00'}`);
          return dateB - dateA; // Descending order (newest first)
        });
        
        console.log('📈 fetchOrders: Sorted orders:', sortedOrders);
        
        // Log status values for all orders
        console.log('📈 fetchOrders: Order statuses:');
        sortedOrders.forEach((order, index) => {
          console.log(`  Order ${index}: ${order._id} - Status: "${order.status}"`);
        });
        
        setOrders(sortedOrders);
        
        // Apply current filter to new orders
        if (activeFilter === 'all') {
          setFilteredOrders(sortedOrders);
          console.log('FilterWhere: Applied "all" filter after fetch, result count:', sortedOrders.length);
        } else {
          const filtered = sortedOrders.filter(order => {
            const orderStatus = order.status || 'unknown';
            const matchesFilter = orderStatus === activeFilter;
            return matchesFilter;
          });
          setFilteredOrders(filtered);
          console.log('FilterWhere: Applied filter "', activeFilter, '" after fetch, result count:', filtered.length);
        }
        
        // For all orders, check if there are more pages
        const hasMoreItems = ordersArray.length === 10;
        setHasMore(hasMoreItems);
        console.log('🔄 fetchOrders: Has more orders (all filter):', hasMoreItems);
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
        console.log('FilterWhere: Updated specific filter after API fetch, result count:', sortedSpecificOrders.length);
        
        // For specific orders, check if there are more pages
        const hasMoreItems = ordersArray.length === 50;
        setHasMore(hasMoreItems);
        console.log('🔄 fetchOrders: Has more orders (specific filter):', hasMoreItems);
      }
      
      setLoading(false);
      setFilterLoading(false); // Hide filter loading indicator
      console.log('✅ fetchOrders: Fetch complete');
    } catch (error) {
      console.error('💥 fetchOrders: Error fetching orders:', error);
      showError(t('common.error'), t('common.retry'));
      setLoading(false);
      setFilterLoading(false); // Hide filter loading indicator even on error
    }
  };

  const applyFilter = (filter) => {
    console.log('FilterWhere: Applying filter:', filter);
    console.log('FilterWhere: Current active filter:', activeFilter);
    console.log('FilterWhere: Current orders count:', orders.length);
    console.log('FilterWhere: Current filtered orders count:', filteredOrders.length);
    
    // Set the active filter first
    setActiveFilter(filter);
    
    // Show loading indicator when switching filters
    setFilterLoading(true);
    
    // Apply the filter to current orders
    if (filter === 'all') {
      setFilteredOrders(orders);
      console.log('FilterWhere: Applied "all" filter, result count:', orders.length);
      // For "all" filter, determine if we have more orders based on pagination
      // If we have exactly N*10 orders, there might be more (assuming 10 per page)
      const mightHaveMore = orders.length > 0 && orders.length % 10 === 0;
      setHasMore(mightHaveMore);
      console.log('FilterWhere: Set hasMore for "all" filter:', mightHaveMore);
      
      // Hide loading indicator after a short delay to ensure UI update
      setTimeout(() => {
        setFilterLoading(false);
      }, 300);
    } else {
      const filtered = orders.filter(order => {
        const orderStatus = order.status || 'unknown';
        const matchesFilter = orderStatus === filter;
        console.log(`FilterWhere: Order ${order._id} status: "${orderStatus}", filter: "${filter}", matches: ${matchesFilter}`);
        return matchesFilter;
      });
      setFilteredOrders(filtered);
      console.log('FilterWhere: Applied filter "', filter, '", result count:', filtered.length);
      
      // If we're filtering by delivered and don't have many results, fetch more delivered orders
      if (filter === 'delivered' && filtered.length < 10) {
        console.log('FilterWhere: Fetching more delivered orders');
        fetchOrders(1, 'delivered');
        // Don't hide loading indicator yet, fetchOrders will handle it
        return;
      }
      
      // If we're filtering by confirmed and don't have many results, fetch more confirmed orders
      if (filter === 'confirmed' && filtered.length < 10) {
        console.log('FilterWhere: Fetching more confirmed orders');
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
    console.log('🔄 YourOrdersPage: useEffect triggered', { authLoading, user, token, isAuthenticated });
    
    // Wait for auth loading to complete
    if (authLoading === true) {
      console.log('⏳ YourOrdersPage: Auth still loading, waiting...');
      return;
    }
    
    // Check if we have auth context values or fallback to localStorage
    const effectiveUser = user || getStorageItem('user');
    const effectiveToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
    
    console.log('🔄 YourOrdersPage: Effective auth state:', { effectiveUser, effectiveToken });
    
    // If both user and token are null/undefined but authLoading is false,
    // it means there's no authenticated user
    if (!effectiveUser && !effectiveToken) {
      console.log('🚫 YourOrdersPage: No user or token found, setting loading to false');
      setLoading(false);
      return;
    }
    
    // If we have user and token, fetch orders
    if (effectiveUser && effectiveToken) {
      console.log('🚀 YourOrdersPage: User authenticated, fetching orders');
      // Small delay to ensure everything is properly initialized
      setTimeout(() => {
        fetchOrders();
      }, 100);
    } else {
      console.log('🚫 YourOrdersPage: User not properly authenticated, setting loading to false');
      setLoading(false);
    }
  }, [authLoading, user, token, isAuthenticated]);

  const handleLoadMore = () => {
    console.log('⏬ handleLoadMore: Loading more orders, current page:', page, 'active filter:', activeFilter);
    const nextPage = page + 1;
    setPage(nextPage);
    // Preserve the active filter when loading more
    fetchOrders(nextPage, activeFilter === 'delivered' || activeFilter === 'confirmed' ? activeFilter : null);
  };

  // Add effect to monitor filter changes
  useEffect(() => {
    console.log('FilterWhere: Active filter changed to:', activeFilter);
  }, [activeFilter]);

  const handleReviewClick = (order, menuItem) => {
    console.log('📝 handleReviewClick: Review clicked for order:', order._id);
    setSelectedOrder(order);
    setSelectedMenuItem(menuItem);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (reviewData) => {
    console.log('📤 handleReviewSubmit: Review submitted', reviewData);
    // Close the modal
    setShowReviewModal(false);
    // Refresh orders to update review status
    await fetchOrders(1);
    
    // Force a re-render of OrderHistoryCard components by updating a timestamp
    // This will cause the review status check to run again
    setLastReviewSubmission(Date.now());
  };

  // Show loading spinner while auth is loading or our component is loading
  if (authLoading || loading) {
    console.log('⏳ YourOrdersPage: Component rendering loading state', { authLoading, loading });
    return <Loading />;
  }

  console.log('📄 YourOrdersPage: Rendering with orders:', orders.length, 'filtered orders:', filteredOrders.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Enhanced with better styling */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-r from-grub-red to-red-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
            {t('yourOrders.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
            {t('yourOrders.subtitle')}
          </p>
          
          {/* View Calendar Button - Only show if user has active subscription */}
          {subscriptionInfo && (
            <div className="mt-8">
              <button
                onClick={() => {
                  // Navigate to meal calendar with subscription start date
                  const subscriptionStartDate = subscriptionInfo?.subscriptionPeriod?.startDate;
                  if (subscriptionStartDate) {
                    const startDate = new Date(subscriptionStartDate).toISOString().split('T')[0];
                    navigate(`/meal-calendar?startDate=${startDate}`);
                  } else {
                    navigate('/meal-calendar');
                  }
                }}
                className="group w-full max-w-md mx-auto bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white text-grub-red font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-2 border-white/30 hover:border-white/50 relative overflow-hidden"
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative z-10 flex items-center justify-center space-x-3">
                  <div className="w-8 h-8 bg-grub-red/10 rounded-full flex items-center justify-center group-hover:bg-grub-red/20 transition-colors duration-300">
                    <svg className="w-5 h-5 text-grub-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-bold text-grub-red group-hover:text-red-700 transition-colors duration-300">
                      {t('yourOrders.viewCalendar')}
                    </div>
                    <div className="text-xs text-red-600 group-hover:text-red-700 transition-colors duration-300">
                      {t('yourOrders.checkScheduledMeals')}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-grub-red group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 -mt-16 relative z-20">
        {/* Filter options - Enhanced responsive design with better styling */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="text-grub-red" />
            {t('yourOrders.filterOrders') || 'Filter Orders'}
          </h2>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => applyFilter('all')}
              disabled={filterLoading}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${
                activeFilter === 'all' 
                  ? 'bg-grub-red text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } ${filterLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {filterLoading && activeFilter === 'all' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : null}
              {t('yourOrders.filters.all')}
            </button>
            <button 
              onClick={() => applyFilter('scheduled')}
              disabled={filterLoading}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${
                activeFilter === 'scheduled' 
                  ? 'bg-grub-red text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } ${filterLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {filterLoading && activeFilter === 'scheduled' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : null}
              {t('yourOrders.filters.scheduled')}
            </button>
            <button 
              onClick={() => applyFilter('pending')}
              disabled={filterLoading}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${
                activeFilter === 'pending' 
                  ? 'bg-grub-red text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } ${filterLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {filterLoading && activeFilter === 'pending' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : null}
              {t('yourOrders.filters.pending')}
            </button>
            <button 
              onClick={() => applyFilter('confirmed')}
              disabled={filterLoading}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${
                activeFilter === 'confirmed' 
                  ? 'bg-grub-red text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } ${filterLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {filterLoading && activeFilter === 'confirmed' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : null}
              {t('yourOrders.filters.confirmed')}
            </button>
            <button 
              onClick={() => applyFilter('preparing')}
              disabled={filterLoading}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${
                activeFilter === 'preparing' 
                  ? 'bg-grub-red text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } ${filterLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {filterLoading && activeFilter === 'preparing' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : null}
              {t('yourOrders.filters.preparing')}
            </button>
            <button 
              onClick={() => applyFilter('delivered')}
              disabled={filterLoading}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${
                activeFilter === 'delivered' 
                  ? 'bg-grub-red text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } ${filterLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {filterLoading && activeFilter === 'delivered' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : null}
              {t('yourOrders.filters.delivered')}
            </button>
            <button 
              onClick={() => applyFilter('cancelled')}
              disabled={filterLoading}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${
                activeFilter === 'cancelled' 
                  ? 'bg-grub-red text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } ${filterLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {filterLoading && activeFilter === 'cancelled' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : null}
              {t('yourOrders.filters.cancelled')}
            </button>
          </div>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center transition-all duration-300 hover:shadow-xl">
            <div className="mx-auto max-w-md">
              <div className="w-32 h-32 mx-auto mb-8 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('yourOrders.noOrdersTitle') || 'No Orders Found'}</h3>
              <p className="text-gray-600 mb-8 text-lg">{t('yourOrders.noOrders')}</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-grub-red hover:bg-red-700 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg transform hover:scale-105"
              >
                {t('yourOrders.browseRestaurants') || 'Browse Restaurants'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filterLoading ? (
              // Show loading skeleton when filter is loading
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-grub-red mb-4"></div>
                <p className="text-gray-600">{t('common.loading')}</p>
              </div>
            ) : (
              <>
                {filteredOrders.map(order => (
                  <OrderHistoryCard
                    key={order._id}
                    order={order}
                    onReviewClick={handleReviewClick}
                    lastReviewSubmission={lastReviewSubmission}
                  />
                ))}
                
                {hasMore && (activeFilter === 'all' || activeFilter === 'delivered' || activeFilter === 'confirmed') && (
                  <div className="text-center py-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="bg-grub-red hover:bg-red-700 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          order={selectedOrder}
          menuItem={selectedMenuItem}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default YourOrdersPage;