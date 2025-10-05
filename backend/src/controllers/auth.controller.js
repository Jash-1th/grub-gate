// FILE: src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const { 
  successResponse, 
  errorResponse, 
  createdResponse,
  unauthorizedResponse,
  notFoundResponse,
  conflictResponse
} = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Register user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, role = 'customer' } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return conflictResponse(res, 'User with this email already exists');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    passwordHash: password, // Will be hashed by pre-save middleware
    phone,
    role
  });

  // Generate email verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save();

  // Generate JWT tokens
  const tokens = generateTokenPair(user._id, user.role);

  // Remove password from response
  user.passwordHash = undefined;

  // TODO: Send verification email
  // await sendVerificationEmail(user.email, verificationToken);

  createdResponse(res, {
    user,
    ...tokens,
    message: 'Registration successful. Please check your email to verify your account.'
  }, 'User registered successfully');
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists and get password
  const user = await User.findOne({ email }).select('+passwordHash');
  
  if (!user) {
    return unauthorizedResponse(res, 'Invalid email or password');
  }

  // Check if password matches
  const isPasswordMatch = await user.matchPassword(password);
  
  if (!isPasswordMatch) {
    return unauthorizedResponse(res, 'Invalid email or password');
  }

  // Check if user is active
  if (user.status !== 'active') {
    return unauthorizedResponse(res, 'Your account has been deactivated. Please contact support.');
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate JWT tokens
  const tokens = generateTokenPair(user._id, user.role);

  // Remove password from response
  user.passwordHash = undefined;

  successResponse(res, {
    user,
    ...tokens
  }, 'Login successful');
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // In a production app, you might want to blacklist the token
  // For now, we'll just send a success response
  successResponse(res, null, 'Logout successful');
});

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('addresses');
  successResponse(res, { user }, 'User profile retrieved successfully');
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return unauthorizedResponse(res, 'Refresh token is required');
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Get user
    const user = await User.findById(decoded.id);
    if (!user || user.status !== 'active') {
      return unauthorizedResponse(res, 'Invalid refresh token');
    }

    // Generate new token pair
    const tokens = generateTokenPair(user._id, user.role);

    successResponse(res, tokens, 'Token refreshed successfully');
  } catch (error) {
    return unauthorizedResponse(res, 'Invalid refresh token');
  }
});

/**
 * @desc    Verify email
 * @route   POST /api/v1/auth/verify-email
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return errorResponse(res, 'Verification token is required', 400);
  }

  // Hash the token to match stored version
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with matching token
  const user = await User.findOne({
    emailVerificationToken: hashedToken
  });

  if (!user) {
    return errorResponse(res, 'Invalid or expired verification token', 400);
  }

  // Update user
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  successResponse(res, null, 'Email verified successfully');
});

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return notFoundResponse(res, 'No user found with this email address');
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save();

  // TODO: Send reset password email
  // await sendPasswordResetEmail(user.email, resetToken);

  successResponse(res, null, 'Password reset email sent');
});

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Hash the token to match stored version
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with matching token and check if token is not expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return errorResponse(res, 'Invalid or expired reset token', 400);
  }

  // Set new password
  user.passwordHash = password; // Will be hashed by pre-save middleware
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Generate new JWT tokens
  const tokens = generateTokenPair(user._id, user.role);

  successResponse(res, tokens, 'Password reset successful');
});

/**
 * @desc    Change password
 * @route   POST /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+passwordHash');

  // Check current password
  const isCurrentPasswordCorrect = await user.matchPassword(currentPassword);
  if (!isCurrentPasswordCorrect) {
    return unauthorizedResponse(res, 'Current password is incorrect');
  }

  // Set new password
  user.passwordHash = newPassword; // Will be hashed by pre-save middleware
  await user.save();

  successResponse(res, null, 'Password changed successfully');
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword
};
