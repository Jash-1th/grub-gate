/**
 * Debug the day index calculation in findSubscriptionDayForDate
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SubscriptionMealPlan = require('./src/models/SubscriptionMealPlan');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/grub-gate';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const debugDayIndexCalculation = async () => {
  try {
    console.log('🔍 Debug Day Index Calculation');
    console.log('=' .repeat(50));

    const userId = '68e7b7ea4a70ed31cffb3fe9';
    const subscriptionPlan = await SubscriptionMealPlan.findOne({ customerId: userId });
    
    if (!subscriptionPlan) {
      console.log('❌ No subscription plan found');
      return;
    }

    console.log('📋 Subscription Plan Details:');
    subscriptionPlan.weeks.forEach((week, weekIndex) => {
      console.log(`\nWeek ${weekIndex + 1}:`);
      console.log(`  Start: ${week.weekStartDate.toDateString()} (Day ${week.weekStartDate.getDay()})`);
      console.log(`  End: ${week.weekEndDate.toDateString()} (Day ${week.weekEndDate.getDay()})`);
    });

    // Test the day index calculation step by step
    const testDates = [
      new Date(2025, 9, 11), // Oct 11 (Saturday)
      new Date(2025, 9, 12), // Oct 12 (Sunday)
      new Date(2025, 9, 13), // Oct 13 (Monday)
    ];

    testDates.forEach(targetDate => {
      console.log(`\n🧪 Testing: ${targetDate.toDateString()} (Day ${targetDate.getDay()})`);
      
      const target = new Date(targetDate);
      target.setHours(0, 0, 0, 0);
      
      for (const week of subscriptionPlan.weeks) {
        const weekStart = new Date(week.weekStartDate);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(week.weekEndDate);
        weekEnd.setHours(23, 59, 59, 999);
        
        console.log(`  Checking against week: ${weekStart.toDateString()} - ${weekEnd.toDateString()}`);
        console.log(`    Target: ${target.toString()}`);
        console.log(`    Week Start: ${weekStart.toString()}`);
        console.log(`    Week End: ${weekEnd.toString()}`);
        console.log(`    In Range: ${target >= weekStart && target <= weekEnd}`);
        
        if (target >= weekStart && target <= weekEnd) {
          console.log(`  ✅ Found in this week!`);
          
          // Debug the day index calculation
          const targetYear = target.getFullYear();
          const targetMonth = target.getMonth();
          const targetDay = target.getDate();
          
          const startYear = weekStart.getFullYear();
          const startMonth = weekStart.getMonth();
          const startDay = weekStart.getDate();
          
          console.log(`    Target Date Parts: ${targetYear}-${targetMonth + 1}-${targetDay}`);
          console.log(`    Start Date Parts: ${startYear}-${startMonth + 1}-${startDay}`);
          
          const targetLocal = new Date(targetYear, targetMonth, targetDay);
          const startLocal = new Date(startYear, startMonth, startDay);
          
          console.log(`    Target Local: ${targetLocal.toString()}`);
          console.log(`    Start Local: ${startLocal.toString()}`);
          
          const dayIndex = Math.floor((targetLocal - startLocal) / (24 * 60 * 60 * 1000));
          console.log(`    Day Difference (ms): ${targetLocal - startLocal}`);
          console.log(`    Day Index: ${dayIndex}`);
          
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          
          // The issue might be here - we need to account for what day the week starts on
          console.log(`    Week starts on: ${weekStart.toDateString()} (Day ${weekStart.getDay()})`);
          console.log(`    Target is on: ${target.toDateString()} (Day ${target.getDay()})`);
          
          // If week starts on Saturday (day 6), then:
          // Saturday = index 0, Sunday = index 1, Monday = index 2, etc.
          // But our dayNames array assumes Sunday = index 0
          
          const weekStartDayOfWeek = weekStart.getDay(); // 0=Sunday, 6=Saturday
          
          if (weekStartDayOfWeek === 6) { // Week starts on Saturday
            console.log(`    🚨 ISSUE: Week starts on Saturday, but dayNames assumes Sunday start`);
            console.log(`    Current mapping: dayNames[${dayIndex}] = ${dayNames[dayIndex]}`);
            
            // Correct mapping for Saturday-start week
            const saturdayStartDayNames = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            console.log(`    Correct mapping: saturdayStartDayNames[${dayIndex}] = ${saturdayStartDayNames[dayIndex]}`);
            
            const expectedDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][target.getDay()];
            console.log(`    Expected day (based on date): ${expectedDay}`);
            console.log(`    Current result: ${dayNames[dayIndex]}`);
            console.log(`    Correct result: ${saturdayStartDayNames[dayIndex]}`);
          } else {
            console.log(`    Week starts on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekStartDayOfWeek]}`);
            console.log(`    Mapping: dayNames[${dayIndex}] = ${dayNames[dayIndex]}`);
          }
          
          break;
        }
      }
    });

    console.log('\n🎯 Root Cause Analysis:');
    console.log('The issue is that findSubscriptionDayForDate assumes all weeks start on Sunday,');
    console.log('but our subscription week starts on Saturday. We need to fix the day mapping logic.');

  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
};

const runDebug = async () => {
  await connectDB();
  await debugDayIndexCalculation();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
};

runDebug();
