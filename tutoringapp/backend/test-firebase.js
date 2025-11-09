require('dotenv').config();
const admin = require('firebase-admin');

console.log('Testing Firebase credentials...\n');

// Check if credentials exist
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || '❌ MISSING');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL || '❌ MISSING');
console.log('FIREBASE_PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);
console.log('FIREBASE_PRIVATE_KEY length:', process.env.FIREBASE_PRIVATE_KEY?.length || 0);
console.log('\nFirst 50 chars of private key:', process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50));
console.log('Last 50 chars of private key:', process.env.FIREBASE_PRIVATE_KEY?.substring(process.env.FIREBASE_PRIVATE_KEY.length - 50));

// Try to initialize
try {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  console.log('\nAfter replacing \\n with newlines:');
  console.log('First 50 chars:', privateKey.substring(0, 50));
  console.log('Last 50 chars:', privateKey.substring(privateKey.length - 50));
  
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
  console.log('\n✅ Firebase initialized successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Firebase initialization failed:');
  console.error('Error message:', error.message);
  console.error('Error code:', error.code);
  console.error('\nFull error:', error);
  process.exit(1);
}



