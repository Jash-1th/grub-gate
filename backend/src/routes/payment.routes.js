// FILE: src/routes/payment.routes.js
const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const { commonValidations } = require('../middlewares/validation');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');
const { calculateOrderTotals, SERVICE_FEE_PERCENTAGE, DEFAULT_TAX_RATE, toCents } = require('../utils/pricingCalculator');

 const Stripe = require('stripe');

const router = express.Router();

 const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @desc    Create payment intent
 * @route   POST /api/v1/payments/create-intent
 * @access  Private (Customer)
 */
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { items, orderTotal, restaurantStripeAccountId, planType = 'single', totalDeliveries = 1, restaurantDeliveryFee } = req.body;

  // Support both: items array OR orderTotal amount
  if (!restaurantStripeAccountId) {
    return errorResponse(res, 'Missing required field: restaurantStripeAccountId', 400);
  }

  // Must have either items array OR orderTotal
  const hasItems = items && Array.isArray(items) && items.length > 0;
  const hasOrderTotal = typeof orderTotal === 'number' && orderTotal > 0;
  
  if (!hasItems && !hasOrderTotal) {
    return errorResponse(res, 'Missing required fields: provide either items array OR orderTotal', 400);
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return errorResponse(res, 'Stripe is not configured (missing STRIPE_SECRET_KEY)', 500);
  }

  const getDeliveryMultiplier = (planType, totalDeliveries = 1) => {
    if (totalDeliveries && totalDeliveries > 1) {
      return totalDeliveries;
    }
    
    switch (planType) {
      case 'bi-weekly':
        return 2;  // Bi-weekly = 2 deliveries
      case 'monthly':
        return 4;  // Monthly = 4 deliveries
      case 'quarterly':
        return 12; // Quarterly = 12 deliveries
      case 'single':
      default:
        return 1;
    }
  };

  let pricing;
  
  if (hasItems) {
    // Use items array with pricing calculator - pass restaurantDeliveryFee if provided
    pricing = calculateOrderTotals({
      items,
      restaurantDeliveryFee: restaurantDeliveryFee || null,
      planType,
      totalDeliveries: getDeliveryMultiplier(planType, totalDeliveries)
    });
  } else {
    // Use orderTotal directly - calculate platform fee and create pricing breakdown
    const platformFee = orderTotal * (SERVICE_FEE_PERCENTAGE / 100);
    pricing = {
      subtotal: orderTotal - (orderTotal * DEFAULT_TAX_RATE),
      deliveryFee: 0,
      serviceFee: platformFee,
      tax: orderTotal * DEFAULT_TAX_RATE,
      total: orderTotal
    };
  }

  // STRICT MATH: Convert ALL values to cents using Math.round() to avoid decimal errors
  const amountCents = Math.round(pricing.total * 100);
  const applicationFeeCents = Math.round(pricing.serviceFee * 100);
  const deliveryFeeCents = Math.round(pricing.deliveryFee * 100);
  const subtotalCents = Math.round(pricing.subtotal * 100);
  const taxCents = Math.round(pricing.tax * 100);

  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return errorResponse(res, 'Invalid calculated amount', 400);
  }

  // Calculate net amount for restaurant (total - platform fee)
  const netAmountCents = amountCents - applicationFeeCents;

  // DEBUG LOGGING: Stripe Payment Intent Details
  console.log('\n========== STRIPE PAYMENT INTENT ==========');
  console.log(`Total Amount Charged: $${(amountCents / 100).toFixed(2)} CAD (${amountCents} cents)`);
  console.log(`Application Fee (Platform): $${(applicationFeeCents / 100).toFixed(2)} CAD (${applicationFeeCents} cents)`);
  console.log(`Delivery Fee: $${(deliveryFeeCents / 100).toFixed(2)} CAD (${deliveryFeeCents} cents)`);
  console.log(`Subtotal: $${(subtotalCents / 100).toFixed(2)} CAD (${subtotalCents} cents)`);
  console.log(`Tax: $${(taxCents / 100).toFixed(2)} CAD (${taxCents} cents)`);
  console.log(`Restaurant Stripe Account ID: ${restaurantStripeAccountId}`);
  console.log(`Net Amount to Restaurant: $${(netAmountCents / 100).toFixed(2)} CAD (${netAmountCents} cents)`);
  console.log('=========================================\n');

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'cad',
    automatic_payment_methods: { enabled: true },

    // Stripe Connect marketplace split:
    // - application_fee_amount: platform cut (service fee)
    // - transfer_data.destination: connected restaurant account receives the remainder
    application_fee_amount: applicationFeeCents,
    transfer_data: {
      destination: restaurantStripeAccountId
    },

    metadata: {
      subtotal_cents: String(subtotalCents),
      delivery_fee_cents: String(deliveryFeeCents),
      service_fee_cents: String(applicationFeeCents),
      tax_cents: String(taxCents),
      total_cents: String(amountCents),
      restaurant_stripe_account_id: restaurantStripeAccountId
    }
  });

  console.log(`✅ Payment Intent Created Successfully: ${paymentIntent.id}`);

  successResponse(res, { clientSecret: paymentIntent.client_secret }, 'Payment intent created');
});

/**
 * @desc    Confirm payment
 * @route   POST /api/v1/payments/confirm
 * @access  Private (Customer)
 */
const confirmPayment = asyncHandler(async (req, res) => {
  // TODO: Implement payment confirmation
  successResponse(res, null, 'Payment confirmation not implemented yet');
});

/**
 * @desc    Process refund
 * @route   POST /api/v1/payments/refund
 * @access  Private (Partner/Admin)
 */
const processRefund = asyncHandler(async (req, res) => {
  // TODO: Implement refund processing
  successResponse(res, null, 'Refund processing not implemented yet');
});

/**
 * @desc    Get saved payment methods
 * @route   GET /api/v1/payments/methods
 * @access  Private (Customer)
 */
const getPaymentMethods = asyncHandler(async (req, res) => {
  // TODO: Implement getting saved payment methods
  successResponse(res, { methods: [] }, 'Payment methods retrieved');
});

/**
 * @desc    Save payment method
 * @route   POST /api/v1/payments/methods
 * @access  Private (Customer)
 */
const savePaymentMethod = asyncHandler(async (req, res) => {
  // TODO: Implement saving payment method
  successResponse(res, null, 'Payment method saved');
});

/**
 * @desc    Delete payment method
 * @route   DELETE /api/v1/payments/methods/:id
 * @access  Private (Customer)
 */
const deletePaymentMethod = asyncHandler(async (req, res) => {
  // TODO: Implement deleting payment method
  successResponse(res, null, 'Payment method deleted');
});

// Routes
router.post('/create-intent', roleMiddleware('customer'), createPaymentIntent);
router.post('/confirm', roleMiddleware('customer'), confirmPayment);
router.post('/refund', roleMiddleware('partner', 'admin'), processRefund);
router.get('/methods', roleMiddleware('customer'), getPaymentMethods);
router.post('/methods', roleMiddleware('customer'), savePaymentMethod);
router.delete('/methods/:id', commonValidations.mongoId, roleMiddleware('customer'), deletePaymentMethod);

module.exports = router;
