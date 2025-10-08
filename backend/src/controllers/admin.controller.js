// FILE: src/controllers/admin.controller.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

/**
 * Get customers for a specific restaurant with their analytics
 * @route GET /api/v1/admin/restaurants/:restaurantId/customers
 */
const getRestaurantCustomers = async (req, res) => {
  try {
    let { restaurantId } = req.params;
    const { page = 1, limit = 10, search = '', status = '' } = req.query;

    // If no restaurantId provided and user is a partner, use their restaurant
    if (!restaurantId && req.user && req.user.roles.includes('partner')) {
      restaurantId = req.user.restaurantId;
    }

    // Validate restaurantId
    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid restaurant ID or no restaurant associated with your account'
      });
    }

    // For partner users, ensure they can only access their own restaurant data
    if (req.user && req.user.roles.includes('partner') && !req.user.roles.includes('admin')) {
      if (req.user.restaurantId?.toString() !== restaurantId.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. You can only view customers for your own restaurant.'
        });
      }
    }

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Add status filter if provided
    if (status) {
      searchQuery.status = status;
    }

    const customers = await User.aggregate([
      // Match users with search criteria
      { $match: { roles: { $in: ['customer'] }, ...searchQuery } },
      
      // Lookup orders for this specific restaurant
      {
        $lookup: {
          from: 'orders',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$customerId', '$$userId'] },
                    { $eq: ['$restaurantId', new mongoose.Types.ObjectId(restaurantId)] },
                    { $eq: ['$paymentStatus', 'paid'] }
                  ]
                }
              }
            },
            { $sort: { createdAt: -1 } }
          ],
          as: 'restaurantOrders'
        }
      },
      
      // Only include customers who have ordered from this restaurant
      {
        $match: {
          'restaurantOrders.0': { $exists: true }
        }
      },
      
      // Calculate restaurant-specific analytics
      {
        $addFields: {
          totalOrders: { $size: '$restaurantOrders' },
          totalSpent: { 
            $round: [{ $sum: '$restaurantOrders.total' }, 2]
          },
          averageOrderValue: { 
            $round: [{ $avg: '$restaurantOrders.total' }, 2]
          },
          lastOrderDate: { $max: '$restaurantOrders.createdAt' },
          firstOrderDate: { $min: '$restaurantOrders.createdAt' },
          // Get recent orders for additional context
          recentOrders: {
            $slice: ['$restaurantOrders', 3]
          }
        }
      },
      
      // Clean up sensitive fields
      {
        $project: {
          restaurantOrders: 0,
          passwordHash: 0,
          emailVerificationToken: 0,
          passwordResetToken: 0,
          passwordResetExpires: 0
        }
      },
      
      // Sort by total spent (highest spenders first)
      { $sort: { totalSpent: -1 } }
    ]);

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCustomers = customers.slice(startIndex, endIndex);

    // Get restaurant information
    const restaurant = await Restaurant.findById(restaurantId).select('name description cuisine');
    if (!restaurant) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurant not found'
      });
    }

    // Calculate summary statistics
    const summary = {
      totalCustomers: customers.length,
      totalRevenue: customers.reduce((sum, customer) => sum + customer.totalSpent, 0),
      totalOrders: customers.reduce((sum, customer) => sum + customer.totalOrders, 0),
      averageCustomerValue: customers.length > 0 
        ? Math.round((customers.reduce((sum, customer) => sum + customer.totalSpent, 0) / customers.length) * 100) / 100
        : 0
    };

    res.json({
      status: 'success',
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          description: restaurant.description,
          cuisine: restaurant.cuisine
        },
        customers: paginatedCustomers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: customers.length,
          pages: Math.ceil(customers.length / limit),
          hasNext: endIndex < customers.length,
          hasPrev: startIndex > 0
        },
        summary
      }
    });

  } catch (error) {
    console.error('Error fetching restaurant customers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * Get detailed analytics for a specific customer at a specific restaurant
 * @route GET /api/v1/admin/restaurants/:restaurantId/customers/:customerId
 */
const getCustomerRestaurantAnalytics = async (req, res) => {
  try {
    const { restaurantId, customerId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid restaurant or customer ID'
      });
    }

    const analytics = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(customerId) } },
      
      // Lookup orders for this restaurant
      {
        $lookup: {
          from: 'orders',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$customerId', '$$userId'] },
                    { $eq: ['$restaurantId', new mongoose.Types.ObjectId(restaurantId)] }
                  ]
                }
              }
            },
            { $sort: { createdAt: -1 } }
          ],
          as: 'orders'
        }
      },
      
      // Lookup restaurant info
      {
        $lookup: {
          from: 'restaurants',
          localField: '_id',
          foreignField: '_id',
          pipeline: [
            { $match: { _id: new mongoose.Types.ObjectId(restaurantId) } }
          ],
          as: 'restaurant'
        }
      },
      
      // Calculate detailed analytics
      {
        $addFields: {
          restaurant: { $arrayElemAt: ['$restaurant', 0] },
          totalOrders: { $size: '$orders' },
          paidOrders: {
            $size: {
              $filter: {
                input: '$orders',
                cond: { $eq: ['$$this.paymentStatus', 'paid'] }
              }
            }
          },
          totalSpent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$orders',
                    cond: { $eq: ['$$this.paymentStatus', 'paid'] }
                  }
                },
                as: 'order',
                in: '$$order.total'
              }
            }
          },
          averageOrderValue: {
            $avg: {
              $map: {
                input: {
                  $filter: {
                    input: '$orders',
                    cond: { $eq: ['$$this.paymentStatus', 'paid'] }
                  }
                },
                as: 'order',
                in: '$$order.total'
              }
            }
          },
          lastOrderDate: { $max: '$orders.createdAt' },
          firstOrderDate: { $min: '$orders.createdAt' },
          cancelledOrders: {
            $size: {
              $filter: {
                input: '$orders',
                cond: { $eq: ['$$this.status', 'cancelled'] }
              }
            }
          }
        }
      },
      
      // Clean up
      {
        $project: {
          passwordHash: 0,
          emailVerificationToken: 0,
          passwordResetToken: 0
        }
      }
    ]);

    if (analytics.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer not found or has no orders at this restaurant'
      });
    }

    res.json({
      status: 'success',
      data: analytics[0]
    });

  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * Get all customers across all restaurants (admin overview)
 * @route GET /api/v1/admin/customers
 */
const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;

    // Build search query
    let searchQuery = { roles: { $in: ['customer'] } };
    
    if (search) {
      searchQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      searchQuery.status = status;
    }

    const customers = await User.aggregate([
      { $match: searchQuery },
      
      // Lookup all orders for each customer
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'customerId',
          as: 'allOrders'
        }
      },
      
      // Calculate overall analytics
      {
        $addFields: {
          totalOrders: { $size: '$allOrders' },
          totalSpent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$allOrders',
                    cond: { $eq: ['$$this.paymentStatus', 'paid'] }
                  }
                },
                as: 'order',
                in: '$$order.total'
              }
            }
          },
          lastOrderDate: { $max: '$allOrders.createdAt' },
          uniqueRestaurants: {
            $size: {
              $setUnion: ['$allOrders.restaurantId', []]
            }
          }
        }
      },
      
      // Clean up
      {
        $project: {
          allOrders: 0,
          passwordHash: 0,
          emailVerificationToken: 0,
          passwordResetToken: 0
        }
      },
      
      // Sort by registration date
      { $sort: { createdAt: -1 } }
    ]);

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCustomers = customers.slice(startIndex, endIndex);

    // Calculate summary
    const summary = {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.status === 'active').length,
      totalRevenue: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
      totalOrders: customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0)
    };

    res.json({
      status: 'success',
      data: {
        customers: paginatedCustomers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: customers.length,
          pages: Math.ceil(customers.length / limit)
        },
        summary
      }
    });

  } catch (error) {
    console.error('Error fetching all customers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

module.exports = {
  getRestaurantCustomers,
  getCustomerRestaurantAnalytics,
  getAllCustomers
};
