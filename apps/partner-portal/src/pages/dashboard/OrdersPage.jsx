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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stat.count}</p>
                    </div>
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                      <FontAwesomeIcon icon={Icon} className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color.replace('bg-', 'text-')}`} />
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
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders by customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red"
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
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-4 px-6 font-semibold text-gray-900">Order ID</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-900">Customer</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-900">Items</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-900">Meal Type</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-900">Total</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-900">Delivery Time</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => (
                            <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-6">
                                <span className="font-semibold text-gray-900">#{order.orderNumber}</span>
                              </td>
                              <td className="py-4 px-6">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {order.customerId?.firstName} {order.customerId?.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">{order.customerId?.email}</div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-gray-900">{order.items?.length || 0} items</span>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
                              <td className="py-4 px-6">
                                <span className="font-bold text-lg text-grub-red">${order.total?.toFixed(2)}</span>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                  <span className="ml-2 capitalize">{order.status}</span>
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-gray-900">
                                  {order.deliveryTime?.estimated ? 
                                    new Date(order.deliveryTime.estimated).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }) : 
                                    'TBD'
                                  }
                                </span>
                              </td>
                              <td className="py-4 px-6">
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

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {filteredOrders.map((order) => (
                  <Card key={order._id} className="hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-3">
                      <div className="space-y-3">
                        {/* Header Row */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900 text-sm">#{order.orderNumber}</span>
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
                          <div className="text-right">
                            <div className="font-bold text-lg text-grub-red">${order.total?.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">{order.items?.length || 0} items</div>
                          </div>
                        </div>

                        {/* Customer Info - Compact */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className="bg-blue-100 rounded-full p-1.5">
                              <FontAwesomeIcon icon={faUser} className="h-3 w-3 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm truncate">
                                {order.customerId?.firstName} {order.customerId?.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
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
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                            </button>
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                                disabled={updateStatusLoading === order._id}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 disabled:opacity-50"
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
                                className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-1 disabled:opacity-50"
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
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 disabled:opacity-50"
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

      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedOrder(null);
        }}
        title=""
        size="xl"
        className="max-w-4xl"
      >
        {selectedOrder && (
          <div className="flex flex-col h-full">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {/* Header */}
              <div className="bg-gradient-to-r from-grub-red to-red-600 text-white rounded-lg p-2.5 sm:p-3 -mx-2 sm:-mx-4 -mt-2 sm:-mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold">
                      Order #{selectedOrder.orderNumber}
                    </h2>
                    <p className="text-red-100 text-xs">
                      {selectedOrder.type === 'weekly-plan' ? 'Weekly Plan' : 'Single Order'} - 
                      Delivery: {selectedOrder.deliveryTime?.estimated ? 
                        new Date(selectedOrder.deliveryTime.estimated).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        'TBD'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-bold">${selectedOrder.total?.toFixed(2)}</div>
                    <div className="text-red-100 text-xs">
                      {selectedOrder.items?.length || 0} items
                      {selectedOrder.mealType && (
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedOrder.mealType === 'lunch' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : selectedOrder.mealType === 'dinner'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedOrder.mealType === 'lunch' ? '🍽️ Lunch' : 
                           selectedOrder.mealType === 'dinner' ? '🍽️ Dinner' : 
                           '🍽️ Order'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
              {/* Status and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1 capitalize">{selectedOrder.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedOrder.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        handleUpdateStatus(selectedOrder._id, 'confirmed');
                        setShowOrderModal(false);
                        setSelectedOrder(null);
                      }}
                      disabled={updateStatusLoading === selectedOrder._id}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs disabled:opacity-50"
                    >
                      {updateStatusLoading === selectedOrder._id ? (
                        <FontAwesomeIcon icon={faSync} className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
                      )}
                      {updateStatusLoading === selectedOrder._id ? 'Confirming...' : 'Confirm'}
                    </Button>
                  )}
                  {selectedOrder.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        handleUpdateStatus(selectedOrder._id, 'preparing');
                        setShowOrderModal(false);
                        setSelectedOrder(null);
                      }}
                      disabled={updateStatusLoading === selectedOrder._id}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs disabled:opacity-50"
                    >
                      {updateStatusLoading === selectedOrder._id ? (
                        <FontAwesomeIcon icon={faSync} className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <FontAwesomeIcon icon={faClock} className="h-3 w-3 mr-1" />
                      )}
                      {updateStatusLoading === selectedOrder._id ? 'Starting...' : 'Start Prep'}
                    </Button>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        handleUpdateStatus(selectedOrder._id, 'ready');
                        setShowOrderModal(false);
                        setSelectedOrder(null);
                      }}
                      disabled={updateStatusLoading === selectedOrder._id}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs disabled:opacity-50"
                    >
                      {updateStatusLoading === selectedOrder._id ? (
                        <FontAwesomeIcon icon={faSync} className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
                      )}
                      Ready
                    </Button>
                  )}
                </div>
              </div>

              {/* Customer & Items Combined */}
              <div className="grid grid-cols-1 gap-2.5">
                {/* Customer Information - Compact */}
                <div className="bg-white border border-gray-200 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 rounded-full p-1 mr-2">
                      <FontAwesomeIcon icon={faUser} className="h-3 w-3 text-blue-600" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Customer & Delivery</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <div className="font-medium text-gray-900 text-xs sm:text-sm">
                        {selectedOrder.customerId?.firstName} {selectedOrder.customerId?.lastName}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FontAwesomeIcon icon={faEnvelope} className="h-2.5 w-2.5 mr-1 text-blue-500" />
                        <span className="text-xs break-all">{selectedOrder.customerId?.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FontAwesomeIcon icon={faPhone} className="h-2.5 w-2.5 mr-1 text-blue-500" />
                        <span className="text-xs">{selectedOrder.customerId?.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="h-2.5 w-2.5 mr-1 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span className="text-xs break-words">
                        {selectedOrder.deliveryAddress ? (
                          `${selectedOrder.deliveryAddress.street}, ${selectedOrder.deliveryAddress.city}, ${selectedOrder.deliveryAddress.province} ${selectedOrder.deliveryAddress.postalCode}`
                        ) : (
                          'Address not available'
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items - Enhanced */}
                <div className="bg-white border border-gray-200 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-full p-1 mr-2">
                        <FontAwesomeIcon icon={faBox} className="h-3 w-3 text-green-600" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Order Items</h3>
                    </div>
                    <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full text-xs font-medium">
                      {selectedOrder.items?.length || 0} items
                    </span>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedOrder.items?.map((item, index) => (
                      <EnhancedItemCard 
                        key={index} 
                        item={item} 
                        index={index}
                      />
                    ))}
                  </div>
                  
                  {/* Order Summary */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 text-sm">Order Total:</span>
                      <span className="font-bold text-grub-red text-lg">${selectedOrder.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Instructions - Compact */}
              {selectedOrder.specialInstructions && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-start">
                    <div className="bg-amber-100 rounded-full p-1 mr-2 flex-shrink-0">
                      <FontAwesomeIcon icon={faCalendar} className="h-3 w-3 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Notes</h3>
                      <p className="text-gray-700 text-xs break-words">{selectedOrder.specialInstructions}</p>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
            
            {/* Modal Footer - Outside scrollable area */}
            <div className="border-t bg-white px-0 py-3 flex flex-col sm:flex-row sm:justify-end gap-2 mt-4 flex-shrink-0 mb-2 lg:mb-0">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}
                className="w-full sm:w-auto text-sm py-2.5"
              >
                Close
              </Button>
              <Button
                onClick={() => window.print()}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5"
              >
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





