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
 * @desc      Register user
 * @route     POST /api/v1/auth/register
 * @access    Public
 */
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, phoneNumber, role = 'customer' } = req.body;

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
    roles: [role]
  };

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
 * @desc      Login user with email/phone + password (no OTP)
 * @route     POST /api/v1/auth/login
 * @access    Public
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

  // For partners, also fetch restaurant information
  let restaurantInfo = null;
  if (user.roles && user.roles.includes('partner')) {
    try {
      restaurantInfo = await Restaurant.findOne({ ownerId: user._id }).select('registrationComplete registrationStage status');
    } catch (error) {
      console.error('Error fetching restaurant info during login:', error);
    }
  }

  // Generate JWT tokens
  const tokens = generateTokenPair(user._id, user.roles || [user.role]);

  // Remove password from response
  user.passwordHash = undefined;

  const userData = {
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
  };

  // Add restaurant info if user is a partner
  if (restaurantInfo) {
    userData.restaurantId = restaurantInfo._id;
    userData.registrationComplete = restaurantInfo.registrationComplete;
    userData.registrationStage = restaurantInfo.registrationStage;
    userData.restaurantStatus = restaurantInfo.status;
  }

  successResponse(res, {
    user: userData,
    ...tokens
  }, 'Login successful');
});

/**
 * @desc      Logout user
 * @route     POST /api/v1/auth/logout
 * @access    Private
 */
const logout = asyncHandler(async (req, res) => {
  successResponse(res, null, 'Logout successful');
});

/**
 * @desc      Get current user
 * @route     GET /api/v1/auth/me
 * @access    Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('addresses');
  successResponse(res, { user }, 'User profile retrieved successfully');
});

/**
 * @desc      Refresh access token
 * @route     POST /api/v1/auth/refresh
 * @access    Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return unauthorizedResponse(res, 'Refresh token is required');
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || user.status !== 'active') {
      return unauthorizedResponse(res, 'Invalid refresh token');
    }

    const tokens = generateTokenPair(user._id, user.roles || [user.role]);
    successResponse(res, tokens, 'Token refreshed successfully');
  } catch (error) {
    return unauthorizedResponse(res, 'Invalid refresh token');
  }
});

/**
 * @desc      Verify email
 * @route     POST /api/v1/auth/verify-email
 * @access    Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return errorResponse(res, 'Verification token is required', 400);
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ emailVerificationToken: hashedToken });

  if (!user) {
    return errorResponse(res, 'Invalid or expired verification token', 400);
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  successResponse(res, null, 'Email verified successfully');
});

/**
 * @desc      Forgot password
 * @route     POST /api/v1/auth/forgot-password
 * @access    Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return notFoundResponse(res, 'No user found with this email address');
  }

  const resetToken = user.getResetPasswordToken();
  await user.save();

  // TODO: Send reset password email
  // await sendPasswordResetEmail(user.email, resetToken);

  successResponse(res, null, 'Password reset email sent');
});

/**
 * @desc      Reset password
 * @route     POST /api/v1/auth/reset-password
 * @access    Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return errorResponse(res, 'Invalid or expired reset token', 400);
  }

  user.passwordHash = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const tokens = generateTokenPair(user._id, user.roles || [user.role]);
  successResponse(res, tokens, 'Password reset successful');
});

/**
 * @desc      Change password
 * @route     POST /api/v1/auth/change-password
 * @access    Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+passwordHash');

  const isCurrentPasswordCorrect = await user.matchPassword(currentPassword);
  if (!isCurrentPasswordCorrect) {
    return unauthorizedResponse(res, 'Current password is incorrect');
  }

  user.passwordHash = newPassword;
  await user.save();

  successResponse(res, null, 'Password changed successfully');
});

/**
 * @desc      Request OTP - checks user existence and determines flow
 * @route     POST /api/v1/auth/otp/request
 * @access    Public
 */
const requestOTP = asyncHandler(async (req, res) => {
  // Renamed to requestCustomerOTP
  return requestCustomerOTP(req, res);
});


/**
 * @desc    Request OTP for Customer Signup
 * @route   POST /api/v1/auth/customer/otp/request
 * @access  Public
 */
const requestCustomerOTP = asyncHandler(async (req, res) => {
  const { identifier, channel } = req.body;

  if (!identifier || !channel) {
    return errorResponse(res, 'Identifier and channel are required', 400);
  }

  const isEmail = emailService.validateEmail(identifier);
  const isPhone = smsService.validatePhoneNumber(identifier);

  if (!isEmail && !isPhone) {
    return errorResponse(res, 'Please provide a valid email or phone number', 400);
  }

  if ((isEmail && channel !== 'email') || (isPhone && channel !== 'sms')) {
    return errorResponse(res, 'Identifier type does not match the channel', 400);
  }

  let formattedIdentifier = identifier.toLowerCase().trim();
  if (isPhone) {
    formattedIdentifier = smsService.formatPhoneNumber(identifier);
  }
  
  const searchQuery = isEmail ? { email: formattedIdentifier } : { phoneNumber: formattedIdentifier };
  const existingUser = await User.findOne(searchQuery);

  if (existingUser) {
    return conflictResponse(res, 'An account with this identifier already exists. Please login instead.');
  }

  try {
    const { otp } = await OTP.generateOTP(formattedIdentifier);

    if (channel === 'email') {
      await emailService.sendOTP(formattedIdentifier, otp);
    } else {
      await smsService.sendOTP(formattedIdentifier, otp);
    }

    successResponse(res, { userExists: false }, 'OTP sent successfully for signup.');
  } catch (error) {
    console.error('Request Customer OTP Error:', error);
    return errorResponse(res, 'Failed to send OTP. Please try again.', 500);
  }
});


/**
 * @desc      Request OTP for existing user login
 * @route     POST /api/v1/auth/otp/login-request
 * @access    Public
 */
const requestLoginOTP = asyncHandler(async (req, res) => {
  const { identifier, channel } = req.body;

  if (!identifier || !channel) {
    return errorResponse(res, 'Identifier and channel are required', 400);
  }

  const isEmail = emailService.validateEmail(identifier);
  const isPhone = smsService.validatePhoneNumber(identifier);

  if (!isEmail && !isPhone) {
    return errorResponse(res, 'Please provide a valid email or phone number', 400);
  }

  let formattedIdentifier = identifier.toLowerCase().trim();
  if (isPhone) {
    formattedIdentifier = smsService.formatPhoneNumber(identifier);
  }

  try {
    const searchQuery = isEmail ? { email: formattedIdentifier } : { phoneNumber: formattedIdentifier };
    const existingUser = await User.findOne(searchQuery);

    if (!existingUser) {
      return notFoundResponse(res, 'No account found with this identifier. Please sign up first.');
    }

    if (existingUser.status !== 'active') {
      return unauthorizedResponse(res, 'Your account has been deactivated. Please contact support.');
    }

    const { otp } = await OTP.generateOTP(formattedIdentifier);
    if (channel === 'email') {
      await emailService.sendOTP(formattedIdentifier, otp);
    } else {
      await smsService.sendOTP(formattedIdentifier, otp);
    }

    successResponse(res, { userExists: true }, 'OTP sent successfully for login.');
  } catch (error) {
    console.error('Request Login OTP Error:', error);
    return errorResponse(res, 'Failed to send OTP. Please try again.', 500);
  }
});

/**
 * @desc      Verify OTP for existing user login
 * @route     POST /api/v1/auth/otp/login-verify
 * @access    Public
 */
const verifyLoginOTP = asyncHandler(async (req, res) => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    return errorResponse(res, 'Identifier and OTP are required', 400);
  }

  let formattedIdentifier = identifier.toLowerCase().trim();
  const isPhone = smsService.validatePhoneNumber(identifier);
  if (isPhone) {
    formattedIdentifier = smsService.formatPhoneNumber(identifier);
  }

  try {
    const otpResult = await OTP.verifyOTP(formattedIdentifier, otp);
    if (!otpResult.success) {
      return errorResponse(res, otpResult.message, 400);
    }

    const isEmail = emailService.validateEmail(formattedIdentifier);
    const searchQuery = isEmail ? { email: formattedIdentifier } : { phoneNumber: formattedIdentifier };
    const user = await User.findOne(searchQuery);

    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    if (user.status !== 'active') {
      return unauthorizedResponse(res, 'Your account has been deactivated.');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const tokens = generateTokenPair(user._id, user.roles);

    successResponse(res, {
      user: {
        _id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        status: user.status,
      },
      ...tokens
    }, 'Login successful');
  } catch (error) {
    console.error('Verify Login OTP Error:', error);
    return errorResponse(res, 'Failed to verify OTP. Please try again.', 500);
  }
});


/**
 * @desc    Verify OTP and create new customer account
 * @route   POST /api/v1/auth/customer/otp/verify
 * @access  Public
 */
const verifyCustomerOTP = asyncHandler(async (req, res) => {
  const {
    identifier,
    otp,
    firstName,
    lastName,
    password
  } = req.body;

  if (!identifier || !otp || !firstName || !lastName || !password) {
    return errorResponse(res, 'Identifier, OTP, name, and password are required', 400);
  }
  
  let formattedIdentifier = identifier.toLowerCase().trim();
  const isPhone = smsService.validatePhoneNumber(identifier);
  if (isPhone) {
    formattedIdentifier = smsService.formatPhoneNumber(identifier);
  }

  try {
    const otpResult = await OTP.verifyOTP(formattedIdentifier, otp);
    if (!otpResult.success) {
      return errorResponse(res, otpResult.message, 400);
    }
    
    const isEmail = emailService.validateEmail(formattedIdentifier);
    const searchQuery = isEmail ? { email: formattedIdentifier } : { phoneNumber: formattedIdentifier };
    const existingUser = await User.findOne(searchQuery);

    if (existingUser) {
      return conflictResponse(res, 'User with this identifier already exists.');
    }

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      passwordHash: password,
      roles: ['customer'],
      status: 'active'
    };

    if (isEmail) {
      userData.email = formattedIdentifier;
      userData.emailVerified = true;
    } else {
      userData.phoneNumber = formattedIdentifier;
      userData.phoneVerified = true;
    }

    const user = await User.create(userData);
    const tokens = generateTokenPair(user._id, user.roles);

    createdResponse(res, {
      user: {
        _id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles
      },
      ...tokens
    }, 'Account created successfully');

  } catch (error) {
    console.error('Verify Customer OTP Error:', error);
    return errorResponse(res, 'Failed to create account. Please try again.', 500);
  }
});


/**
 * @desc      Register partner with restaurant details
 * @route     POST /api/v1/auth/register-partner
 * @access    Public
 */
const registerPartner = asyncHandler(async (req, res) => {
  // This is a large function, you can keep it as is or refactor into smaller services
  // For now, let's assume it's correct from your provided code.
  // The logic inside verifyPartnerOTP largely replaces this.
  return errorResponse(res, 'This endpoint is deprecated. Please use the multi-step partner registration flow.', 404);
});

/**
 * @desc      Request OTP for Partner Signup - Step 1
 * @route     POST /api/v1/auth/partner/otp/request
 * @access    Public
 */
const requestPartnerOTP = asyncHandler(async (req, res) => {
  const { identifier, channel } = req.body;

  if (!identifier || !channel) {
    return errorResponse(res, 'Identifier and channel are required', 400);
  }

  const isEmail = emailService.validateEmail(identifier);
  const isPhone = smsService.validatePhoneNumber(identifier);

  if (!isEmail && !isPhone) {
    return errorResponse(res, 'Please provide a valid email address or phone number', 400);
  }

  if ((isEmail && channel !== 'email') || (isPhone && channel !== 'sms')) {
    return errorResponse(res, 'Identifier type does not match the channel', 400);
  }

  let formattedIdentifier = identifier.toLowerCase().trim();
  if (isPhone) {
    formattedIdentifier = smsService.formatPhoneNumber(identifier);
  }
  
  try {
    const searchQuery = isEmail ? { email: formattedIdentifier } : { phoneNumber: formattedIdentifier };
    const existingUser = await User.findOne(searchQuery);

    if (existingUser && existingUser.roles.includes('partner')) {
      return conflictResponse(res, 'A partner account with this identifier already exists.');
    }

    const { otp } = await OTP.generateOTP(formattedIdentifier);

    if (channel === 'email') {
      await emailService.sendOTP(formattedIdentifier, otp, { subject: 'GrubGate Partner Verification' });
    } else {
      await smsService.sendOTP(formattedIdentifier, otp);
    }

    successResponse(res, { userExists: !!existingUser }, 'OTP sent successfully for partner registration.');
  } catch (error) {
    console.error('Request Partner OTP Error:', error);
    return errorResponse(res, 'Failed to send OTP. Please try again.', 500);
  }
});


/**
 * @desc      Verify OTP and Complete Partner Registration - Step 2
 * @route     POST /api/v1/auth/partner/otp/verify
 * @access    Public
 */
const verifyPartnerOTP = asyncHandler(async (req, res) => {
  const {
    identifier, otp, verifyOnly, skipOtpVerification, otpVerificationToken,
    firstName, lastName, password,
    restaurantName, description, cuisine, cuisineType, businessType,
    street, city, state: province, postalCode, country, coordinates, formattedAddress,
    businessPhone, businessEmail, website,
    operatingHours,
    deliveryRadius, deliveryFee, minOrderAmount, avgDeliveryTime,
    businessLicenseText, taxId
  } = req.body;

  if (!identifier) {
    return errorResponse(res, 'Identifier is required', 400);
  }
  if (!skipOtpVerification && !otp) {
    return errorResponse(res, 'OTP is required', 400);
  }
  if (skipOtpVerification && !otpVerificationToken) {
    return errorResponse(res, 'Verification token is required', 400);
  }

  let formattedIdentifier = identifier.toLowerCase().trim();
  const isPhone = smsService.validatePhoneNumber(identifier);
  if (isPhone) {
    formattedIdentifier = smsService.formatPhoneNumber(identifier);
  }

  try {
    if (!skipOtpVerification) {
      const otpResult = await OTP.verifyOTP(formattedIdentifier, otp);
      if (!otpResult.success) {
        return errorResponse(res, otpResult.message, 400);
      }
      if (verifyOnly) {
        return successResponse(res, {
          verificationToken: `verified_${formattedIdentifier}_${Date.now()}`
        }, 'OTP verified successfully');
      }
    } else {
      const tokenParts = otpVerificationToken.split('_');
      const tokenIdentifier = tokenParts.slice(1, -1).join('_');
      if (!otpVerificationToken.startsWith('verified_') || tokenIdentifier !== formattedIdentifier) {
        return errorResponse(res, 'Invalid or mismatched verification token', 400);
      }
    }

    // Debug: Log all received fields
    console.log('🔍 Registration Debug - Full req.body:', Object.keys(req.body));
    console.log('🔍 Registration Debug - Received fields:');
    console.log('firstName:', firstName);
    console.log('lastName:', lastName);
    console.log('password:', password ? '[PRESENT]' : '[MISSING]');
    console.log('restaurantName:', restaurantName);
    console.log('cuisine:', cuisine);
    console.log('street:', street);
    console.log('city:', city);
    console.log('postalCode:', postalCode);
    console.log('country:', country);
    console.log('businessPhone:', businessPhone);
    
    const missingFields = [];
    if (!firstName) missingFields.push('firstName');
    if (!lastName) missingFields.push('lastName');
    if (!password) missingFields.push('password');
    if (!restaurantName) missingFields.push('restaurantName');
    if (!cuisine) missingFields.push('cuisine');
    if (!street) missingFields.push('street');
    if (!city) missingFields.push('city');
    if (!postalCode) missingFields.push('postalCode');
    if (!country) missingFields.push('country');
    if (!businessPhone) missingFields.push('businessPhone');
    
    if (missingFields.length > 0) {
        console.log('❌ Missing required fields:', missingFields);
        return errorResponse(res, `Missing required fields: ${missingFields.join(', ')}`, 400);
    }

    const isEmail = emailService.validateEmail(formattedIdentifier);
    const searchQuery = isEmail ? { email: formattedIdentifier } : { phoneNumber: formattedIdentifier };
    let user = await User.findOne(searchQuery);
    let isNewUser = false;
    
    // Handle file uploads with comprehensive error handling
    let fileUrls = {};
    console.log('🔍 File upload debug - req.files:', req.files ? Object.keys(req.files) : 'No files');
    console.log('🔍 Cloudinary config check:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING',
      api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING', 
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING'
    });
    
    if (req.files) {
        try {
            // Upload logo
            if (req.files.logo && req.files.logo.length > 0) {
                console.log('📸 Uploading logo:', req.files.logo[0].originalname, 'Size:', req.files.logo[0].size, 'bytes');
                try {
                    const result = await uploadToCloudinary(req.files.logo[0].buffer, { 
                      folder: 'grubgate/logos',
                      transformation: [
                        { width: 300, height: 300, crop: 'fill' },
                        { quality: 'auto', fetch_format: 'auto' }
                      ]
                    });
                    fileUrls.logo = result.secure_url;
                    console.log('✅ Logo uploaded successfully:', result.secure_url);
                } catch (logoError) {
                    console.error('❌ Logo upload failed:', logoError.message);
                    fileUrls.logo = null;
                }
            } else {
                console.log('ℹ️ No logo file provided');
                fileUrls.logo = null;
            }
            
            // Upload restaurant images
            if (req.files.images && req.files.images.length > 0) {
                console.log('🖼️ Uploading', req.files.images.length, 'restaurant images');
                fileUrls.images = await Promise.all(req.files.images.map(async (file, index) => {
                    const result = await uploadToCloudinary(file.buffer, { 
                      folder: 'grubgate/restaurants',
                      public_id: `restaurant_${Date.now()}_${index}`,
                      transformation: [
                        { width: 800, height: 600, crop: 'fill' },
                        { quality: 'auto', fetch_format: 'auto' }
                      ]
                    });
                    console.log(`✅ Image ${index + 1} uploaded:`, result.secure_url);
                    return result.secure_url;
                }));
            } else {
                fileUrls.images = [];
            }
            
            // Upload business license
            if (req.files.businessLicenseFile && req.files.businessLicenseFile.length > 0) {
                console.log('📄 Uploading business license:', req.files.businessLicenseFile[0].originalname);
                const result = await uploadToCloudinary(req.files.businessLicenseFile[0].buffer, { 
                  folder: 'grubgate/documents',
                  resource_type: 'auto' // Supports both images and PDFs
                });
                fileUrls.businessLicense = result.secure_url;
                console.log('✅ Business license uploaded:', result.secure_url);
            }
        } catch (uploadError) {
            console.error('❌ File upload error:', uploadError);
            // Continue with registration even if file uploads fail
            fileUrls = { logo: null, images: [], businessLicense: null };
        }
    } else {
        console.log('ℹ️ No files to upload');
        fileUrls = { logo: null, images: [], businessLicense: null };
    }


    if (!user) {
      isNewUser = true;
      const userData = {
        firstName, lastName, passwordHash: password, roles: ['partner'], status: 'active'
      };
      if (isEmail) {
        userData.email = formattedIdentifier;
        userData.emailVerified = true;
      } else {
        userData.phoneNumber = formattedIdentifier;
        userData.phoneVerified = true;
      }
      user = await User.create(userData);
    } else {
      if (!user.roles.includes('partner')) {
        user.roles.push('partner');
        await user.save();
      }
    }

    let cuisineArray = Array.isArray(cuisineType) ? cuisineType : (Array.isArray(cuisine) ? cuisine : [cuisine]);

    const restaurant = await Restaurant.create({
      name: restaurantName,
      description,
      cuisine: cuisineArray,
      businessType,
      ownerId: user._id,
      address: {
        country: country || 'IN',
        street: street,
        addressLine1: street,
        city,
        state: province,
        province: province,
        postalCode,
        coordinates: coordinates ? JSON.parse(coordinates) : undefined,
        formattedAddress: formattedAddress,
        timezone: 'Asia/Kolkata' // Default timezone for India
      },
      phone: businessPhone,
      email: businessEmail || (isEmail ? formattedIdentifier : ''),
      website,
      logo: fileUrls.logo,
      images: fileUrls.images || [],
      operatingHours,
      deliverySettings: {
        radius: parseFloat(deliveryRadius) || 5,
        fee: parseFloat(deliveryFee) || 0,
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        avgDeliveryTime: parseInt(avgDeliveryTime) || 30
      },
      businessLicense: fileUrls.businessLicense || businessLicenseText,
      businessLicenseText: businessLicenseText || '',
      taxId: taxId || '',
      status: 'pending', // New restaurants should be pending approval
      registrationComplete: false,
      registrationStage: 2,
      isVerified: false,
      rating: 0,
      reviewCount: 0,
      totalOrders: 0,
      isPopular: false,
      tags: [],
      commissionRate: 15
    });

    user.restaurantId = restaurant._id;
    await user.save();

    const tokens = generateTokenPair(user._id, user.roles);
    user.passwordHash = undefined;

    createdResponse(res, {
      user,
      restaurant,
      ...tokens,
      isNewUser
    }, isNewUser ? 'Partner account created successfully.' : 'Partner role added successfully.');

  } catch (error) {
    console.error('Verify Partner OTP Error:', error);
    return errorResponse(res, 'Failed to complete partner registration. Please try again.', 500);
  }
});

/**
 * Complete Partner Billing Information - Stage 3
 * @desc      Complete partner registration with billing info, logo, and images
 * @route     POST /api/v1/auth/partner/complete-billing
 * @access    Public (with verification token)
 */
const completePartnerBilling = asyncHandler(async (req, res) => {
  // Logic from your file seems reasonable, keeping it as is.
  const {
    identifier, otpVerificationToken,
    businessName, billingEmail, billingPhone, contactPerson,
    billingStreet, billingCity, billingProvince, billingPostalCode, billingCountry = 'Canada',
    bankName, accountType, routingNumber, accountNumber,
    businessNumber, gstHstNumber
  } = req.body;

  if (!identifier || !otpVerificationToken || !businessName || !billingEmail || !billingPhone || !billingStreet || !bankName) {
    return errorResponse(res, 'Missing required billing information', 400);
  }

  let formattedIdentifier = identifier.toLowerCase().trim();
  const isPhone = smsService.validatePhoneNumber(identifier);
  if (isPhone) {
    formattedIdentifier = smsService.formatPhoneNumber(identifier);
  }

  try {
    const tokenParts = otpVerificationToken.split('_');
    const tokenIdentifier = tokenParts.slice(1, -1).join('_');
    if (!otpVerificationToken.startsWith('verified_') || tokenIdentifier !== formattedIdentifier) {
        return errorResponse(res, 'Invalid or mismatched verification token', 400);
    }

    const isEmail = emailService.validateEmail(formattedIdentifier);
    const user = await User.findOne(isEmail ? { email: formattedIdentifier } : { phoneNumber: formattedIdentifier });
    if (!user || !user.restaurantId) {
      return notFoundResponse(res, 'User or restaurant not found. Please complete previous steps.');
    }

    const restaurant = await Restaurant.findById(user.restaurantId);
    if (!restaurant) {
      return notFoundResponse(res, 'Restaurant not found.');
    }
    
    const updateData = {
        billingInfo: {
            businessName,
            billingAddress: {
                street: billingStreet,
                city: billingCity,
                province: billingProvince,
                postalCode: billingPostalCode,
                country: billingCountry
            },
            bankAccountInfo: { bankName, accountType, routingNumber, accountNumber },
            taxInfo: { businessNumber, gstHstNumber },
            contactInfo: { email: billingEmail, phone: billingPhone, contactPerson }
        },
        registrationComplete: true,
        registrationStage: 3
    };

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(restaurant._id, updateData, { new: true });
    
    const tokens = generateTokenPair(user._id, user.roles);

    successResponse(res, {
        user,
        restaurant: updatedRestaurant,
        ...tokens
    }, 'Billing information updated successfully.');

  } catch (error) {
    console.error('Complete Billing Error:', error);
    return errorResponse(res, 'Failed to update billing information.', 500);
  }
});


/**
 * Update Restaurant Operating Hours
 * @desc      Update operating hours for a restaurant (used in onboarding setup)
 * @route     PUT /api/v1/auth/partner/operating-hours
 * @access    Private (Partner only)
 */
const updateOperatingHours = asyncHandler(async (req, res) => {
  const { operatingHours } = req.body;
  const userId = req.user.id; // Correctly get user ID from authenticated request

  console.log('🕐 Updating operating hours for user:', userId);
  console.log('🕐 Operating hours data:', JSON.stringify(operatingHours, null, 2));

  if (!operatingHours) {
    return errorResponse(res, 'Operating hours data is required', 400);
  }

  try {
    // Find the authenticated user to get their restaurant ID
    const user = await User.findById(userId);
    if (!user || !user.restaurantId) {
      return notFoundResponse(res, 'Associated user or restaurant not found.');
    }

    // Update the restaurant's operating hours and advance registration stage
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      user.restaurantId,
      {
        $set: {
          operatingHours: operatingHours,
          registrationStage: 2 // Assuming this is stage 2
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedRestaurant) {
      return notFoundResponse(res, 'Restaurant not found for update.');
    }
    
    console.log('✅ Operating hours updated for restaurant:', updatedRestaurant._id);

    successResponse(res, {
      restaurant: {
        _id: updatedRestaurant._id,
        name: updatedRestaurant.name,
        registrationComplete: updatedRestaurant.registrationComplete,
        registrationStage: updatedRestaurant.registrationStage
      }
    }, 'Operating hours updated successfully');
  } catch (error) {
    console.error('Update operating hours error:', error);
    return errorResponse(res, 'Failed to update operating hours. Please try again.', 500);
  }
});

module.exports = {
  // General auth
  register,
  login,
  logout,
  getMe,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,

  // OTP authentication (aliases for backward compatibility)
  requestOTP: requestCustomerOTP,
  verifyOTP: verifyCustomerOTP,
  
  // OTP login
  requestLoginOTP,
  verifyLoginOTP,
  
  // Customer authentication
  requestCustomerOTP,
  verifyCustomerOTP,
  
  // Partner authentication
  registerPartner, // Note: Deprecated but kept for reference
  requestPartnerOTP,
  verifyPartnerOTP,
  completePartnerBilling,
  
  // Partner setup
  updateOperatingHours
};