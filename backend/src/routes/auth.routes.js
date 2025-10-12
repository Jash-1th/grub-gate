// FILE: src/routes/auth.routes.js
const express = require('express');
const {
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
  completePartnerBilling,
  updateOperatingHours
} = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth');
const { validateRequest, userSchemas, partnerSchemas } = require('../middlewares/joiValidation');
const { partnerUploads, handleUploadError } = require('../middlewares/upload');

const router = express.Router();

// Public routes
router.post('/register', validateRequest(userSchemas.register), register);
router.post('/register-partner', 
  partnerUploads, 
  handleUploadError, 
  validateRequest(partnerSchemas.register), 
  registerPartner
);
router.post('/login', validateRequest(userSchemas.login), login);
router.post('/refresh', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// OTP Authentication routes
router.post('/otp/request', validateRequest(userSchemas.requestOTP), requestOTP);
router.post('/otp/verify', validateRequest(userSchemas.verifyOTP), verifyOTP);
router.post('/otp/check', validateRequest(userSchemas.verifyOTPOnly), verifyLoginOTP);

// OTP Login routes (for existing users)
router.post('/otp/login-request', validateRequest(userSchemas.requestOTP), requestLoginOTP);
router.post('/otp/login-verify', validateRequest(userSchemas.requestOTP), verifyLoginOTP);

// Partner OTP Authentication routes
router.post('/partner/otp/request', validateRequest(userSchemas.requestOTP), requestPartnerOTP);
router.post('/partner/otp/verify', 
  partnerUploads, 
  handleUploadError,
  validateRequest(partnerSchemas.verifyPartnerOTP), 
  verifyPartnerOTP
);
router.post('/partner/complete-billing', 
  partnerUploads, 
  handleUploadError,
  validateRequest(partnerSchemas.completePartnerBilling), 
  completePartnerBilling
);

// Protected routes
router.use(authMiddleware); // Apply auth middleware to all routes below
router.post('/logout', logout);
router.get('/me', getMe);
router.post('/change-password', changePassword);

// Partner setup routes
router.put('/partner/operating-hours', validateRequest(partnerSchemas.updateOperatingHours), updateOperatingHours);

module.exports = router;
