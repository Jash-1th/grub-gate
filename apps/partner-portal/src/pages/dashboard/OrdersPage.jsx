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
import StatusUpdateButton from '../../components/orders/StatusUpdateButton';
import { ordersApi } from '../../api/ordersApi';

const OrdersPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(null);
  const [notification, setNotification] = useState(null);

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
    { value: 'all', label: t('orders.allStatuses') },
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

  const handleUpdateStatus = async (orderId, newStatus, notes = '') => {
    try {
      setUpdateStatusLoading(orderId);
      console.log(`🔄 Updating order ${orderId} to status: ${newStatus}`);
      
      const response = await ordersApi.updateOrderStatus(orderId, newStatus, notes);
      
      if (response.data?.status === 'success') {
        console.log('✅ Order status updated successfully');
        
        // Show success notification
        setNotification({
          type: 'success',
          message: `Order status updated to "${newStatus}" successfully!`,
          details: notes ? `Note: ${notes}` : null
        });
        
        // Refresh orders to show updated status
        await refreshOrders();
      } else {
        throw new Error(response.data?.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('❌ Error updating order status:', err);
      
      // Show error notification
      setNotification({
        type: 'error',
        message: 'Failed to update order status',
        details: err.message || 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setUpdateStatusLoading(null);
    }
  };

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000); // Auto-dismiss after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
            text={t('orders.loadingOrders')} 
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
            title={t('orders.failedToLoad')}
            showRetry={true}
            showDismiss={true}
          />
        )}

        {/* Status Update Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg border p-4 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <FontAwesomeIcon 
                  icon={notification.type === 'success' ? faCheckCircle : faExclamationCircle} 
                  className={`h-5 w-5 ${notification.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{notification.message}</p>
                {notification.details && (
                  <p className="text-xs mt-1 opacity-80">{notification.details}</p>
                )}
              </div>
              <button
                onClick={() => setNotification(null)}
                className={`flex-shrink-0 p-1 rounded-full hover:bg-opacity-20 transition-colors ${
                  notification.type === 'success' ? 'hover:bg-green-600' : 'hover:bg-red-600'
                }`}
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="bg-gradient-to-r from-grub-red to-red-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                {isClient ? (
                  selectedDate 
                    ? (selectedDate.toDateString() === new Date().toDateString()
                      ? t('orders.todaysOrders')
                      : `${t('orders.ordersFor')} ${selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}`)
                    : t('orders.orders')
                ) : t('orders.orders')}
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Date Picker */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl w-full sm:w-auto relative z-20 shadow-lg">
                <DatePicker
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                  placeholder={t('orders.selectDate')}
                  className="w-full sm:w-56"
                />
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-5 py-1.5 sm:py-2.5 relative z-10 shadow-lg w-auto">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-lg sm:text-2xl font-bold">{orders.length}</span>
                  <span className="text-xs sm:text-sm font-medium opacity-90">{t('orders.orders')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[
            { 
              label: t('orders.statuses.pending'), 
              count: filteredOrders.filter(o => o.status === 'pending').length, 
              color: 'bg-yellow-500', 
              bgColor: 'bg-yellow-50',
              icon: faClock 
            },
            { 
              label: t('orders.statuses.preparing'), 
              count: filteredOrders.filter(o => o.status === 'preparing').length, 
              color: 'bg-orange-500', 
              bgColor: 'bg-orange-50',
              icon: faBox 
            },
            { 
              label: t('orders.statuses.ready'), 
              count: filteredOrders.filter(o => o.status === 'ready').length, 
              color: 'bg-green-500', 
              bgColor: 'bg-green-50',
              icon: faCheckCircle 
            },
            { 
              label: t('orders.statuses.delivered'), 
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
                    placeholder={t('orders.searchPlaceholder')}
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
                text={t('orders.loadingOrders')} 
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('orders.emptyState.title')}</h3>
                <p className="text-gray-500">{t('orders.emptyState.description', { day: getCurrentDayName() })}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Card className="shadow-lg border-2 border-gray-100">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1000px]">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                          <tr>
                            <th className="text-left py-4 px-6 font-bold text-gray-900 text-sm xl:text-base uppercase tracking-wide">{t('orders.tableHeaders.orderId')}</th>
                            <th className="text-left py-4 px-6 font-bold text-gray-900 text-sm xl:text-base uppercase tracking-wide">{t('orders.tableHeaders.customer')}</th>
                            <th className="text-left py-4 px-6 font-bold text-gray-900 text-sm xl:text-base uppercase tracking-wide">{t('orders.tableHeaders.items')}</th>
                            <th className="text-left py-4 px-6 font-bold text-gray-900 text-sm xl:text-base uppercase tracking-wide">{t('orders.tableHeaders.mealType')}</th>
                            <th className="text-left py-4 px-6 font-bold text-gray-900 text-sm xl:text-base uppercase tracking-wide">{t('orders.tableHeaders.total')}</th>
                            <th className="text-left py-4 px-6 font-bold text-gray-900 text-sm xl:text-base uppercase tracking-wide">{t('orders.tableHeaders.status')}</th>
                            <th className="text-left py-4 px-6 font-bold text-gray-900 text-sm xl:text-base uppercase tracking-wide">{t('orders.tableHeaders.delivery')}</th>
                            <th className="text-center py-4 px-6 font-bold text-gray-900 text-sm xl:text-base uppercase tracking-wide">{t('orders.tableHeaders.actions')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredOrders.map((order, index) => (
                            <tr key={order._id} className="hover:bg-blue-50/50 transition-all duration-200 group">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <div className={`w-1 h-10 rounded-full ${
                                    order.status === 'scheduled' ? 'bg-blue-500' : 
                                    order.status === 'delivered' ? 'bg-green-500' : 
                                    'bg-yellow-500'
                                  }`} />
                                  <span className="font-bold text-gray-900 text-base">#{order.orderNumber}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                                    <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-gray-900 text-sm xl:text-base truncate">
                                      {order.customerId?.firstName} {order.customerId?.lastName}
                                    </div>
                                    <div className="text-xs xl:text-sm text-gray-500 truncate">{order.customerId?.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <div className="bg-gray-100 rounded-lg px-3 py-1.5">
                                    <span className="font-semibold text-gray-900 text-sm xl:text-base">{order.items?.length || 0}</span>
                                    <span className="text-gray-500 text-xs xl:text-sm ml-1">{t('orders.tableHeaders.items').toLowerCase()}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold whitespace-nowrap shadow-sm ${
                                  order.mealType === 'lunch' 
                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                                    : order.mealType === 'dinner'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                                }`}>
                                  {order.mealType === 'lunch' ? `🍽️ ${t('orders.mealTypes.lunch')}` : 
                                   order.mealType === 'dinner' ? `🌙 ${t('orders.mealTypes.dinner')}` : 
                                   '🍽️ Order'}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="bg-red-50 rounded-lg px-3 py-2 inline-block border border-red-100">
                                  <span className="font-bold text-lg xl:text-xl text-grub-red">${order.total?.toFixed(2)}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <StatusUpdateButton
                                  order={order}
                                  onStatusUpdate={handleUpdateStatus}
                                  isLoading={updateStatusLoading === order._id}
                                />
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium text-gray-900 text-sm xl:text-base whitespace-nowrap">
                                    {order.deliveryTime?.estimated ? 
                                      new Date(order.deliveryTime.estimated).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      }) : 
                                      'TBD'
                                    }
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-center">
                                  <button
                                    onClick={() => handleViewOrder(order)}
                                    className="p-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                                    title={t('orders.actions.view')}
                                  >
                                    <FontAwesomeIcon icon={faEye} className="h-5 w-5" />
                                  </button>
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
              <div className="lg:hidden space-y-3">
                {filteredOrders.map((order) => (
                  <Card key={order._id} className="hover:shadow-lg transition-all duration-200 border-l-4 overflow-hidden" style={{borderLeftColor: order.status === 'scheduled' ? '#3B82F6' : order.status === 'delivered' ? '#10B981' : '#F59E0B'}}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col gap-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-base">#{order.orderNumber}</span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">{order.status}</span>
                              </span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit ${
                              order.mealType === 'lunch' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : order.mealType === 'dinner'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.mealType === 'lunch' ? `🍽️ ${t('orders.mealTypes.lunch')}` : 
                               order.mealType === 'dinner' ? `🌙 ${t('orders.mealTypes.dinner')}` : 
                               '🍽️ Order'}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-xl text-grub-red">${order.total?.toFixed(2)}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{order.items?.length || 0} {t('orders.tableHeaders.items').toLowerCase()}</div>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                              <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-sm truncate">
                                {order.customerId?.firstName} {order.customerId?.lastName}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                                <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                                {order.deliveryTime?.estimated ? 
                                  new Date(order.deliveryTime.estimated).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 
                                  'TBD'
                                }
                              </div>
                            </div>
                          </div>
                          
                          {/* View Button */}
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} className="h-5 w-5" />
                          </button>
                        </div>
                        
                        {/* Status Button - Full Width */}
                        <div className="pt-1">
                          <StatusUpdateButton
                            order={order}
                            onStatusUpdate={handleUpdateStatus}
                            isLoading={updateStatusLoading === order._id}
                          />
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
            {/* Modern Header with Gradient - Mobile Optimized */}
            <div className="bg-gradient-to-br from-grub-red via-red-600 to-red-700 text-white p-4 sm:p-6 -m-4 sm:-m-6 mb-4 sm:mb-6 rounded-t-2xl">
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Order Number and Type */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5 sm:p-2 flex-shrink-0">
                      <FontAwesomeIcon icon={faBox} className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-2xl font-bold truncate">
                        {t('orders.modal.order')} #{selectedOrder.orderNumber}
                      </h2>
                      <p className="text-red-100 text-xs sm:text-sm">
                        {selectedOrder.type === 'weekly-plan' ? t('orders.modal.weeklyPlanOrder') : t('orders.modal.singleOrder')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Total Price - Mobile */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3 text-right flex-shrink-0">
                    <div className="text-xl sm:text-2xl font-bold">${selectedOrder.total?.toFixed(2)}</div>
                    <div className="text-red-100 text-xs">{selectedOrder.items?.length || 0} {t('orders.tableHeaders.items').toLowerCase()}</div>
                  </div>
                </div>
                
                {/* Delivery Time and Meal Type */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">
                    <FontAwesomeIcon icon={faClock} className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <span className="font-medium">
                      {selectedOrder.deliveryTime?.estimated ? 
                        new Date(selectedOrder.deliveryTime.estimated).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        'TBD'
                      }
                    </span>
                  </div>
                  
                  {selectedOrder.mealType && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium">
                      {selectedOrder.mealType === 'lunch' ? `🍽️ ${t('orders.mealTypes.lunch')}` : 
                       selectedOrder.mealType === 'dinner' ? `🌙 ${t('orders.mealTypes.dinner')}` : 
                       '🍽️ Meal'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 px-3 sm:px-6 pb-20 sm:pb-6 pt-2 sm:pt-4">

              {/* Status and Actions Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${getStatusColor(selectedOrder.status).replace('text-', 'bg-').replace('800', '100')}`}>
                      {getStatusIcon(selectedOrder.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-900">{t('orders.modal.orderStatus')}</h3>
                      <span className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                        <span className="capitalize">{selectedOrder.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {selectedOrder.status === 'pending' && (
                      <Button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder._id, 'confirmed');
                          setShowOrderModal(false);
                          setSelectedOrder(null);
                        }}
                        disabled={updateStatusLoading === selectedOrder._id}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {updateStatusLoading === selectedOrder._id ? (
                          <>
                            <FontAwesomeIcon icon={faSync} className="h-4 w-4 mr-2 animate-spin" />
                            {t('orders.modal.confirming')}
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 mr-2" />
                            {t('orders.modal.confirmOrder')}
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
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {updateStatusLoading === selectedOrder._id ? (
                          <>
                            <FontAwesomeIcon icon={faSync} className="h-4 w-4 mr-2 animate-spin" />
                            {t('orders.modal.starting')}
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faClock} className="h-4 w-4 mr-2" />
                            {t('orders.modal.startPreparation')}
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {updateStatusLoading === selectedOrder._id ? (
                          <>
                            <FontAwesomeIcon icon={faSync} className="h-4 w-4 mr-2 animate-spin" />
                            {t('orders.modal.updating')}
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 mr-2" />
                            {t('orders.modal.markAsReady')}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Information Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="bg-blue-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                    <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-900">{t('orders.modal.customerInformation')}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{t('orders.modal.deliveryDetailsContact')}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('orders.modal.customerName')}</label>
                      <div className="mt-1 text-lg font-semibold text-gray-900">
                        {selectedOrder.customerId?.firstName} {selectedOrder.customerId?.lastName}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('orders.modal.emailAddress')}</label>
                      <div className="mt-1 flex items-center gap-2">
                        <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-900">{selectedOrder.customerId?.email}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('orders.modal.phoneNumber')}</label>
                      <div className="mt-1 flex items-center gap-2">
                        <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-900">{selectedOrder.customerId?.phone || t('orders.modal.notProvided')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('orders.modal.deliveryAddress')}</label>
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
                          <span className="text-gray-500 italic">{t('orders.modal.addressNotAvailable')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-100 rounded-full p-3">
                    <FontAwesomeIcon icon={faBox} className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{t('orders.modal.orderItems')}</h3>
                    <p className="text-sm text-gray-600">{t('orders.modal.itemsInOrder', { count: selectedOrder.items?.length || 0 })}</p>
                  </div>
                  <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                    {selectedOrder.items?.length || 0} {t('orders.tableHeaders.items').toLowerCase()}
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
                      <span className="text-lg font-semibold text-gray-900">{t('orders.modal.orderTotal')}</span>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('orders.modal.specialInstructions')}</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedOrder.specialInstructions}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="border-t bg-white px-6 py-4 pb-20 sm:pb-4 flex flex-col sm:flex-row sm:justify-end gap-3 mt-6 flex-shrink-0 -mx-6 -mb-6 rounded-b-2xl">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium"
              >
                {t('orders.modal.close')}
              </Button>
              <Button
                onClick={() => window.print()}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              >
                <FontAwesomeIcon icon={faBox} className="h-4 w-4 mr-2" />
                {t('orders.modal.printOrder')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;






