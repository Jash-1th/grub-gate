// FILE: src/hooks/useOrders.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { ordersApi } from '../api/ordersApi';

/**
 * SSR-safe hook for managing orders data and operations
 * @param {Object} initialFilters - Initial filters for orders
 * @returns {Object} Orders state and operations
 */
export const useOrders = (initialFilters = {}) => {
  // SSR safety check
  const isClient = typeof window !== 'undefined';
  
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 0,
    totalItems: 0
  });
  
  // Filters state
  const [filters, setFilters] = useState(initialFilters);
  
  // Refs for cleanup and debouncing
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  /**
   * Fetch orders from API with current filters
   */
  const fetchOrders = useCallback(async (customFilters = null) => {
    // Skip on server-side rendering
    if (!isClient) {
      setLoading(false);
      return;
    }

    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      const queryFilters = customFilters || filters;
      
      // Clean up empty filter values
      const cleanFilters = Object.entries(queryFilters).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      console.log('🔍 useOrders: Making API call with filters:', cleanFilters);

      const response = await ordersApi.getOrders(cleanFilters);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      // Debug: Log the actual response structure
      console.log('📦 useOrders: API Response received:', response?.data?.data?.length, 'orders');

      if (response?.data?.status === 'success') {
        const ordersData = response.data.data || [];
        console.log('✅ useOrders: Setting orders:', ordersData.length, 'orders');
        setOrders(ordersData);
        setPagination(response.data.pagination || pagination);
      } else {
        console.error('❌ useOrders: Unexpected response format:', response);
        throw new Error('Invalid response format');
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to fetch orders');
        setOrders([]);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [filters, isClient, pagination]);

  /**
   * Update order status
   */
  const updateOrderStatus = useCallback(async (orderId, status, notes = '') => {
    if (!isClient) return { success: false, error: 'Not available on server' };

    try {
      setError(null);
      
      const response = await ordersApi.updateOrderStatus(orderId, status, notes);
      
      if (response?.data?.status === 'success') {
        // Update local state optimistically
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status, updatedAt: new Date().toISOString() }
              : order
          )
        );
        
        // Refresh orders to get latest data
        await fetchOrders();
        
        return { success: true, data: response.data };
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      const errorMessage = err.message || 'Failed to update order status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [isClient, fetchOrders]);

  /**
   * Cancel order
   */
  const cancelOrder = useCallback(async (orderId, reason = '') => {
    if (!isClient) return { success: false, error: 'Not available on server' };

    try {
      setError(null);
      
      const response = await ordersApi.cancelOrder(orderId, reason);
      
      if (response?.data?.status === 'success') {
        // Update local state optimistically
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { 
                  ...order, 
                  status: 'cancelled', 
                  cancelReason: reason,
                  cancelledAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString() 
                }
              : order
          )
        );
        
        // Refresh orders to get latest data
        await fetchOrders();
        
        return { success: true, data: response.data };
      } else {
        throw new Error('Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      const errorMessage = err.message || 'Failed to cancel order';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [isClient, fetchOrders]);

  /**
   * Update filters with debouncing
   */
  const updateFilters = useCallback((newFilters) => {
    if (!isClient) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update filters immediately for UI responsiveness
    setFilters(prev => {
      const updatedFilters = { ...prev, ...newFilters };
      
      // Debounce API call with updated filters
      timeoutRef.current = setTimeout(() => {
        fetchOrders(updatedFilters);
      }, 300);
      
      return updatedFilters;
    });
  }, [isClient, fetchOrders]);

  /**
   * Refresh orders (force refetch)
   */
  const refreshOrders = useCallback(() => {
    if (isClient) {
      fetchOrders();
    }
  }, [isClient, fetchOrders]);

  /**
   * Get today's orders from current orders list
   */
  const getTodaysOrders = useCallback(() => {
    return ordersApi.getTodaysOrders(orders);
  }, [orders]);

  /**
   * Get current day's meals from weekly plans
   */
  const getCurrentDayMeals = useCallback(() => {
    return ordersApi.getCurrentDayMeals(orders);
  }, [orders]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial data fetch on client-side mount
  useEffect(() => {
    if (isClient) {
      // Small delay to ensure component is mounted
      const initTimeout = setTimeout(() => {
        fetchOrders();
      }, 100);

      return () => clearTimeout(initTimeout);
    } else {
      // Set loading to false on server-side
      setLoading(false);
    }
  }, [isClient]); // Only depend on isClient for initial fetch

  // Remove this useEffect since updateFilters now handles the API calls directly
  // No need for a separate effect to watch filter changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Return loading state for SSR
  if (!isClient) {
    return {
      orders: [],
      loading: true,
      error: null,
      pagination: { page: 1, limit: 20, totalPages: 0, totalItems: 0 },
      filters: initialFilters,
      updateOrderStatus: () => Promise.resolve({ success: false, error: 'Not available on server' }),
      cancelOrder: () => Promise.resolve({ success: false, error: 'Not available on server' }),
      updateFilters: () => {},
      refreshOrders: () => {},
      getTodaysOrders: () => [],
      getCurrentDayMeals: () => [],
      clearError: () => {},
      isClient: false
    };
  }

  return {
    // Data
    orders,
    loading,
    error,
    pagination,
    filters,
    
    // Operations
    updateOrderStatus,
    cancelOrder,
    updateFilters,
    refreshOrders,
    
    // Computed data
    getTodaysOrders,
    getCurrentDayMeals,
    
    // Utilities
    clearError,
    isClient
  };
};

export default useOrders;
