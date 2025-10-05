// FILE: src/routes/weeklyPlan.routes.js
const express = require('express');
const {
  getWeeklyPlans,
  getWeeklyPlan,
  createWeeklyPlan,
  updateWeeklyPlan,
  deleteWeeklyPlan,
  pauseWeeklyPlan,
  resumeWeeklyPlan,
  generateOrders,
  addMeal,
  removeMeal,
  getRestaurantWeeklyPlans,
  getActiveWeeklyPlans
} = require('../controllers/weeklyPlan.controller');
const { authMiddleware, roleMiddleware, restaurantOwnershipMiddleware } = require('../middlewares/auth');
const { weeklyPlanValidations, commonValidations, queryValidations } = require('../middlewares/validation');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Weekly plan routes
router.get('/', queryValidations.pagination, getWeeklyPlans);
router.get('/active', roleMiddleware('customer'), getActiveWeeklyPlans);
router.get('/:id', commonValidations.mongoId, getWeeklyPlan);

// Customer routes
router.post('/', roleMiddleware('customer'), weeklyPlanValidations.create, createWeeklyPlan);
router.patch('/:id', commonValidations.mongoId, roleMiddleware('customer'), updateWeeklyPlan);
router.delete('/:id', commonValidations.mongoId, roleMiddleware('customer'), deleteWeeklyPlan);

// Weekly plan management
router.post('/:id/pause', commonValidations.mongoId, roleMiddleware('customer'), pauseWeeklyPlan);
router.post('/:id/resume', commonValidations.mongoId, roleMiddleware('customer'), resumeWeeklyPlan);
router.post('/:id/generate-orders', commonValidations.mongoId, roleMiddleware('customer', 'admin'), generateOrders);

// Meal management
router.post('/:id/meals', commonValidations.mongoId, roleMiddleware('customer'), addMeal);
router.delete('/:id/meals/:day/:mealType', commonValidations.mongoId, roleMiddleware('customer'), removeMeal);

// Restaurant-specific weekly plans (Partner view)
router.get('/restaurants/:restaurantId/weekly-plans', 
  commonValidations.mongoId, 
  roleMiddleware('partner'), 
  restaurantOwnershipMiddleware, 
  getRestaurantWeeklyPlans
);

module.exports = router;
