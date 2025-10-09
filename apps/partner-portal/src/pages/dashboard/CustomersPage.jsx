import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faEnvelope, 
  faPhone, 
  faCalendar, 
  faDollarSign, 
  faShoppingBag,
  faSpinner,
  faExclamationTriangle,
  faUsers,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { Input, Card, CardContent, CardHeader, CardTitle } from '@grub-gate/ui';
import { getToken, getUserData, setStorageItem } from '../../utils/ssrSafeStorage';

const CustomersPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // SSR Safety
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  // Debounced fetch function to prevent rapid API calls
  const debouncedFetchCustomers = useCallback(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      fetchCustomers();
    }, 500); // 500ms delay
  }, []);

  // Fetch customers when component mounts or search changes
  useEffect(() => {
    if (isClient) {
      debouncedFetchCustomers();
    }

    // Cleanup timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isClient, searchTerm, currentPage, debouncedFetchCustomers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the correct storage methods for tokens and user data
      let authToken = getToken('accessToken');
      let userData = getUserData('user');
      
      if (!authToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Use the simplified endpoint for partners
      const response = await fetch(
        `/api/v1/admin/my-customers?page=${currentPage}&limit=10&search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment before trying again.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setCustomers(data.data.customers);
        setRestaurant(data.data.restaurant);
        setSummary(data.data.summary);
        setPagination(data.data.pagination);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(data.message || 'Failed to fetch customers');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      
      // Handle rate limiting with exponential backoff
      if (err.message.includes('Too many requests') && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited. Retrying in ${delay}ms (attempt ${retryCount + 1}/3)`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchCustomers();
        }, delay);
        
        return; // Don't set error state yet, we're retrying
      }
      
      setError(err.message);
      setCustomers([]);
      setSummary(null);
      setRetryCount(0); // Reset retry count on other errors
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers; // Already filtered by backend

  // Consistent date formatting to prevent hydration mismatch
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // SSR Loading State
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin text-grub-red mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Loading Customers</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button 
                onClick={fetchCustomers}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-grub-red to-red-600 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              {restaurant?.name ? `${restaurant.name} - Customers` : 'Customer Management'}
            </h1>
            <p className="text-red-100 text-sm">
              {restaurant?.name ? `Customers who have ordered from ${restaurant.name}` : 'Manage and track your customers'}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-sm font-medium">
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              ) : (
                filteredCustomers.length
              )} Customers
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                  <FontAwesomeIcon icon={faUsers} className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{summary.totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-grub-red/10 rounded-full">
                  <FontAwesomeIcon icon={faDollarSign} className="h-5 w-5 sm:h-6 sm:w-6 text-grub-red" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold text-grub-red">${summary.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                  <FontAwesomeIcon icon={faShoppingBag} className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{summary.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                  <FontAwesomeIcon icon={faChartLine} className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Customer Value</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">${summary.averageCustomerValue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
            {loading && (
              <FontAwesomeIcon 
                icon={faSpinner} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" 
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customers List - Responsive */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FontAwesomeIcon icon={faShoppingBag} className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-500">Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Card>
                <CardHeader>
                  <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Customer</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Contact</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Orders at This Restaurant</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Spent at This Restaurant</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Last Order</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Avg Order Value</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map((customer) => (
                          <tr key={customer._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-grub-red rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                    {customer.fullName?.charAt(0) || customer.firstName?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{customer.fullName || `${customer.firstName} ${customer.lastName}`}</div>
                                  <div className="text-sm text-gray-500">Joined {formatDate(customer.createdAt)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-600">
                                  <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 mr-2" />
                                  {customer.email}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <FontAwesomeIcon icon={faPhone} className="h-4 w-4 mr-2" />
                                  {customer.phoneNumber || customer.phone}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center text-sm text-gray-900">
                                <FontAwesomeIcon icon={faShoppingBag} className="h-4 w-4 mr-2" />
                                <span className="font-bold text-blue-600">{customer.totalOrders}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-bold text-lg text-grub-red">
                                ${customer.totalSpent?.toFixed(2) || '0.00'}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center text-sm text-gray-600">
                                <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 mr-2" />
                                {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'No orders'}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-medium text-green-600">
                                ${customer.averageOrderValue?.toFixed(2) || '0.00'}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                                {customer.status}
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

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredCustomers.map((customer) => (
              <Card key={customer._id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-grub-red rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {customer.fullName?.charAt(0) || customer.firstName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{customer.fullName || `${customer.firstName} ${customer.lastName}`}</div>
                          <div className="text-xs text-gray-500">Joined {formatDate(customer.createdAt)}</div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="break-all">{customer.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FontAwesomeIcon icon={faPhone} className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{customer.phoneNumber || customer.phone}</span>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <FontAwesomeIcon icon={faShoppingBag} className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="font-bold text-gray-900">{customer.totalOrders}</div>
                        <div className="text-xs text-gray-500">Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <FontAwesomeIcon icon={faDollarSign} className="h-4 w-4 text-grub-red" />
                        </div>
                        <div className="font-bold text-grub-red">${customer.totalSpent?.toFixed(0) || '0'}</div>
                        <div className="text-xs text-gray-500">Spent</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="font-medium text-gray-900 text-xs">
                          {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'No orders'}
                        </div>
                        <div className="text-xs text-gray-500">Last Order</div>
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

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} customers
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrev || loading}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm bg-grub-red text-white rounded">
                  {pagination.page}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNext || loading}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomersPage;





