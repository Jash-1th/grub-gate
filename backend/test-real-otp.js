// Test script for real OTP delivery
require('dotenv').config();

const SMSService = require('./src/services/smsService');
const EmailService = require('./src/services/emailService');

async function testOTPServices() {
  console.log('🧪 Testing Real OTP Services...\n');

  // Test Email Service
  console.log('📧 Testing Email Service:');
  const emailService = new EmailService();
  
  try {
    const emailResult = await emailService.sendOTP('your-test-email@gmail.com', '123456');
    console.log('✅ Email OTP sent successfully:', emailResult.message);
  } catch (error) {
    console.log('❌ Email OTP failed:', error.message);
  }

  console.log('\n📱 Testing SMS Service:');
  const smsService = new SMSService();
  
  try {
    const smsResult = await smsService.sendOTP('+1234567890', '123456'); // Replace with your phone
    console.log('✅ SMS OTP sent successfully:', smsResult.message);
  } catch (error) {
    console.log('❌ SMS OTP failed:', error.message);
  }

  console.log('\n🔧 Configuration Check:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST ? '✅ Set' : '❌ Missing');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
  console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
  console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing');
  console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? '✅ Set' : '❌ Missing');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
}

testOTPServices().catch(console.error);
