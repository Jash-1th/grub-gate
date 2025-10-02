import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  TrendingDown, 
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  Users,
  BarChart3,
  Target,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCw,
  Eye,
  Package,
  Percent
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@grub-gate/ui';
import { useIsClient } from '../../hooks/useIsClient.js';
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
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
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
  const [timeRange, setTimeRange] = useState('last7Days');
  const [activeTab, setActiveTab] = useState('overview');

  const timeRanges = [
    { value: 'last7Days', label: 'Last 7 Days' },
    { value: 'last30Days', label: 'Last 30 Days' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'lastYear', label: 'Last Year' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'performance', label: 'Performance', icon: Target }
  ];

  // Calculate additional metrics
  const totalRevenue = mockAnalytics.revenue.current;
  const totalOrders = mockAnalytics.orders.current;
  const totalCustomers = mockAnalytics.customers.current;
  const avgOrderValue = mockAnalytics.avgOrderValue.current;
  
  // Calculate order status distribution
  const orderStatusData = [
    { name: 'Delivered', value: mockOrders.filter(o => o.status === 'delivered').length, color: '#10B981' },
    { name: 'Preparing', value: mockOrders.filter(o => o.status === 'preparing').length, color: '#F59E0B' },
    { name: 'Pending', value: mockOrders.filter(o => o.status === 'pending').length, color: '#EF4444' },
    { name: 'Ready', value: mockOrders.filter(o => o.status === 'ready').length, color: '#3B82F6' }
  ];

  const metrics = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: mockAnalytics.revenue.growth,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: mockAnalytics.orders.growth,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Active Customers',
      value: totalCustomers.toLocaleString(),
      change: mockAnalytics.customers.growth,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Avg Order Value',
      value: `$${avgOrderValue}`,
      change: mockAnalytics.avgOrderValue.growth,
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: 5.4,
      icon: Percent,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      title: 'Avg Prep Time',
      value: '18 min',
      change: -8.2,
      icon: Clock,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200'
    }
  ];

  const topItemsData = mockAnalytics.chartData.topItems.map(item => ({
    name: item.name,
    orders: item.orders,
    revenue: item.revenue
  }));

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
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Download className="h-4 w-4 mr-2" />
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
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const isPositive = metric.change > 0;
            return (
              <Card key={index} className={`hover:shadow-lg transition-all duration-200 border-l-4 ${metric.borderColor}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${metric.bgColor} mb-3`}>
                        <Icon className={`h-5 w-5 ${metric.color}`} />
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
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-1" />
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue Trend */}
          <div className="xl:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-grub-red rounded-full"></div>
                      <span className="text-sm text-gray-600">Revenue</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChartComponent 
                  data={mockAnalytics.chartData.revenue} 
                  type="line" 
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderStatusData.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{status.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900">{status.value}</span>
                      <span className="text-xs text-gray-500">
                        ({((status.value / totalOrders) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Items */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Top Performing Items</CardTitle>
                <Button variant="secondary" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topItemsData.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-grub-red text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.orders} orders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-grub-red">${item.revenue.toFixed(0)}</div>
                      <div className="text-sm text-gray-500">revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Insights */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Customer Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {mockCustomers.filter(c => c.status === 'active').length}
                    </div>
                    <div className="text-sm text-gray-600">Active Customers</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${(mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / mockCustomers.length).toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Customer Value</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Top Customers</h4>
                  <div className="space-y-2">
                    {mockCustomers
                      .sort((a, b) => b.totalSpent - a.totalSpent)
                      .slice(0, 3)
                      .map((customer, index) => (
                        <div key={customer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-grub-red text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-sm text-gray-900">{customer.name}</div>
                              <div className="text-xs text-gray-500">{customer.totalOrders} orders</div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-grub-red">
                            ${customer.totalSpent.toFixed(0)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-semibold">Menu Item Performance</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="secondary" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
                <Button variant="secondary" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile View */}
            <div className="lg:hidden space-y-4">
              {topItemsData.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <span className="bg-grub-red text-white px-2 py-1 rounded-full text-xs font-medium">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Orders:</span>
                      <span className="font-medium text-gray-900 ml-1">{item.orders}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Revenue:</span>
                      <span className="font-medium text-grub-red ml-1">${item.revenue.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Price:</span>
                      <span className="font-medium text-gray-900 ml-1">${(item.revenue / item.orders).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Performance:</span>
                      <span className="font-medium text-green-600 ml-1">+{(Math.random() * 20 + 5).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Rank</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Item Name</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Orders</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Revenue</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Avg Price</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {topItemsData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-grub-red text-white rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{item.orders}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-grub-red">${item.revenue.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900">${(item.revenue / item.orders).toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-green-600 font-medium">+{(Math.random() * 20 + 5).toFixed(1)}%</span>
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
    </div>
  );
};

export default AnalyticsPage;




