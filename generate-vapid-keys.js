// FILE: generate-vapid-keys.js
// Script to generate VAPID keys for Web Push Notifications

const crypto = require('crypto');

console.log('🔐 Generating VAPID Keys for Web Push Notifications...\n');

// Generate ECDSA key pair using P-256 curve (required for VAPID)
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'prime256v1', // P-256 curve
  publicKeyEncoding: {
    type: 'spki',
    format: 'der'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'der'
  }
});

// Convert to base64url format
function toBase64Url(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

const publicKeyBase64 = toBase64Url(publicKey);
const privateKeyBase64 = toBase64Url(privateKey);

console.log('✅ VAPID Keys Generated Successfully!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📋 PUBLIC KEY (use in frontend):');
console.log('─'.repeat(64));
console.log(publicKeyBase64);
console.log('\n🔒 PRIVATE KEY (use in backend - keep secret!):');
console.log('─'.repeat(64));
console.log(privateKeyBase64);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📝 SETUP INSTRUCTIONS:\n');
console.log('1️⃣  BACKEND (.env file):');
console.log('   Add the following to: grub-gate/backend/.env');
console.log('   ─────────────────────────────────────────────────');
console.log(`   VAPID_PUBLIC_KEY=${publicKeyBase64}`);
console.log(`   VAPID_PRIVATE_KEY=${privateKeyBase64}`);
console.log(`   VAPID_SUBJECT=mailto:your-email@grubgate.com`);
console.log('');

console.log('2️⃣  CUSTOMER APP (.env file):');
console.log('   Add the following to: grub-gate/apps/customer-app/.env');
console.log('   ─────────────────────────────────────────────────');
console.log(`   VITE_VAPID_PUBLIC_KEY=${publicKeyBase64}`);
console.log('');

console.log('3️⃣  PARTNER PORTAL (.env file):');
console.log('   Add the following to: grub-gate/apps/partner-portal/.env');
console.log('   ─────────────────────────────────────────────────');
console.log(`   VITE_VAPID_PUBLIC_KEY=${publicKeyBase64}`);
console.log('');

console.log('4️⃣  Update customer-app/src/pwa.js:');
console.log('   Replace the placeholder VAPID key with the public key above');
console.log('   ─────────────────────────────────────────────────');
console.log(`   const placeholderKey = '${publicKeyBase64}';`);
console.log('');

console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('   • NEVER commit the private key to version control');
console.log('   • Add .env files to .gitignore');
console.log('   • Keep the private key secure and confidential');
console.log('   • The public key can be shared (it goes to clients)');
console.log('');

console.log('🚀 Next Steps:');
console.log('   1. Copy the keys to your .env files as shown above');
console.log('   2. Restart your backend server');
console.log('   3. Rebuild your frontend apps');
console.log('   4. Test push notifications using the test components');
console.log('');
console.log('✅ Done! Your push notifications are ready to use!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
