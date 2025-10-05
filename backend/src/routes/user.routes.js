// FILE: src/routes/user.routes.js
const express = require('express');
const {
  getProfile,
  updateProfile,
  deleteAccount,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserStats
} = require('../controllers/user.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const { userValidations, commonValidations } = require('../middlewares/validation');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Profile routes
router.get('/profile', getProfile);
router.patch('/profile', userValidations.updateProfile, updateProfile);
router.delete('/account', deleteAccount);

// Address routes
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.patch('/addresses/:id', commonValidations.mongoId, updateAddress);
router.delete('/addresses/:id', commonValidations.mongoId, deleteAddress);
router.patch('/addresses/:id/default', commonValidations.mongoId, setDefaultAddress);

// Admin only routes
router.get('/stats', roleMiddleware('admin'), getUserStats);

module.exports = router;
