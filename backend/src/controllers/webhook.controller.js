// FILE: src/controllers/webhook.controller.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const SubscriptionMealPlan = require('../models/SubscriptionMealPlan');
const Order = require('../models/Order');

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/v1/webhooks/stripe
 * @access  Public (Stripe only)
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    // Verify the webhook signature using the raw body
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log(`✅ Stripe webhook verified: ${event.type} (${event.id})`);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      console.log(`💰 PaymentIntent succeeded: ${paymentIntent.id}`);
      console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}`);
      console.log(`   Metadata:`, paymentIntent.metadata);

      try {
        // Extract planId from metadata (set by your frontend when creating PaymentIntent)
        const planId = paymentIntent.metadata?.planId;

        if (!planId) {
          console.warn(`⚠️ No planId found in PaymentIntent metadata: ${paymentIntent.id}`);
          // Still return 200 to acknowledge receipt, but log the issue
          break;
        }

        // Update SubscriptionMealPlan payment status
        const updatedPlan = await SubscriptionMealPlan.findByIdAndUpdate(
          planId,
          { 
            status: 'active',
            // Add a payment tracking field if you want to track the Stripe payment ID
            // You may need to add this field to your schema
          },
          { new: true }
        );

        if (updatedPlan) {
          console.log(`✅ SubscriptionMealPlan updated: ${planId}`);
        } else {
          console.warn(`⚠️ SubscriptionMealPlan not found for planId: ${planId}`);
        }

        // Update all related Orders that reference this plan
        const updatedOrders = await Order.updateMany(
          { weeklyPlanId: planId },
          { 
            paymentStatus: 'paid',
            paymentIntentId: paymentIntent.id
          }
        );

        if (updatedOrders.modifiedCount > 0) {
          console.log(`✅ Updated ${updatedOrders.modifiedCount} orders for planId: ${planId}`);
        } else {
          console.log(`ℹ️ No orders found to update for planId: ${planId}`);
        }

      } catch (error) {
        console.error(`❌ Error processing payment_intent.succeeded:`, error);
        // Don't return 500 - Stripe will retry. Log and continue.
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const errorMessage = paymentIntent.last_payment_error?.message || 'Unknown error';
      console.error(`❌ PaymentIntent failed: ${paymentIntent.id}`);
      console.error(`   Error: ${errorMessage}`);

      try {
        const planId = paymentIntent.metadata?.planId;
        
        if (planId) {
          // Update orders to reflect failed payment
          await Order.updateMany(
            { weeklyPlanId: planId },
            { paymentStatus: 'failed' }
          );
          console.log(`✅ Marked orders as failed for planId: ${planId}`);
        }
      } catch (error) {
        console.error(`❌ Error processing payment_intent.payment_failed:`, error);
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object;
      console.log(`💸 Charge refunded: ${charge.id}`);
      // Handle refunds if needed
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};

module.exports = {
  handleStripeWebhook
};
