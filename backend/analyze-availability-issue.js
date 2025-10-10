// Analyze availability issues in partner portal without database connection
console.log('🔍 Analyzing Menu Item Availability Issues in Partner Portal\n');

// Simulate the availability data structure from partner portal frontend
console.log('📋 FRONTEND AVAILABILITY STRUCTURE (MenuPage.jsx):');
const frontendAvailability = {
  monday: { lunch: true, dinner: true },
  tuesday: { lunch: true, dinner: true },
  wednesday: { lunch: true, dinner: true },
  thursday: { lunch: true, dinner: true },
  friday: { lunch: true, dinner: true },
  saturday: { lunch: true, dinner: true },
  sunday: { lunch: true, dinner: true }
};

console.log('Initial form data (lines 68-76 in MenuPage.jsx):');
console.log(JSON.stringify(frontendAvailability, null, 2));

// Simulate FormData creation (createMenuItemFormData function)
console.log('\n📤 FORMDATA PROCESSING (menuApi.js):');

const createMenuItemFormData = (itemData, imageFile = null) => {
  const formData = new FormData();
  
  // This is the key part - how availability is handled
  Object.keys(itemData).forEach(key => {
    if (itemData[key] !== null && itemData[key] !== undefined) {
      if (typeof itemData[key] === 'object' && key === 'availability') {
        // Handle availability object - THIS IS CRITICAL
        console.log('🔑 Converting availability to JSON string:', JSON.stringify(itemData[key]));
        formData.append(key, JSON.stringify(itemData[key]));
      } else {
        formData.append(key, itemData[key]);
      }
    }
  });
  
  return formData;
};

// Simulate the FormData creation
console.log('\nSimulating FormData creation...');
const mockFormData = {
  name: 'Test Item',
  description: 'Test description',
  category: 'main',
  price: 15.99,
  availability: frontendAvailability
};

// This simulates what happens in the frontend
const formDataString = JSON.stringify(frontendAvailability);
console.log('FormData availability string:', formDataString);

// Simulate backend parsing (parseMenuItemFormData function)
console.log('\n📥 BACKEND PARSING (menuApi.js):');

const parseMenuItemFormData = (formData) => {
  const data = {};
  
  // Simulate getting availability from FormData
  const availabilityStr = formDataString; // This would be formData.get('availability')
  if (availabilityStr) {
    try {
      data.availability = JSON.parse(availabilityStr);
      console.log('✅ Successfully parsed availability:', JSON.stringify(data.availability, null, 2));
    } catch (e) {
      console.error('❌ Error parsing availability:', e.message);
    }
  }
  
  return data;
};

const parsedData = parseMenuItemFormData();

// Simulate MongoDB schema validation
console.log('\n🗄️  MONGODB SCHEMA VALIDATION (MenuItem.js):');

const validateAvailabilityStructure = (availability) => {
  const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const issues = [];
  
  if (!availability || typeof availability !== 'object') {
    issues.push('❌ Availability is not an object');
    return issues;
  }
  
  requiredDays.forEach(day => {
    if (!availability[day]) {
      issues.push(`❌ Missing ${day} availability`);
    } else {
      if (typeof availability[day].lunch !== 'boolean') {
        issues.push(`❌ ${day}.lunch is not a boolean (${typeof availability[day].lunch})`);
      }
      if (typeof availability[day].dinner !== 'boolean') {
        issues.push(`❌ ${day}.dinner is not a boolean (${typeof availability[day].dinner})`);
      }
    }
  });
  
  return issues;
};

const validationIssues = validateAvailabilityStructure(parsedData.availability);
if (validationIssues.length === 0) {
  console.log('✅ Availability structure is valid');
} else {
  console.log('❌ Validation issues found:');
  validationIssues.forEach(issue => console.log('  ', issue));
}

// Test findAlwaysAvailable logic
console.log('\n🔍 ALWAYS AVAILABLE LOGIC (MenuItem.js):');

const testFindAlwaysAvailable = (availability) => {
  const query = {
    status: 'available',
    'availability.monday.lunch': true,
    'availability.monday.dinner': true,
    'availability.tuesday.lunch': true,
    'availability.tuesday.dinner': true,
    'availability.wednesday.lunch': true,
    'availability.wednesday.dinner': true,
    'availability.thursday.lunch': true,
    'availability.thursday.dinner': true,
    'availability.friday.lunch': true,
    'availability.friday.dinner': true,
    'availability.saturday.lunch': true,
    'availability.saturday.dinner': true,
    'availability.sunday.lunch': true,
    'availability.sunday.dinner': true
  };
  
  console.log('Query for always available items:');
  console.log('- All 14 slots (7 days × 2 meals) must be true');
  
  // Check if our test availability would match
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const wouldMatch = days.every(day => 
    availability[day] && 
    availability[day].lunch === true && 
    availability[day].dinner === true
  );
  
  console.log(`✅ Test availability would match always-available query: ${wouldMatch}`);
  
  return wouldMatch;
};

testFindAlwaysAvailable(parsedData.availability);

// Test with partial availability
console.log('\n🧪 TESTING PARTIAL AVAILABILITY:');
const partialAvailability = {
  monday: { lunch: true, dinner: false },  // Not always available
  tuesday: { lunch: true, dinner: true },
  wednesday: { lunch: true, dinner: true },
  thursday: { lunch: true, dinner: true },
  friday: { lunch: true, dinner: true },
  saturday: { lunch: true, dinner: true },
  sunday: { lunch: true, dinner: true }
};

console.log('Partial availability (Monday dinner = false):');
console.log(JSON.stringify(partialAvailability, null, 2));

const partialWouldMatch = testFindAlwaysAvailable(partialAvailability);
console.log(`Would match always-available: ${partialWouldMatch} (should be false)`);

// Identify potential issues
console.log('\n🚨 POTENTIAL ISSUES IDENTIFIED:');

console.log('\n1. ⚠️  FRONTEND ISSUES (MenuPage.jsx):');
console.log('   - Check if availability checkboxes are properly bound to state');
console.log('   - Verify handleInputChange for availability updates the correct structure');
console.log('   - Lines 667-674 and 681-688 handle checkbox changes');

console.log('\n2. ⚠️  API ISSUES (menuApi.js):');
console.log('   - FormData JSON.stringify might not preserve boolean types');
console.log('   - Line 164: formData.append(key, JSON.stringify(itemData[key]))');
console.log('   - Line 219: JSON.parse(availabilityStr) might have type issues');

console.log('\n3. ⚠️  BACKEND ISSUES (menuItem.controller.js):');
console.log('   - Multer FormData parsing might convert booleans to strings');
console.log('   - Validation middleware might not catch availability structure issues');
console.log('   - Lines 162-167 in routes: availabilityValidation might be insufficient');

console.log('\n4. ⚠️  DATABASE ISSUES (MenuItem.js):');
console.log('   - Pre-save middleware (lines 199-214) sets default availability');
console.log('   - findAlwaysAvailable method (lines 314-339) is very strict');
console.log('   - Any missing or false value excludes item from normal users');

console.log('\n📋 RECOMMENDED DEBUGGING STEPS:');
console.log('1. Add console.log in MenuPage.jsx handleInputChange for availability');
console.log('2. Add console.log in createMenuItemFormData before JSON.stringify');
console.log('3. Add console.log in backend controller before MenuItem.create');
console.log('4. Check if boolean values are preserved through the entire flow');
console.log('5. Test with browser dev tools to see actual FormData being sent');

console.log('\n✅ Analysis completed. Check the recommended debugging steps above.');
