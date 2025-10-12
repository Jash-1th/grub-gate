/**
 * Calculate growth percentage between two values
 * @param {number} current - Current period value
 * @param {number} previous - Previous period value
 * @param {boolean} [inverse] - Whether lower values are better (e.g., for time metrics)
 * @returns {number} Growth percentage (positive for growth, negative for decline)
 */
const calculateGrowth = (current, previous, inverse = false) => {
  if (previous === 0 || previous === null || previous === undefined) {
    return current > 0 ? 100 : 0;
  }
  
  const growth = ((current - previous) / Math.abs(previous)) * 100;
  
  // For inverse metrics (where lower is better), invert the growth
  return inverse ? -growth : growth;
};

/**
 * Format growth value with proper sign and decimal places
 * @param {number} value - The growth value to format
 * @returns {number} Formatted growth value
 */
const formatGrowth = (value) => {
  return parseFloat(value.toFixed(1));
};

module.exports = {
  calculateGrowth,
  formatGrowth
};
