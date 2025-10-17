import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faEye, 
  faCheckCircle, 
  faClock, 
  faTimes,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faBox,
  faUser,
  faCalendar,
  faDollarSign,
  faChevronRight,
  faEllipsisV,
  faExclamationCircle,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Modal } from '@grub-gate/ui';
import { useOrders } from '../../hooks/useOrders';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import DatePicker from '../../components/common/DatePicker';
import EnhancedItemCard from '../../components/orders/EnhancedItemCard';

const OrdersPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(null);

  // Initialize orders hook with date filter to prevent showing all orders initially
  const initialFilters = useMemo(() => {
    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    return {
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      date: todayFormatted,
      includeScheduled: 'true'
    };
  }, []);

  const {
    orders,
    loading,
    error,
    pagination,
    updateOrderStatus,
    cancelOrder,
    refreshOrders,
    getTodaysOrders,
    clearError,
    updateFilters,
    isClient
  } = useOrders(initialFilters);

  // SSR-safe date formatting (memoized to prevent re-renders)
  const formatDateForAPI = useCallback((date) => {
    if (!isClient || !date) return '';
    // Use local date to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format
  }, [isClient]);

  // Handle date change
  const handleDateChange = useCallback((newDate) => {
    console.log('🗓️ OrdersPage: handleDateChange called with:', newDate);
    setSelectedDate(newDate);
    
    // Update filters to fetch orders for selected date
    if (isClient && updateFilters) {
      const formattedDate = formatDateForAPI(newDate);
      console.log('🗓️ OrdersPage: Formatted date for API:', formattedDate);
      updateFilters({
        date: formattedDate,
        includeScheduled: 'true'
      });
    }
  }, [isClient, updateFilters, formatDateForAPI]);

  // Debug authentication on mount (only once)
  useEffect(() => {
    if (isClient) {
      // Debug user authentication
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('🔐 OrdersPage: Current user:', user);
      console.log('🔐 OrdersPage: User roles:', user.roles);
      console.log('🔐 OrdersPage: Has token:', !!token);
      
      // Note: Initial date filter is now set in initialFilters, no need to call updateFilters here
    }
  }, [isClient]); // Only run once when client is ready

  // Get current day name (SSR-safe)
  const getCurrentDayName = () => {
    if (!isClient) return 'monday'; // Default for SSR
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    return days[today.getDay()];
  };

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: t('orders.statuses.pending') },
    { value: 'confirmed', label: t('orders.statuses.confirmed') },
    { value: 'preparing', label: t('orders.statuses.preparing') },
    { value: 'ready', label: t('orders.statuses.ready') },
    { value: 'delivered', label: t('orders.statuses.delivered') },
    { value: 'cancelled', label: t('orders.statuses.cancelled') }
  ];

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    if (!isClient) return [];
    
    return orders.filter(order => {
      const customerName = `${order.customerId?.firstName || ''} ${order.customerId?.lastName || ''}`.trim();
      const customerEmail = order.customerId?.email || '';
      const orderNumber = order.orderNumber || order._id;
      
      const matchesSearch = searchTerm === '' || 
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter, isClient]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdateStatusLoading(orderId);
      const result = await updateOrderStatus(orderId, newStatus);
      
      if (result.success) {
        // Show success message (you can add toast notification here)
        console.log('Order status updated successfully');
      } else {
        console.error('Failed to update order status:', result.error);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setUpdateStatusLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />;
      case 'preparing': return <FontAwesomeIcon icon={faClock} className="h-4 w-4" />;
      case 'ready': return <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />;
      case 'delivered': return <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />;
      case 'cancelled': return <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />;
      default: return <FontAwesomeIcon icon={faClock} className="h-4 w-4" />;
    }
  };

  // SSR loading state
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner 
            size="large" 
            text="Loading orders..." 
            className="mt-20"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Error Message */}
        {error && (
          <ErrorMessage
            error={error}
            onRetry={refreshOrders}
            onDismiss={clearError}
            title="Failed to load orders"
            showRetry={true}
            showDismiss={true}
          />
        )}
        {/* Header */}
        <div className="bg-gradient-to-r from-grub-red to-red-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                {isClient && selectedDate ? (
                  selectedDate.toDateString() === new Date().toDateString() 
                    ? "Today's Orders" 
                    : selectedDate > new Date()
                    ? `Scheduled Orders for ${selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}`
                    : `Orders for ${selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}`
                ) : "Orders"}
              </h1>
              <p className="text-red-100 mt-1 text-sm sm:text-base">
                {isClient ? (
                  orders.length > 0 
                    ? selectedDate > new Date()
                      ? `${orders.length} scheduled orders found for selected date`
                      : `${orders.length} orders found for selected date`
                    : selectedDate > new Date()
                      ? "No scheduled orders found for this date"
                      : "No orders found for this date"
                ) : "Select a date to view orders"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Date Picker */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg w-full sm:w-auto">
                <DatePicker
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                  placeholder="Select date"
                  className="w-full sm:w-48"
                />
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="text-xs sm:text-sm font-medium">{orders.length} Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[
            { 
              label: 'Pending', 
              count: filteredOrders.filter(o => o.status === 'pending').length, 
              color: 'bg-yellow-500', 
              bgColor: 'bg-yellow-50',
              icon: faClock 
            },
            { 
              label: 'Preparing', 
              count: filteredOrders.filter(o => o.status === 'preparing').length, 
              color: 'bg-orange-500', 
              bgColor: 'bg-orange-50',
              icon: faBox 
            },
            { 
              label: 'Ready', 
              count: filteredOrders.filter(o => o.status === 'ready').length, 
              color: 'bg-green-500', 
              bgColor: 'bg-green-50',
              icon: faCheckCircle 
            },
            { 
              label: 'Delivered', 
              count: filteredOrders.filter(o => o.status === 'delivered').length, 
              color: 'bg-blue-500', 
              bgColor: 'bg-blue-50',
              icon: faCheckCircle 
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-3 sm:p-4 lg:p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{stat.label}</p>
                      <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">{stat.count}</p>
                    </div>
                    <div className={`h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full flex items-center justify-center flex-shrink-0 ml-2 ${stat.bgColor}`}>
                      <FontAwesomeIcon icon={Icon} className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${stat.color.replace('bg-', 'text-')}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders by customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm sm:text-base w-full"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48 lg:w-56">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red bg-white"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-8">
              <LoadingSpinner 
                size="large" 
                text="Loading today's orders..." 
                className="py-8"
              />
            </CardContent>
          </Card>
        )}

        {/* Orders List - Responsive Design */}
        {!loading && (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FontAwesomeIcon icon={faBox} className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No weekly plan orders for today</h3>
                <p className="text-gray-500">No lunch or dinner orders from weekly meal plans scheduled for {getCurrentDayName()}.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1000px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-3 px-4 xl:py-4 xl:px-6 font-semibold text-gray-900 text-sm xl:text-base">Order ID</th>
                            <th className="text-left py-3 px-4 xl:py-4 xl:px-6 font-semibold text-gray-900 text-sm xl:text-base">Customer</th>
                            <th className="text-left py-3 px-4 xl:py-4 xl:px-6 font-semibold text-gray-900 text-sm xl:text-base">Items</th>
                            <th className="text-left py-3 px-4 xl:py-4 xl:px-6 font-semibold text-gray-900 text-sm xl:text-base">Meal Type</th>
                            <th className="text-left py-3 px-4 xl:py-4 xl:px-6 font-semibold text-gray-900 text-sm xl:text-base">Total</th>
                            <th className="text-left py-3 px-4 xl:py-4 xl:px-6 font-semibold text-gray-900 text-sm xl:text-base">Status</th>
                            <th className="text-left py-3 px-4 xl:py-4 xl:px-6 font-semibold text-gray-900 text-sm xl:text-base">Delivery Time</th>
                            <th className="text-left py-3 px-4 xl:py-4 xl:px-6 font-semibold text-gray-900 text-sm xl:text-base">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => (
                            <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-4 xl:py-4 xl:px-6">
                                <span className="font-semibold text-gray-900 text-sm xl:text-base">#{order.orderNumber}</span>
                              </td>
                              <td className="py-3 px-4 xl:py-4 xl:px-6">
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-900 text-sm xl:text-base truncate">
                                    {order.customerId?.firstName} {order.customerId?.lastName}
                                  </div>
                                  <div className="text-xs xl:text-sm text-gray-500 truncate">{order.customerId?.email}</div>
                                </div>
                              </td>
                              <td className="py-3 px-4 xl:py-4 xl:px-6">
                                <span className="text-gray-900 text-sm xl:text-base">{order.items?.length || 0} items</span>
                              </td>
                              <td className="py-3 px-4 xl:py-4 xl:px-6">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                  order.mealType === 'lunch' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : order.mealType === 'dinner'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.mealType === 'lunch' ? '🍽️ Lunch' : 
                                   order.mealType === 'dinner' ? '🍽️ Dinner' : 
                                   '🍽️ Order'}
                                </span>
                              </td>
                              <td className="py-3 px-4 xl:py-4 xl:px-6">
                                <span className="font-bold text-base xl:text-lg text-grub-red">${order.total?.toFixed(2)}</span>
                              </td>
                              <td className="py-3 px-4 xl:py-4 xl:px-6">
                                <span className={`inline-flex items-center px-2 xl:px-3 py-1 rounded-full text-xs xl:text-sm font-medium whitespace-nowrap ${getStatusColor(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                  <span className="ml-1 xl:ml-2 capitalize">{order.status}</span>
                                </span>
                              </td>
                              <td className="py-3 px-4 xl:py-4 xl:px-6">
                                <span className="text-gray-900 text-sm xl:text-base whitespace-nowrap">
                                  {order.deliveryTime?.estimated ? 
                                    new Date(order.deliveryTime.estimated).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }) : 
                                    'TBD'
                                  }
                                </span>
                              </td>
                              <td className="py-3 px-4 xl:py-4 xl:px-6">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleViewOrder(order)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  >
                                    <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                                  </button>
                                  {order.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                                      disabled={updateStatusLoading === order._id}
                                      className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                                    >
                                      {updateStatusLoading === order._id ? (
                                        <>
                                          <FontAwesomeIcon icon={faSync} className="h-3 w-3 mr-1 animate-spin" />
                                          Confirming...
                                        </>
                                      ) : (
                                        'Confirm'
                                      )}
                                    </Button>
                                  )}
                                  {order.status === 'confirmed' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateStatus(order._id, 'preparing')}
                                      disabled={updateStatusLoading === order._id}
                                      className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
                                    >
                                      {updateStatusLoading === order._id ? (
                                        <>
                                          <FontAwesomeIcon icon={faSync} className="h-3 w-3 mr-1 animate-spin" />
                                          Starting...
                                        </>
                                      ) : (
                                        'Start Prep'
                                      )}
                                    </Button>
                                  )}
                                  {order.status === 'preparing' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateStatus(order._id, 'ready')}
                                      disabled={updateStatusLoading === order._id}
                                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                                    >
                                      {updateStatusLoading === order._id ? (
                                        <>
                                          <FontAwesomeIcon icon={faSync} className="h-3 w-3 mr-1 animate-spin" />
                                          Updating...
                                        </>
                                      ) : (
                                        'Mark Ready'
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mobile and Tablet Card View */}
              <div className="lg:hidden space-y-3 sm:space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order._id} className="hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-3 sm:space-y-4">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <span className="font-bold text-gray-900 text-sm sm:text-base">#{order.orderNumber}</span>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">{order.status}</span>
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                order.mealType === 'lunch' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : order.mealType === 'dinner'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {order.mealType === 'lunch' ? '🍽️ Lunch' : 
                                 order.mealType === 'dinner' ? '🍽️ Dinner' : 
                                 '🍽️ Order'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-lg sm:text-xl text-grub-red">${order.total?.toFixed(2)}</div>
                            <div className="text-xs sm:text-sm text-gray-500">{order.items?.length || 0} items</div>
                          </div>
                        </div>

                        {/* Customer Info - Enhanced */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                              <FontAwesomeIcon icon={faUser} className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                {order.customerId?.firstName} {order.customerId?.lastName}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500">
                                Delivery: {order.deliveryTime?.estimated ? 
                                  new Date(order.deliveryTime.estimated).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 
                                  'TBD'
                                }
                              </div>
                            </div>
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                            </button>
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                                disabled={updateStatusLoading === order._id}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-3 py-1.5 disabled:opacity-50 whitespace-nowrap"
                              >
                                {updateStatusLoading === order._id ? (
                                  <FontAwesomeIcon icon={faSync} className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
                                )}
                                {updateStatusLoading === order._id ? 'Confirming...' : 'Confirm'}
                              </Button>
                            )}
                            {order.status === 'confirmed' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(order._id, 'preparing')}
                                disabled={updateStatusLoading === order._id}
                                className="bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm px-3 py-1.5 disabled:opacity-50 whitespace-nowrap"
                              >
                                {updateStatusLoading === order._id ? (
                                  <FontAwesomeIcon icon={faSync} className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <FontAwesomeIcon icon={faClock} className="h-3 w-3 mr-1" />
                                )}
                                {updateStatusLoading === order._id ? 'Starting...' : 'Prep'}
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(order._id, 'ready')}
                                disabled={updateStatusLoading === order._id}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 py-1.5 disabled:opacity-50 whitespace-nowrap"
                              >
                                {updateStatusLoading === order._id ? (
                                  <FontAwesomeIcon icon={faSync} className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
                                )}
                                {updateStatusLoading === order._id ? 'Updating...' : 'Ready'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
          </div>
        )}
      </div>

      {/* Order Details Modal - Redesigned */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedOrder(null);
        }}
        title=""
        size="xl"
        className="max-w-5xl"
      >
        {selectedOrder && (
          <div className="flex flex-col h-full bg-gray-50">
            {/* Modern Header with Gradient */}
            <div className="bg-gradient-to-br from-grub-red via-red-600 to-red-700 text-white p-6 -m-6 mb-6 rounded-t-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <FontAwesomeIcon icon={faBox} className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        Order #{selectedOrder.orderNumber}
                      </h2>
                      <p className="text-red-100 text-sm">
                        {selectedOrder.type === 'weekly-plan' ? 'Weekly Plan Order' : 'Single Order'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <FontAwesomeIcon icon={faClock} className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">
                        Delivery: {selectedOrder.deliveryTime?.estimated ? 
                          new Date(selectedOrder.deliveryTime.estimated).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 
                          'TBD'
                        }
                      </span>
                    </div>
                    
                    {selectedOrder.mealType && (
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                        <span className="text-sm font-medium">
                          {selectedOrder.mealType === 'lunch' ? '🍽️ Lunch' : 
                           selectedOrder.mealType === 'dinner' ? '🌙 Dinner' : 
                           '🍽️ Meal'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right lg:text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                    <div className="text-3xl font-bold mb-1">${selectedOrder.total?.toFixed(2)}</div>
                    <div className="text-red-100 text-sm">
                      {selectedOrder.items?.length || 0} items total
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto space-y-6 px-6 pb-6">

              {/* Status and Actions Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${getStatusColor(selectedOrder.status).replace('text-', 'bg-').replace('800', '100')}`}>
                        {getStatusIcon(selectedOrder.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                          <span className="capitalize">{selectedOrder.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {selectedOrder.status === 'pending' && (
                      <Button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder._id, 'confirmed');
                          setShowOrderModal(false);
                          setSelectedOrder(null);
                        }}
                        disabled={updateStatusLoading === selectedOrder._id}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {updateStatusLoading === selectedOrder._id ? (
                          <>
                            <FontAwesomeIcon icon={faSync} className="h-4 w-4 mr-2 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 mr-2" />
                            Confirm Order
                          </>
                        )}
                      </Button>
                    )}
                    {selectedOrder.status === 'confirmed' && (
                      <Button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder._id, 'preparing');
                          setShowOrderModal(false);
                          setSelectedOrder(null);
                        }}
                        disabled={updateStatusLoading === selectedOrder._id}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {updateStatusLoading === selectedOrder._id ? (
                          <>
                            <FontAwesomeIcon icon={faSync} className="h-4 w-4 mr-2 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faClock} className="h-4 w-4 mr-2" />
                            Start Preparation
                          </>
                        )}
                      </Button>
                    )}
                    {selectedOrder.status === 'preparing' && (
                      <Button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder._id, 'ready');
                          setShowOrderModal(false);
                          setSelectedOrder(null);
                        }}
                        disabled={updateStatusLoading === selectedOrder._id}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {updateStatusLoading === selectedOrder._id ? (
                          <>
                            <FontAwesomeIcon icon={faSync} className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 mr-2" />
                            Mark as Ready
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Information Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 rounded-full p-3">
                    <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                    <p className="text-sm text-gray-600">Delivery details and contact information</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Customer Name</label>
                      <div className="mt-1 text-lg font-semibold text-gray-900">
                        {selectedOrder.customerId?.firstName} {selectedOrder.customerId?.lastName}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email Address</label>
                      <div className="mt-1 flex items-center gap-2">
                        <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-900">{selectedOrder.customerId?.email}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                      <div className="mt-1 flex items-center gap-2">
                        <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-900">{selectedOrder.customerId?.phone || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Delivery Address</label>
                    <div className="mt-1 flex items-start gap-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                      <div className="text-gray-900 leading-relaxed">
                        {selectedOrder.deliveryAddress ? (
                          <>
                            <div>{selectedOrder.deliveryAddress.street}</div>
                            <div>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.province}</div>
                            <div className="font-medium">{selectedOrder.deliveryAddress.postalCode}</div>
                          </>
                        ) : (
                          <span className="text-gray-500 italic">Address not available</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-100 rounded-full p-3">
                    <FontAwesomeIcon icon={faBox} className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                    <p className="text-sm text-gray-600">{selectedOrder.items?.length || 0} items in this order</p>
                  </div>
                  <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                    {selectedOrder.items?.length || 0} items
                  </div>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedOrder.items?.map((item, index) => (
                    <EnhancedItemCard 
                      key={index} 
                      item={item} 
                      index={index}
                    />
                  ))}
                </div>
                
                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Order Total:</span>
                      <span className="text-2xl font-bold text-grub-red">${selectedOrder.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.specialInstructions && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 rounded-full p-3 flex-shrink-0">
                      <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Instructions</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedOrder.specialInstructions}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="border-t bg-white px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-3 mt-6 flex-shrink-0 -mx-6 -mb-6 rounded-b-2xl">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium"
              >
                Close
              </Button>
              <Button
                onClick={() => window.print()}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              >
                <FontAwesomeIcon icon={faBox} className="h-4 w-4 mr-2" />
                Print Order
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;





