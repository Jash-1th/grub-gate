// FILE: src/routes/orderGeneration.routes.js
const express = require('express');
const {
  generateTodaysOrders,
  generateOrdersForSpecificDay,
  getGenerationStats,
  getTodaysGeneratedOrders,
  getGenerationStatus
} = require('../controllers/orderGeneration.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const { param } = require('express-validator');
const { validationResult } = require('express-validator');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * Order Generation Routes
 */

// Generate today's orders (Admin only)
router.post('/daily', 
  roleMiddleware('admin'), 
  generateTodaysOrders
);

// Generate orders for specific day (Admin only - for testing)
router.post('/day/:dayName', 
  roleMiddleware('admin'),
  [
    param('dayName')
      .isIn(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])
      .withMessage('Invalid day name. Must be a valid day of the week.')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  },
  generateOrdersForSpecificDay
);

// Get order generation statistics (Admin/Partner)
router.get('/stats', 
  roleMiddleware('admin', 'partner'), 
  getGenerationStats
);

// Get today's generated orders for partner's restaurants (Partner only)
router.get('/today', 
  roleMiddleware('partner'), 
  getTodaysGeneratedOrders
);

// Check order generation status (Admin/Partner)
router.get('/status', 
  roleMiddleware('admin', 'partner'), 
  getGenerationStatus
);

module.exports = router;
