// Quick test to verify Cloudinary configuration
require('dotenv').config();
const { uploadToCloudinary } = require('./src/config/cloudinary');

console.log('🔍 Testing Cloudinary Configuration...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING');

// Test with a simple buffer (1x1 pixel PNG)
const testBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==', 'base64');

async function testCloudinaryUpload() {
  try {
    console.log('🔍 Testing Cloudinary upload...');
    const result = await uploadToCloudinary(testBuffer, {
      folder: 'grubgate/test',
      public_id: `test_${Date.now()}`
    });
    
    console.log('✅ Cloudinary upload successful!');
    console.log('📄 Result:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      bytes: result.bytes
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    console.error('🔍 Full error:', error);
    process.exit(1);
  }
}

testCloudinaryUpload();
