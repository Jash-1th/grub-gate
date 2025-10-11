// FILE: src/routes/stats.routes.js
const express = require('express');
const {
  getPlatformStats,
  getRestaurantStats,
  getPopularDishes
} = require('../controllers/stats.controller');

const router = express.Router();

// Public routes - no authentication required for homepage stats
router.get('/platform', getPlatformStats);
router.get('/restaurants', getRestaurantStats);
router.get('/popular-dishes', getPopularDishes);

module.exports = router;
