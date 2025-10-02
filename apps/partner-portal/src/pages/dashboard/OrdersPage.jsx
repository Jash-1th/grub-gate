import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  X,
  MapPin,
  Phone,
  Mail,
  Package,
  User,
  Calendar,
  DollarSign,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Modal } from '@grub-gate/ui';
import { mockOrders } from '../../lib/mock-data.js';

const OrdersPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Consistent date formatting to prevent hydration mismatch
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    // In a real app, this would update the order status via API
    console.log('Update order status:', orderId, newStatus);
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
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'preparing': return <Clock className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-grub-red to-red-600 rounded-2xl p-6 !text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold !text-white">Orders Management</h1>
              <p className="!text-red-100 mt-2">Track and manage all your restaurant orders</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm font-medium">{filteredOrders.length} Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: 'Pending', 
              count: filteredOrders.filter(o => o.status === 'pending').length, 
              color: 'bg-yellow-500', 
              bgColor: 'bg-yellow-50',
              icon: Clock 
            },
            { 
              label: 'Preparing', 
              count: filteredOrders.filter(o => o.status === 'preparing').length, 
              color: 'bg-orange-500', 
              bgColor: 'bg-orange-50',
              icon: Package 
            },
            { 
              label: 'Ready', 
              count: filteredOrders.filter(o => o.status === 'ready').length, 
              color: 'bg-green-500', 
              bgColor: 'bg-green-50',
              icon: CheckCircle 
            },
            { 
              label: 'Delivered', 
              count: filteredOrders.filter(o => o.status === 'delivered').length, 
              color: 'bg-blue-500', 
              bgColor: 'bg-blue-50',
              icon: CheckCircle 
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.count}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders by customer name or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red"
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

        {/* Orders List - Responsive Design */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
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
                            <th className="text-left py-4 px-6 font-semibold text-gray-900">Total</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-6">
                                <span className="font-semibold text-gray-900">#{order.id.split('_')[1]}</span>
                              </td>
                              <td className="py-4 px-6">
                                <div>
                                  <div className="font-medium text-gray-900">{order.customer.name}</div>
                                  <div className="text-sm text-gray-500">{order.customer.email}</div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-gray-900">{order.items.length} items</span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="font-bold text-lg text-grub-red">${order.total}</span>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                  <span className="ml-2">{order.status}</span>
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-gray-900">{formatDate(order.orderDate)}</span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleViewOrder(order)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  {order.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      Confirm
                                    </Button>
                                  )}
                                  {order.status === 'confirmed' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                      className="bg-orange-600 hover:bg-orange-700 text-white"
                                    >
                                      Start Prep
                                    </Button>
                                  )}
                                  {order.status === 'preparing' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateStatus(order.id, 'ready')}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      Mark Ready
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
                  <Card key={order.id} className="hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-3">
                      <div className="space-y-3">
                        {/* Header Row */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900 text-sm">#{order.id.split('_')[1]}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-grub-red">${order.total}</div>
                            <div className="text-xs text-gray-500">{order.items.length} items</div>
                          </div>
                        </div>

                        {/* Customer Info - Compact */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className="bg-blue-100 rounded-full p-1.5">
                              <User className="h-3 w-3 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm truncate">{order.customer.name}</div>
                              <div className="text-xs text-gray-500">
                                {formatDate(order.orderDate)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Confirm
                              </Button>
                            )}
                            {order.status === 'confirmed' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-1"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                Prep
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(order.id, 'ready')}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ready
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
                    <h2 className="text-base sm:text-lg font-bold">Order #{selectedOrder.id.split('_')[1]}</h2>
                    <p className="text-red-100 text-xs">
                      {formatDate(selectedOrder.orderDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-bold">${selectedOrder.total}</div>
                    <div className="text-red-100 text-xs">{selectedOrder.items.length} items</div>
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
                        handleUpdateStatus(selectedOrder.id, 'confirmed');
                        setShowOrderModal(false);
                        setSelectedOrder(null);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirm
                    </Button>
                  )}
                  {selectedOrder.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'preparing');
                        setShowOrderModal(false);
                        setSelectedOrder(null);
                      }}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Start Prep
                    </Button>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'ready');
                        setShowOrderModal(false);
                        setSelectedOrder(null);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
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
                      <User className="h-3 w-3 text-blue-600" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Customer & Delivery</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <div className="font-medium text-gray-900 text-xs sm:text-sm">{selectedOrder.customer.name}</div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-2.5 w-2.5 mr-1 text-blue-500" />
                        <span className="text-xs break-all">{selectedOrder.customer.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-2.5 w-2.5 mr-1 text-blue-500" />
                        <span className="text-xs">{selectedOrder.customer.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <MapPin className="h-2.5 w-2.5 mr-1 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span className="text-xs break-words">{selectedOrder.deliveryAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items - Compact */}
                <div className="bg-white border border-gray-200 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-full p-1 mr-2">
                        <Package className="h-3 w-3 text-green-600" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Order Items</h3>
                    </div>
                    <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full text-xs font-medium">
                      {selectedOrder.items.length}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-xs">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{item.name}</div>
                          <div className="text-gray-600">${item.price} × {item.quantity}</div>
                        </div>
                        <div className="font-bold text-grub-red ml-2">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Total - Compact */}
              <div className="bg-gradient-to-r from-grub-red/5 to-red-100/50 border border-grub-red/20 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-grub-red/10 rounded-full p-1.5 mr-2">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-grub-red" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Order Total</h3>
                      <p className="text-gray-600 text-xs">All items</p>
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-grub-red">${selectedOrder.total}</div>
                </div>
              </div>

              {/* Special Instructions - Compact */}
              {selectedOrder.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-start">
                    <div className="bg-amber-100 rounded-full p-1 mr-2 flex-shrink-0">
                      <Calendar className="h-3 w-3 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Notes</h3>
                      <p className="text-gray-700 text-xs break-words">{selectedOrder.notes}</p>
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




