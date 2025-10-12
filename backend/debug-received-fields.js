// Debug what fields the backend actually receives
const axios = require('axios');

async function debugReceivedFields() {
  try {
    console.log('🔍 Testing what backend receives...');
    
    // Send the exact same data as the frontend
    const jsonData = {
      identifier: 'jash64326@yahoo.com',
      skipOtpVerification: 'true',
      otpVerificationToken: 'verified_jash64326@yahoo.com_1760249571391',
      otp: '123456',
      firstName: 'jash',
      lastName: 'kumar',
      email: 'jash64326@yahoo.com',
      phoneNumber: '1111111111',
      password: '1qazxsw2Qa',
      restaurantName: 'xyz',
      description: 'asdaw,d asdjawewaje awejaweaw',
      cuisine: 'Indian',
      cuisineType: 'Indian',
      businessType: 'restaurant',
      street: 'dharmavaram',
      city: 'dhara,varam',
      state: 'IN',
      province: 'IN',
      postalCode: '515671',
      country: 'IN',
      coordinates: '{"lat":14.424078,"lng":77.714381}',
      formattedAddress: 'dharmavaram, dhara,varam, IN, 515671, India',
      businessPhone: '1111111111',
      businessEmail: 'jash64326@yahoo.com',
      website: 'httsp://www.domain.com',
      deliveryRadius: '10',
      deliveryFee: '9.97',
      minOrderAmount: '0',
      avgDeliveryTime: '30',
      businessLicenseText: '',
      taxId: ''
    };
    
    console.log('📤 Sending data:', Object.keys(jsonData));
    console.log('🔍 Required fields check:');
    const requiredFields = ['firstName', 'lastName', 'password', 'restaurantName', 'cuisine', 'street', 'city', 'postalCode', 'country', 'businessPhone'];
    requiredFields.forEach(field => {
      const value = jsonData[field];
      const hasValue = value && value.toString().trim() !== '';
      console.log(`${field}: ${hasValue ? '✅' : '❌'} "${value}"`);
    });
    
    const response = await axios.post('http://localhost:5000/api/v1/auth/partner/otp/verify', jsonData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    // Check if it's a validation error with specific field details
    if (error.response?.data?.errors) {
      console.error('🔍 Validation errors:', error.response.data.errors);
    }
  }
}

debugReceivedFields();
