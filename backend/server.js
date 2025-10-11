// FILE: server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('express-async-errors');
require('dotenv').config();

// Import configuration and middleware
const connectDB = require('./src/config/database');
const { errorHandler } = require('./src/middlewares/errorHandler');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const restaurantRoutes = require('./src/routes/restaurant.routes');
const menuItemRoutes = require('./src/routes/menuItem.routes');
const orderRoutes = require('./src/routes/order.routes');
const weeklyPlanRoutes = require('./src/routes/weeklyPlan.routes');
const subscriptionRoutes = require('./src/routes/subscription.routes');
const reviewRoutes = require('./src/routes/review.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');
const contactRoutes = require('./src/routes/contact.routes');
const uploadRoutes = require('./src/routes/upload.routes');
const searchRoutes = require('./src/routes/search.routes');
const mealPlanRoutes = require('./src/routes/mealPlan.routes');
const subscriptionMealPlanRoutes = require('./src/routes/subscriptionMealPlan.routes');
const statsRoutes = require('./src/routes/stats.routes');
const partnerMenuItemRoutes = require('./src/routes/partner/menuItem.routes');
const partnerSettingsRoutes = require('./src/routes/partner/restaurantSettings.routes');
const partnerOrderRoutes = require('./src/routes/partner/orders.routes');
const orderGenerationRoutes = require('./src/routes/orderGeneration.routes');
const adminRoutes = require('./src/routes/admin.routes');
const geocodingRoutes = require('./src/routes/geocoding.routes');

const app = express();

// Connect to MongoDB
connectDB();

// Start order activation service
const { startOrderActivationCron } = require('./src/services/orderActivationService');
startOrderActivationCron();

// Security middleware
app.use(helmet());

// Rate limiting - More generous for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute (was 15 minutes)
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10000, // 10000 requests per minute (was 100 per 15 min)
  message: {
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api', limiter);

// CORS configuration - Allow both Customer App and Partner Portal
const allowedOrigins = [
  'http://localhost:3000', // Customer App
  'http://localhost:5173', // Partner Portal (Vite dev server)
  'http://localhost:4173'  // Partner Portal (Vite preview)
];

// Add production origins from environment variable
if (process.env.CORS_ORIGIN) {
  const productionOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  allowedOrigins.push(...productionOrigins);
}

console.log('🔧 CORS: Allowing origins:', allowedOrigins);
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'GrubGate API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);
app.use('/api/v1/menu-items', menuItemRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/weekly-plans', weeklyPlanRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/meal-plans', mealPlanRoutes);
app.use('/api/v1/subscription-meal-plans', subscriptionMealPlanRoutes);
app.use('/api/v1/partner', partnerMenuItemRoutes);
app.use('/api/v1/partner', partnerSettingsRoutes);
app.use('/api/v1/partner/orders', partnerOrderRoutes);
app.use('/api/v1/orders/generate', orderGenerationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/geocoding', geocodingRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Export the app for serverless functions
module.exports = app;

// Only start server if not in serverless environment
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`🚀 GrubGate API Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.log(`❌ Uncaught Exception: ${err.message}`);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('💤 Process terminated');
    });
  });
}