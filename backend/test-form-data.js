// Test what the backend receives with FormData
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testFormData() {
  try {
    console.log('🧪 Testing FormData submission...');
    
    const formData = new FormData();
    
    // Add all the fields that the frontend is sending
    formData.append('identifier', 'jash64326@yahoo.com');
    formData.append('skipOtpVerification', 'true');
    formData.append('otpVerificationToken', 'verified_jash64326@yahoo.com_1760248656838');
    formData.append('otp', '123456');
    formData.append('firstName', '3232');
    formData.append('lastName', 'ewqewr1');
    formData.append('email', 'jash64326@yahoo.com');
    formData.append('phoneNumber', '123456754');
    formData.append('password', '1qazxsw2Qa');
    formData.append('restaurantName', 'XYA');
    formData.append('description', 'JADM DJDMz');
    formData.append('cuisine', 'Indian');
    formData.append('cuisineType', 'Indian');
    formData.append('businessType', 'restaurant');
    formData.append('street', 'daharmavaram , kotapeta');
    formData.append('city', 'dharamvara');
    formData.append('state', 'IN');
    formData.append('province', 'IN');
    formData.append('postalCode', '515671');
    formData.append('country', 'US');
    formData.append('businessPhone', '1212121212');
    formData.append('businessEmail', 'jash64326@yahoo.com');
    formData.append('website', 'https://www.dmpain.com');
    formData.append('deliveryRadius', '5');
    formData.append('deliveryFee', '0');
    formData.append('minOrderAmount', '0');
    formData.append('avgDeliveryTime', '30');
    
    const response = await axios.post('http://localhost:5000/api/v1/auth/partner/otp/verify', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ FormData test successful:', response.data);
  } catch (error) {
    console.error('❌ FormData test failed:', error.response?.data || error.message);
  }
}

testFormData();
