import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../styles/dashboard-loading.css';
import { 
  faArrowTrendUp, 
  faShoppingBag, 
  faUsers, 
  faDollarSign,
  faClock,
  faStar,
  faArrowUp,
  faArrowDown,
  faPlus,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, CardHeader, CardTitle } from '@grub-gate/ui';
import analyticsService from '../../services/analyticsService.js';
import { useRestaurant } from '../../contexts/RestaurantContext.jsx';

const DashboardHome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { restaurantInfo, getRestaurantName } = useRestaurant();
  
  // SSR-safe state management
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notification, setNotification] = useState(null);

  // SSR safety
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isClient) return;
      
      try {
        setLoading(true);
        
        // Fetch dashboard analytics and recent orders in parallel
        const [analytics, orders] = await Promise.all([
          analyticsService.getDashboardOverview(30), // Last 30 days for dashboard (matches analytics page)
          analyticsService.getRecentOrders(5)
        ]);
        
        // Debug logs (remove in production)
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Dashboard Analytics Data:', analytics);
          console.log('📋 Recent Orders Data:', orders);
        }
        
        setDashboardData(analytics);
        setRecentOrders(orders.data || orders);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        // Fallback to empty data on error - no mock data
        setDashboardData({
          overview: {
            totalRevenue: { current: 0, growth: 0 },
            totalOrders: { current: 0, growth: 0 },
            activeCustomers: { current: 0, growth: 0 },
            avgOrderValue: { current: 0, growth: 0 }
          },
          topItems: []
        });
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isClient]);

  // Manual refresh function
  const handleRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      const [analytics, orders] = await Promise.all([
        analyticsService.getDashboardOverview(30), // Last 30 days (matches analytics page)
        analyticsService.getRecentOrders(5)
      ]);
      
      setDashboardData(analytics);
      setRecentOrders(orders.data || orders);
      setLastUpdated(new Date());
      
      // Show success notification
      setNotification({ type: 'success', message: t('dashboard.notifications.updateSuccess') });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Dashboard refresh error:', error);
      setNotification({ type: 'error', message: t('dashboard.notifications.updateError') });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !isClient || loading) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, isClient, loading]);

  // Process real data with SSR-safe fallbacks
  const overview = dashboardData?.overview || {};
  const topItems = dashboardData?.topItems || [];

  const stats = [
    {
      title: t('dashboard.stats.totalOrders'),
      value: overview.totalOrders?.current || 0,
      change: overview.totalOrders?.growth || 0,
      icon: faShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: t('dashboard.stats.totalRevenue'),
      value: `$${(overview.totalRevenue?.current || 0).toLocaleString()}`,
      change: overview.totalRevenue?.growth || 0,
      icon: faDollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: t('dashboard.stats.activeSubscribers'),
      value: overview.activeCustomers?.current || 0,
      change: overview.activeCustomers?.growth || 0,
      icon: faUsers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: t('dashboard.stats.avgOrderValue'),
      value: `$${(overview.avgOrderValue?.current || 0).toFixed(2)}`,
      change: overview.avgOrderValue?.growth || 0,
      icon: faArrowTrendUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  // Process top menu items from real data with fallback
  const topMenuItems = topItems.length > 0 
    ? topItems.slice(0, 3).map(item => ({
        id: item._id,
        name: item.name,
        totalOrders: item.totalQuantity || item.orders,
        price: (item.totalRevenue / (item.totalQuantity || 1)).toFixed(2),
        rating: 4.5 // Default rating since we don't have this in our data yet
      }))
    : []; // Show empty state when no data available

  // Beautiful Loading State Component
  const LoadingSkeleton = () => (
    <div className="space-y-4 lg:space-y-6 animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-r from-grub-red via-grub-red to-grub-red rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-shimmer"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <div className="h-6 bg-white/20 rounded w-32"></div>
              <div className="h-4 bg-white/15 rounded w-48"></div>
            </div>
            <div className="h-10 w-10 bg-white/20 rounded-lg"></div>
          </div>
          <div className="h-4 bg-white/15 rounded w-80 mb-3"></div>
          <div className="h-12 bg-white/10 rounded-lg w-full"></div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent animate-shimmer"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent animate-shimmer"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent animate-shimmer"></div>
        <div className="relative z-10">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // SSR Loading State
  if (!isClient || loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 animate-slideInLeft ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-grub-red via-grub-red to-grub-red rounded-2xl p-6 lg:p-8 text-white animate-fadeInUp shadow-lg">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-xl lg:text-2xl font-bold">
            {loading ? (
              <div className="h-7 bg-white/20 rounded w-64"></div>
            ) : (
              t('dashboard.welcome', { name: getRestaurantName() })
            )}
          </h1>
          {!loading && (
            <div className="flex items-center space-x-3">
              {lastUpdated && (
                <div className="text-right">
                  <p className="text-red-100 text-xs">{t('dashboard.lastUpdated')}</p>
                  <p className="text-white text-xs font-medium">
                    {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 disabled:opacity-50"
                title={t('dashboard.refreshData')}
              >
                <FontAwesomeIcon icon={faSync} className={`h-4 w-4 text-white ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>
        <p className="text-red-100 text-sm lg:text-base">
          {loading ? (
            t('dashboard.settingUp')
          ) : (
            restaurantInfo?.description || t('dashboard.manageOperations')
          )}
        </p>
        {restaurantInfo?.status === 'active' && (
          <div className="mt-3 bg-green-500 bg-opacity-20 border border-green-300 rounded-lg p-3">
            <p className="text-green-100 text-sm">
              ✅ {t('dashboard.status.active')}
            </p>
          </div>
        )}
        {restaurantInfo?.status === 'pending' && (
          <div className="mt-3 bg-yellow-500 bg-opacity-20 border border-yellow-300 rounded-lg p-3">
            <p className="text-yellow-100 text-sm">
              📝 {t('dashboard.status.pending')}
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          const animationDelay = `animate-delay-${(index + 1) * 100}`;
          return (
            <div key={index} className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-scaleIn ${animationDelay} border-2 border-gray-100 overflow-hidden group`}>
              <div className="p-5 lg:p-6">
                {/* Header with Title and Change */}
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-600 mb-1 truncate">
                      {stat.title}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        isPositive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {isPositive ? (
                          <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3 mr-1" />
                        ) : (
                          <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(stat.change)}%
                      </span>
                      <span className="text-xs text-gray-500 font-medium">{t('dashboard.vsLastMonth')}</span>
                    </div>
                  </div>
                </div>
                
                {/* Value and Icon Row */}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex-1 min-w-0 truncate">
                    {stat.value}
                  </p>
                  <div className={`h-12 w-12 lg:h-14 lg:w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.bgColor} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <FontAwesomeIcon icon={Icon} className={`h-6 w-6 lg:h-7 lg:w-7 ${stat.color}`} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Orders */}
        <Card className="animate-fadeInUp animate-delay-200 shadow-sm border-0 bg-white hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3 lg:pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg lg:text-xl font-bold text-gray-900">{t('dashboard.recentOrders')}</CardTitle>
              <button 
                onClick={() => navigate('/dashboard/orders')}
                className="text-sm text-grub-red hover:text-grub-red-light font-medium transition-colors"
              >
                {t('dashboard.viewAll')} →
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 lg:space-y-4">
              {loading ? (
                // Loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <div className="h-8 w-8 lg:h-10 lg:w-10 bg-gray-300 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
                      <div className="h-3 bg-gray-300 rounded w-12"></div>
                    </div>
                  </div>
                ))
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order._id || order.id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 lg:space-x-3 min-w-0">
                      <div className="h-8 w-8 lg:h-10 lg:w-10 bg-grub-red rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs lg:text-sm font-medium">
                          {order.customer.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm lg:text-base truncate">
                          {order.customer.name}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-500">
                          {order.items.length} {order.items.length === 1 ? t('dashboard.item') : t('dashboard.items')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-gray-900 text-sm lg:text-base">
                        ${order.total.toFixed(2)}
                      </p>
                      <span className={`inline-flex items-center px-2 lg:px-2.5 py-0.5 rounded-full text-[10px] lg:text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FontAwesomeIcon icon={faShoppingBag} className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm mb-2">{t('dashboard.emptyStates.noOrders')}</p>
                  <p className="text-gray-400 text-xs mb-3">{t('dashboard.emptyStates.noOrdersDesc')}</p>
                  <button 
                    onClick={() => navigate('/dashboard/orders')}
                    className="text-grub-red text-sm font-medium hover:text-grub-red-light transition-colors"
                  >
                    {t('dashboard.emptyStates.viewAllOrders')} →
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Menu Items */}
        <Card className="animate-fadeInUp animate-delay-300 shadow-sm border-0 bg-white hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3 lg:pb-4">
            <CardTitle className="text-lg lg:text-xl font-bold text-gray-900">{t('dashboard.topSellingItems')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 lg:space-y-4">
              {topMenuItems.length > 0 ? (
                topMenuItems.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-2 lg:space-x-3 min-w-0">
                      <div className="h-7 w-7 lg:h-8 lg:w-8 bg-grub-red text-white rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs lg:text-sm font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm lg:text-base truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faStar} className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-400" />
                          <span className="text-xs lg:text-sm text-gray-500 ml-1">
                            {item.rating} • ${item.price}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-grub-red text-sm lg:text-base">
                        {item.totalOrders}
                      </p>
                      <p className="text-xs lg:text-sm text-gray-500">
                        {t('dashboard.orders')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FontAwesomeIcon icon={faShoppingBag} className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm mb-2">{t('dashboard.emptyStates.noMenuItems')}</p>
                  <p className="text-gray-400 text-xs mb-3">{t('dashboard.emptyStates.noMenuItemsDesc')}</p>
                  <button 
                    onClick={() => navigate('/dashboard/menu')}
                    className="text-grub-red text-sm font-medium hover:text-grub-red-light transition-colors"
                  >
                    {t('dashboard.emptyStates.addFirstItem')} →
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="animate-fadeInUp animate-delay-400 shadow-sm border-0 bg-white hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3 lg:pb-4">
          <CardTitle className="text-lg lg:text-xl font-bold text-gray-900">{t('dashboard.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
            <button 
              onClick={() => navigate('/dashboard/menu')}
              className="p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-grub-red transition-all text-left group"
            >
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="h-8 w-8 lg:h-10 lg:w-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                  <FontAwesomeIcon icon={faPlus} className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm lg:text-base group-hover:text-grub-red transition-colors">{t('dashboard.actions.addMenuItem')}</p>
                  <p className="text-xs lg:text-sm text-gray-500">{t('dashboard.actions.addMenuItemDesc')}</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/dashboard/analytics')}
              className="p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-grub-red transition-all text-left group"
            >
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="h-8 w-8 lg:h-10 lg:w-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                  <FontAwesomeIcon icon={faArrowTrendUp} className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm lg:text-base group-hover:text-grub-red transition-colors">{t('dashboard.actions.viewAnalytics')}</p>
                  <p className="text-xs lg:text-sm text-gray-500">{t('dashboard.actions.viewAnalyticsDesc')}</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/dashboard/customers')}
              className="p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-grub-red transition-all text-left group"
            >
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="h-8 w-8 lg:h-10 lg:w-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                  <FontAwesomeIcon icon={faUsers} className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm lg:text-base group-hover:text-grub-red transition-colors">{t('dashboard.actions.manageCustomers')}</p>
                  <p className="text-xs lg:text-sm text-gray-500">{t('dashboard.actions.manageCustomersDesc')}</p>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;







