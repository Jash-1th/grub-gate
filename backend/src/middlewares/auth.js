// FILE: src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token and attach user to request
const authMiddleware = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware: Processing request to:', req.method, req.path);
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies (for web app)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      console.log('❌ Auth middleware: No token found in request');
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    console.log('🔍 Auth middleware: Token received (first 20 chars):', token.substring(0, 20) + '...');
    console.log('🔍 Auth middleware: Token length:', token.length);

    try {
      // Verify token
      console.log('🔑 Auth middleware: Attempting to verify token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Auth middleware: Token verified successfully, user ID:', decoded.id);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-passwordHash');
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Token is valid but user no longer exists.'
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({
          status: 'error',
          message: 'Your account has been deactivated. Please contact support.'
        });
      }

      // Attach user to request object
      req.user = user;
      console.log('✅ Auth middleware: User authenticated:', user._id, 'for', req.method, req.path);
      next();

    } catch (jwtError) {
      console.log('❌ Auth middleware: JWT verification failed:', jwtError.name, jwtError.message);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token has expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }

      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token. Please login again.',
          code: 'INVALID_TOKEN'
        });
      }

      throw jwtError;
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authentication error occurred.'
    });
  }
};

// Middleware to check user roles
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.'
      });
    }

    // Check both roles array (new) and role field (legacy) for backward compatibility
    const userRoles = req.user.roles || (req.user.role ? [req.user.role] : []);
    
    // Check if user has any of the allowed roles
    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource or is admin
const ownershipMiddleware = (resourceUserIdField = 'customerId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.'
      });
    }

    // Check both roles array (new) and role field (legacy) for backward compatibility
    const userRoles = req.user.roles || (req.user.role ? [req.user.role] : []);
    
    // Admin can access everything
    if (userRoles.includes('admin')) {
      return next();
    }

    // Check ownership based on the resource
    const resourceUserId = req.body[resourceUserIdField] || 
                          req.params[resourceUserIdField] || 
                          req.query[resourceUserIdField];

    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

// Middleware to check restaurant ownership
const restaurantOwnershipMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.'
      });
    }

    // Check both roles array (new) and role field (legacy) for backward compatibility
    const userRoles = req.user.roles || (req.user.role ? [req.user.role] : []);
    
    // Admin can access everything
    if (userRoles.includes('admin')) {
      return next();
    }

    // Partners can only access their own restaurants
    if (userRoles.includes('partner')) {
      const restaurantId = req.params.restaurantId || req.params.id || req.body.restaurantId;
      
      if (restaurantId) {
        const Restaurant = require('../models/Restaurant');
        const restaurant = await Restaurant.findById(restaurantId);
        
        if (!restaurant) {
          return res.status(404).json({
            status: 'error',
            message: 'Restaurant not found.'
          });
        }

        if (restaurant.ownerId.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            status: 'error',
            message: 'Access denied. You can only manage your own restaurants.'
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error('Restaurant ownership middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authorization error occurred.'
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-passwordHash');
        
        if (user && user.status === 'active') {
          req.user = user;
        }
      } catch (jwtError) {
        // Silently ignore token errors for optional auth
        console.warn('Optional auth token error:', jwtError.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  ownershipMiddleware,
  restaurantOwnershipMiddleware,
  optionalAuthMiddleware
};
