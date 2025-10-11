// Quick test for platform stats endpoint
const axios = require('axios');

const testPlatformStats = async () => {
  try {
    console.log('🧪 Testing platform stats endpoint...');
    
    const response = await axios.get('http://localhost:5000/api/v1/stats/platform');
    
    console.log('✅ Success! Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    const data = response.data.data;
    console.log('\n📊 Key Stats:');
    console.log(`   • Total Customers: ${data.totalCustomers}`);
    console.log(`   • Total Restaurants: ${data.totalRestaurants}`);
    console.log(`   • Total Orders: ${data.totalOrders}`);
    console.log(`   • Data Source: ${data.dataSource}`);
    
  } catch (error) {
    console.error('❌ Error:');
    if (error.code === 'ECONNREFUSED') {
      console.error('   Backend server not running on port 5000');
    } else {
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data?.message || error.message);
    }
  }
};

testPlatformStats();
