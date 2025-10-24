// Debug calendar entry dates
const mongoose = require('mongoose');
require('dotenv').config();

async function debugCalendarDates() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const UserMealCalendar = require('./src/models/UserMealCalendar');

    // Find the meal calendar
    const mealCalendar = await UserMealCalendar.findById('68fbc8204027e108f1043531');

    if (mealCalendar) {
      console.log('📋 Raw calendar entries data:');
      mealCalendar.calendarEntries.forEach((entry, index) => {
        console.log(`\n${index + 1}. Entry:`);
        console.log(`   - mealName: ${entry.mealName}`);
        console.log(`   - mealType: ${entry.mealType}`);
        console.log(`   - status: ${entry.status}`);
        console.log(`   - scheduledDate (raw): ${entry.scheduledDate}`);
        console.log(`   - scheduledDate (type): ${typeof entry.scheduledDate}`);
        console.log(`   - scheduledDate (Date): ${new Date(entry.scheduledDate)}`);
        console.log(`   - scheduledDate (ISO): ${entry.scheduledDate ? new Date(entry.scheduledDate).toISOString() : 'null'}`);
      });

      // Check the full document structure
      console.log('\n📄 Full document structure:');
      console.log(JSON.stringify(mealCalendar.toObject(), null, 2));
    } else {
      console.log('❌ Meal calendar not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

debugCalendarDates();
