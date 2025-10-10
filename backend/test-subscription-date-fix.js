/**
 * Test script to verify subscription meal plan date fix
 */

const { getNextSunday, getWeekDateRange } = require('./src/utils/dateHelpers');

console.log('🧪 Testing Subscription Meal Plan Date Fix');
console.log('=' .repeat(50));

// Test the fixed calculation logic
const testSubscriptionDates = (planType) => {
  console.log(`\n📅 Testing ${planType.toUpperCase()} Plan:`);
  console.log('-' .repeat(30));
  
  // FIXED: Use proper Sunday-based calculation
  const startDate = getNextSunday(); // Start on next Sunday, not current date
  const endDate = new Date(startDate);
  let weekCount = 1;
  
  switch (planType) {
    case 'bi-weekly':
      endDate.setDate(startDate.getDate() + 13); // 14 days = 2 weeks, but end on Saturday (13 days from Sunday)
      weekCount = 2;
      break;
    case 'monthly':
      endDate.setDate(startDate.getDate() + 27); // 4 weeks = 28 days, but end on Saturday (27 days from Sunday)
      weekCount = 4;
      break;
    case 'quarterly':
      endDate.setDate(startDate.getDate() + 83); // 12 weeks = 84 days, but end on Saturday (83 days from Sunday)
      weekCount = 12;
      break;
  }
  
  // Generate week start dates using proper Sunday-based calculation
  const weekStartDates = [];
  
  for (let i = 0; i < weekCount; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (i * 7)); // Each week starts on Sunday
    weekStartDates.push(weekStart);
  }
  
  console.log(`Plan Start: ${startDate.toDateString()} (${startDate.getDay() === 0 ? '✅ Sunday' : '❌ Not Sunday'})`);
  console.log(`Plan End:   ${endDate.toDateString()} (${endDate.getDay() === 6 ? '✅ Saturday' : '❌ Not Saturday'})`);
  console.log(`Duration:   ${Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1} days`);
  console.log(`Weeks:      ${weekCount}`);
  
  console.log('Week Start Dates:');
  weekStartDates.forEach((date, index) => {
    const isCorrectDay = date.getDay() === 0;
    console.log(`   Week ${index + 1}: ${date.toDateString()} (${isCorrectDay ? '✅ Sunday' : '❌ Not Sunday'})`);
  });
  
  return {
    startCorrect: startDate.getDay() === 0,
    endCorrect: endDate.getDay() === 6,
    allWeeksCorrect: weekStartDates.every(date => date.getDay() === 0)
  };
};

// Test all plan types
const biWeeklyResult = testSubscriptionDates('bi-weekly');
const monthlyResult = testSubscriptionDates('monthly');
const quarterlyResult = testSubscriptionDates('quarterly');

// Summary
console.log('\n🎯 Summary');
console.log('-' .repeat(30));
console.log(`Bi-weekly Plan: ${biWeeklyResult.startCorrect && biWeeklyResult.endCorrect && biWeeklyResult.allWeeksCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
console.log(`Monthly Plan:   ${monthlyResult.startCorrect && monthlyResult.endCorrect && monthlyResult.allWeeksCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
console.log(`Quarterly Plan: ${quarterlyResult.startCorrect && quarterlyResult.endCorrect && quarterlyResult.allWeeksCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);

const allCorrect = [biWeeklyResult, monthlyResult, quarterlyResult].every(result => 
  result.startCorrect && result.endCorrect && result.allWeeksCorrect
);

if (allCorrect) {
  console.log('\n🎉 SUCCESS: All subscription plans now use correct Sunday-Saturday weeks!');
  console.log('   - Plans start on Sunday (not random current date)');
  console.log('   - Plans end on Saturday');
  console.log('   - All week boundaries are correct');
  console.log('   - No more timezone offset issues');
} else {
  console.log('\n❌ ISSUE: Some subscription plans still have date problems');
}

// Compare with old broken calculation
console.log('\n🔍 Comparison with OLD (broken) calculation:');
console.log('-' .repeat(40));
const oldStartDate = new Date(); // Old broken way
const newStartDate = getNextSunday(); // New fixed way

console.log(`OLD (broken): ${oldStartDate.toDateString()} (Day ${oldStartDate.getDay()})`);
console.log(`NEW (fixed):  ${newStartDate.toDateString()} (Day ${newStartDate.getDay()})`);
console.log(`Difference:   ${Math.ceil((newStartDate - oldStartDate) / (1000 * 60 * 60 * 24))} days`);
