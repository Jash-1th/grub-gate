// FILE: src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const OTP = require('../models/OTP');
const { generateTokenPair, generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const smsService = require('../services/smsService');
const emailService = require('../services/emailService');
const { getFileUrls } = require('../middlewares/upload');
const { uploadToCloudinary } = require('../config/cloudinary');
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
  const { firstName, lastName, email, password, phone, phoneNumber, role = 'customer' } = req.body;

  console.log('🔍 Register endpoint received:', { firstName, lastName, email, phone, phoneNumber, role });
  console.log('🔍 Final phoneNumber value:', phoneNumber || phone);

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return conflictResponse(res, 'User with this email already exists');
  }

  // Create user
  const userData = {
    firstName,
    lastName,
    email,
    passwordHash: password, // Will be hashed by pre-save middleware
    phoneNumber: phoneNumber || phone, // Support both field names
    roles: [role] // Convert single role to roles array as expected by User model
  };
  
  console.log('🔍 User data being created:', userData);
  
  const user = await User.create(userData);

  // Generate email verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save();

  // Generate JWT tokens
  const tokens = generateTokenPair(user._id, user.roles || [user.role]);

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
 * @desc    Login user with email/phone + password (no OTP)
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return errorResponse(res, 'Email/phone and password are required', 400);
  }

  // Determine if identifier is email or phone
  const isEmail = emailService.validateEmail(identifier);
  const isPhone = smsService.validatePhoneNumber(identifier);

  if (!isEmail && !isPhone) {
    return errorResponse(res, 'Please provide a valid email address or phone number', 400);
  }

  // Format identifier
  let formattedIdentifier = identifier.toLowerCase().trim();
  if (isPhone) {
    formattedIdentifier = smsService.formatPhoneNumber(identifier);
  }

  // Find user by email or phone
  const searchQuery = isEmail 
    ? { email: formattedIdentifier }
    : { phoneNumber: formattedIdentifier };
  
  const user = await User.findOne(searchQuery).select('+passwordHash');
  
  if (!user) {
    return unauthorizedResponse(res, 'Invalid credentials');
  }

  // Check if user has a password (some users might be OTP-only)
  if (!user.passwordHash) {
    return errorResponse(res, 'Please use OTP login for this account', 400);
  }

  // Check if password matches
  const isPasswordMatch = await user.matchPassword(password);
  
  if (!isPasswordMatch) {
    return unauthorizedResponse(res, 'Invalid credentials');
  }

  // Check if user is active
  if (user.status !== 'active') {
    return unauthorizedResponse(res, 'Your account has been deactivated. Please contact support.');
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate JWT tokens
  const tokens = generateTokenPair(user._id, user.roles || [user.role]);

  // Remove password from response
  user.passwordHash = undefined;

  successResponse(res, {
    user: {
      _id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      role: user.role, // Legacy field
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified
    },
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
    const tokens = generateTokenPair(user._id, user.roles || [user.role]);

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
  const tokens = generateTokenPair(user._id, user.roles || [user.role]);

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

/**
 * @desc    Request OTP - checks user existence and determines flow
 * @route   POST /api/v1/auth/otp/request
 * @access  Public
 */
const requestOTP = asyncHandler(async (req, res) => {
  const { identifier, channel } = req.body;

  // Validate input
  if (!identifier || !channel) {
    return errorResponse(res, 'Identifier and channel are required', 400);
  }

  // Determine if identifier is email or phone
  const isEmail = emailService.validateEmail(identifier);
  const isPhone = smsService.validatePhoneNumber(identifier);

  if (!isEmail && !isPhone) {
    return errorResponse(res, 'Please provide a valid email address or phone number', 400);
  }

  // Validate channel matches identifier type
  if (isEmail && channel !== 'email') {
    return errorResponse(res, 'Email address requires email channel', 400);
  }
  if (isPhone && channel !== 'sms') {
    return errorResponse(res, 'Phone number requires SMS channel', 400);
  }

  // Format phone number if needed
  let formattedIdentifier = identifier.toLowerCase().trim();
  if (isPhone) {
    formattedIdentifier = smsService.formatPhoneNumber(identifier);
  }

  try {
    // Check if user already exists
    const isEmailIdentifier = emailService.validateEmail(formattedIdentifier);
    const searchQuery = isEmailIdentifier 
      ? { email: formattedIdentifier }
      : { phoneNumber: formattedIdentifier };
    
    const existingUser = await User.findOne(searchQuery);
    
    if (existingUser) {
      // User exists - this should be a login flow
      return errorResponse(res, 
        'An account with this email/phone already exists. Please use the login option instead.', 
        409 // Conflict status code
      );
    }

    // User doesn't exist - proceed with signup OTP
    // Generate OTP
    const { otp } = await OTP.generateOTP(formattedIdentifier);

    // Send OTP based on channel
    let sendResult;
    if (channel === 'email') {
      sendResult = await emailService.sendOTP(formattedIdentifier, otp);
    } else if (channel === 'sms') {
      sendResult = await smsService.sendOTP(formattedIdentifier, otp);
    }

    if (!sendResult.success) {
      return errorResponse(res, `Failed to send OTP: ${sendResult.message}`, 500);
    }

    successResponse(res, {
      identifier: formattedIdentifier,
      channel,
      expiresIn: 300, // 5 minutes
      userExists: false // Explicitly indicate this is a new user signup
    }, 'OTP sent successfully for signup');

  } catch (error) {
    console.error('Request OTP Error:', error);
    return errorResponse(res, 'Failed to send OTP. Please try again.', 500);
  }
});

/**
 * @desc    Request OTP for existing user login
 * @route   POST /api/v1/auth/otp/login-request
 * @access  Public
 */
const requestLoginOTP = asyncHandler(async (req, res) => {
  const { identifier, channel } = req.body;

  // Validate input
  if (!identifier || !channel) {
    return errorResponse(res, 'Identifier and channel are required', 400);
  }

  // Determine if identifier is email or phone
  const isEmail = emailService.validateEmail(identifier);
  const isPhone = smsService.validatePhoneNumber(identifier);

  if (!isEmail && !isPhone) {
    return errorResponse(res, 'Please provide a valid email address or phone number', 400);
  }

  // Format phone number if needed
  let formattedIdentifier = identifier.toLowerCase().trim();
  if (isPhone) {
    formattedIdentifier = smsService.formatPhoneNumber(identifier);
  }

  try {
    // Check if user exists (required for login)
    const isEmailIdentifier = emailService.validateEmail(formattedIdentifier);
    const searchQuery = isEmailIdentifier 
      ? { email: formattedIdentifier }
      : { phoneNumber: formattedIdentifier };
    
    const existingUser = await User.findOne(searchQuery);
    
    if (!existingUser) {
      return errorResponse(res, 
        'No account found with this email/phone. Please sign up first.', 
        404
      );
    }

    // Check if user is active
    if (existingUser.status !== 'active') {
      return errorResponse(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    // Generate OTP for login
    const { otp } = await OTP.generateOTP(formattedIdentifier);

    // Send OTP based on channel
    let sendResult;
    if (channel === 'email') {
      sendResult = await emailService.sendOTP(formattedIdentifier, otp);
    } else if (channel === 'sms') {
      sendResult = await smsService.sendOTP(formattedIdentifier, otp);
    }

    if (!sendResult.success) {
      return errorResponse(res, `Failed to send OTP: ${sendResult.message}`, 500);
    }

    successResponse(res, {
      identifier: formattedIdentifier,
      channel,
      expiresIn: 300, // 5 minutes
      userExists: true // Explicitly indicate this is an existing user login
    }, 'OTP sent successfully for login');

  } catch (error) {
    console.error('Request Login OTP Error:', error);
    return errorResponse(res, 'Failed to send OTP. Please try again.', 500);
  }
});

/**
 * @desc    Verify OTP for existing user login
 * @route   POST /api/v1/auth/otp/login-verify
 * @access  Public
 */
const verifyLoginOTP = asyncHandler(async (req, res) => {
  const { identifier, otp } = req.body;

  // Validate input
  if (!identifier || !otp) {
    return errorResponse(res, 'Identifier and OTP are required', 400);
  }

  // Format identifier
  let formattedIdentifier = identifier.toLowerCase().trim();
  const isPhone = smsService.validatePhoneNumber(identifier);
  if (isPhone) {
    formattedIdentifier = smsService.formatPhoneNumber(identifier);
  }

  try {
    // Verify OTP first
    const otpResult = await OTP.verifyOTP(formattedIdentifier, otp);
    
    if (!otpResult.success) {
      return errorResponse(res, otpResult.message, 400);
    }

    // Find user
    const isEmail = emailService.validateEmail(formattedIdentifier);
    const searchQuery = isEmail 
      ? { email: formattedIdentifier }
      : { phoneNumber: formattedIdentifier };
    
    const user = await User.findOne(searchQuery);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Check if user is active
    if (user.status !== 'active') {
      return errorResponse(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT tokens
    const tokens = generateTokenPair(user._id, user.roles || [user.role]);

    successResponse(res, {
      user: {
        _id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        role: user.role, // Legacy field
        status: user.status,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified
      },
      ...tokens
    }, 'Login successful');

  } catch (error) {
    console.error('Verify Login OTP Error:', error);
    return errorResponse(res, 'Failed to verify OTP. Please try again.', 500);
  }
});

/**
 * @desc    Verify OTP and create new user account (signup only)
 * @route   POST /api/v1/auth/otp/verify
 * @access  Public
 */
const verifyOTP = asyncHandler(async (req, res) => {
  const { 
    identifier, 
    otp, 
    firstName, 
    lastName, 
    username, 
    phoneNumber, 
    email, 
    password, 
    userType,
    restaurantDetails 
  } = req.body;
  const finalUserType = userType || 'customer'; // Default to customer if not specified

  // Validate input
  if (!identifier || !otp) {
    return errorResponse(res, 'Identifier and OTP are required', 400);
  }

  // Customer app always creates customer accounts - no validation needed

  // Format identifier
  let formattedIdentifier = identifier.toLowerCase().trim();
  const isPhone = smsService.validatePhoneNumber(identifier);
  if (isPhone) {
    formattedIdentifier = smsService.formatPhoneNumber(identifier);
  }

  try {
    // Verify OTP first
    const otpResult = await OTP.verifyOTP(formattedIdentifier, otp);
    
    if (!otpResult.success) {
      return errorResponse(res, otpResult.message, 400);
    }

    console.log('✅ OTP verification successful!');

    // Check if user exists
    const isEmail = emailService.validateEmail(formattedIdentifier);
    const searchQuery = isEmail 
      ? { email: formattedIdentifier }
      : { phoneNumber: formattedIdentifier };
    
    let user = await User.findOne(searchQuery);

    if (user) {
      // User already exists - check if they want to add a new role
      const requestedRole = finalUserType;
      
      if (user.roles && user.roles.includes(requestedRole)) {
        // User already has this role
        return errorResponse(res, `You already have a ${requestedRole} account. Please use password login instead.`, 409);
      } else {
        // User exists but doesn't have this role - ADD THE ROLE (OTP already verified above)
        console.log(`🔄 Adding ${requestedRole} role to existing user:`, user.email || user.phoneNumber);
        
        // Add the new role to existing user
        if (!user.roles.includes(requestedRole)) {
          user.roles.push(requestedRole);
        }
        
        // Update legacy role field for backward compatibility
        if (requestedRole === 'partner') {
          user.role = 'partner'; // Partners get priority in legacy field
          
          // Add restaurant details if provided
          if (restaurantDetails) {
            user.restaurantDetails = restaurantDetails;
          }
        }
        
        // Save the updated user
        await user.save();
        
        // Generate JWT with updated roles
        const token = jwt.sign(
          { 
            userId: user._id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            roles: user.roles,
            role: user.role // Legacy field
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        
        // Return success with updated user data
        return successResponse(res, {
          message: `${requestedRole.charAt(0).toUpperCase() + requestedRole.slice(1)} role added successfully! You can now access both customer and partner features.`,
          accessToken: token,
          user: {
            id: user._id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            roles: user.roles,
            role: user.role, // Legacy field
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
            status: user.status
          }
        }, 200);
      }
    } else {
      // User doesn't exist - SIGNUP FLOW
      
      // For signup, we need first and last name, and password
      if (!firstName || !lastName) {
        return errorResponse(res, 'First name and last name are required for new accounts', 400);
      }
      
      if (!password) {
        return errorResponse(res, 'Password is required for new accounts', 400);
      }

      // Create new user
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        roles: [finalUserType],
        status: 'active'
      };
      
      // Add username if provided
      if (username) {
        userData.username = username.trim();
      }
      
      // Add password if provided
      if (password) {
        userData.passwordHash = password; // Will be hashed by pre-save middleware
      }
      
      // Add restaurant details if user is partner
      if (finalUserType === 'partner' && restaurantDetails) {
        userData.restaurantDetails = restaurantDetails;
      }

      // Set email and phone based on what's verified and what's provided
      if (isEmail) {
        // Identifier is email (verified)
        userData.email = formattedIdentifier;
        userData.emailVerified = true;
        
        // Add phone number if provided in signup form
        if (phoneNumber) {
          userData.phoneNumber = smsService.formatPhoneNumber(phoneNumber);
          userData.phoneVerified = false; // Not verified yet
        }
      } else {
        // Identifier is phone (verified)
        userData.phoneNumber = formattedIdentifier;
        userData.phoneVerified = true;
        
        // Add email if provided in signup form
        if (email) {
          userData.email = email.toLowerCase().trim();
          userData.emailVerified = false; // Not verified yet
        }
      }

      user = await User.create(userData);

      // Generate JWT tokens
      const tokens = generateTokenPair(user._id, user.roles);

      createdResponse(res, {
        user: {
          _id: user._id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          roles: user.roles,
          role: user.role, // Legacy field
          status: user.status,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified
        },
        ...tokens
      }, 'Account created and login successful');
    }

  } catch (error) {
    console.error('Verify OTP Error:', error);
    return errorResponse(res, 'Failed to verify OTP. Please try again.', 500);
  }
});


/**
 * @desc    Register partner with restaurant details
 * @route   POST /api/v1/auth/register-partner
 * @access  Public
 */
const registerPartner = asyncHandler(async (req, res) => {
  const {
    // User details
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    
    // Restaurant details
    restaurantName,
    description,
    cuisine,
    businessType,
    cuisineType,
    
    // Address
    street,
    city,
    province,
    postalCode,
    
    // Contact details
    businessPhone,
    businessEmail,
    website,
    
    // Operating hours
    operatingHours,
    
    // Delivery settings
    deliveryRadius,
    deliveryFee,
    minOrderAmount,
    avgDeliveryTime,
    
    // Business info
    businessLicense,
    taxId
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [
      { email: email?.toLowerCase() },
      { phoneNumber }
    ]
  });
  
  if (existingUser) {
    return conflictResponse(res, 'User with this email or phone number already exists');
  }

  // Check if restaurant name already exists
  const existingRestaurant = await Restaurant.findOne({ 
    name: { $regex: new RegExp(`^${restaurantName}$`, 'i') }
  });
  
  if (existingRestaurant) {
    return conflictResponse(res, 'Restaurant with this name already exists');
  }

  try {
    // Get file URLs if files were uploaded
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrls = req.files ? getFileUrls(req.files, baseUrl) : {};

    // Create user with partner role
    const user = await User.create({
      firstName,
      lastName,
      email: email?.toLowerCase(),
      phoneNumber,
      passwordHash: password, // Will be hashed by pre-save middleware
      roles: ['partner'],
      role: 'partner', // Legacy field
      status: 'active',
      emailVerified: false,
      phoneVerified: false,
      
      // Store restaurant details in user document
      restaurantDetails: {
        restaurantName,
        businessType,
        cuisineType: Array.isArray(cuisineType) ? cuisineType : [cuisineType],
        businessAddress: {
          street,
          city,
          province,
          postalCode
        },
        businessPhone,
        businessEmail,
        website,
        description,
        operatingHours,
        hasDelivery: true,
        deliveryRadius: parseFloat(deliveryRadius) || 5,
        businessLicense: fileUrls.businessLicense || businessLicense,
        taxId
      }
    });

    // Create restaurant document
    const restaurant = await Restaurant.create({
      name: restaurantName,
      description,
      cuisine,
      ownerId: user._id,
      address: {
        street,
        city,
        province,
        postalCode
      },
      phone: businessPhone,
      email: businessEmail || email,
      website,
      logo: fileUrls.logo,
      images: fileUrls.images || [],
      operatingHours: operatingHours || {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '22:00', closed: false },
        saturday: { open: '09:00', close: '22:00', closed: false },
        sunday: { open: '09:00', close: '22:00', closed: false }
      },
      deliverySettings: {
        radius: parseFloat(deliveryRadius) || 5,
        fee: parseFloat(deliveryFee) || 0,
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        avgDeliveryTime: parseInt(avgDeliveryTime) || 30
      },
      status: 'pending' // Requires admin approval
    });

    // Generate JWT tokens
    const tokens = generateTokenPair(user._id, user.roles);

    // Remove password from response
    user.passwordHash = undefined;

    createdResponse(res, {
      user: {
        _id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        role: user.role,
        status: user.status,
        restaurantDetails: user.restaurantDetails
      },
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        status: restaurant.status,
        cuisine: restaurant.cuisine
      },
      ...tokens
    }, 'Partner registration successful. Your restaurant is pending approval.');

  } catch (error) {
    console.error('Partner registration error:', error);
    return errorResponse(res, 'Registration failed. Please try again.', 500);
  }
});

/**
 * @desc    Request OTP for Partner Signup - Step 1
 * @route   POST /api/v1/auth/partner/otp/request
 * @access  Public
 */
const requestPartnerOTP = asyncHandler(async (req, res) => {
  const { identifier, channel } = req.body;

  // Validate input
  if (!identifier || !channel) {
    return errorResponse(res, 'Identifier and channel are required', 400);
  }

  // Determine if identifier is email or phone
  const isEmail = emailService.validateEmail(identifier);
  const isPhone = smsService.validatePhoneNumber(identifier);

  if (!isEmail && !isPhone) {
    return errorResponse(res, 'Please provide a valid email address or phone number', 400);
  }

  // Validate channel matches identifier type
  if (isEmail && channel !== 'email') {
    return errorResponse(res, 'Email address requires email channel', 400);
  }
  if (isPhone && channel !== 'sms') {
    return errorResponse(res, 'Phone number requires SMS channel', 400);
  }

  // Format phone number if needed
  let formattedIdentifier = identifier.toLowerCase().trim();
  if (isPhone) {
    formattedIdentifier = smsService.formatPhoneNumber(identifier);
  }

  try {
    // Check if user already exists with partner role
    const isEmailIdentifier = emailService.validateEmail(formattedIdentifier);
    const searchQuery = isEmailIdentifier 
      ? { email: formattedIdentifier }
      : { phoneNumber: formattedIdentifier };
    
    const existingUser = await User.findOne(searchQuery);
    
    if (existingUser && existingUser.roles && existingUser.roles.includes('partner')) {
      return errorResponse(res, 
        'A partner account with this email/phone already exists. Please use the login option instead.', 
        409
      );
    }

    // Generate OTP for partner signup
    const { otp } = await OTP.generateOTP(formattedIdentifier);

    // Send OTP based on channel
    let sendResult;
    if (channel === 'email') {
      sendResult = await emailService.sendOTP(formattedIdentifier, otp, {
        subject: 'GrubGate Partner Registration - Verify Your Account',
        template: 'partner-signup'
      });
    } else if (channel === 'sms') {
      sendResult = await smsService.sendOTP(formattedIdentifier, otp, {
        message: `Your GrubGate Partner signup verification code is: ${otp}. Valid for 5 minutes.`
      });
    }

    if (!sendResult.success) {
      return errorResponse(res, `Failed to send OTP: ${sendResult.message}`, 500);
    }

    successResponse(res, {
      identifier: formattedIdentifier,
      channel,
      expiresIn: 300, // 5 minutes
      userExists: !!existingUser, // Indicate if user exists (for role addition)
      message: 'OTP sent successfully for partner registration'
    }, 'Partner signup OTP sent successfully');

  } catch (error) {
    console.error('Request Partner OTP Error:', error);
    return errorResponse(res, 'Failed to send OTP. Please try again.', 500);
  }
});

/**
 * @desc    Verify OTP and Complete Partner Registration - Step 2
 * @route   POST /api/v1/auth/partner/otp/verify
 * @access  Public
 */
const verifyPartnerOTP = asyncHandler(async (req, res) => {
  const { 
    // OTP verification fields (OTP already verified, but need identifier for user lookup)
    identifier,
    otp,
    verifyOnly,
    skipOtpVerification,
    otpVerificationToken,
    
    // User details
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    
    // Restaurant details
    restaurantName,
    description,
    cuisine,
    cuisineType,
    businessType,
    
    // Address
    street,
    city,
    province,
    postalCode,
    
    // Contact details
    businessPhone,
    businessEmail,
    website,
    
    // Operating hours (optional)
    operatingHours,
    
    // Delivery settings
    deliveryRadius,
    deliveryFee,
    minOrderAmount,
    avgDeliveryTime,
    
    // Business info
    businessLicenseText,
    taxId
  } = req.body;

  // Validate required fields
  if (!identifier) {
    return errorResponse(res, 'Identifier is required', 400);
  }
  
  // If not skipping OTP verification, OTP is required
  if (!skipOtpVerification && !otp) {
    return errorResponse(res, 'OTP is required', 400);
  }
  
  // If skipping OTP verification, verification token is required
  if (skipOtpVerification && !otpVerificationToken) {
    return errorResponse(res, 'Verification token is required when skipping OTP verification', 400);
  }

  // If verifyOnly flag is true, skip other validations
  if (!verifyOnly) {
    if (!firstName || !lastName) {
      return errorResponse(res, 'First name and last name are required', 400);
    }

    if (!restaurantName) {
      return errorResponse(res, 'Restaurant name is required', 400);
    }

    if (!password) {
      return errorResponse(res, 'Password is required', 400);
    }
  }

  // Format identifier
  let formattedIdentifier = identifier.toLowerCase().trim();
  const isPhone = smsService.validatePhoneNumber(identifier);
  if (isPhone) {
    formattedIdentifier = smsService.formatPhoneNumber(identifier);
  }

  try {
    // Verify OTP first (unless skipOtpVerification flag is set)
    if (!skipOtpVerification) {
      const otpResult = await OTP.verifyOTP(formattedIdentifier, otp);
      
      if (!otpResult.success) {
        return errorResponse(res, otpResult.message, 400);
      }

      console.log('✅ Partner OTP verification successful!');

      // If verifyOnly flag is true, return success without completing signup
      if (verifyOnly) {
        return successResponse(res, {
          verificationToken: `verified_${formattedIdentifier}_${Date.now()}`,
          identifier: formattedIdentifier
        }, 'OTP verified successfully');
      }
    } else {
      console.log('⏭️ Skipping OTP verification (already verified in previous step)');
      
      // Basic validation of verification token format
      if (!otpVerificationToken.startsWith('verified_')) {
        return errorResponse(res, 'Invalid verification token format', 400);
      }
      
      // Extract identifier from token and validate it matches
      const tokenParts = otpVerificationToken.split('_');
      if (tokenParts.length < 3) {
        return errorResponse(res, 'Invalid verification token format', 400);
      }
      
      // Token should contain the identifier
      const tokenIdentifier = tokenParts.slice(1, -1).join('_'); // Everything between 'verified_' and timestamp
      if (tokenIdentifier !== formattedIdentifier) {
        return errorResponse(res, 'Verification token does not match identifier', 400);
      }
      
      console.log('✅ Verification token validated successfully');
    }

    // Check if restaurant name already exists
    const existingRestaurant = await Restaurant.findOne({ 
      name: { $regex: new RegExp(`^${restaurantName}$`, 'i') }
    });
    
    if (existingRestaurant) {
      return conflictResponse(res, 'Restaurant with this name already exists');
    }

    // Check if user exists
    const isEmail = emailService.validateEmail(formattedIdentifier);
    const searchQuery = isEmail 
      ? { email: formattedIdentifier }
      : { phoneNumber: formattedIdentifier };
    
    let user = await User.findOne(searchQuery);
    let isNewUser = false;

    // Handle file uploads to Cloudinary
    let fileUrls = {};
    if (req.files) {
      console.log('📁 Processing file uploads...');
      
      try {
        // Upload logo if provided
        if (req.files.logo && req.files.logo[0]) {
          console.log('🖼️ Uploading logo...');
          const logoFile = req.files.logo[0];
          
          // Validate logo file type
          const allowedLogoTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          if (!allowedLogoTypes.includes(logoFile.mimetype)) {
            console.error('❌ Invalid logo file type:', logoFile.mimetype);
            return errorResponse(res, `Invalid logo file type. Please upload an image file (JPEG, PNG, or WebP). Received: ${logoFile.originalname}`, 400);
          }
          
          const logoResult = await uploadToCloudinary(logoFile.buffer, {
            folder: 'grubgate/restaurants/logos',
            transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
            public_id: `logo_${restaurantName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}`
          });
          fileUrls.logo = logoResult.secure_url;
          console.log('✅ Logo uploaded:', logoResult.secure_url);
        }

        // Upload restaurant images if provided
        if (req.files.images && req.files.images.length > 0) {
          console.log(`🖼️ Uploading ${req.files.images.length} restaurant images...`);
          fileUrls.images = [];
          
          const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          
          for (let i = 0; i < req.files.images.length; i++) {
            const imageFile = req.files.images[i];
            
            // Validate image file type
            if (!allowedImageTypes.includes(imageFile.mimetype)) {
              console.error('❌ Invalid image file type:', imageFile.mimetype);
              return errorResponse(res, `Invalid image file type. Please upload image files (JPEG, PNG, or WebP). Invalid file: ${imageFile.originalname}`, 400);
            }
            
            const imageResult = await uploadToCloudinary(imageFile.buffer, {
              folder: 'grubgate/restaurants/images',
              transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }],
              public_id: `image_${restaurantName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${i}`
            });
            fileUrls.images.push(imageResult.secure_url);
          }
          console.log('✅ Restaurant images uploaded:', fileUrls.images.length);
        }

        // Upload business license if provided
        if (req.files.businessLicenseFile && req.files.businessLicenseFile[0]) {
          console.log('📄 Uploading business license...');
          const licenseFile = req.files.businessLicenseFile[0];
          
          // Validate business license file type (images and PDFs allowed)
          const allowedLicenseTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
          if (!allowedLicenseTypes.includes(licenseFile.mimetype)) {
            console.error('❌ Invalid business license file type:', licenseFile.mimetype);
            return errorResponse(res, `Invalid business license file type. Please upload an image (JPEG, PNG, WebP) or PDF file. Received: ${licenseFile.originalname}`, 400);
          }
          
          const licenseResult = await uploadToCloudinary(licenseFile.buffer, {
            folder: 'grubgate/restaurants/documents',
            resource_type: 'auto',
            public_id: `license_${restaurantName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}`
          });
          fileUrls.businessLicense = licenseResult.secure_url;
          console.log('✅ Business license uploaded:', licenseResult.secure_url);
        }
      } catch (uploadError) {
        console.error('❌ File upload error:', uploadError);
        return errorResponse(res, 'Failed to upload files. Please try again.', 500);
      }
    }

    // Create or update user first (needed for restaurant ownerId)
    if (!user) {
      // Create new user with partner role
      console.log('👤 Creating new partner user:', formattedIdentifier);
      isNewUser = true;
      
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        roles: ['partner'],
        status: 'active',
        passwordHash: password // Will be hashed by pre-save middleware
      };

      // Set email and phone based on verified identifier
      if (isEmail) {
        userData.email = formattedIdentifier;
        userData.emailVerified = true;
        
        // Add phone if provided
        if (phoneNumber) {
          userData.phoneNumber = smsService.formatPhoneNumber(phoneNumber);
          userData.phoneVerified = false;
        }
      } else {
        userData.phoneNumber = formattedIdentifier;
        userData.phoneVerified = true;
        
        // Add email if provided
        if (email) {
          userData.email = email.toLowerCase().trim();
          userData.emailVerified = false;
        }
      }

      user = await User.create(userData);
      console.log('✅ New partner user created:', user._id);
    } else {
      // User exists - add partner role
      console.log('🔄 Adding partner role to existing user:', user.email || user.phoneNumber);
      
      if (!user.roles.includes('partner')) {
        user.roles.push('partner');
      }
      
      await user.save();
    }

    // Now create restaurant document with valid ownerId
    console.log('🏪 Creating restaurant:', restaurantName);
    // Handle cuisine types - prioritize cuisineType array over single cuisine
    let cuisineArray = [];
    if (cuisineType && Array.isArray(cuisineType) && cuisineType.length > 0) {
      cuisineArray = cuisineType;
    } else if (cuisine) {
      cuisineArray = Array.isArray(cuisine) ? cuisine : [cuisine];
    } else {
      cuisineArray = ['Other']; // Default fallback
    }

    const restaurant = await Restaurant.create({
      name: restaurantName,
      description,
      cuisine: cuisineArray,
      businessType,
      ownerId: user._id, // Now we have a valid user ID
      address: {
        street,
        city,
        province,
        postalCode
      },
      phone: businessPhone,
      email: businessEmail || (user ? user.email : email),
      website,
      logo: fileUrls.logo,
      images: fileUrls.images || [],
      operatingHours: operatingHours || {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '22:00', closed: false },
        saturday: { open: '09:00', close: '22:00', closed: false },
        sunday: { open: '09:00', close: '22:00', closed: false }
      },
      deliverySettings: {
        radius: parseFloat(deliveryRadius) || 5,
        fee: parseFloat(deliveryFee) || 0,
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        avgDeliveryTime: parseInt(avgDeliveryTime) || 30
      },
      businessLicense: fileUrls.businessLicense || businessLicenseText,
      taxId,
      status: 'pending'
    });

    // Add restaurant reference to user (clean approach)
    user.restaurantId = restaurant._id;
    await user.save();
    console.log('✅ Restaurant created and linked to user:', restaurant._id);

    // Generate JWT tokens
    const tokens = generateTokenPair(user._id, user.roles);

    // Remove password from response
    user.passwordHash = undefined;

    const responseMessage = isNewUser 
      ? 'Partner account created successfully! Your restaurant is pending approval.'
      : 'Partner role added successfully! Your restaurant is pending approval.';

    createdResponse(res, {
      user: {
        _id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        restaurantId: user.restaurantId
      },
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        status: restaurant.status,
        cuisine: restaurant.cuisine,
        address: restaurant.address
      },
      ...tokens,
      isNewUser
    }, responseMessage);

  } catch (error) {
    console.error('Verify Partner OTP Error:', error);
    return errorResponse(res, 'Failed to complete partner registration. Please try again.', 500);
  }
});

/**
 * Complete Partner Billing Information - Stage 3
 * @desc    Complete partner registration with billing info, logo, and images
 * @route   POST /api/v1/auth/partner/complete-billing
 * @access  Public (with verification token)
 */
const completePartnerBilling = asyncHandler(async (req, res) => {
  const {
    identifier,
    otpVerificationToken,
    
    // Business billing info
    businessName,
    billingEmail,
    billingPhone,
    contactPerson,
    
    // Billing address
    billingStreet,
    billingCity,
    billingProvince,
    billingPostalCode,
    billingCountry = 'Canada',
    
    // Bank account info
    bankName,
    accountType,
    routingNumber,
    accountNumber,
    
    // Tax info
    businessNumber,
    gstHstNumber,
    
    // Payment method
    paymentMethod = 'bank_transfer'
  } = req.body;

  // Validate required fields
  if (!identifier || !otpVerificationToken) {
    return errorResponse(res, 'Identifier and verification token are required', 400);
  }

  if (!businessName || !billingEmail || !billingPhone) {
    return errorResponse(res, 'Business name, billing email, and billing phone are required', 400);
  }

  if (!billingStreet || !billingCity || !billingProvince || !billingPostalCode) {
    return errorResponse(res, 'Complete billing address is required', 400);
  }

  if (!bankName || !accountType || !routingNumber || !accountNumber) {
    return errorResponse(res, 'Complete bank account information is required', 400);
  }

  // Format identifier
  let formattedIdentifier = identifier.toLowerCase().trim();
  const isPhone = smsService.validatePhoneNumber(identifier);
  if (isPhone) {
    formattedIdentifier = smsService.formatPhoneNumber(identifier);
  }

  try {
    // Validate verification token
    if (!otpVerificationToken.startsWith('verified_')) {
      return errorResponse(res, 'Invalid verification token format', 400);
    }

    const tokenParts = otpVerificationToken.split('_');
    if (tokenParts.length < 3) {
      return errorResponse(res, 'Invalid verification token format', 400);
    }

    const tokenIdentifier = tokenParts.slice(1, -1).join('_');
    if (tokenIdentifier !== formattedIdentifier) {
      return errorResponse(res, 'Verification token does not match identifier', 400);
    }

    console.log('✅ Verification token validated for billing completion');

    // Find the user and restaurant
    const isEmail = emailService.validateEmail(formattedIdentifier);
    const searchQuery = isEmail 
      ? { email: formattedIdentifier }
      : { phoneNumber: formattedIdentifier };
    
    const user = await User.findOne(searchQuery);
    if (!user) {
      return errorResponse(res, 'User not found. Please complete basic registration first.', 404);
    }

    if (!user.restaurantId) {
      return errorResponse(res, 'Restaurant not found. Please complete basic registration first.', 404);
    }

    const restaurant = await Restaurant.findById(user.restaurantId);
    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found. Please complete basic registration first.', 404);
    }

    // Handle file uploads to Cloudinary
    let fileUrls = {};
    if (req.files) {
      console.log('📁 Processing file uploads for billing completion...');
      
      try {
        // Upload logo if provided
        if (req.files.logo && req.files.logo[0]) {
          console.log('🖼️ Uploading logo...');
          const logoFile = req.files.logo[0];
          
          const allowedLogoTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          if (!allowedLogoTypes.includes(logoFile.mimetype)) {
            return errorResponse(res, `Invalid logo file type. Please upload an image file (JPEG, PNG, or WebP).`, 400);
          }
          
          const logoResult = await uploadToCloudinary(logoFile.buffer, {
            folder: 'grubgate/restaurants/logos',
            transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
            public_id: `logo_${restaurant.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}`
          });
          fileUrls.logo = logoResult.secure_url;
          console.log('✅ Logo uploaded:', logoResult.secure_url);
        }

        // Upload restaurant images if provided
        if (req.files.images && req.files.images.length > 0) {
          console.log(`🖼️ Uploading ${req.files.images.length} restaurant images...`);
          fileUrls.images = [];
          
          const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          
          for (let i = 0; i < req.files.images.length; i++) {
            const imageFile = req.files.images[i];
            
            if (!allowedImageTypes.includes(imageFile.mimetype)) {
              return errorResponse(res, `Invalid image file type. Please upload image files (JPEG, PNG, or WebP).`, 400);
            }
            
            const imageResult = await uploadToCloudinary(imageFile.buffer, {
              folder: 'grubgate/restaurants/images',
              transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }],
              public_id: `image_${restaurant.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}_${i}`
            });
            fileUrls.images.push(imageResult.secure_url);
          }
          console.log('✅ Restaurant images uploaded:', fileUrls.images.length);
        }

        // Upload business license if provided
        if (req.files.businessLicenseFile && req.files.businessLicenseFile[0]) {
          console.log('📄 Uploading business license...');
          const licenseFile = req.files.businessLicenseFile[0];
          
          const allowedLicenseTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
          if (!allowedLicenseTypes.includes(licenseFile.mimetype)) {
            return errorResponse(res, `Invalid business license file type. Please upload an image or PDF file.`, 400);
          }
          
          const licenseResult = await uploadToCloudinary(licenseFile.buffer, {
            folder: 'grubgate/restaurants/documents',
            resource_type: 'auto',
            public_id: `license_${restaurant.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}`
          });
          fileUrls.businessLicense = licenseResult.secure_url;
          console.log('✅ Business license uploaded:', licenseResult.secure_url);
        }
      } catch (uploadError) {
        console.error('❌ File upload error:', uploadError);
        return errorResponse(res, 'Failed to upload files. Please try again.', 500);
      }
    }

    // Update restaurant with complete billing information
    const updateData = {
      // Update logo and images if provided
      ...(fileUrls.logo && { logo: fileUrls.logo }),
      ...(fileUrls.images && fileUrls.images.length > 0 && { images: fileUrls.images }),
      ...(fileUrls.businessLicense && { businessLicense: fileUrls.businessLicense }),
      
      // Complete billing information
      billingInfo: {
        businessName,
        billingAddress: {
          street: billingStreet,
          city: billingCity,
          province: billingProvince,
          postalCode: billingPostalCode,
          country: billingCountry
        },
        paymentMethod,
        bankAccountInfo: {
          bankName,
          accountType,
          routingNumber,
          accountNumber
        },
        ...(businessNumber && {
          taxInfo: {
            businessNumber,
            ...(gstHstNumber && { gstHstNumber })
          }
        }),
        contactInfo: {
          email: billingEmail,
          phone: billingPhone,
          ...(contactPerson && { contactPerson })
        }
      },
      
      // Mark registration as complete
      registrationComplete: true,
      registrationStage: 3
    };

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurant._id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('✅ Restaurant billing information completed:', updatedRestaurant._id);

    // Generate fresh JWT tokens
    const accessToken = generateToken(user._id, user.roles);
    const refreshToken = generateRefreshToken(user._id);

    // Return success response
    return successResponse(res, {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        roles: user.roles,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        restaurantId: user.restaurantId
      },
      restaurant: updatedRestaurant,
      accessToken,
      refreshToken
    }, 'Partner registration completed successfully! Your restaurant is ready for review.');

  } catch (error) {
    console.error('Complete Partner Billing Error:', error);
    return errorResponse(res, 'Failed to complete billing information. Please try again.', 500);
  }
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
  changePassword,
  requestOTP,
  verifyOTP,
  requestLoginOTP,
  verifyLoginOTP,
  registerPartner,
  requestPartnerOTP,
  verifyPartnerOTP,
  completePartnerBilling
};
