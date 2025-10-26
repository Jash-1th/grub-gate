// Generate VAPID keys for Web Push Notifications
// Run with: node generate-vapid-keys.js

const crypto = require('crypto');

// Generate ECDH key pair using P-256 curve (required for VAPID)
const ecdh = crypto.createECDH('prime256v1');
ecdh.generateKeys();

// Get private key (32 bytes)
const privateKey = ecdh.getPrivateKey();

// Get public key (65 bytes uncompressed format: 0x04 + X + Y)
const publicKey = ecdh.getPublicKey();

// Convert to base64url format (URL-safe base64 without padding)
function toBase64Url(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

const publicKeyBase64 = toBase64Url(publicKey);
const privateKeyBase64 = toBase64Url(privateKey);

console.log('\n=== VAPID Keys Generated ===\n');
console.log('📌 Public Key (add to frontend .env):');
console.log(`VITE_VAPID_PUBLIC_KEY=${publicKeyBase64}`);
console.log(`\n✅ Length: ${publicKeyBase64.length} characters (should be ~87)`);
console.log(`✅ Bytes: ${publicKey.length} bytes (should be 65)\n`);

console.log('📌 Private Key (add to backend .env):');
console.log(`VAPID_PRIVATE_KEY=${privateKeyBase64}`);
console.log(`\n✅ Length: ${privateKeyBase64.length} characters (should be ~43)`);
console.log(`✅ Bytes: ${privateKey.length} bytes (should be 32)\n`);

console.log('📌 Add these to your .env files:\n');
console.log('Frontend (.env):');
console.log(`VITE_VAPID_PUBLIC_KEY=${publicKeyBase64}\n`);

console.log('Backend (.env):');
console.log(`VAPID_PUBLIC_KEY=${publicKeyBase64}`);
console.log(`VAPID_PRIVATE_KEY=${privateKeyBase64}`);
console.log(`VAPID_SUBJECT=mailto:admin@grubgate.com\n`);

console.log('⚠️  IMPORTANT:');
console.log('- Public key must be the SAME in both frontend and backend');
console.log('- Private key must ONLY be in backend');
console.log('- These keys must match across customer-app, partner-portal, and backend\n');
