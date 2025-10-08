// FILE: src/routes/partner/restaurantSettings.routes.js
const express = require('express');
const router = express.Router();
const {
  getMyRestaurant,
  getRestaurantSettings,
  updateRestaurantSettings,
  getNotificationPreferences,
  updateNotificationPreferences,
  getBillingInfo,
  updateBillingInfo
} = require('../../controllers/partner/restaurantSettings.controller');
const { authMiddleware, roleMiddleware } = require('../../middlewares/auth');
const { validateRequest } = require('../../middlewares/joiValidation');
const Joi = require('joi');

// Validation schemas
const updateRestaurantSettingsSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    description: Joi.string().trim().max(500),
    cuisine: Joi.alternatives().try(
      Joi.string().trim(),
      Joi.array().items(Joi.string().trim()).min(1)
    ),
    phone: Joi.string().trim().pattern(/^\+?[1-9]\d{1,14}$/),
    email: Joi.string().email().lowercase(),
    website: Joi.string().uri(),
    address: Joi.alternatives().try(
      Joi.string().trim(),
      Joi.object({
        street: Joi.string().trim(),
        city: Joi.string().trim(),
        province: Joi.string().trim(),
        postalCode: Joi.string().trim(),
        coordinates: Joi.object({
          lat: Joi.number().min(-90).max(90),
          lng: Joi.number().min(-180).max(180)
        })
      })
    ),
    deliverySettings: Joi.object({
      radius: Joi.number().min(1).max(50),
      fee: Joi.number().min(0).max(50),
      minOrderAmount: Joi.number().min(0).max(200),
      avgDeliveryTime: Joi.number().min(10).max(120)
    }),
    // Individual delivery fields for backward compatibility
    deliveryRadius: Joi.number().min(1).max(50),
    deliveryFee: Joi.number().min(0).max(50),
    minOrderAmount: Joi.number().min(0).max(200),
    avgDeliveryTime: Joi.number().min(10).max(120),
    operatingHours: Joi.object({
      monday: Joi.object({
        open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean()
      }),
      tuesday: Joi.object({
        open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean()
      }),
      wednesday: Joi.object({
        open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean()
      }),
      thursday: Joi.object({
        open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean()
      }),
      friday: Joi.object({
        open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean()
      }),
      saturday: Joi.object({
        open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean()
      }),
      sunday: Joi.object({
        open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closed: Joi.boolean()
      })
    })
  })
};

const updateNotificationPreferencesSchema = {
  body: Joi.object({
    preferences: Joi.object({
      emailNotifications: Joi.boolean(),
      smsNotifications: Joi.boolean(),
      orderAlerts: Joi.boolean(),
      customerMessages: Joi.boolean(),
      systemUpdates: Joi.boolean()
    }).required()
  })
};

const updateBillingInfoSchema = {
  body: Joi.object({
    billingInfo: Joi.object({
      businessName: Joi.string().trim().max(100).allow(''),
      billingAddress: Joi.object({
        street: Joi.string().trim().max(100).allow(''),
        city: Joi.string().trim().max(50).allow(''),
        province: Joi.string().trim().max(50).allow(''),
        postalCode: Joi.string().trim().uppercase().pattern(/^[A-Z]\d[A-Z] \d[A-Z]\d$/).allow(''),
        country: Joi.string().trim().max(50).default('Canada').allow('')
      }).allow(null),
      paymentMethod: Joi.string().trim().max(100).allow(''),
      bankAccountInfo: Joi.object({
        bankName: Joi.string().trim().max(100).allow(''),
        accountType: Joi.string().valid('checking', 'savings', 'business').allow('', null),
        routingNumber: Joi.string().trim().pattern(/^\d{9}$/).allow(''),
        accountNumber: Joi.string().trim().pattern(/^\d{8,17}$/).allow('')
      }).allow(null),
      taxInfo: Joi.object({
        businessNumber: Joi.string().trim().pattern(/^\d{9}RP\d{4}$/).allow(''),
        gstHstNumber: Joi.string().trim().pattern(/^\d{9}RT\d{4}$/).allow(''),
        qstNumber: Joi.string().trim().pattern(/^\d{10}TQ\d{4}$/).allow('')
      }).allow(null),
      contactInfo: Joi.object({
        billingEmail: Joi.string().email().lowercase().trim().allow(''),
        billingPhone: Joi.string().trim().pattern(/^\+?[\d\s\-\(\)]+$/).allow(''),
        contactPerson: Joi.string().trim().max(100).allow('')
      }).allow(null)
    }).required()
  })
};

// Apply authentication middleware to all routes
router.use(authMiddleware);
router.use(roleMiddleware('partner', 'admin'));

// Get current user's restaurant
router.get('/restaurants/me', getMyRestaurant);

// Restaurant settings routes
router.route('/restaurants/:restaurantId/settings')
  .get(getRestaurantSettings)
  .patch(validateRequest(updateRestaurantSettingsSchema), updateRestaurantSettings);

// User notification preferences routes
router.route('/users/me/notification-preferences')
  .get(getNotificationPreferences)
  .patch(validateRequest(updateNotificationPreferencesSchema), updateNotificationPreferences);

// User billing information routes
router.route('/users/me/billing')
  .get(getBillingInfo)
  .patch(validateRequest(updateBillingInfoSchema), updateBillingInfo);

module.exports = router;
