const express = require('express');
const router = express.Router();
const { activateTodaysOrders, manualActivateOrdersForDate } = require('../services/orderActivationService');
const { authMiddleware } = require('../middlewares/auth');

/**
 * @route   POST /api/v1/order-activation/activate-today
 * @desc    Manually trigger today's order activation (for testing)
 * @access  Private (Admin only)
 */
router.post('/activate-today', authMiddleware, async (req, res) => {
  try {
    console.log('🔧 Manual trigger: Activating today\'s orders...');
    
    const result = await activateTodaysOrders();
    
    res.json({
      success: true,
      message: 'Orders activated successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Error in manual activation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate orders',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/v1/order-activation/activate-date
 * @desc    Manually activate orders for a specific date
 * @access  Private (Admin only)
 */
router.post('/activate-date', authMiddleware, async (req, res) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required (format: YYYY-MM-DD)'
      });
    }
    
    console.log(`🔧 Manual trigger: Activating orders for ${date}...`);
    
    const count = await manualActivateOrdersForDate(date);
    
    res.json({
      success: true,
      message: `Activated ${count} orders for ${date}`,
      data: { activatedCount: count, date }
    });
  } catch (error) {
    console.error('❌ Error in manual date activation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate orders',
      error: error.message
    });
  }
});

module.exports = router;
