/**
 * Test script to verify the date calculation fix
 * This will compare frontend and backend date calculations
 */

const { getNextSunday, getWeekDateRange, getCalendarDateForSubscriptionDay } = require('./src/utils/dateHelpers');

console.log('🧪 Testing Date Calculation Fix');
console.log('=' .repeat(50));

// Simulate frontend calculation (from WeeklyMenuPage.jsx)
const frontendGetNextSunday = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek; // If today is Sunday, get next Sunday
  
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + daysUntilSunday);
  nextSunday.setHours(0, 0, 0, 0); // Reset to start of day
  
  return nextSunday;
};

const frontendGetDayDateForWeek = (dayName, weekOffset = 0) => {
  // Map day names to Sunday-based index (Sunday = 0, Monday = 1, etc.)
  const dayNameToIndex = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  };
  
  const dayIndex = dayNameToIndex[dayName.toLowerCase()];
  if (dayIndex === undefined) return null;
  
  const nextSunday = frontendGetNextSunday();
  const startOfWeek = new Date(nextSunday);
  startOfWeek.setDate(nextSunday.getDate() + (weekOffset * 7)); // Next Sunday + week offset
  const targetDay = new Date(startOfWeek);
  targetDay.setDate(startOfWeek.getDate() + dayIndex); // Add day index (0=Sunday, 1=Monday, etc.)
  
  return targetDay;
};

// Test 1: Compare getNextSunday functions
console.log('\n📅 Test 1: getNextSunday Comparison');
console.log('-' .repeat(30));

const frontendNextSunday = frontendGetNextSunday();
const backendNextSunday = getNextSunday();

console.log(`Frontend: ${frontendNextSunday.toDateString()} ${frontendNextSunday.toTimeString()}`);
console.log(`Backend:  ${backendNextSunday.toDateString()} ${backendNextSunday.toTimeString()}`);

const sundayMatch = frontendNextSunday.getTime() === backendNextSunday.getTime();
console.log(`Match: ${sundayMatch ? '✅' : '❌'}`);

if (!sundayMatch) {
  const diff = Math.abs(frontendNextSunday - backendNextSunday) / (1000 * 60 * 60);
  console.log(`Difference: ${diff} hours`);
}

// Test 2: Compare day calculations for Week 1
console.log('\n📅 Test 2: Week 1 Day Calculations');
console.log('-' .repeat(30));

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
let allDaysMatch = true;

for (const day of daysOfWeek) {
  const frontendDate = frontendGetDayDateForWeek(day, 0);
  const backendDate = getCalendarDateForSubscriptionDay(day, 0);
  
  const match = frontendDate && backendDate && frontendDate.getTime() === backendDate.getTime();
  allDaysMatch = allDaysMatch && match;
  
  console.log(`${day.padEnd(10)}: Frontend ${frontendDate?.toDateString()} | Backend ${backendDate?.toDateString()} ${match ? '✅' : '❌'}`);
  
  if (!match && frontendDate && backendDate) {
    const diff = Math.abs(frontendDate - backendDate) / (1000 * 60 * 60 * 24);
    console.log(`           Difference: ${diff} days`);
  }
}

// Test 3: Test specific problematic scenario
console.log('\n📅 Test 3: Specific Day Mapping Test');
console.log('-' .repeat(30));

// Test the scenario: UI shows Sunday Oct 12, should save as Sunday (not Monday)
const testSunday = frontendGetDayDateForWeek('sunday', 1); // Week 1 Sunday
const backendSunday = getCalendarDateForSubscriptionDay('sunday', 1);

console.log(`UI Sunday (Week 1):       ${testSunday?.toDateString()}`);
console.log(`Backend Sunday (Week 1):  ${backendSunday?.toDateString()}`);
console.log(`Should save as:           Sunday (not Monday)`);

const sundayCorrect = testSunday && backendSunday && testSunday.getTime() === backendSunday.getTime();
console.log(`Correct: ${sundayCorrect ? '✅' : '❌'}`);

// Summary
console.log('\n🎯 Summary');
console.log('-' .repeat(30));
console.log(`getNextSunday match: ${sundayMatch ? '✅' : '❌'}`);
console.log(`All days match: ${allDaysMatch ? '✅' : '❌'}`);
console.log(`Sunday mapping correct: ${sundayCorrect ? '✅' : '❌'}`);

if (sundayMatch && allDaysMatch && sundayCorrect) {
  console.log('\n🎉 SUCCESS: Date calculations are now consistent!');
  console.log('   - UI Sunday will save as Sunday in database');
  console.log('   - UI Monday will save as Monday in database');
  console.log('   - No more +1 day offset issue');
} else {
  console.log('\n❌ ISSUE: Date calculations still have problems');
  console.log('   - Need further investigation');
}
