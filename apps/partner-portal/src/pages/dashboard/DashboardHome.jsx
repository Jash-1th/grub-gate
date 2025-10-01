import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@grub-gate/ui';
import { mockAnalytics, mockOrders, mockMenuItems } from '../../lib/mock-data.js';

const DashboardHome = () => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('dashboard.stats.totalOrders'),
      value: mockAnalytics.orders.current,
      change: mockAnalytics.orders.growth,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: t('dashboard.stats.totalRevenue'),
      value: `$${mockAnalytics.revenue.current.toLocaleString()}`,
      change: mockAnalytics.revenue.growth,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: t('dashboard.stats.activeSubscribers'),
      value: mockAnalytics.customers.current,
      change: mockAnalytics.customers.growth,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: t('dashboard.stats.avgOrderValue'),
      value: `$${mockAnalytics.avgOrderValue.current}`,
      change: mockAnalytics.avgOrderValue.growth,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const recentOrders = mockOrders.slice(0, 5);
  const topMenuItems = mockMenuItems
    .sort((a, b) => b.totalOrders - a.totalOrders)
    .slice(0, 3);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-grub-red to-grub-red-light rounded-lg p-4 lg:p-6 text-white">
        <h1 className="text-xl lg:text-2xl font-bold mb-2">
          {t('dashboard.welcome', { name: 'Bistro Montreal' })}
        </h1>
        <p className="text-red-100 text-sm lg:text-base">
          {t('dashboard.overview')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-600 truncate">
                        {stat.title}
                      </p>
                      <span className={`inline-flex items-center text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? (
                          <ArrowUpRight className="h-4 w-4 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-0.5" />
                        )}
                        {Math.abs(stat.change)}%
                      </span>
                    </div>
                    <p className="mt-2 text-2xl lg:text-3xl font-extrabold text-gray-900">
                      {stat.value}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="hidden sm:inline text-xs text-gray-500">{t('dashboard.stats.thisWeek')}</span>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-3 lg:pb-4">
            <CardTitle className="text-lg lg:text-xl">{t('dashboard.recentOrders')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 lg:space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg">
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
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-gray-900 text-sm lg:text-base">
                      ${order.total}
                    </p>
                    <span className={`inline-flex items-center px-2 lg:px-2.5 py-0.5 rounded-full text-[10px] lg:text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t(`orders.statuses.${order.status}`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Menu Items */}
        <Card>
          <CardHeader className="pb-3 lg:pb-4">
            <CardTitle className="text-lg lg:text-xl">{t('analytics.metrics.topItems')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 lg:space-y-4">
              {topMenuItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 lg:space-x-3 min-w-0">
                    <div className="h-7 w-7 lg:h-8 lg:w-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs lg:text-sm font-medium text-gray-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm lg:text-base truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-400 fill-current" />
                        <span className="text-xs lg:text-sm text-gray-500 ml-1">
                          {item.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-gray-900 text-sm lg:text-base">
                      {item.totalOrders}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500">
                      {t('dashboard.stats.orders')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3 lg:pb-4">
          <CardTitle className="text-lg lg:text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
            <button className="p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="h-8 w-8 lg:h-10 lg:w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm lg:text-base">Add Menu Item</p>
                  <p className="text-xs lg:text-sm text-gray-500">Create a new dish</p>
                </div>
              </div>
            </button>
            
            <button className="p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="h-8 w-8 lg:h-10 lg:w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm lg:text-base">View Analytics</p>
                  <p className="text-xs lg:text-sm text-gray-500">Check performance</p>
                </div>
              </div>
            </button>
            
            <button className="p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="h-8 w-8 lg:h-10 lg:w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm lg:text-base">Manage Customers</p>
                  <p className="text-xs lg:text-sm text-gray-500">View customer data</p>
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




