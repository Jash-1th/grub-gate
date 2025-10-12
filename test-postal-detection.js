// Test postal code detection
const { detectCountryFromPostalCode } = require('./backend/src/services/globalGeocodingService');

console.log('🧪 Testing Postal Code Detection\n');

const testCodes = [
  '515671', // Should be India (6 digits)
  '5156', // Partial - should be Australia (4 digits) when complete
  'H3A 1B2', // Should be Canada
  'H3A', // Partial Canadian code
  '10001', // Should be US (5 digits)
  'M5V 2B4', // Should be Canada
  'SW1A 1AA', // Should be UK
  '2000', // Should be Australia (4 digits)
  '12345' // Could be US or Germany (5 digits)
];

testCodes.forEach(code => {
  const result = detectCountryFromPostalCode(code);
  console.log(`📮 "${code}" → ${result || 'UNKNOWN'}`);
});

console.log('\n🔍 Testing specific patterns:');

// Test the patterns directly
const patterns = {
  'US': /^\d{5}(-\d{4})?$/,
  'CA': /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
  'IN': /^\d{6}$/,
  'UK': /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i,
  'AU': /^\d{4}$/,
  'DE': /^\d{5}$/,
  'FR': /^\d{5}$/,
  'JP': /^\d{3}-\d{4}$/,
  'BR': /^\d{5}-\d{3}$/
};

console.log('\n515671 matches:');
Object.entries(patterns).forEach(([country, pattern]) => {
  const matches = pattern.test('515671');
  if (matches) {
    console.log(`✅ ${country}: ${pattern}`);
  }
});

console.log('\nH3A matches:');
Object.entries(patterns).forEach(([country, pattern]) => {
  const matches = pattern.test('H3A');
  if (matches) {
    console.log(`✅ ${country}: ${pattern}`);
  }
});
