// FILE: scripts/debug-next-sunday.js
const { getNextSunday } = require('../src/utils/dateHelpers');

/**
 * Debug getNextSunday function
 */
function debugNextSunday() {
  console.log('🔍 DEBUGGING getNextSunday FUNCTION');
  console.log('=' .repeat(40));
  
  const today = new Date();
  console.log(`Today: ${today.toDateString()} (${today.getDay()})`);
  
  const nextSunday = getNextSunday(today);
  console.log(`Next Sunday: ${nextSunday.toDateString()} (${nextSunday.getDay()})`);
  
  // Test with different days
  const testDates = [
    new Date('2025-10-09'), // Wednesday
    new Date('2025-10-10'), // Thursday  
    new Date('2025-10-11'), // Friday
    new Date('2025-10-12'), // Saturday
    new Date('2025-10-13'), // Sunday
  ];
  
  console.log('\n📅 Testing getNextSunday with different dates:');
  testDates.forEach(date => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const nextSun = getNextSunday(date);
    console.log(`${date.toDateString()} (${dayNames[date.getDay()]}) → ${nextSun.toDateString()} (${dayNames[nextSun.getDay()]})`);
  });
}

debugNextSunday();
