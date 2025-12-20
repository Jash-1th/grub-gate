// FILE: src/controllers/dasher.auth.controller.js
const User = require('../models/User');
const Dasher = require('../models/Dasher');
const { generateTokenPair } = require('../utils/jwt');
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
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');

/**
 * @desc      Register dasher
 * @route     POST /api/v1/dasher/auth/register
 * @access    Public
 */
const registerDasher = asyncHandler(async (req, res) => {
  const { 
    firstName, 
    lastName, 
    email, 
    phoneNumber, 
    password,
    vehicleType,
    vehicleMake,
    vehicleModel,
    vehicleYear,
    licensePlate,
    vehicleColor,
    licenseNumber,
    licenseExpiry,
    insuranceProvider,
    insurancePolicyNumber,
    insuranceExpiry,
    bankName,
    accountHolderName,
    accountNumber,
    routingNumber,
    emergencyContactName,
    emergencyContactPhone,
    emergencyContactRelationship,
    serviceCity,
    serviceProvince,
    serviceRadius
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [
      { email },
      { phoneNumber }
    ]
  });
  
  if (existingUser) {
    if (existingUser.email === email) {
      return conflictResponse(res, 'User with this email already exists');
    } else if (existingUser.phoneNumber === phoneNumber) {
      return conflictResponse(res, 'User with this phone number already exists');
    }
  }

  // Upload documents to Cloudinary if provided
  let profilePhotoUrl, licenseFrontUrl, licenseBackUrl, vehicleRegUrl, insuranceDocUrl;
  
  try {
    if (req.files) {
      if (req.files.profilePhoto && req.files.profilePhoto[0]) {
        const result = await uploadToCloudinary(req.files.profilePhoto[0].buffer, {
          folder: 'grubgate/dashers/profiles',
          resource_type: 'image'
        });
        profilePhotoUrl = result.secure_url;
      }
      
      if (req.files.driversLicenseFront && req.files.driversLicenseFront[0]) {
        const result = await uploadToCloudinary(req.files.driversLicenseFront[0].buffer, {
          folder: 'grubgate/dashers/licenses',
          resource_type: 'image'
        });
        licenseFrontUrl = result.secure_url;
      }
      
      if (req.files.driversLicenseBack && req.files.driversLicenseBack[0]) {
        const result = await uploadToCloudinary(req.files.driversLicenseBack[0].buffer, {
          folder: 'grubgate/dashers/licenses',
          resource_type: 'image'
        });
        licenseBackUrl = result.secure_url;
      }
      
      if (req.files.vehicleRegistration && req.files.vehicleRegistration[0]) {
        const result = await uploadToCloudinary(req.files.vehicleRegistration[0].buffer, {
          folder: 'grubgate/dashers/vehicles',
          resource_type: 'auto'
        });
        vehicleRegUrl = result.secure_url;
      }
      
      if (req.files.insuranceDocument && req.files.insuranceDocument[0]) {
        const result = await uploadToCloudinary(req.files.insuranceDocument[0].buffer, {
          folder: 'grubgate/dashers/insurance',
          resource_type: 'auto'
        });
        insuranceDocUrl = result.secure_url;
      }
    }
  } catch (uploadError) {
    console.error('File upload error:', uploadError);
    return errorResponse(res, 'Failed to upload documents. Please try again.', 500);
  }

  // Create user with dasher role
  const user = await User.create({
    firstName,
    lastName,
    email,
    phoneNumber,
    passwordHash: password,  // Will be hashed by pre-save middleware
    roles: ['dasher'],
    status: 'active'
  });

  // Create dasher profile
  const dasherData = {
    userId: user._id,
    vehicle: {
      type: vehicleType,
      make: vehicleMake,
      model: vehicleModel,
      year: vehicleYear ? parseInt(vehicleYear) : undefined,
      licensePlate: licensePlate,
      color: vehicleColor
    },
    license: {
      number: licenseNumber,
      expiryDate: new Date(licenseExpiry),
      frontImageUrl: licenseFrontUrl,
      backImageUrl: licenseBackUrl,
      verified: false
    },
    serviceArea: {
      city: serviceCity,
      province: serviceProvince,
      radius: serviceRadius ? parseInt(serviceRadius) : 10
    },
    documents: {
      profilePhoto: profilePhotoUrl,
      vehicleRegistration: vehicleRegUrl
    },
    status: 'pending',  // Requires admin approval
    onboardingComplete: false,
    onboardingStep: 1
  };

  // Add insurance if provided
  if (insuranceProvider) {
    dasherData.insurance = {
      provider: insuranceProvider,
      policyNumber: insurancePolicyNumber,
      expiryDate: insuranceExpiry ? new Date(insuranceExpiry) : undefined,
      documentUrl: insuranceDocUrl,
      verified: false
    };
  }

  // Add banking if provided
  if (bankName) {
    dasherData.banking = {
      bankName,
      accountHolderName,
      accountNumber,  // TODO: Encrypt in production
      routingNumber,
      verified: false
    };
  }

  // Add emergency contact if provided
  if (emergencyContactName) {
    dasherData.emergencyContact = {
      name: emergencyContactName,
      phone: emergencyContactPhone,
      relationship: emergencyContactRelationship
    };
  }

  const dasher = await Dasher.create(dasherData);

  // Generate JWT tokens
  const tokens = generateTokenPair(user._id, user.roles);

  // Remove password from response
  user.passwordHash = undefined;

  // TODO: Send welcome email
  // await emailService.sendDasherWelcomeEmail(user.email, user.firstName);

  createdResponse(res, {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roles: user.roles
    },
    dasher: {
      id: dasher._id,
      status: dasher.status,
      onboardingComplete: dasher.onboardingComplete,
      onboardingStep: dasher.onboardingStep
    },
    ...tokens
  }, 'Registration successful. Your application is under review and you will be notified once approved.');
});

/**
 * @desc      Login dasher
 * @route     POST /api/v1/dasher/auth/login
 * @access    Public
 */
const loginDasher = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return errorResponse(res, 'Email/phone and password are required', 400);
  }

  // Determine if identifier is email or phone
  const isEmail = identifier.includes('@');
  
  // Find user by email or phone with dasher role
  const user = await User.findOne({
    $or: [
      { email: isEmail ? identifier : undefined },
      { phoneNumber: !isEmail ? identifier : undefined }
    ],
    roles: 'dasher'
  }).select('+passwordHash');

  if (!user) {
    return unauthorizedResponse(res, 'Invalid credentials');
  }

  // Check password
  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    return unauthorizedResponse(res, 'Invalid credentials');
  }

  // Get dasher profile
  const dasher = await Dasher.findOne({ userId: user._id });

  if (!dasher) {
    return notFoundResponse(res, 'Dasher profile not found. Please contact support.');
  }

  // Check dasher status
  if (dasher.status === 'pending') {
    return errorResponse(res, 'Your application is still under review. You will be notified once approved.', 403);
  }

  if (dasher.status === 'rejected') {
    return errorResponse(res, `Your application was rejected. Reason: ${dasher.rejectionReason || 'Not specified'}`, 403);
  }

  if (dasher.status === 'suspended') {
    return errorResponse(res, 'Your account has been suspended. Please contact support.', 403);
  }

  // Update last login and last active
  user.lastLoginAt = new Date();
  dasher.lastActiveAt = new Date();
  await Promise.all([user.save(), dasher.save()]);

  // Generate JWT tokens
  const tokens = generateTokenPair(user._id, user.roles);

  // Remove password from response
  user.passwordHash = undefined;

  successResponse(res, {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roles: user.roles,
      lastLoginAt: user.lastLoginAt
    },
    dasher: {
      id: dasher._id,
      status: dasher.status,
      isAvailable: dasher.availability.isAvailable,
      onboardingComplete: dasher.onboardingComplete,
      stats: dasher.stats,
      currentDelivery: dasher.currentDelivery
    },
    ...tokens
  }, 'Login successful');
});

/**
 * @desc      Get current dasher profile
 * @route     GET /api/v1/dasher/auth/me
 * @access    Private (Dasher only)
 */
const getDasherProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const dasher = await Dasher.findOne({ userId: req.user.id });

  if (!dasher) {
    return notFoundResponse(res, 'Dasher profile not found');
  }

  successResponse(res, {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roles: user.roles
    },
    dasher
  }, 'Profile retrieved successfully');
});

/**
 * @desc      Update dasher profile
 * @route     PUT /api/v1/dasher/auth/profile
 * @access    Private (Dasher only)
 */
const updateDasherProfile = asyncHandler(async (req, res) => {
  const dasher = await Dasher.findOne({ userId: req.user.id });

  if (!dasher) {
    return notFoundResponse(res, 'Dasher profile not found');
  }

  const {
    vehicleMake,
    vehicleModel,
    vehicleYear,
    vehicleColor,
    emergencyContactName,
    emergencyContactPhone,
    emergencyContactRelationship,
    serviceRadius
  } = req.body;

  // Update allowed fields
  if (vehicleMake) dasher.vehicle.make = vehicleMake;
  if (vehicleModel) dasher.vehicle.model = vehicleModel;
  if (vehicleYear) dasher.vehicle.year = parseInt(vehicleYear);
  if (vehicleColor) dasher.vehicle.color = vehicleColor;
  
  if (emergencyContactName) {
    dasher.emergencyContact = dasher.emergencyContact || {};
    dasher.emergencyContact.name = emergencyContactName;
    dasher.emergencyContact.phone = emergencyContactPhone;
    dasher.emergencyContact.relationship = emergencyContactRelationship;
  }
  
  if (serviceRadius) {
    dasher.serviceArea.radius = parseInt(serviceRadius);
  }

  await dasher.save();

  successResponse(res, { dasher }, 'Profile updated successfully');
});

/**
 * @desc      Toggle dasher availability
 * @route     POST /api/v1/dasher/auth/toggle-availability
 * @access    Private (Dasher only)
 */
const toggleAvailability = asyncHandler(async (req, res) => {
  const dasher = await Dasher.findOne({ userId: req.user.id });

  if (!dasher) {
    return notFoundResponse(res, 'Dasher profile not found');
  }

  if (dasher.status !== 'active') {
    return errorResponse(res, 'Your account must be active to change availability', 403);
  }

  await dasher.toggleAvailability();

  successResponse(res, {
    isAvailable: dasher.availability.isAvailable,
    lastActiveAt: dasher.lastActiveAt
  }, `You are now ${dasher.availability.isAvailable ? 'available' : 'unavailable'} for deliveries`);
});

/**
 * @desc      Refresh access token
 * @route     POST /api/v1/dasher/auth/refresh
 * @access    Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return errorResponse(res, 'Refresh token is required', 400);
  }

  try {
    const { verifyRefreshToken, generateTokenPair } = require('../utils/jwt');
    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await User.findById(decoded.id);
    if (!user || !user.roles.includes('dasher')) {
      return unauthorizedResponse(res, 'Invalid refresh token');
    }

    const tokens = generateTokenPair(user._id, user.roles);
    
    successResponse(res, tokens, 'Token refreshed successfully');
  } catch (error) {
    return unauthorizedResponse(res, 'Invalid or expired refresh token');
  }
});

module.exports = {
  registerDasher,
  loginDasher,
  getDasherProfile,
  updateDasherProfile,
  toggleAvailability,
  refreshToken
};
