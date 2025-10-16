const express = require('express');
const {
  getMealPlan,
  createOrUpdateMealPlan,
  addItemToMealPlan,
  removeItemFromMealPlan,
  clearMealPlan,
  clearItemsByRestaurant,
  getSelectedRestaurants,
  addSelectedRestaurant,
  removeSelectedRestaurant
} = require('../controllers/mealPlan.controller');
const { authMiddleware } = require('../middlewares/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

const router = express.Router();

// Validation rules
const userIdValidation = param('userId')
  .isMongoId()
  .withMessage('Invalid user ID format');

const mealPlanValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('weeklyPlans')
    .isObject()
    .withMessage('Weekly plans must be an object'),
  body('totalItems')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total items must be a non-negative integer')
];

const addItemValidation = [
  userIdValidation,
  body('item')
    .isObject()
    .withMessage('Item must be an object'),
  body('item.id')
    .notEmpty()
    .withMessage('Item ID is required'),
  body('item.name')
    .notEmpty()
    .withMessage('Item name is required'),
  body('item.price')
    .isNumeric()
    .withMessage('Item price must be a number'),
  body('day')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day specified'),
  body('mealType')
    .isIn(['lunch', 'dinner'])
    .withMessage('Meal type must be lunch or dinner'),
  body('restaurantName')
    .notEmpty()
    .withMessage('Restaurant name is required'),
  body('week')
    .optional()
    .isInt({ min: 0, max: 1 })
    .withMessage('Week must be 0 or 1')
];

const removeItemValidation = [
  userIdValidation,
  body('planId')
    .notEmpty()
    .withMessage('Plan ID is required'),
  body('day')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day specified'),
  body('mealType')
    .isIn(['lunch', 'dinner'])
    .withMessage('Meal type must be lunch or dinner'),
  body('week')
    .optional()
    .isInt({ min: 0, max: 1 })
    .withMessage('Week must be 0 or 1')
];

const clearMealPlanValidation = [
  userIdValidation,
  query('week')
    .optional()
    .isInt({ min: 0, max: 1 })
    .withMessage('Week must be 0 or 1')
];

// Apply authentication to all routes
router.use(authMiddleware);

// Routes
router.get('/me', getMealPlan); // Get current user's meal plan
router.get('/:userId', userIdValidation, handleValidationErrors, getMealPlan);
router.post('/', mealPlanValidation, handleValidationErrors, createOrUpdateMealPlan);
router.post('/:userId/add-item', addItemValidation, handleValidationErrors, addItemToMealPlan);
router.delete('/:userId/remove-item', removeItemValidation, handleValidationErrors, removeItemFromMealPlan);
router.delete('/:userId/clear', clearMealPlanValidation, handleValidationErrors, clearMealPlan);
router.delete('/:userId/clear-restaurant/:restaurantId', userIdValidation, handleValidationErrors, clearItemsByRestaurant);

// Restaurant selection routes
router.get('/selected-restaurants', getSelectedRestaurants);
router.post('/selected-restaurants', addSelectedRestaurant);
router.delete('/selected-restaurants/:restaurantId', removeSelectedRestaurant);

module.exports = router;
