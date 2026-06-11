/*
  scripts/createAdmin.js

  Usage (PowerShell):
    $env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\service-account.json'
    $env:ADMIN_EMAIL = 'admin@example.com'
    $env:ADMIN_PASSWORD = 'very-strong-password'
    node scripts/createAdmin.js

  Or via CLI args:
    node scripts/createAdmin.js admin@example.com very-strong-password
*/

const admin = require('firebase-admin');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('ERROR: Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON file path.');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
} catch (err) {
  console.error('ERROR: Could not load service account JSON from', process.env.GOOGLE_APPLICATION_CREDENTIALS);
  console.error(err.message);
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const email = process.env.ADMIN_EMAIL || process.argv[2];
const password = process.env.ADMIN_PASSWORD || process.argv[3];

if (!email || !password) {
  console.error('Usage: set ADMIN_EMAIL and ADMIN_PASSWORD env vars, or pass as args:');
  console.error("  node scripts/createAdmin.js admin@example.com 'very-strong-password'");
  process.exit(1);
}

(async () => {
  try {
    // Check if user exists
    const userRecord = await admin.auth().getUserByEmail(email).catch(() => null);
    if (userRecord) {
      console.log(`User already exists: ${userRecord.uid} (${email})`);
      process.exit(0);
    }

    const newUser = await admin.auth().createUser({
      email,
      password,
      emailVerified: true
    });

    console.log('Created admin user:', newUser.uid, email);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err.message || err);
    process.exit(1);
  }
})();
