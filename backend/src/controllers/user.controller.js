// FILE: src/controllers/user.controller.js
const User = require('../models/User');
const { 
  successResponse, 
  errorResponse, 
  notFoundResponse,
  conflictResponse
} = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Get user profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  successResponse(res, { user }, 'Profile retrieved successfully');
});

/**
 * @desc    Update user profile
 * @route   PATCH /api/v1/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'firstName', 
    'lastName', 
    'phone', 
    'preferences'
  ];
  
  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  successResponse(res, { user }, 'Profile updated successfully');
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/v1/users/account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  // Soft delete - change status to inactive
  user.status = 'inactive';
  await user.save();

  // TODO: Cancel active subscriptions, orders, etc.

  successResponse(res, null, 'Account deactivated successfully');
});

/**
 * @desc    Get user addresses
 * @route   GET /api/v1/users/addresses
 * @access  Private
 */
const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  successResponse(res, { addresses: user.addresses }, 'Addresses retrieved successfully');
});

/**
 * @desc    Add new address
 * @route   POST /api/v1/users/addresses
 * @access  Private
 */
const addAddress = asyncHandler(async (req, res) => {
  const { label, street, city, province, postalCode, instructions, isDefault } = req.body;

  const user = await User.findById(req.user._id);
  
  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  await user.addAddress({
    label,
    street,
    city,
    province,
    postalCode,
    instructions,
    isDefault
  });

  successResponse(res, { addresses: user.addresses }, 'Address added successfully');
});

/**
 * @desc    Update address
 * @route   PATCH /api/v1/users/addresses/:id
 * @access  Private
 */
const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const user = await User.findById(req.user._id);
  
  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  try {
    await user.updateAddress(id, updates);
    successResponse(res, { addresses: user.addresses }, 'Address updated successfully');
  } catch (error) {
    return notFoundResponse(res, 'Address not found');
  }
});

/**
 * @desc    Delete address
 * @route   DELETE /api/v1/users/addresses/:id
 * @access  Private
 */
const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(req.user._id);
  
  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  const address = user.addresses.id(id);
  if (!address) {
    return notFoundResponse(res, 'Address not found');
  }

  await user.removeAddress(id);
  successResponse(res, { addresses: user.addresses }, 'Address deleted successfully');
});

/**
 * @desc    Set default address
 * @route   PATCH /api/v1/users/addresses/:id/default
 * @access  Private
 */
const setDefaultAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(req.user._id);
  
  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  const address = user.addresses.id(id);
  if (!address) {
    return notFoundResponse(res, 'Address not found');
  }

  try {
    await user.updateAddress(id, { isDefault: true });
    successResponse(res, { addresses: user.addresses }, 'Default address updated successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to update default address', 500);
  }
});

/**
 * @desc    Get user statistics (for admin)
 * @route   GET /api/v1/users/stats
 * @access  Private (Admin only)
 */
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        customers: {
          $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] }
        },
        partners: {
          $sum: { $cond: [{ $eq: ['$role', 'partner'] }, 1, 0] }
        },
        verifiedUsers: {
          $sum: { $cond: ['$emailVerified', 1, 0] }
        }
      }
    }
  ]);

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select('firstName lastName email role createdAt status');

  successResponse(res, {
    stats: stats[0] || {},
    recentUsers
  }, 'User statistics retrieved successfully');
});

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserStats
};
