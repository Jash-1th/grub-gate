const { findSubscriptionDayForDate, getNextSunday } = require('./src/utils/dateHelpers');

// Your actual subscription data
const subscriptionData = {
  planStartDate: new Date('2025-10-11T18:30:00.000+00:00'),
  planEndDate: new Date('2025-10-25T18:30:00.000+00:00'),
  weekStartDates: [
    new Date('2025-10-11T18:30:00.000+00:00'),
    new Date('2025-10-18T18:30:00.000+00:00')
  ],
  weeks: [
    {
      weekNumber: 1,
      weekStartDate: new Date('2025-10-11T18:30:00.000+00:00'),
      weekEndDate: new Date('2025-10-18T18:29:59.999+00:00'),
      meals: {}
    },
    {
      weekNumber: 2,
      weekStartDate: new Date('2025-10-18T18:30:00.000+00:00'),
      weekEndDate: new Date('2025-10-25T18:29:59.999+00:00'),
      meals: {}
    }
  ]
};

console.log('🔍 DEBUGGING SUBSCRIPTION DATE ISSUE');
console.log('=====================================');

// Test what day of week each date is
console.log('\n📅 DATE ANALYSIS:');
console.log('Oct 11, 2025:', new Date('2025-10-11').toDateString(), '- Day of week:', new Date('2025-10-11').getDay(), '(0=Sunday, 1=Monday, etc.)');
console.log('Oct 12, 2025:', new Date('2025-10-12').toDateString(), '- Day of week:', new Date('2025-10-12').getDay());
console.log('Oct 13, 2025:', new Date('2025-10-13').toDateString(), '- Day of week:', new Date('2025-10-13').getDay());

// Test current subscription structure
console.log('\n🗓️ CURRENT SUBSCRIPTION STRUCTURE:');
console.log('Plan Start:', subscriptionData.planStartDate.toDateString());
console.log('Plan End:', subscriptionData.planEndDate.toDateString());

subscriptionData.weeks.forEach((week, index) => {
  console.log(`\nWeek ${week.weekNumber}:`);
  console.log(`  Start: ${week.weekStartDate.toDateString()} (Day ${week.weekStartDate.getDay()})`);
  console.log(`  End: ${week.weekEndDate.toDateString()} (Day ${week.weekEndDate.getDay()})`);
});

// Test findSubscriptionDayForDate function
console.log('\n🔍 TESTING findSubscriptionDayForDate:');
const testDates = [
  new Date('2025-10-11'), // Saturday (should be null - before subscription)
  new Date('2025-10-12'), // Sunday (should be 'sunday' - first day)
  new Date('2025-10-13'), // Monday (should be 'monday')
  new Date('2025-10-18'), // Saturday (should be 'saturday' - last day of week 1)
  new Date('2025-10-19')  // Sunday (should be 'sunday' - first day of week 2)
];

testDates.forEach(date => {
  const result = findSubscriptionDayForDate(date, subscriptionData.weeks);
  console.log(`${date.toDateString()} (Day ${date.getDay()}) -> "${result}"`);
});

// Test what getNextSunday returns from Oct 9, 2025 (today)
console.log('\n📅 TESTING getNextSunday from Oct 9, 2025:');
const today = new Date('2025-10-09');
const nextSunday = getNextSunday(today);
console.log(`From ${today.toDateString()} -> Next Sunday: ${nextSunday.toDateString()}`);

console.log('\n❌ PROBLEM IDENTIFIED:');
console.log('The subscription starts on Oct 11 (Saturday) but should start on Oct 12 (Sunday)');
console.log('This causes date mapping issues in the partner orders page');
