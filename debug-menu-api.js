// Debug script to check menu API response
const fetch = require('node-fetch');

async function testMenuAPI() {
  try {
    console.log('🔍 Testing menu API...');
    
    // Test the public menu API first (no auth required)
    const publicResponse = await fetch('http://localhost:5000/api/v1/restaurants/1/menu?userType=pro');
    const publicData = await publicResponse.json();
    
    console.log('📋 Public Menu API Response:');
    console.log('Status:', publicResponse.status);
    console.log('Total items:', publicData.data?.menuItems?.length || 0);
    
    if (publicData.data?.menuItems?.length > 0) {
      const firstItem = publicData.data.menuItems[0];
      console.log('\n🍽️ First menu item:');
      console.log('Name:', firstItem.name);
      console.log('Image URL:', firstItem.image || 'No image');
      console.log('Price:', firstItem.price);
      console.log('Category:', firstItem.category);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testMenuAPI();
