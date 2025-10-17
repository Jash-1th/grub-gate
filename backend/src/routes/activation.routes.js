// FILE: src/routes/activation.routes.js
const express = require('express');
const { completeSetupActivation, getActivationStatus } = require('../controllers/activation.controller');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// @route   POST /api/v1/activation/complete-setup
// @desc    Complete restaurant setup and activate user/restaurant
// @access  Private (Partner only)
router.post('/complete-setup', completeSetupActivation);

// @route   GET /api/v1/activation/status
// @desc    Get current activation status
// @access  Private
router.get('/status', getActivationStatus);

module.exports = router;
