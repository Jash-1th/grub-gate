// FILE: src/routes/webhook.routes.js
const express = require('express');
const { handleStripeWebhook } = require('../controllers/webhook.controller');

const router = express.Router();

/**
 * @route   POST /api/v1/webhooks/stripe
 * @desc    Handle Stripe webhook events
 * @access  Public (Stripe only)
 * 
 * IMPORTANT: This route expects raw body (express.raw middleware)
 * The raw body parsing must be configured in server.js BEFORE global express.json()
 */
router.post('/stripe', handleStripeWebhook);

module.exports = router;
