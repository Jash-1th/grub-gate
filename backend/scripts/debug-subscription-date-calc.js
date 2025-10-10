// FILE: scripts/debug-subscription-date-calc.js
const { getNextSunday } = require('../src/utils/dateHelpers');

/**
 * Debug subscription date calculation from our test script
 */
function debugSubscriptionDateCalc() {
  console.log('🔍 DEBUGGING SUBSCRIPTION DATE CALCULATION');
  console.log('=' .repeat(50));
  
  // Simulate the exact logic from our test script
  const today = new Date();
  console.log(`Today: ${today.toDateString()} (day ${today.getDay()})`);
  
  const nextSunday = getNextSunday(today);
  console.log(`getNextSunday result: ${nextSunday.toDateString()} (day ${nextSunday.getDay()})`);
  
  const planStartDate = new Date(nextSunday);
  console.log(`planStartDate (before UTC): ${planStartDate.toDateString()}`);
  
  planStartDate.setUTCHours(0, 0, 0, 0);
  console.log(`planStartDate (after UTC): ${planStartDate.toDateString()}`);
  console.log(`planStartDate ISO: ${planStartDate.toISOString()}`);
  
  // Check if the UTC conversion is causing the issue
  const testDate = new Date('2025-10-12'); // Sunday
  console.log(`\nTest with explicit Sunday:`);
  console.log(`Original: ${testDate.toDateString()}`);
  
  testDate.setUTCHours(0, 0, 0, 0);
  console.log(`After setUTCHours: ${testDate.toDateString()}`);
  console.log(`ISO: ${testDate.toISOString()}`);
  
  // Check timezone offset
  console.log(`\nTimezone info:`);
  console.log(`Timezone offset: ${today.getTimezoneOffset()} minutes`);
  console.log(`Local time: ${today.toLocaleString()}`);
  console.log(`UTC time: ${today.toISOString()}`);
}

debugSubscriptionDateCalc();
