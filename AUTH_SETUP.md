# Enable Firebase Auth and Create Admin User

Follow these steps to enable Email/Password authentication and create an admin account that can access the Admin panel.

## 1) Enable Email/Password Sign-in

1. Go to the Firebase Console → your project → Authentication → Sign-in method.
2. Enable **Email/Password** and save.

## 2) Create an Admin User (Console)

1. In Firebase Console → Authentication → Users → Add user.
2. Provide an email and a secure password.
3. Use those credentials to sign into the Admin panel at the portfolio site (Ctrl+Shift+A).

## 3) (Optional) Create Admin user via Admin SDK (recommended for automation)

You can create a user programmatically using the Admin SDK. Example Node.js script:

```js
// scripts/createAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const email = 'admin@example.com';
const password = 'very-strong-password';

admin.auth().createUser({ email, password })
  .then(userRecord => console.log('Created user:', userRecord.uid))
  .catch(err => console.error('Error creating user:', err));
```

Run:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS='C:\path\to\service-account.json'
npm install firebase-admin
node scripts/createAdmin.js
```

## 4) Deploy Firestore Rules

To apply the `firestore.rules` file included in this repo, run:

```bash
npx -y firebase-tools@latest deploy --only firestore:rules
```

Or deploy hosting and rules together:

```bash
npx -y firebase-tools@latest deploy --only hosting,firestore:rules
```

## 5) Verify Admin Login

1. Serve the site locally or deploy.
2. Open Admin panel (Ctrl+Shift+A) and sign in with created admin credentials.

If sign-in fails, check browser console for auth errors and verify `authDomain` in `public/index.html` matches your Firebase project.
