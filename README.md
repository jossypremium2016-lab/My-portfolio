# Windows 11 Developer Portfolio Website - Setup Guide

This is a fully interactive, Windows 11-themed developer portfolio website built with HTML5, Bootstrap 5, CSS3, vanilla JavaScript, and Firebase. It simulates a complete Windows 11 desktop environment with fully functional applications.

## Features

### Desktop Experience
- **Boot Screen**: Animated Windows boot sequence with spinner
- **Lock Screen**: Beautiful lock screen with live clock and date
- **Desktop Wallpaper**: Dynamic wallpaper with multiple themes (changeable)
- **Desktop Icons**: Double-click to open applications
- **Context Menu**: Right-click menu with various options

### Taskbar
- Windows 11-style taskbar with centered icons
- Live clock in system tray (updates every second)
- System indicators (WiFi, Volume, Battery, Notifications)
- Search bar for quick filtering
- App indicators showing open applications

### Start Menu
- Frosted glass design with blur effect
- Pinned apps section
- Recommended/Recent projects section
- Search functionality
- Power button and Settings shortcut

### Application Windows
All windows feature:
- Draggable by title bar
- Minimizable (shrinks animation)
- Maximizable/restorable
- Closeable
- Z-index management (click to bring to front)
- Frosted glass effects with backdrop blur

### Built-in Applications

#### 1. **File Explorer** - Projects Showcase
- Displays projects from Firebase Firestore
- Multiple view modes: Grid, List, Details
- Sorting options: By Date, Name, Category
- Category filtering (All, Web Apps, Mobile, Open Source, Tools)
- Project search functionality
- Click to view project details

#### 2. **Settings** - About Me
- Profile information and bio
- Experience section with job history
- Education details
- Skills display
- Achievements section

#### 3. **Terminal** - Skills & Tech Stack
- Functional command-line interface
- Supports commands: `whoami`, `skills`, `projects`, `contact`, `clear`, `help`
- Command history (arrow keys to navigate)
- Blinking cursor
- Styled output

#### 4. **Edge Browser** - Contact & Links
- Contact form with Name, Email, Message fields
- Form submission to Firebase
- Browser tabs for external links:
  - LinkedIn
  - GitHub
  - Twitter (opens in new tab)

#### 5. **Photos** - Gallery
- Grid layout for images
- Full-screen lightbox viewer
- Previous/Next navigation
- Close button
- Supports both local and Firebase Storage images

#### 6. **Notepad** - Resume
- Displays formatted resume text
- Print/Download PDF button
- Clean, readable text layout

#### 7. **Admin Panel** - Project Management
- Firebase Authentication (email/password)
- Accessible via keyboard shortcut: **Ctrl + Shift + A**
- Or via desktop icon (when logged in)
- CRUD operations for projects:
  - Add new projects
  - Edit existing projects
  - Delete projects
- Form fields:
  - Title, Description, Category
  - Tech Stack (comma-separated)
  - Thumbnail URL
  - Live URL & GitHub URL
  - Featured toggle

## Installation & Setup

### 1. Prerequisites
- Node.js installed (for Firebase CLI)
- Firebase project created at https://console.firebase.google.com
- Git (optional)

### 2. Clone/Download the Project
```bash
cd your-project-directory
```

### 3. Install Firebase Tools
```bash
npm install -g firebase-tools
```

### 4. Initialize Firebase
```bash
firebase init
```
Select options:
- Use existing project (select your Firebase project)
- Configure hosting (public directory: `public`)

### 5. Configure Firebase in HTML
Edit `public/index.html` and replace the Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

Get these values from Firebase Console → Project Settings

### 6. Setup Firebase Firestore Database

In Firebase Console:
1. Go to Firestore Database
2. Create a database in production mode
3. Create a `projects` collection
4. Add at least one test document with this structure:

```json
{
  "title": "Sample Project",
  "description": "Description of the project",
  "category": "web",
  "tech": ["React", "Firebase", "CSS3"],
  "thumbnail": "https://via.placeholder.com/200",
  "liveUrl": "https://example.com",
  "githubUrl": "https://github.com/yourname/project",
  "featured": true,
  "dateAdded": "2024-01-01T00:00:00Z"
}
```

### 7. Setup Firebase Authentication

In Firebase Console:
1. Go to Authentication
2. Enable Email/Password authentication
3. Create an admin user:
   - Go to Users tab
   - Add user with email and password
   - Note these credentials for the admin panel

### 8. Configure Firestore Security Rules

Go to Firestore → Rules and set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read
    match /projects/{document=**} {
      allow read;
      allow write: if request.auth != null;
    }
    // Contact submissions (if creating contacts collection)
    match /contacts/{document=**} {
      allow create;
      allow read, write: if request.auth != null;
    }
  }
}
```

### 9. Customize Portfolio Data

Edit `os.js` and customize the `portfolioData` object:

```javascript
const portfolioData = {
    name: 'Your Name',
    title: 'Your Title',
    bio: 'Your bio...',
    email: 'your.email@example.com',
    social: {
        github: 'https://github.com/yourname',
        linkedin: 'https://linkedin.com/in/yourname',
        twitter: 'https://twitter.com/yourname'
    },
    experience: [
        { title: 'Role', company: 'Company', duration: 'Year - Year' },
        // Add more...
    ],
    skills: ['Skill1', 'Skill2', 'Skill3'],
    education: [
        { school: 'University', degree: 'Degree', year: 'Year' },
        // Add more...
    ],
    resume: `Your resume text here...`
};
```

### 10. Deploy to Firebase Hosting

```bash
firebase deploy
```

Your portfolio will be live at: `https://your-project-id.web.app`

## Usage

### End User Experience

1. **Boot Sequence**: Page loads with Windows boot animation
2. **Lock Screen**: Click or press any key to unlock
3. **Desktop**: Double-click icons or use Start Menu to open apps
4. **Taskbar**: 
   - Click Start button to open Start Menu
   - Click app icons in taskbar to access open apps
   - Click clock for current time
5. **Windows**:
   - Drag by title bar to move
   - Double-click title bar to maximize/restore
   - Minimize button to minimize to taskbar
   - Close button to close
6. **Context Menu**: Right-click desktop for options

### Admin Panel

Access with **Ctrl + Shift + A** (once logged in):
1. Enter admin email and password
2. Click "Add Project" to create new projects
3. Fill in project details
4. Click "Save Project"
5. Edit/Delete projects using the toolbar buttons

## Customization

### Change Wallpaper
Right-click desktop → "Change Wallpaper" or edit `wallpapers` array in `os.js`

### Change Colors
Edit CSS variables in `win11.css`:
```css
:root {
    --win11-blue: #0078D4;
    --acrylic-light: rgba(255, 255, 255, 0.85);
    --acrylic-dark: rgba(29, 29, 29, 0.85);
    /* ...more variables */
}
```

### Add More Projects
Use the Admin Panel or add directly to Firestore

### Modify Window Size
Edit default window dimensions in `os.js` windowManager class

### Add Custom Commands to Terminal
Edit `executeTerminalCommand()` function in `os.js`

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (except backdrop-filter may have limited support)
- Mobile: Shows "Best experienced on desktop" message (responsive design can be enhanced)

## File Structure

```
portfolio/
├── public/
│   ├── index.html       # Main HTML with all templates
│   ├── win11.css        # Comprehensive styling
│   └── os.js           # Main JavaScript logic
├── firebase.json        # Firebase hosting config
└── README.md           # This file
```

## Troubleshooting

### Projects not loading
- Check Firebase Firestore rules
- Verify Firestore collection name is "projects"
- Check browser console for errors (F12)

### Admin panel not working
- Verify Firebase Auth is enabled
- Check email/password credentials
- Ensure Firestore rules allow authenticated writes

### Windows not dragging
- Check z-index handling in browser dev tools
- Verify event listeners are attached

### Styling issues
- Clear browser cache (Ctrl + Shift + Delete)
- Check CSS file is loading (should see "win11.css" in Network tab)

## Performance Tips

1. **Optimize Images**: Use compressed images for project thumbnails
2. **Lazy Loading**: Projects load on-demand from Firestore
3. **Cache**: Consider adding service worker for offline support
4. **CDN**: Firebase Hosting includes built-in CDN

## Security Notes

- Admin credentials are sent securely via Firebase Auth
- Firestore rules restrict project editing to authenticated users
- Consider adding CSRF protection for contact form
- Sensitive data should not be stored in client-side code

## Next Steps

1. Add more projects to your Firestore database
2. Upload project screenshots to gallery
3. Update all portfolio information
4. Deploy to production
5. Share your portfolio!

## Support & Resources

- Firebase Documentation: https://firebase.google.com/docs
- Bootstrap 5: https://getbootstrap.com/docs/5.0/
- CSS Tricks: https://css-tricks.com/
- MDN Web Docs: https://developer.mozilla.org/

---

**Created with ❤️ for developers who want a unique portfolio experience**
