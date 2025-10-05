// FILE: src/routes/menuItem.routes.js
const express = require('express');
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateAvailability,
  toggleStatus,
  getByDietaryPreferences,
  getPopularItems,
  searchMenuItems,
  getByPriceRange,
  getCategories
} = require('../controllers/menuItem.controller');
const { authMiddleware, roleMiddleware, restaurantOwnershipMiddleware } = require('../middlewares/auth');
const { menuItemValidations, commonValidations, queryValidations } = require('../middlewares/validation');

const router = express.Router();

// Public routes for menu items
router.get('/dietary', getByDietaryPreferences);
router.get('/popular', getPopularItems);
router.get('/search', queryValidations.search, searchMenuItems);
router.get('/price-range', getByPriceRange);

// Restaurant-specific menu item routes
router.get('/restaurants/:restaurantId/menu-items', commonValidations.mongoId, queryValidations.pagination, getMenuItems);
router.get('/restaurants/:restaurantId/menu-items/categories', commonValidations.mongoId, getCategories);
router.get('/restaurants/:restaurantId/menu-items/:id', commonValidations.mongoId, getMenuItem);

// Protected routes - Partner only
router.use(authMiddleware);
router.post('/restaurants/:restaurantId/menu-items', 
  commonValidations.mongoId, 
  roleMiddleware('partner'), 
  restaurantOwnershipMiddleware, 
  menuItemValidations.create, 
  createMenuItem
);

router.patch('/restaurants/:restaurantId/menu-items/:id', 
  commonValidations.mongoId, 
  roleMiddleware('partner', 'admin'), 
  restaurantOwnershipMiddleware, 
  menuItemValidations.update, 
  updateMenuItem
);

router.delete('/restaurants/:restaurantId/menu-items/:id', 
  commonValidations.mongoId, 
  roleMiddleware('partner', 'admin'), 
  restaurantOwnershipMiddleware, 
  deleteMenuItem
);

router.patch('/restaurants/:restaurantId/menu-items/:id/availability', 
  commonValidations.mongoId, 
  roleMiddleware('partner'), 
  restaurantOwnershipMiddleware, 
  updateAvailability
);

router.patch('/restaurants/:restaurantId/menu-items/:id/status', 
  commonValidations.mongoId, 
  roleMiddleware('partner'), 
  restaurantOwnershipMiddleware, 
  toggleStatus
);

module.exports = router;
