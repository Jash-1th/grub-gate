/**
 * Test script for meal plan date calculation system
 * Run with: node test-meal-plan-dates.js
 */

const { calculateMealPlanDates, addDatesToMealPlan, needsDateRecalculation } = require('./src/utils/mealPlanDateCalculator');

console.log('🧪 Testing Meal Plan Date Calculator...\n');

// Test 1: Basic date calculation
console.log('📅 Test 1: Basic Date Calculation');
const dates = calculateMealPlanDates();
console.log('Week 0 dates:', dates.week0);
console.log('Week 1 dates:', dates.week1);
console.log('');

// Test 2: Sample meal plan with dates
console.log('📅 Test 2: Adding Dates to Meal Plan');
const sampleMealPlan = {
  userId: 'test-user',
  weeklyPlans: {
    week0: {
      monday: { 
        lunch: [{ name: 'Chicken Curry', price: 150 }], 
        dinner: [] 
      },
      tuesday: { 
        lunch: [], 
        dinner: [{ name: 'Fish Fry', price: 200 }] 
      },
      wednesday: { lunch: [], dinner: [] },
      thursday: { lunch: [], dinner: [] },
      friday: { lunch: [], dinner: [] },
      saturday: { lunch: [], dinner: [] },
      sunday: { lunch: [], dinner: [] }
    },
    week1: {
      monday: { lunch: [], dinner: [] },
      tuesday: { lunch: [], dinner: [] },
      wednesday: { lunch: [], dinner: [] },
      thursday: { lunch: [], dinner: [] },
      friday: { lunch: [], dinner: [] },
      saturday: { lunch: [], dinner: [] },
      sunday: { lunch: [], dinner: [] }
    }
  },
  totalItems: 2
};

const mealPlanWithDates = addDatesToMealPlan(sampleMealPlan);
console.log('Monday with date:', mealPlanWithDates.weeklyPlans.week0.monday);
console.log('Tuesday with date:', mealPlanWithDates.weeklyPlans.week0.tuesday);
console.log('');

// Test 3: Date recalculation check
console.log('📅 Test 3: Date Recalculation Check');
console.log('Needs recalculation (original):', needsDateRecalculation(sampleMealPlan));
console.log('Needs recalculation (with dates):', needsDateRecalculation(mealPlanWithDates));
console.log('');

// Test 4: Verify Sunday-based weeks
console.log('📅 Test 4: Sunday-Based Week Verification');
const week0Sunday = new Date(dates.week0.sunday);
const week0Monday = new Date(dates.week0.monday);
const dayDifference = (week0Monday - week0Sunday) / (1000 * 60 * 60 * 24);
console.log('Days between Sunday and Monday:', dayDifference);
console.log('Week starts on Sunday:', week0Sunday.getDay() === 0 ? '✅' : '❌');
console.log('');

console.log('✅ All tests completed!');
console.log('🎯 Expected behavior:');
console.log('- Week 0 should start on next Sunday');
console.log('- Week 1 should start 7 days after Week 0');
console.log('- All dates should be in YYYY-MM-DD format');
console.log('- Sunday should have day index 0');
