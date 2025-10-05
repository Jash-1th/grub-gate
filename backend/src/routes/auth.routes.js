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
  changePassword
} = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth');
const { validateRequest, userSchemas } = require('../middlewares/joiValidation');

const router = express.Router();

// Public routes
router.post('/register', validateRequest(userSchemas.register), register);
router.post('/login', validateRequest(userSchemas.login), login);
router.post('/refresh', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.use(authMiddleware); // Apply auth middleware to all routes below
router.post('/logout', logout);
router.get('/me', getMe);
router.post('/change-password', changePassword);

module.exports = router;
