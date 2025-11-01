import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowTrendUp, 
  faArrowTrendDown, 
  faDownload,
  faCalendar,
  faDollarSign,
  faShoppingBag,
  faUsers,
  faChartBar,
  faBullseye,
  faClock,
  faStar,
  faArrowUp,
  faArrowDown,
  faFilter,
  faSync,
  faEye,
  faBox,
  faPercent,
  faSpinner,
  faRedo,
  faChartPie,
  faCreditCard,
  faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@grub-gate/ui';
import { useIsClient } from '../../hooks/useIsClient.js';
import analyticsService from '../../services/analyticsService.js';
// Keep mock data as fallback for development
import { mockAnalytics, mockOrders, mockCustomers } from '../../lib/mock-data.js';

// SSR-safe chart component
const ChartComponent = ({ data, type = 'line' }) => {
  const isClient = useIsClient();
  const [chartComponents, setChartComponents] = useState(null);
  
  useEffect(() => {
    if (isClient) {
      // Dynamic import for charts to ensure SSR safety
      import('recharts').then((recharts) => {
        setChartComponents(recharts);
      }).catch((error) => {
        console.error('Failed to load recharts:', error);
      });
    }
  }, [isClient]);
  
  if (!isClient || !chartComponents) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    );
  }

  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } = chartComponents;
  const colors = ['#800020', '#a0002a', '#600015', '#c0003a'];

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => {
              if (!isClient) return value;
              try {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                });
              } catch {
                return value;
              }
            }}
          />
          <YAxis 
            tickFormatter={(value) => {
              if (!isClient) return value;
              return `$${value.toLocaleString()}`;
            }}
          />
          <Tooltip 
            formatter={(value) => {
              if (!isClient) return [value, 'Revenue'];
              return [`$${value.toLocaleString()}`, 'Revenue'];
            }}
            labelFormatter={(label) => {
              if (!isClient) return label;
              try {
                const date = new Date(label);
                return date.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });
              } catch {
                return label;
              }
            }}
          />
          <Line type="monotone" dataKey="value" stroke="#800020" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="orders" fill="#800020" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="orders"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
};

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [topCustomersData, setTopCustomersData] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customersError, setCustomersError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const timeRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: faChartBar },
    { id: 'revenue', label: 'Revenue', icon: faDollarSign },
    { id: 'customers', label: 'Customers', icon: faUsers },
    { id: 'performance', label: 'Performance', icon: faBullseye }
  ];

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await analyticsService.getAllOverviewData(timeRange);
        console.log('📊 Analytics data received:', data);
        console.log('📊 Order status type:', typeof data?.orderStatus, 'Is array:', Array.isArray(data?.orderStatus));
        setAnalyticsData(data);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError(err.message);
        // Fallback to mock data in case of error
        setAnalyticsData({
          overview: {
            totalRevenue: { current: mockAnalytics.revenue.current, growth: mockAnalytics.revenue.growth },
            totalOrders: { current: mockAnalytics.orders.current, growth: mockAnalytics.orders.growth },
            activeCustomers: { current: mockAnalytics.customers.current, growth: mockAnalytics.customers.growth },
            avgOrderValue: { current: mockAnalytics.avgOrderValue.current, growth: mockAnalytics.avgOrderValue.growth },
            avgPrepTime: { current: 18, growth: -8.2 }
          },
          topItems: mockAnalytics.chartData.topItems,
          orderStatus: [
            { status: 'delivered', count: mockOrders.filter(o => o.status === 'delivered').length },
            { status: 'preparing', count: mockOrders.filter(o => o.status === 'preparing').length },
            { status: 'pending', count: mockOrders.filter(o => o.status === 'pending').length },
            { status: 'ready', count: mockOrders.filter(o => o.status === 'ready').length }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  // Fetch top customers data when component mounts or time range changes
  useEffect(() => {
    const fetchTopCustomers = async () => {
      try {
        setLoadingCustomers(true);
        setCustomersError(null);
        
        // Convert time range to days for the API
        const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
        const response = await analyticsService.getTopCustomers(5, days);
        setTopCustomersData(response.data || []);
      } catch (error) {
        console.error('Failed to fetch top customers:', error);
        setCustomersError('Failed to load customer data');
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchTopCustomers();
  }, [timeRange]);

  // SSR-safe customer data processing (must be before metrics) - fix data access
  const customerOverviewData = analyticsData?.customerOverview?.data || {
    activeCustomers: { current: 0, growth: 0 },
    newCustomers: { current: 0, growth: 0 },
    loyalCustomers: { current: 0, growth: 0 }
  };

  const topCustomersDataFallback = analyticsData?.topCustomers?.data?.length > 0 
    ? analyticsData.topCustomers.data 
    : mockCustomers.slice(0, 5); // Fallback to mock data

  const customerSegmentsData = analyticsData?.customerSegments?.data || {
    active: mockCustomers.filter(c => c.status === 'active').length,
    new: 0,
    loyal: mockCustomers.filter(c => c.totalOrders > 5).length
  };

  // SSR-safe performance data processing with proper fallback structure - fix data access
  const performanceOverviewData = analyticsData?.performanceOverview?.data || {
    deliveryPerformance: {
      onTimeDeliveryRate: { current: 0, growth: 0 },
      avgDeliveryTime: { current: 0, growth: 0 },
    },
    orderPerformance: {
      completionRate: { current: 0, growth: 0 },
      avgPrepTime: { current: 0, growth: 0 }
    }
  };

  // Ensure nested objects exist to prevent undefined errors
  const safePerformanceData = {
    deliveryPerformance: {
      onTimeDeliveryRate: performanceOverviewData?.deliveryPerformance?.onTimeDeliveryRate || { current: 0, growth: 0 },
      avgDeliveryTime: performanceOverviewData?.deliveryPerformance?.avgDeliveryTime || { current: 0, growth: 0 },
    },
    orderPerformance: {
      completionRate: performanceOverviewData?.orderPerformance?.completionRate || { current: 0, growth: 0 },
      avgPrepTime: performanceOverviewData?.orderPerformance?.avgPrepTime || { current: 0, growth: 0 }
    }
  };

  // Calculate metrics from real data - fix data access
  const overview = analyticsData?.overview?.data || {};
  const totalRevenue = overview.totalRevenue?.current || 0;
  const totalOrders = overview.totalOrders?.current || 0;
  const totalCustomers = customerOverviewData.activeCustomers?.current || 0;
  const avgOrderValue = overview.avgOrderValue?.current || 0;
  const avgPrepTime = overview.avgPrepTime?.current || 0;
  
  // Calculate order status distribution from real data with proper array validation - fix data access
  const orderStatusData = (analyticsData?.orderStatus?.data && Array.isArray(analyticsData.orderStatus.data)) ? 
    analyticsData.orderStatus.data.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
      color: {
        'delivered': '#10B981',
        'preparing': '#F59E0B', 
        'pending': '#EF4444',
        'ready': '#3B82F6'
      }[item.status] || '#6B7280'
    })) : [
      { name: 'Delivered', value: 0, color: '#10B981' },
      { name: 'Preparing', value: 0, color: '#F59E0B' },
      { name: 'Pending', value: 0, color: '#EF4444' },
      { name: 'Ready', value: 0, color: '#3B82F6' }
    ];

  // SSR-safe subscription analytics data processing (moved before metrics) - fix data access
  const subscriptionOverviewData = analyticsData?.subscriptionOverview?.data || {
    monthlyRecurringRevenue: { current: 0, growth: 0 },
    subscriptionRevenue: { current: 0, growth: 0 },
    oneTimeRevenue: { current: 0, growth: 0 },
    subscriptionConversionRate: { current: 0, growth: 0 },
    averageRevenuePerUser: { current: 0, growth: 0 },
    customerLifetimeValue: { current: 0, growth: 0 },
    churnRate: { current: 0, growth: 0 }
  };

  // SSR-safe revenue breakdown data processing (moved before metrics) - fix data access
  const revenueBreakdownData = analyticsData?.revenueBreakdown?.data || {
    subscriptionRevenue: 0,
    oneTimeRevenue: 0,
    subscriptionPercentage: 0,
    oneTimePercentage: 0,
    totalRevenue: 0
  };

  const metrics = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: overview.totalRevenue?.growth || 0,
      icon: faDollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Monthly Recurring Revenue',
      value: `$${(subscriptionOverviewData.monthlyRecurringRevenue?.current || 0).toLocaleString()}`,
      change: subscriptionOverviewData.monthlyRecurringRevenue?.growth || 0,
      icon: faRedo,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: overview.totalOrders?.growth || 0,
      icon: faShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Active Customers',
      value: totalCustomers.toLocaleString(),
      change: customerOverviewData.activeCustomers?.growth || 0,
      icon: faUsers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Subscription Conversion',
      value: `${(subscriptionOverviewData.subscriptionConversionRate?.current || 0).toFixed(1)}%`,
      change: subscriptionOverviewData.subscriptionConversionRate?.growth || 0,
      icon: faUserCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      title: 'Avg Revenue Per User',
      value: `$${(subscriptionOverviewData.averageRevenuePerUser?.current || 0).toFixed(2)}`,
      change: subscriptionOverviewData.averageRevenuePerUser?.growth || 0,
      icon: faChartBar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Customer Lifetime Value',
      value: `$${(subscriptionOverviewData.customerLifetimeValue?.current || 0).toFixed(0)}`,
      change: subscriptionOverviewData.customerLifetimeValue?.growth || 0,
      icon: faCreditCard,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200'
    },
    {
      title: 'Avg Prep Time',
      value: `${avgPrepTime} min`,
      change: overview.avgPrepTime?.growth || 0,
      icon: faClock,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200'
    },
    {
      title: 'On-Time Delivery',
      value: `${safePerformanceData.deliveryPerformance.onTimeDeliveryRate?.current?.toFixed(1) || 0}%`,
      change: safePerformanceData.deliveryPerformance.onTimeDeliveryRate?.growth || 0,
      icon: faBullseye,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Churn Rate',
      value: `${(subscriptionOverviewData.churnRate?.current || 0).toFixed(1)}%`,
      change: subscriptionOverviewData.churnRate?.growth || 0,
      icon: faArrowTrendDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  const topItemsData = (analyticsData?.topItems?.data && Array.isArray(analyticsData.topItems.data)) ? 
    analyticsData.topItems.data.map(item => ({
      name: item.name,
      orders: item.totalQuantity || item.orders,
      revenue: item.totalRevenue || item.revenue
    })) : [];

  // SSR-safe revenue trend data processing - fix data access
  const revenueTrendData = (analyticsData?.revenueTrend?.data && Array.isArray(analyticsData.revenueTrend.data)) ? 
    analyticsData.revenueTrend.data.map(item => ({
      date: item.date,
      value: item.value || item.revenue || 0  // Handle multiple formats
    })) : 
    mockAnalytics.chartData.revenue; // Fallback to mock data

  // SSR-safe delivery performance trend data processing - fix data access
  const deliveryPerformanceTrendData = (analyticsData?.deliveryPerformanceTrend?.data && Array.isArray(analyticsData.deliveryPerformanceTrend.data)) ? 
    analyticsData.deliveryPerformanceTrend.data : 
    [
      { date: '2024-01-01', onTimeRate: 85 },
      { date: '2024-01-02', onTimeRate: 88 },
      { date: '2024-01-03', onTimeRate: 92 },
      { date: '2024-01-04', onTimeRate: 87 },
      { date: '2024-01-05', onTimeRate: 90 },
      { date: '2024-01-06', onTimeRate: 94 },
      { date: '2024-01-07', onTimeRate: 91 }
    ]; // Fallback to mock data

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                const isPositive = metric.change > 0;
                return (
                  <Card key={index} className={`hover:shadow-lg transition-all duration-200 border-l-4 ${metric.borderColor}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${metric.bgColor} mb-3`}>
                            <FontAwesomeIcon icon={Icon} className={`h-5 w-5 ${metric.color}`} />
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1 truncate">
                            {metric.title}
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            {metric.value}
                          </p>
                          <div className={`flex items-center text-sm ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isPositive ? (
                              <FontAwesomeIcon icon={faArrowUp} className="h-4 w-4 mr-1" />
                            ) : (
                              <FontAwesomeIcon icon={faArrowDown} className="h-4 w-4 mr-1" />
                            )}
                            <span className="font-medium">{Math.abs(metric.change)}%</span>
                            <span className="text-gray-500 ml-1 text-xs">vs last period</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Revenue Breakdown Chart */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <FontAwesomeIcon icon={faChartPie} className="h-5 w-5 mr-2 text-grub-red" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Pie Chart */}
                  <div className="h-64">
                    <ChartComponent 
                      data={[
                        { 
                          name: 'Subscription Revenue', 
                          orders: revenueBreakdownData.subscriptionRevenue,
                          color: '#10B981'
                        },
                        { 
                          name: 'One-time Orders', 
                          orders: revenueBreakdownData.oneTimeRevenue,
                          color: '#3B82F6'
                        }
                      ]} 
                      type="pie" 
                    />
                  </div>
                  
                  {/* Revenue Stats */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${revenueBreakdownData.subscriptionRevenue?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-gray-600">Subscription Revenue</div>
                        <div className="text-xs text-green-600 font-medium">
                          {revenueBreakdownData.subscriptionPercentage?.toFixed(1) || 0}% of total
                        </div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          ${revenueBreakdownData.oneTimeRevenue?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-gray-600">One-time Orders</div>
                        <div className="text-xs text-blue-600 font-medium">
                          {revenueBreakdownData.oneTimePercentage?.toFixed(1) || 0}% of total
                        </div>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900">
                        ${revenueBreakdownData.totalRevenue?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'revenue':
        return (
          <div className="space-y-6">
            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.filter(m => m.title.includes('Revenue') || m.title.includes('Order')).map((metric, index) => {
                const Icon = metric.icon;
                const isPositive = metric.change > 0;
                return (
                  <Card key={index} className={`hover:shadow-lg transition-all duration-200 border-l-4 ${metric.borderColor}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${metric.bgColor} mb-3`}>
                            <FontAwesomeIcon icon={Icon} className={`h-5 w-5 ${metric.color}`} />
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1 truncate">
                            {metric.title}
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            {metric.value}
                          </p>
                          <div className={`flex items-center text-sm ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isPositive ? (
                              <FontAwesomeIcon icon={faArrowUp} className="h-4 w-4 mr-1" />
                            ) : (
                              <FontAwesomeIcon icon={faArrowDown} className="h-4 w-4 mr-1" />
                            )}
                            <span className="font-medium">{Math.abs(metric.change)}%</span>
                            <span className="text-gray-500 ml-1 text-xs">vs last period</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Revenue Chart */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Revenue Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartComponent 
                  data={revenueTrendData} 
                  type="line" 
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-6">
            {/* Customer Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.filter(m => m.title.includes('Customers') || m.title.includes('Conversion')).map((metric, index) => {
                const Icon = metric.icon;
                const isPositive = metric.change > 0;
                return (
                  <Card key={index} className={`hover:shadow-lg transition-all duration-200 border-l-4 ${metric.borderColor}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${metric.bgColor} mb-3`}>
                            <FontAwesomeIcon icon={Icon} className={`h-5 w-5 ${metric.color}`} />
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1 truncate">
                            {metric.title}
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            {metric.value}
                          </p>
                          <div className={`flex items-center text-sm ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isPositive ? (
                              <FontAwesomeIcon icon={faArrowUp} className="h-4 w-4 mr-1" />
                            ) : (
                              <FontAwesomeIcon icon={faArrowDown} className="h-4 w-4 mr-1" />
                            )}
                            <span className="font-medium">{Math.abs(metric.change)}%</span>
                            <span className="text-gray-500 ml-1 text-xs">vs last period</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Customer Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Customer Segments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {customerSegmentsData.active}
                        </div>
                        <div className="text-sm text-gray-600">Active Customers</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {customerSegmentsData.loyal}
                        </div>
                        <div className="text-sm text-gray-600">Loyal Customers</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Top Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loadingCustomers ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="h-3 bg-gray-100 rounded w-16"></div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                              <div className="h-3 bg-gray-100 rounded w-12"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : customersError ? (
                      <div className="text-center py-6 text-red-500">
                        <p>{customersError}</p>
                        <button 
                          onClick={() => window.location.reload()}
                          className="mt-2 text-sm text-grub-red hover:underline"
                        >
                          Try again
                        </button>
                      </div>
                    ) : topCustomersData.length > 0 ? (
                      topCustomersData.map((customer, index) => (
                        <div key={customer._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-grub-red text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {customer.name || 'Customer'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {customer.totalOrders} {customer.totalOrders === 1 ? 'order' : 'orders'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-grub-red">
                              ${(customer.totalSpent || 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">total spent</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        No customer data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.filter(m => m.title.includes('Prep Time') || m.title.includes('Avg Order') || m.title.includes('Conversion')).map((metric, index) => {
                const Icon = metric.icon;
                const isPositive = metric.change > 0;
                return (
                  <Card key={index} className={`hover:shadow-lg transition-all duration-200 border-l-4 ${metric.borderColor}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${metric.bgColor} mb-3`}>
                            <FontAwesomeIcon icon={Icon} className={`h-5 w-5 ${metric.color}`} />
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1 truncate">
                            {metric.title}
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            {metric.value}
                          </p>
                          <div className={`flex items-center text-sm ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isPositive ? (
                              <FontAwesomeIcon icon={faArrowUp} className="h-4 w-4 mr-1" />
                            ) : (
                              <FontAwesomeIcon icon={faArrowDown} className="h-4 w-4 mr-1" />
                            )}
                            <span className="font-medium">{Math.abs(metric.change)}%</span>
                            <span className="text-gray-500 ml-1 text-xs">vs last period</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Delivery Performance Trend Chart */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Delivery Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartComponent 
                  data={deliveryPerformanceTrendData.map(item => ({
                    date: item.date,
                    value: item.onTimeRate || 0
                  }))} 
                  type="line" 
                />
              </CardContent>
            </Card>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Order Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Pie Chart Visualization */}
                    <div className="h-64">
                      <ChartComponent 
                        data={orderStatusData.map(status => ({
                          name: status.name,
                          orders: status.value,
                          color: status.color
                        }))} 
                        type="pie" 
                      />
                    </div>
                    
                    {/* Status List with Performance Insights */}
                    <div className="space-y-3">
                      {orderStatusData.map((status, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: status.color }}
                            ></div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">{status.name}</span>
                              <div className="text-xs text-gray-500">
                                {status.name === 'Scheduled' && 'Future orders planned'}
                                {status.name === 'Pending' && 'Awaiting confirmation'}
                                {status.name === 'Preparing' && 'In kitchen'}
                                {status.name === 'Ready' && 'Ready for pickup/delivery'}
                                {status.name === 'Delivered' && 'Successfully completed'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900">{status.value}</span>
                            <div className="text-xs text-gray-500">
                              {((status.value / totalOrders) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Top Performing Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Performance Summary */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {topItemsData.length}
                        </div>
                        <div className="text-xs text-gray-600">Active Items</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          ${topItemsData.reduce((sum, item) => sum + (item.revenue || 0), 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Total Revenue</div>
                      </div>
                    </div>

                    {/* Enhanced Item List */}
                    <div className="space-y-3">
                      {topItemsData.slice(0, 5).map((item, index) => {
                        const avgOrderValue = item.orders > 0 ? item.revenue / item.orders : 0;
                        const revenueShare = topItemsData.length > 0 ? 
                          (item.revenue / topItemsData.reduce((sum, i) => sum + (i.revenue || 0), 0)) * 100 : 0;
                        
                        return (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-grub-red">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-grub-red text-white rounded-full text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{item.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {revenueShare.toFixed(1)}% of total revenue
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-grub-red">${item.revenue.toFixed(0)}</div>
                                <div className="text-xs text-gray-500">total revenue</div>
                              </div>
                            </div>
                            
                            {/* Performance Metrics */}
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div className="text-center p-2 bg-white rounded">
                                <div className="text-sm font-semibold text-gray-700">{item.orders}</div>
                                <div className="text-xs text-gray-500">Orders</div>
                              </div>
                              <div className="text-center p-2 bg-white rounded">
                                <div className="text-sm font-semibold text-gray-700">${avgOrderValue.toFixed(2)}</div>
                                <div className="text-xs text-gray-500">Avg Value</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-grub-red to-red-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-red-100 mt-1">Track your restaurant's performance and growth</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value} className="text-gray-900">
                    {range.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => window.location.reload()}
                  disabled={loading}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faSync} className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <FontAwesomeIcon icon={faDownload} className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-grub-red text-grub-red bg-red-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={Icon} className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin text-grub-red" />
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faSync} className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Analytics</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-grub-red hover:bg-red-700 text-white"
                >
                  <FontAwesomeIcon icon={faSync} className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        ) : (
          renderTabContent()
        )}

      </div>
    </div>
  );
};

export default AnalyticsPage;







