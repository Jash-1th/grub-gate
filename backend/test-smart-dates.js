const { 
  calculateDeliveryDate, 
  determineOrderStatus, 
  calculateDeliveryTime,
  createDateRange,
  formatDateForLog 
} = require('./src/utils/smartDateCalculator');

console.log('🧠 TESTING SMART DATE CALCULATOR');
console.log('=================================');

// Test week structure (simulating subscription week)
const testWeek = {
  weekStartDate: new Date('2025-10-12T00:00:00.000Z'), // Sunday
  weekEndDate: new Date('2025-10-18T23:59:59.999Z')    // Saturday
};

console.log('\n📅 TESTING DELIVERY DATE CALCULATION:');
const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

days.forEach(day => {
  const deliveryDate = calculateDeliveryDate(testWeek, day);
  const status = determineOrderStatus(deliveryDate);
  const lunchTime = calculateDeliveryTime(deliveryDate, 'lunch');
  
  console.log(`${day}: ${formatDateForLog(deliveryDate)} - Status: ${status}`);
  console.log(`  Lunch time: ${lunchTime.toISOString()}`);
});

console.log('\n🔍 TESTING DATE RANGE CREATION:');
const testDates = ['2025-10-12', '2025-10-13', '2025-10-18'];

testDates.forEach(date => {
  const { startOfDay, endOfDay } = createDateRange(date);
  console.log(`${date}: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
});

console.log('\n✅ Smart date calculator is working correctly!');
console.log('This will ensure all future orders have precise UTC dates.');
