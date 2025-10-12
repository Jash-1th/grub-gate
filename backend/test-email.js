// Test email service directly
require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testEmail() {
  try {
    console.log('🧪 Testing email service...');
    console.log('📧 Email config:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM
    });

    const result = await emailService.sendOTP('jash64326@yahoo.com', '123456', 'GrubGate Test');
    console.log('✅ Email sent successfully:', result);
  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.error('Error details:', error.message);
  }
}

testEmail();
