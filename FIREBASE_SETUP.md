// ============================================
// FIREBASE CONFIGURATION TEMPLATE
// ============================================
// 
// HOW TO GET THESE VALUES:
// 1. Go to https://console.firebase.google.com
// 2. Select your project
// 3. Click "Settings" (gear icon) → "Project settings"
// 4. Under "Your apps", find the web app
// 5. Copy the firebaseConfig object
// 6. Replace the values below and paste into public/index.html
//
// ============================================

// EXAMPLE CONFIG (REPLACE WITH YOUR OWN):
const firebaseConfig = {
    apiKey: "AIzaSyDf1234567890abcdefghijklmnopqrst",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// FIRESTORE SETUP CHECKLIST:
// 
// ✓ 1. Create Firestore Database
//   - Go to Firestore Database
//   - Click "Create database"
//   - Select "Production mode"
//   - Choose location closest to your users
//
// ✓ 2. Create "projects" Collection
//   - Click "Start collection"
//   - Collection ID: "projects"
//   - Create first document with sample data
//
// ✓ 3. Sample Project Document Structure:
// {
//   "title": "Amazing Web App",
//   "description": "A full-stack application built with React and Firebase",
//   "category": "web",
//   "tech": ["React", "Firebase", "Tailwind CSS", "Node.js"],
//   "thumbnail": "https://via.placeholder.com/200",
//   "liveUrl": "https://myproject.com",
//   "githubUrl": "https://github.com/username/project",
//   "featured": true,
//   "dateAdded": Timestamp.now()
// }
//
// ✓ 4. Set Firestore Security Rules:
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     // Public read access to projects
//     match /projects/{document=**} {
//       allow read;
//       allow write: if request.auth != null;
//     }
//   }
// }
//

// FIREBASE AUTHENTICATION SETUP:
//
// ✓ 1. Enable Email/Password Authentication
//   - Go to Authentication
//   - Click "Get started"
//   - Enable "Email/Password" provider
//
// ✓ 2. Create Admin User
//   - Go to "Users" tab
//   - Click "Add user"
//   - Email: your-email@gmail.com
//   - Password: strong-password-here
//   - Note: You'll use these credentials to access admin panel
//
// Access Admin Panel:
//   - Press Ctrl + Shift + A while on the portfolio site
//   - Or double-click the "Admin" icon on desktop (once authenticated)
//   - Enter your email and password
//   - Manage your projects!
//

// PORTFOLIO DATA CUSTOMIZATION:
//
// Edit the portfolioData object in os.js with your information:
// {
//   name: "Your Full Name",
//   title: "Your Professional Title",
//   bio: "Short bio about yourself",
//   email: "your.email@example.com",
//   social: {
//     github: "https://github.com/yourusername",
//     linkedin: "https://linkedin.com/in/yourusername",
//     twitter: "https://twitter.com/yourusername"
//   },
//   experience: [
//     { title: "Role", company: "Company Name", duration: "2021 - Present" }
//   ],
//   skills: ["JavaScript", "React", "Node.js", "Firebase"],
//   education: [
//     { school: "University Name", degree: "Bachelor of Science", year: "2021" }
//   ],
//   resume: "Your full resume text here..."
// }

// DEPLOYMENT:
//
// 1. Build and Test Locally:
//    firebase serve
//
// 2. Deploy to Firebase Hosting:
//    firebase deploy
//
// 3. Your site will be live at:
//    https://{your-project-id}.web.app
//
// 4. Custom Domain (Optional):
//    - Firebase Console → Hosting → Add custom domain
//    - Follow domain verification steps
//

// ADDING PROJECTS VIA ADMIN PANEL:
//
// 1. Access admin panel: Ctrl + Shift + A
// 2. Enter email and password
// 3. Click "+ Add Project"
// 4. Fill in the form:
//    - Title: Project name
//    - Description: What the project does
//    - Category: web, mobile, open-source, tools
//    - Tech Stack: Technologies used (comma-separated)
//    - Thumbnail URL: Image for project card
//    - Live URL: Link to live project
//    - GitHub URL: Link to GitHub repository
//    - Featured: Check to feature on start menu
// 5. Click "Save Project"
//

// TROUBLESHOOTING:
//
// Q: Projects aren't showing up
// A: 1. Check Firestore has "projects" collection
//    2. Verify security rules allow read access
//    3. Check browser console (F12) for errors
//
// Q: Admin login not working
// A: 1. Verify user exists in Firebase Auth
//    2. Check email/password are correct
//    3. Ensure Firestore rules allow writes
//    4. Check browser console for auth errors
//
// Q: Contact form not submitting
// A: 1. Add a "contacts" collection in Firestore (optional)
//    2. Verify security rules allow create
//    3. Check network tab in browser dev tools
//
// Q: CSS/styling not appearing
// A: 1. Clear browser cache (Ctrl + Shift + Delete)
//    2. Verify win11.css is loading (Network tab)
//    3. Check for console errors
//    4. Try different browser
//

console.log("Firebase Portfolio Configuration");
console.log("================================");
console.log("To complete setup:");
console.log("1. Add your Firebase config above");
console.log("2. Create Firestore database and 'projects' collection");
console.log("3. Enable Firebase Authentication");
console.log("4. Set Firestore security rules");
console.log("5. Create admin user");
console.log("6. Customize portfolioData in os.js");
console.log("7. Deploy with 'firebase deploy'");
console.log("");
console.log("Access admin panel: Ctrl + Shift + A");
