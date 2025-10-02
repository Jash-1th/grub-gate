import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  TrendingDown, 
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  Users,
  BarChart3
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@grub-gate/ui';
import { useIsClient } from '../../hooks/useIsClient.js';
import { mockAnalytics } from '../../lib/mock-data.js';

// SSR-safe chart component
const ChartComponent = ({ data, type = 'line' }) => {
  const isClient = useIsClient();
  
  if (!isClient) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    );
  }

  // Dynamic import for charts to ensure SSR safety
  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } = require('recharts');

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

  const timeRanges = [
    { value: 'last7Days', label: t('analytics.last7Days') },
    { value: 'last30Days', label: t('analytics.last30Days') },
    { value: 'last3Months', label: t('analytics.last3Months') },
    { value: 'lastYear', label: t('analytics.lastYear') }
  ];

  const metrics = [
    {
      title: t('analytics.metrics.revenue'),
      value: `$${mockAnalytics.revenue.current.toLocaleString()}`,
      change: mockAnalytics.revenue.growth,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: t('analytics.metrics.orders'),
      value: mockAnalytics.orders.current,
      change: mockAnalytics.orders.growth,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: t('analytics.metrics.customers'),
      value: mockAnalytics.customers.current,
      change: mockAnalytics.customers.growth,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: t('analytics.metrics.avgOrderValue'),
      value: `$${mockAnalytics.avgOrderValue.current}`,
      change: mockAnalytics.avgOrderValue.growth,
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const topItemsData = mockAnalytics.chartData.topItems.map(item => ({
    name: item.name,
    orders: item.orders,
    revenue: item.revenue
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('analytics.title')}
          </h1>
          <p className="text-gray-600">
            {t('analytics.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <Button variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            {t('analytics.export')}
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change > 0;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.value}
                    </p>
                    <div className={`flex items-center mt-2 text-sm ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span>{Math.abs(metric.change)}%</span>
                      <span className="text-gray-500 ml-1">
                        {t('dashboard.stats.thisWeek')}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${metric.bgColor}`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.charts.revenueChart')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartComponent 
              data={mockAnalytics.chartData.revenue} 
              type="line" 
            />
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.charts.ordersChart')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartComponent 
              data={mockAnalytics.chartData.orders} 
              type="line" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Items Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.charts.topItemsChart')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ChartComponent 
                data={topItemsData} 
                type="bar" 
              />
            </div>
            <div>
              <ChartComponent 
                data={topItemsData} 
                type="pie" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.metrics.topItems')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Item
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Orders
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Revenue
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Avg. Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {topItemsData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">
                        {item.orders}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">
                        ${item.revenue.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">
                        ${(item.revenue / item.orders).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;





