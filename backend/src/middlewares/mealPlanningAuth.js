// FILE: src/middlewares/mealPlanningAuth.js
const { authMiddleware } = require('./auth');

/**
 * Middleware to protect meal planning related routes
 * This middleware checks if the request is coming from a meal planning context
 * and requires authentication for those requests
 */
const mealPlanningAuthMiddleware = async (req, res, next) => {
  // Check if request is from meal planning context
  const source = req.query.source || req.headers['x-source'];
  const isMealPlanningContext = source === 'plan' || 
                               source === 'weekly-menu' || 
                               source === 'meal-plan' ||
                               req.query.day || 
                               req.query.slot ||
                               req.query.week !== undefined;

  // If this is a meal planning context, require authentication
  if (isMealPlanningContext) {
    return authMiddleware(req, res, next);
  }

  // For non-meal planning contexts (public browsing), allow without auth
  next();
};

/**
 * Middleware to protect subscription-related routes
 * Always requires authentication
 */
const subscriptionAuthMiddleware = authMiddleware;

/**
 * Middleware to protect meal plan data routes
 * Always requires authentication and user ownership
 */
const mealPlanDataAuthMiddleware = async (req, res, next) => {
  // First check authentication
  await authMiddleware(req, res, (authError) => {
    if (authError) return next(authError);

    // Check if user is accessing their own data
    const requestedUserId = req.params.userId || req.body.userId;
    if (requestedUserId && requestedUserId !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only access your own meal plan data.'
      });
    }

    next();
  });
};

module.exports = {
  mealPlanningAuthMiddleware,
  subscriptionAuthMiddleware,
  mealPlanDataAuthMiddleware
};
