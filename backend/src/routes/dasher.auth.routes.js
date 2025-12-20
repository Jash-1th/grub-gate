// FILE: src/routes/dasher.auth.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const {
  registerDasher,
  loginDasher,
  getDasherProfile,
  updateDasherProfile,
  toggleAvailability,
  refreshToken
} = require('../controllers/dasher.auth.controller');
const { upload } = require('../middlewares/upload');

/**
 * @route   POST /api/v1/dasher/auth/register
 * @desc    Register a new dasher with document uploads
 * @access  Public
 */
router.post('/register', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'driversLicenseFront', maxCount: 1 },
  { name: 'driversLicenseBack', maxCount: 1 },
  { name: 'vehicleRegistration', maxCount: 1 },
  { name: 'insuranceDocument', maxCount: 1 }
]), registerDasher);

/**
 * @route   POST /api/v1/dasher/auth/login
 * @desc    Login dasher
 * @access  Public
 */
router.post('/login', loginDasher);

/**
 * @route   POST /api/v1/dasher/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', refreshToken);

/**
 * @route   GET /api/v1/dasher/auth/me
 * @desc    Get current dasher profile
 * @access  Private (Dasher only)
 */
router.get('/me', authMiddleware, roleMiddleware('dasher'), getDasherProfile);

/**
 * @route   PUT /api/v1/dasher/auth/profile
 * @desc    Update dasher profile
 * @access  Private (Dasher only)
 */
router.put('/profile', authMiddleware, roleMiddleware('dasher'), updateDasherProfile);

/**
 * @route   POST /api/v1/dasher/auth/toggle-availability
 * @desc    Toggle dasher availability status
 * @access  Private (Dasher only)
 */
router.post('/toggle-availability', authMiddleware, roleMiddleware('dasher'), toggleAvailability);

module.exports = router;
