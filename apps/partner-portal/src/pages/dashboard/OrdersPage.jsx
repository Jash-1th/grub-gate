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
  Calendar,
  DollarSign,
  User,
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
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-grub-red to-red-600 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Orders Management</h1>
            <p className="text-red-100 text-sm">Track and manage all your restaurant orders</p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {filteredOrders.length} Orders
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: 'Pending', count: filteredOrders.filter(o => o.status === 'pending').length, color: 'bg-yellow-100 text-yellow-800', icon: Clock },
          { label: 'Preparing', count: filteredOrders.filter(o => o.status === 'preparing').length, color: 'bg-orange-100 text-orange-800', icon: Package },
          { label: 'Ready', count: filteredOrders.filter(o => o.status === 'ready').length, color: 'bg-green-100 text-green-800', icon: CheckCircle },
          { label: 'Delivered', count: filteredOrders.filter(o => o.status === 'delivered').length, color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
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

      {/* Orders List - Mobile-First Design */}
      <div className="space-y-3 lg:space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => handleViewOrder(order)}>
              <CardContent className="p-4 lg:p-6">
                {/* Mobile Layout */}
                <div className="lg:hidden">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900">#{order.id.split('_')[1]}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{t(`orders.statuses.${order.status}`)}</span>
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <User className="h-4 w-4 mr-1" />
                        {order.customer.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-grub-red">${order.total}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-1" />
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </div>
                    <div className="flex items-center space-x-2">
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(order.id, 'confirmed');
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Confirm
                        </Button>
                      )}
                      {order.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(order.id, 'preparing');
                          }}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          Start Prep
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(order.id, 'ready');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Mark Ready
                        </Button>
                      )}
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:flex lg:items-center lg:justify-between">
                  <div className="flex items-center space-x-6">
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">#{order.id.split('_')[1]}</div>
                      <div className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900 mb-1">{order.customer.name}</div>
                      <div className="text-sm text-gray-500">{order.customer.email}</div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-1" />
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </div>
                    
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2">{t(`orders.statuses.${order.status}`)}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-bold text-xl text-grub-red">${order.total}</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(order.id, 'confirmed');
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                      )}
                      {order.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(order.id, 'preparing');
                          }}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Start Prep
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(order.id, 'ready');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Ready
                        </Button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewOrder(order);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
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
      >
        {selectedOrder && (
          <div className="max-h-[calc(100vh-150px)] overflow-y-auto">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-grub-red via-red-600 to-red-700 text-white rounded-2xl p-6 mb-6 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/10"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl lg:text-3xl font-bold">Order #{selectedOrder.id.split('_')[1]}</h2>
                        <p className="text-red-100 text-sm">
                          {new Date(selectedOrder.orderDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm`}>
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-2 capitalize">{selectedOrder.status.replace('_', ' ')}</span>
                      </span>
                      <span className="text-red-100 text-sm">
                        {selectedOrder.items.length} {selectedOrder.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    
                    <div className="text-4xl lg:text-5xl font-bold mb-2">${selectedOrder.total}</div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    {selectedOrder.status === 'pending' && (
                      <Button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder.id, 'confirmed');
                          setShowOrderModal(false);
                          setSelectedOrder(null);
                        }}
                        className="bg-white text-grub-red hover:bg-gray-100 font-semibold shadow-lg"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Order
                      </Button>
                    )}
                    {selectedOrder.status === 'confirmed' && (
                      <Button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder.id, 'preparing');
                          setShowOrderModal(false);
                          setSelectedOrder(null);
                        }}
                        className="bg-orange-500 text-white hover:bg-orange-600 font-semibold shadow-lg"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Start Preparing
                      </Button>
                    )}
                    {selectedOrder.status === 'preparing' && (
                      <Button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder.id, 'ready');
                          setShowOrderModal(false);
                          setSelectedOrder(null);
                        }}
                        className="bg-green-500 text-white hover:bg-green-600 font-semibold shadow-lg"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Ready
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Customer Information Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Customer Details</h3>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedOrder.customer.name}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm">{selectedOrder.customer.email}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm">{selectedOrder.customer.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:text-right">
                      <div className="flex items-start text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 mt-1 text-blue-500 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 mb-1">Delivery Address</p>
                          <p>{selectedOrder.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Order Items</h3>
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedOrder.items.length} {selectedOrder.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-sm transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg mb-1">{item.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="bg-white px-2 py-1 rounded-md border">
                              <DollarSign className="h-3 w-3 inline mr-1" />
                              {item.price}
                            </span>
                            <span className="bg-white px-2 py-1 rounded-md border">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-grub-red">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total Card */}
              <div className="bg-gradient-to-r from-grub-red/5 to-red-100/50 border-2 border-grub-red/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-grub-red/10 rounded-full p-3 mr-4">
                      <DollarSign className="h-6 w-6 text-grub-red" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Order Total</h3>
                      <p className="text-gray-600 text-sm">Including all items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-grub-red">${selectedOrder.total}</div>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <div className="flex items-start">
                    <div className="bg-amber-100 rounded-full p-2 mr-3 flex-shrink-0">
                      <Calendar className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Instructions</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedOrder.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Modal Footer */}
          <div className="border-t bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-3 mt-6 rounded-b-2xl">
            <Button
              variant="secondary"
              onClick={() => {
                setShowOrderModal(false);
                setSelectedOrder(null);
              }}
              className="w-full sm:w-auto border-gray-300 hover:bg-gray-100"
            >
              Close
            </Button>
            <Button
              onClick={() => window.print()}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              Print Order
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;





