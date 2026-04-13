/**
 * Pricing Calculator Utility
 * Single Source of Truth for all pricing calculations across the backend
 * 
 * NOTE: Keep this in sync with apps/customer-app/src/utils/pricingCalculator.js
 */

// ============================================
// CONSTANTS - Single Source of Truth
// ============================================
const DEFAULT_TAX_RATE = 0.15;           // 15% tax (on meal cost only)
const SERVICE_FEE_PERCENTAGE = 0.099;    // 9.9% platform service fee (on meal cost)
const PLATFORM_COMMISSION_PERCENTAGE = 0.17; // 17% platform commission (on meal + service fee + tax)
const DEFAULT_DELIVERY_FEE = 3.99;       // Default delivery fee

// ============================================
// Helper Functions
// ============================================

/**
 * Get delivery multiplier based on plan type
 * @param {string} planType - Type of plan
 * @param {number} totalDeliveries - Explicit number of deliveries
 * @returns {number} Multiplier for delivery fee
 */
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

/**
 * Calculate subtotal from items
 * @param {Array<{price: number, quantity?: number}>} items - Items array
 * @returns {number} Subtotal amount
 */
const calculateSubtotal = (items) => {
  if (!items || items.length === 0) return 0;
  
  return items.reduce((total, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);
};

/**
 * Calculate delivery fee
 * @param {number} restaurantDeliveryFee - Restaurant's delivery fee
 * @param {string} planType - Plan type for multiplier
 * @param {number} totalDeliveries - Number of deliveries
 * @returns {number} Calculated delivery fee
 */
const calculateDeliveryFee = (restaurantDeliveryFee, planType, totalDeliveries = 1) => {
  const baseFee = restaurantDeliveryFee !== undefined && restaurantDeliveryFee !== null 
    ? restaurantDeliveryFee 
    : DEFAULT_DELIVERY_FEE;
  
  const multiplier = getDeliveryMultiplier(planType, totalDeliveries);
  return baseFee * multiplier;
};

/**
 * Calculate service fee
 * @param {number} subtotal - Order subtotal (meal cost)
 * @param {number} [customRate] - Optional custom service fee percentage
 * @returns {number} Service fee amount
 */
const calculateServiceFee = (subtotal, customRate) => {
  const rate = customRate !== undefined ? customRate : SERVICE_FEE_PERCENTAGE;
  // Use Math.round(value * 100) for every calculation step to prevent floating-point errors
  return Math.round(subtotal * rate * 100) / 100;
};

/**
 * Calculate platform commission
 * @param {number} subtotal - Order subtotal (meal cost)
 * @param {number} serviceFee - Service fee amount
 * @param {number} tax - Tax amount
 * @param {number} [customRate] - Optional custom commission percentage
 * @returns {number} Platform commission amount
 */
const calculatePlatformCommission = (subtotal, serviceFee, tax, customRate) => {
  const rate = customRate !== undefined ? customRate : PLATFORM_COMMISSION_PERCENTAGE;
  const baseAmount = subtotal + serviceFee + tax;
  // Use Math.round(value * 100) for every calculation step to prevent floating-point errors
  return Math.round(baseAmount * rate * 100) / 100;
};

/**
 * Calculate tax
 * @param {number} subtotal - Order subtotal (meal cost only - tax is calculated ONLY on meal cost)
 * @param {number} deliveryFee - Delivery fee (not taxed)
 * @param {number} serviceFee - Service fee (not taxed)
 * @param {number} [customRate] - Optional custom tax rate
 * @returns {number} Tax amount
 */
const calculateTax = (subtotal, deliveryFee, serviceFee, customRate) => {
  const rate = customRate !== undefined ? customRate : DEFAULT_TAX_RATE;
  // CRITICAL: Tax is calculated ONLY on the Meal Cost (subtotal), not on delivery fee or service fee
  // Use Math.round(value * 100) for every calculation step to prevent floating-point errors
  return Math.round(subtotal * rate * 100) / 100;
};

// ============================================
// Main Calculation Function
// ============================================

/**
 * Universal order total calculation
 * Single Source of Truth for all pricing across the application
 * 
 * @param {Object} params - Calculation parameters
 * @param {Array<{price: number, quantity?: number}>} params.items - Array of items
 * @param {number} [params.restaurantDeliveryFee] - Restaurant-specific delivery fee
 * @param {string} [params.planType='single'] - 'bi-weekly', 'monthly', 'quarterly', or 'single'
 * @param {number} [params.totalDeliveries=1] - Number of deliveries for subscription plans
 * @param {number} [params.customTaxRate] - Override default tax rate
 * @param {number} [params.customServiceFeePercentage] - Override default service fee
 * @returns {Object} Complete pricing breakdown
 */
const calculateOrderTotals = ({
  items,
  restaurantDeliveryFee,
  planType = 'single',
  totalDeliveries = 1,
  customTaxRate,
  customServiceFeePercentage
}) => {
  // Validate inputs
  if (!items || !Array.isArray(items)) {
    console.warn('calculateOrderTotals: items must be an array');
    items = [];
  }

  // Calculate individual components
  const subtotal = calculateSubtotal(items);
  const deliveryFee = calculateDeliveryFee(restaurantDeliveryFee, planType, totalDeliveries);
  const serviceFee = calculateServiceFee(subtotal, customServiceFeePercentage);
  const tax = calculateTax(subtotal, deliveryFee, serviceFee, customTaxRate);
  const platformCommission = calculatePlatformCommission(subtotal, serviceFee, tax);
  
  // Customer Grand Total: Meal Cost + Service Fee + Tax + Delivery Fee + Platform Commission
  // Use Math.round(value * 100) for every calculation step to prevent floating-point errors
  const total = Math.round((subtotal + deliveryFee + serviceFee + tax + platformCommission) * 100) / 100;

  // Count items
  const itemCount = items.reduce((count, item) => count + (item.quantity || 1), 0);

  // Grub-Gate's Revenue (application_fee_amount for Stripe): Service Fee + Platform Commission
  const applicationFee = Math.round((serviceFee + platformCommission) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    platformCommission: Math.round(platformCommission * 100) / 100,
    applicationFee, // For Stripe Connect: Service Fee + Platform Commission
    total,
    itemCount
  };
};

// ============================================
// Formatting Helpers
// ============================================

/**
 * Format price for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted price string
 */
const formatPrice = (amount) => {
  return `$${amount.toFixed(2)}`;
};

/**
 * Convert dollars to cents (for Stripe)
 * @param {number} dollars - Amount in dollars
 * @returns {number} Amount in cents
 */
const toCents = (dollars) => {
  return Math.round(dollars * 100);
};

/**
 * Convert cents to dollars
 * @param {number} cents - Amount in cents
 * @returns {number} Amount in dollars
 */
const fromCents = (cents) => {
  return cents / 100;
};

// ============================================
// Exports
// ============================================

module.exports = {
  // Constants
  DEFAULT_TAX_RATE,
  TAX_RATE: DEFAULT_TAX_RATE,
  SERVICE_FEE_PERCENTAGE,
  SERVICE_FEE_RATE: SERVICE_FEE_PERCENTAGE,
  PLATFORM_COMMISSION_PERCENTAGE,
  PLATFORM_COMMISSION_RATE: PLATFORM_COMMISSION_PERCENTAGE,
  DEFAULT_DELIVERY_FEE,
  DELIVERY_FEE: DEFAULT_DELIVERY_FEE,
  
  // Main function
  calculateOrderTotals,
  
  // Helper functions
  calculateSubtotal,
  calculateDeliveryFee,
  calculateServiceFee,
  calculateTax,
  calculatePlatformCommission,
  getDeliveryMultiplier,
  formatPrice,
  toCents,
  fromCents
};
