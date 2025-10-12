// Test with JSON data instead of FormData to bypass multer
const axios = require('axios');

async function testJsonData() {
  try {
    console.log('🧪 Testing JSON submission (bypassing multer)...');
    
    const jsonData = {
      identifier: 'jash64326@yahoo.com',
      skipOtpVerification: 'true',
      otpVerificationToken: 'verified_jash64326@yahoo.com_1760248656838',
      otp: '123456',
      firstName: '3232',
      lastName: 'ewqewr1',
      email: 'jash64326@yahoo.com',
      phoneNumber: '123456754',
      password: '1qazxsw2Qa',
      restaurantName: 'XYA',
      description: 'JADM DJDMz',
      cuisine: 'Indian',
      cuisineType: 'Indian',
      businessType: 'restaurant',
      street: 'daharmavaram , kotapeta',
      city: 'dharamvara',
      state: 'IN',     // Controller expects 'state' field
      province: 'IN',  // Joi validation expects 'province' field
      postalCode: '515671',
      country: 'US',
      businessPhone: '1212121212',
      businessEmail: 'jash64326@yahoo.com',
      website: 'https://www.dmpain.com',
      deliveryRadius: 5,
      deliveryFee: 0,
      minOrderAmount: 0,
      avgDeliveryTime: 30
    };
    
    const response = await axios.post('http://localhost:5000/api/v1/auth/partner/otp/verify', jsonData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ JSON test successful:', response.data);
  } catch (error) {
    console.error('❌ JSON test failed:', error.response?.data || error.message);
  }
}

testJsonData();
