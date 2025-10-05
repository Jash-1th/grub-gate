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

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use('/api/v1/meal-plans', mealPlanRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler (must be last)
app.use(errorHandler);

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

module.exports = app;
