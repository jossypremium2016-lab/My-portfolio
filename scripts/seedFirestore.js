/*
  Seed Firestore with sample projects.
  Usage:
    1. Create a Firebase service account JSON in the Firebase Console (Project Settings -> Service Accounts -> Generate new private key).
    2. Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the path of that JSON file, e.g.:
       setx GOOGLE_APPLICATION_CREDENTIALS "C:\\path\\to\\serviceAccountKey.json"
       (or use PowerShell: $env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\\path\\to\\serviceAccountKey.json')
    3. Install dependencies: `npm install firebase-admin` (or run `npm ci` if package.json updated)
    4. Run: `node scripts/seedFirestore.js`
*/

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const projectsPath = path.join(__dirname, '..', 'seed', 'projects.json');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('ERROR: GOOGLE_APPLICATION_CREDENTIALS is not set. Point it to your service account JSON file.');
  process.exit(1);
}

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`ERROR: service account file not found at ${serviceAccountPath}`);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath)
});

const db = admin.firestore();

async function seed() {
  const raw = fs.readFileSync(projectsPath, 'utf8');
  const projects = JSON.parse(raw);

  for (const p of projects) {
    const docRef = await db.collection('projects').add(p);
    console.log('Added project:', p.title, '->', docRef.id);
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
