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
  Mail
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('orders.title')}
        </h1>
        <p className="text-gray-600">
          {t('orders.subtitle')}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('orders.searchOrders')}
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

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    {t('orders.tableHeaders.orderId')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    {t('orders.tableHeaders.customer')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    {t('orders.tableHeaders.items')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    {t('orders.tableHeaders.total')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    {t('orders.tableHeaders.status')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    {t('orders.tableHeaders.date')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    {t('orders.tableHeaders.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">
                        #{order.id.split('_')[1]}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">
                        ${order.total}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">
                          {t(`orders.statuses.${order.status}`)}
                        </span>
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'preparing')}
                            className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'ready')}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
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

      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedOrder(null);
        }}
        title={t('orders.details.title')}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('orders.details.customerInfo')}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">
                    {selectedOrder.customer.name}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {selectedOrder.customer.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {selectedOrder.customer.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {selectedOrder.deliveryAddress}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('orders.details.orderItems')}
              </h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>{t('orders.details.total')}</span>
                <span>${selectedOrder.total}</span>
              </div>
            </div>

            {/* Special Instructions */}
            {selectedOrder.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('orders.details.notes')}
                </h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {selectedOrder.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}
              >
                {t('common.close')}
              </Button>
              {selectedOrder.status === 'pending' && (
                <Button onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')}>
                  {t('orders.actions.confirm')}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;




