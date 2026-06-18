//// ============================================
// WINDOWS 11 PORTFOLIO OS - MAIN APPLICATION
// ============================================

import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const state = {
    bootComplete: false,
    desktopActive: false,
    startMenuOpen: false,
    loginInProgress: false,
    openWindows: new Map(),
    zIndex: 1000,
    currentUser: null,
    projects: [],
    wallpaperIndex: 0,
    darkMode: false,
    commandHistory: [],
    historyIndex: -1
};

const wallpapers = [
    "url('./professional_suit_wallpaper.png') center/cover no-repeat",
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
];

// ═══════════════════════════════════════════════
// ✏️  EDIT THIS SECTION WITH YOUR REAL INFO
// ═══════════════════════════════════════════════
const portfolioData = {
    name: 'Joseph Lamide Ogungbe',
    title: 'Software Engineer & Accountant',
    bio: "I am a skilled Accountant and Software Engineer who combines financial expertise with technology solutions. I help businesses improve financial reporting, automate processes, analyze data, and build software that drives efficiency and growth. If you need someone who understands both numbers and technology, let's connect.",
    email: 'jossypremium.2016@gmail.com',
    social: {
        github: 'https://github.com/jossypremium2016-lab',
        linkedin: 'https://linkedin.com/in/Joseph-Lamide-Ogungbe',
        twitter: 'https://twitter.com/jossypremium'
    },
    experience: [
        { title: 'Financial Systems Engineer', company: 'Premium Solutions', duration: '2023 - Present' },
        { title: 'Software Developer', company: 'TechFin Services', duration: '2021 - 2023' }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Firebase', 'CSS3', 'Web Design', 'UI/UX', 'Git', 'SQL', 'Accounting', 'Python', 'Docker'],
    education: [
        {school: 'Kwara State Polytechic,Ilorin,Kwara State', degree: 'Higher National Diploma in Accountancy',year:'2010'}, {school: 'University Of Ilorin,Ilorin', degree: 'Post Graduate in Strategy Management',year:'2015'},{school: 'Ladoke Akintola University,Ogbomoso', degree: 'BS Accounting', year: '2018'},{school:'The institute of Chartered Accountants of Nigeria(ICAN) ',degree: 'Associate Member ',year:'2025' },
        { school: 'SQI College Of ICT,Ogbomoso', degree: 'Software Engineering Diploma', year: '2026' }
    ],
    resume: `JOSEPH LAMIDE OGUNGBE
Software Engineer & Accountant | jossypremium.2016@gmail.com

SUMMARY
A highly skilled and analytical professional with a dual background in Accounting and Software Engineering. Experienced in automating complex financial workflows, building robust full-stack applications, and designing data-driven systems.

EXPERIENCE
Financial Systems Engineer — Premium Solutions (2023 - Present)
• Integrated automated accounting solutions that reduced manual reconciliation times by 65%.
• Developed internal tools using Node.js and SQL to streamline reporting and audit preparation.
• Maintained cloud databases and automated backups.

Software Developer — TechFin Services (2026 till date)
• Built full-stack fintech portals using React, Express, and Firebase.
• Collaborated with financial analysts to implement dynamic visual reporting and graphing dashboards.
• Wrote scalable payment APIs.

SKILLS
Programming: JavaScript, Python, SQL, HTML/CSS
Frameworks: React, Node.js, Express, Bootstrap
Databases: Firebase Firestore, PostgreSQL, MongoDB
Finance: Financial Reporting, Auditing, Process Automation

EDUCATION
BS Accounting — University of Lagos (2020)
Advanced Diploma in Software Engineering — ALX Program (2022)`
};
// ═══════════════════════════════════════════════

// ---------- Theme Manager ----------
function initTheme() {
    const themeBtn = document.getElementById('themeToggle');
    if (!themeBtn) return;

    const savedTheme = localStorage.getItem('win11-theme') || 'dark';
    state.darkMode = savedTheme === 'dark';

    if (state.darkMode) {
        document.body.classList.remove('light-mode');
        themeBtn.textContent = '🌙';
    } else {
        document.body.classList.add('light-mode');
        themeBtn.textContent = '☀️';
    }

    themeBtn.addEventListener('click', () => {
        state.darkMode = !state.darkMode;
        if (state.darkMode) {
            document.body.classList.remove('light-mode');
            themeBtn.textContent = '🌙';
            localStorage.setItem('win11-theme', 'dark');
            showToast('Theme Settings', 'Switched to Dark Mode', '🌙');
        } else {
            document.body.classList.add('light-mode');
            themeBtn.textContent = '☀️';
            localStorage.setItem('win11-theme', 'light');
            showToast('Theme Settings', 'Switched to Light Mode', '☀️');
        }
    });
}

// ---------- Search Handler ----------
function handleSearch(queryText) {
    const resultsContainer = document.getElementById('startMenuSearchResults');
    const normalContent = document.getElementById('startMenuNormalContent');
    const resultsList = document.getElementById('searchResultsList');

    if (!resultsContainer || !normalContent || !resultsList) return;

    const v = queryText.trim().toLowerCase();
    if (v === '') {
        resultsContainer.classList.add('hidden');
        normalContent.classList.remove('hidden');
        return;
    }

    const menu = document.getElementById('startMenu');
    if (menu && menu.classList.contains('hidden')) {
        state.startMenuOpen = true;
        menu.classList.remove('hidden');
    }

    resultsContainer.classList.remove('hidden');
    normalContent.classList.add('hidden');
    resultsList.innerHTML = '';

    const apps = [
        { name: 'projects', label: 'File Explorer', icon: '📁' },
        { name: 'about', label: 'Settings', icon: '⚙️' },
        { name: 'skills', label: 'Task Manager', icon: '📊' },
        { name: 'terminal', label: 'Terminal', icon: '💻' },
        { name: 'contact', label: 'Mail', icon: '📧' },
        { name: 'resume', label: 'Notepad', icon: '📄' },
        { name: 'gallery', label: 'Photos', icon: '🖼️' }
    ];

    const matchedApps = apps.filter(app => app.label.toLowerCase().includes(v));
    const matchedProjects = state.projects.filter(p =>
        (p.title || '').toLowerCase().includes(v) ||
        (p.description || '').toLowerCase().includes(v) ||
        (p.techStack || p.tech || []).some(t => t.toLowerCase().includes(v))
    );

    if (matchedApps.length === 0 && matchedProjects.length === 0) {
        resultsList.innerHTML = '<div class="search-result-empty" style="color: var(--text-color); opacity: 0.5; padding: 10px; font-style: italic; font-size: 13px;">No results found</div>';
        return;
    }

    matchedApps.forEach(app => {
        const item = document.createElement('div');
        item.className = 'start-menu-app-item search-result-item-style';
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.padding = '8px 12px';
        item.style.gap = '12px';
        item.style.cursor = 'pointer';
        item.style.borderRadius = '4px';
        item.style.color = 'var(--text-color)';

        item.innerHTML = `
            <span style="font-size: 18px;">${app.icon}</span>
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: 500; font-size: 13px;">${app.label}</span>
                <span style="font-size: 11px; opacity: 0.6;">System App</span>
            </div>
        `;

        item.addEventListener('click', () => {
            openApp(app.name);
            toggleStartMenu();
            clearSearches();
        });
        resultsList.appendChild(item);
    });

    matchedProjects.forEach(p => {
        const item = document.createElement('div');
        item.className = 'start-menu-app-item search-result-item-style';
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.padding = '8px 12px';
        item.style.gap = '12px';
        item.style.cursor = 'pointer';
        item.style.borderRadius = '4px';
        item.style.color = 'var(--text-color)';

        const cat = p.category ? p.category.toUpperCase() : 'PROJECT';
        item.innerHTML = `
            <span style="font-size: 18px;">📦</span>
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: 500; font-size: 13px;">${p.title}</span>
                <span style="font-size: 11px; opacity: 0.6;">Project • ${cat}</span>
            </div>
        `;

        item.addEventListener('click', () => {
            openApp('projects');
            toggleStartMenu();
            clearSearches();
            setTimeout(() => {
                const win = state.openWindows.get('projects');
                if (win) {
                    const searchInput = win.querySelector('.toolbar-search');
                    if (searchInput) {
                        searchInput.value = p.title;
                        searchInput.dispatchEvent(new Event('input'));
                    }
                }
            }, 200);
        });
        resultsList.appendChild(item);
    });
}

function clearSearches() {
    const ts = document.getElementById('taskbarSearch');
    const sms = document.getElementById('startMenuSearch');
    if (ts) ts.value = '';
    if (sms) sms.value = '';
    const resultsContainer = document.getElementById('startMenuSearchResults');
    const normalContent = document.getElementById('startMenuNormalContent');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    if (normalContent) normalContent.classList.remove('hidden');
}

// ---------- BOOT & LOCK SCREEN ----------
export function initBoot() {
    setTimeout(() => {
        const boot = document.getElementById('bootScreen');
        if (boot) boot.classList.add('hidden');
        showLockScreen();
    }, 3000);
}

function showLockScreen() {
    const lockScreen = document.getElementById('lockScreen');
    if (!lockScreen) return;
    lockScreen.classList.remove('hidden');
    updateLockScreenTime();
    
    // --- Google Button Binding ---
    const googleBtn = document.getElementById('googleSignInBtn');
    if (googleBtn) {
        // Direct click assignment ensures browsers recognize it as an intentional user action
        googleBtn.onclick = async (e) => {
            e.preventDefault();
            await handleGoogleLogin();
        };
    }

    // --- GitHub Button Binding ---
    const githubBtn = document.getElementById('githubSignInBtn');
    if (githubBtn) {
        githubBtn.onclick = async (e) => {
            e.preventDefault();
            await handleGithubLogin();
        };
    }
}

async function handleGoogleLogin() {
    if (state.loginInProgress) return;

    state.loginInProgress = true;
    const signInBtn = document.getElementById('googleSignInBtn');
    if (signInBtn) signInBtn.disabled = true;

    try {
        if (typeof window.signInWithGoogle === 'function') {
            const result = await window.signInWithGoogle();
            const user = result.user;
            showToast('Authenticated', `Welcome ${user.displayName || user.email}`, '🔐');
            unlockScreen();
        } else {
            throw new Error("Google Sign-In configuration is missing in index.html");
        }
    } catch (error) {
        console.error("Authentication Error: ", error);
        if (error.code !== 'auth/cancelled-popup-request') {
            showToast('Login Failed', error.message, '❌');
        }
    } finally {
        state.loginInProgress = false;
        if (signInBtn) signInBtn.disabled = false;
    }
}

async function handleGithubLogin() {
    if (state.loginInProgress) return;

    state.loginInProgress = true;
    const signInBtn = document.getElementById('githubSignInBtn');
    if (signInBtn) signInBtn.disabled = true;

    try {
        if (typeof window.signInWithGithub === 'function') {
            const result = await window.signInWithGithub();
            const user = result.user;
            
            // GitHub users sometimes don't have a display name configured, fallback to username/email
            const identifier = user.displayName || user.reloadUserInfo.screenName || user.email;
            showToast('Authenticated', `Welcome ${identifier}`, '🔐');
            unlockScreen();
        } else {
            throw new Error("GitHub Sign-In configuration is missing in index.html");
        }
    } catch (error) {
        console.error("Authentication Error: ", error);
        if (error.code !== 'auth/cancelled-popup-request') {
            showToast('Login Failed', error.message, '❌');
        }
    } finally {
        state.loginInProgress = false;
        if (signInBtn) signInBtn.disabled = false;
    }
}
function updateLockScreenTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeEl = document.querySelector('.lock-time-display');
    const dateEl = document.querySelector('.lock-date-display');
    if (timeEl) timeEl.textContent = timeStr;
    if (dateEl) dateEl.textContent = dateStr;
}

function unlockScreen() {
    if (!state.bootComplete) {
        const lockScreen = document.getElementById('lockScreen');
        if (lockScreen) lockScreen.classList.add('hidden');
        state.bootComplete = true;
        initDesktop();
    }
}

// ---------- DESKTOP INITIALIZATION ----------
export function initDesktop() {
    const desktop = document.getElementById('desktopEnvironment');
    if (desktop) desktop.classList.remove('hidden');
    const wpEl = document.querySelector('.desktop-wallpaper');
    if (wpEl) wpEl.style.background = wallpapers[state.wallpaperIndex];
    state.desktopActive = true;
    
    updateTaskbarClock();
    initTheme();
    initializeEventListeners();
    loadProjects();
    checkAuthStatus();
    setupKeyboardShortcuts();
    showToast('Welcome', "Welcome to Joseph's Portfolio! Explore Windows 11 features.", '💻');
}

function updateTaskbarClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const clock = document.getElementById('clockDisplay');
    if (clock) clock.textContent = timeStr;
}

// ---------- EVENT LISTENERS ----------
function initializeEventListeners() {
    const startBtn = document.getElementById('startButton');
    if (startBtn) startBtn.addEventListener('click', toggleStartMenu);

    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
        });
        icon.addEventListener('dblclick', (e) => {
            const app = e.currentTarget.dataset.app;
            openApp(app);
        });
        let touchTimeout;
        icon.addEventListener('touchstart', (e) => {
            touchTimeout = setTimeout(() => { openApp(icon.dataset.app); }, 300);
        }, { passive: true });
        icon.addEventListener('touchend', () => clearTimeout(touchTimeout), { passive: true });
    });

    const desktopBg = document.querySelector('.desktop-wallpaper');
    if (desktopBg) {
        desktopBg.addEventListener('click', () => {
            document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        });
    }

    const desktopEnv = document.getElementById('desktopEnvironment');
    if (desktopEnv) desktopEnv.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const menu = document.getElementById('contextMenu');
        if (!menu) return;
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        menu.classList.remove('hidden');
    });
    document.addEventListener('click', () => {
        const menu = document.getElementById('contextMenu');
        if (menu) menu.classList.add('hidden');
    });
    const notif = document.getElementById('notificationBell');
    if (notif) notif.addEventListener('click', toggleNotifications);
    document.querySelectorAll('.start-menu-app-item').forEach(item => {
        item.addEventListener('click', () => {
            openApp(item.dataset.app);
            toggleStartMenu();
        });
    });
    const powerBtn = document.getElementById('powerButton');
    if (powerBtn) powerBtn.addEventListener('click', shutdown);
    const settingsBtn = document.getElementById('settingsButton');
    if (settingsBtn) settingsBtn.addEventListener('click', () => { openApp('about'); toggleStartMenu(); });

    const taskbarSearch = document.getElementById('taskbarSearch');
    const startMenuSearch = document.getElementById('startMenuSearch');

    if (taskbarSearch) {
        taskbarSearch.addEventListener('input', (e) => {
            if (startMenuSearch) startMenuSearch.value = e.target.value;
            handleSearch(e.target.value);
        });
    }

    if (startMenuSearch) {
        startMenuSearch.addEventListener('input', (e) => {
            if (taskbarSearch) taskbarSearch.value = e.target.value;
            handleSearch(e.target.value);
        });
    }

    document.addEventListener('submit', handleFormSubmit);
}

function checkAuthStatus() {
    if (window.auth) {
        window.auth.onAuthStateChanged((user) => {
            state.currentUser = user;
            if (user) {
                if (user.email === 'jossypremium.2016@gmail.com') {
                    const adminIcon = document.getElementById('adminIcon');
                    if (adminIcon) adminIcon.classList.remove('admin-hidden');
                    showToast('Admin Mode', 'Full administrative write permissions allowed.', '⚙️');
                } else {
                    enforceGuestReadOnlyMode();
                }
            } else {
                const desktop = document.getElementById('desktopEnvironment');
                if (desktop) desktop.classList.add('hidden');
                state.bootComplete = false;
                showLockScreen();
            }
        });
    } else {
        console.warn('Firebase Auth instance not found on window context.');
    }
}

function enforceGuestReadOnlyMode() {
    const adminIcon = document.getElementById('adminIcon');
    if (adminIcon) adminIcon.classList.add('admin-hidden');

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
            e.preventDefault();
            showToast('Access Denied', 'Administrative privileges required.', '🔐');
        }
    }, true);

    document.addEventListener('click', (e) => {
        const target = e.target;
        if (
            target.id === 'addProjectBtn' || 
            target.classList.contains('project-delete-btn') || 
            target.classList.contains('project-edit-btn') || 
            target.closest('#adminPanel')
        ) {
            e.stopPropagation();
            e.preventDefault();
            showToast('Read-Only Mode', 'You can view everything, but making updates is restricted.', '⚠️');
        }
    }, true);
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
            e.preventDefault();
            if (state.currentUser && state.currentUser.email === 'jossypremium.2016@gmail.com') {
                openApp('admin');
            } else {
                showToast('Access Denied', 'Administrative privileges required.', '🔐');
            }
        }
        if (e.key === 'Escape' && state.startMenuOpen) toggleStartMenu();
    });
}

// ---------- START MENU ----------
function toggleStartMenu() {
    const menu = document.getElementById('startMenu');
    if (!menu) return;
    state.startMenuOpen = !state.startMenuOpen;
    if (state.startMenuOpen) {
        menu.classList.remove('hidden');
        const smSearch = document.getElementById('startMenuSearch');
        if (smSearch) smSearch.focus();
        loadRecommendedProjects();
    } else {
        menu.classList.add('hidden');
    }
}

function loadRecommendedProjects() {
    const recommended = document.getElementById('startMenuRecommended');
    if (!recommended) return;
    recommended.innerHTML = '';
    if (state.projects.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'start-menu-project';
        empty.style.color = 'rgba(255,255,255,0.4)';
        empty.style.fontStyle = 'italic';
        empty.textContent = 'No projects yet — add some via the Admin panel.';
        recommended.appendChild(empty);
        return;
    }
    state.projects.slice(0, 3).forEach(project => {
        const item = document.createElement('div');
        item.className = 'start-menu-project';
        item.innerHTML = `📦 ${project.title || ''}`;
        item.addEventListener('click', () => { openApp('projects'); toggleStartMenu(); });
        recommended.appendChild(item);
    });
}

// ---------- Context Menu ----------
function showContextMenu(e) {
    e.preventDefault();
    const menu = document.getElementById('contextMenu');
    if (!menu) return;
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
    menu.classList.remove('hidden');
}

function hideContextMenu() {
    const menu = document.getElementById('contextMenu');
    if (menu) menu.classList.add('hidden');
}

document.addEventListener('click', (e) => {
    const item = e.target.closest('.context-menu-item');
    if (item) {
        const action = item.dataset.action;
        switch (action) {
            case 'refresh': location.reload(); break;
            case 'view-projects': openApp('projects'); break;
            case 'about': openApp('about'); break;
            case 'contact': openApp('contact'); break;
            case 'change-wallpaper': changeWallpaper(); break;
            case 'personalize': openApp('about'); break;
        }
        hideContextMenu();
    }
});

// ---------- Notifications ----------
function toggleNotifications() { const panel = document.getElementById('notificationsPanel'); if (panel) panel.classList.toggle('hidden'); }
function addNotification(message) { const list = document.getElementById('notificationsList'); if (!list) return; const item = document.createElement('div'); item.className = 'notification-item'; item.textContent = message; list.appendChild(item); setTimeout(() => item.remove(), 5000); }

// ---------- Toast Notifications ----------
function showToast(title, message, icon = '🔔') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}

// ---------- Window Manager ----------
class WindowManager {
    constructor() {
        this.draggingWindow = null;
        this.dragOffset = { x: 0, y: 0 };
        this.onDrag = this.onDrag.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
    }
    createWindow(template) {
        if (!template) {
            console.error('Window template was not found.');
            showToast('Window Error', 'This app window template is missing.', '!');
            return null;
        }

        const clone = document.importNode(template.content, true);
        const windowEl = clone.querySelector('.win11-window');
        if (!windowEl) {
            console.error('Window template does not contain .win11-window.');
            showToast('Window Error', 'This app window is not configured correctly.', '!');
            return null;
        }

        document.getElementById('windowsContainer').appendChild(windowEl);
        windowEl.style.zIndex = state.zIndex++;
        this.setupWindowControls(windowEl);
        this.setupResizing(windowEl);
        const appName = windowEl.dataset.window;
        state.openWindows.set(appName, windowEl);
        renderTaskbar();
        return windowEl;
    }
    setupWindowControls(windowEl) {
        const header = windowEl.querySelector('.window-header');
        const minimizeBtn = windowEl.querySelector('.window-minimize');
        const maximizeBtn = windowEl.querySelector('.window-maximize');
        const closeBtn = windowEl.querySelector('.window-close');
        if (header) header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            this.startDrag(e, windowEl);
        });
        if (header) header.addEventListener('dblclick', () => this.toggleMaximize(windowEl));
        if (minimizeBtn) minimizeBtn.addEventListener('click', () => this.minimizeWindow(windowEl));
        if (maximizeBtn) maximizeBtn.addEventListener('click', () => this.toggleMaximize(windowEl));
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeWindow(windowEl));
        windowEl.addEventListener('mousedown', () => {
            windowEl.style.zIndex = state.zIndex++;
        });

        if (maximizeBtn) {
            const overlay = document.createElement('div');
            overlay.className = 'snap-layout-overlay';
            overlay.innerHTML = `
                <div class="snap-layout-grid">
                    <div class="snap-zone" data-layout="top-left" title="Snap Top Left"></div>
                    <div class="snap-zone" data-layout="top-right" title="Snap Top Right"></div>
                    <div class="snap-zone" data-layout="bottom-left" title="Snap Bottom Left"></div>
                    <div class="snap-zone" data-layout="bottom-right" title="Snap Bottom Right"></div>
                </div>
            `;
            maximizeBtn.appendChild(overlay);

            let ghost = document.getElementById('snapGhostPreview');
            if (!ghost) {
                ghost = document.createElement('div');
                ghost.id = 'snapGhostPreview';
                ghost.className = 'snap-ghost-preview';
                document.body.appendChild(ghost);
            }

            overlay.querySelectorAll('.snap-zone').forEach(zone => {
                zone.addEventListener('mouseenter', (e) => {
                    showGhostPreview(e.target.dataset.layout);
                });
                zone.addEventListener('mouseleave', () => {
                    hideGhostPreview();
                });
                zone.addEventListener('click', (e) => {
                    e.stopPropagation();
                    snapWindow(windowEl, e.target.dataset.layout);
                    overlay.style.display = 'none';
                    setTimeout(() => { overlay.style.display = ''; }, 500);
                });
            });
        }
    }
    setupResizing(windowEl) {
        const rightHandle = document.createElement('div');
        rightHandle.className = 'window-resize-handle handle-r';
        const bottomHandle = document.createElement('div');
        bottomHandle.className = 'window-resize-handle handle-b';
        const cornerHandle = document.createElement('div');
        cornerHandle.className = 'window-resize-handle handle-se';

        windowEl.appendChild(rightHandle);
        windowEl.appendChild(bottomHandle);
        windowEl.appendChild(cornerHandle);

        const startResize = (e, direction) => {
            e.preventDefault();
            e.stopPropagation();
            const startWidth = windowEl.offsetWidth;
            const startHeight = windowEl.offsetHeight;
            const startX = e.clientX || e.touches[0].clientX;
            const startY = e.clientY || e.touches[0].clientY;

            const doResize = (moveEvent) => {
                const clientX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
                const clientY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);
                if (direction.includes('r')) {
                    const newWidth = Math.max(400, startWidth + (clientX - startX));
                    windowEl.style.width = newWidth + 'px';
                }
                if (direction.includes('b')) {
                    const newHeight = Math.max(300, startHeight + (clientY - startY));
                    windowEl.style.height = newHeight + 'px';
                }
            };

            const stopResize = () => {
                document.removeEventListener('mousemove', doResize);
                document.removeEventListener('mouseup', stopResize);
                document.removeEventListener('touchmove', doResize);
                document.removeEventListener('touchend', stopResize);
            };

            document.addEventListener('mousemove', doResize);
            document.addEventListener('mouseup', stopResize);
            document.addEventListener('touchmove', doResize, { passive: false });
            document.addEventListener('touchend', stopResize);
        };

        rightHandle.addEventListener('mousedown', (e) => startResize(e, 'r'));
        bottomHandle.addEventListener('mousedown', (e) => startResize(e, 'b'));
        cornerHandle.addEventListener('mousedown', (e) => startResize(e, 'rb'));

        rightHandle.addEventListener('touchstart', (e) => startResize(e, 'r'), { passive: false });
        bottomHandle.addEventListener('touchstart', (e) => startResize(e, 'b'), { passive: false });
        cornerHandle.addEventListener('touchstart', (e) => startResize(e, 'rb'), { passive: false });
    }
    startDrag(e, windowEl) { this.draggingWindow = windowEl; const rect = windowEl.getBoundingClientRect(); this.dragOffset.x = e.clientX - rect.left; this.dragOffset.y = e.clientY - rect.top; document.addEventListener('mousemove', this.onDrag); document.addEventListener('mouseup', this.stopDrag); }
    onDrag(e) {
        if (!this.draggingWindow) return;
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        this.draggingWindow.style.left = x + 'px';
        this.draggingWindow.style.top = y + 'px';
    }
    stopDrag() {
        this.draggingWindow = null;
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.stopDrag);
    }
    toggleMaximize(windowEl) {
        windowEl.classList.remove('minimizing');
        if (windowEl.style.width === 'calc(100% - 20px)') {
            windowEl.style.width = '800px';
            windowEl.style.height = '600px';
            windowEl.style.left = '50px';
            windowEl.style.top = '50px';
        } else {
            windowEl.style.width = 'calc(100% - 20px)';
            windowEl.style.height = 'calc(100% - 78px)';
            windowEl.style.left = '10px';
            windowEl.style.top = '10px';
        }
    }
    minimizeWindow(windowEl) { windowEl.classList.add('minimizing'); setTimeout(() => { windowEl.style.display = 'none'; }, 300); }
    restoreWindow(windowEl) { windowEl.classList.remove('minimizing'); windowEl.style.display = 'flex'; windowEl.style.zIndex = state.zIndex++; }
    closeWindow(windowEl) {
        const appName = windowEl.dataset.window;
        windowEl.classList.add('closing');
        setTimeout(() => {
            windowEl.remove();
            state.openWindows.delete(appName);
            renderTaskbar();
        }, 200);
    }
}
const windowManager = new WindowManager();

// ---------- Ghost Previews & Snapping Helpers ----------
function showGhostPreview(layout) {
    const ghost = document.getElementById('snapGhostPreview');
    if (!ghost) return;
    ghost.classList.add('active');
    if (layout === 'top-left') {
        ghost.style.left = '10px';
        ghost.style.top = '10px';
        ghost.style.width = 'calc(50% - 15px)';
        ghost.style.height = 'calc(50% - 39px)';
    } else if (layout === 'top-right') {
        ghost.style.left = 'calc(50% + 5px)';
        ghost.style.top = '10px';
        ghost.style.width = 'calc(50% - 15px)';
        ghost.style.height = 'calc(50% - 39px)';
    } else if (layout === 'bottom-left') {
        ghost.style.left = '10px';
        ghost.style.top = 'calc(50% - 19px)';
        ghost.style.width = 'calc(50% - 15px)';
        ghost.style.height = 'calc(50% - 39px)';
    } else if (layout === 'bottom-right') {
        ghost.style.left = 'calc(50% + 5px)';
        ghost.style.top = 'calc(50% - 19px)';
        ghost.style.width = 'calc(50% - 15px)';
        ghost.style.height = 'calc(50% - 39px)';
    }
}
function hideGhostPreview() {
    const ghost = document.getElementById('snapGhostPreview');
    if (ghost) ghost.classList.remove('active');
}
function snapWindow(windowEl, layout) {
    windowEl.classList.remove('minimizing');
    windowEl.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    if (layout === 'top-left') {
        windowEl.style.left = '10px';
        windowEl.style.top = '10px';
        windowEl.style.width = 'calc(50% - 15px)';
        windowEl.style.height = 'calc(50% - 39px)';
    } else if (layout === 'top-right') {
        windowEl.style.left = 'calc(50% + 5px)';
        windowEl.style.top = '10px';
        windowEl.style.width = 'calc(50% - 15px)';
        windowEl.style.height = 'calc(50% - 39px)';
    } else if (layout === 'bottom-left') {
        windowEl.style.left = '10px';
        windowEl.style.top = 'calc(50% - 19px)';
        windowEl.style.width = 'calc(50% - 15px)';
        windowEl.style.height = 'calc(50% - 39px)';
    } else if (layout === 'bottom-right') {
        windowEl.style.left = 'calc(50% + 5px)';
        windowEl.style.top = 'calc(50% - 19px)';
        windowEl.style.width = 'calc(50% - 15px)';
        windowEl.style.height = 'calc(50% - 39px)';
    }
    setTimeout(() => { windowEl.style.transition = ''; }, 300);
}

// ---------- App Management ----------
function openApp(appName) {
    if (state.openWindows.has(appName)) {
        const existingWindow = state.openWindows.get(appName);
        if (existingWindow.style.display === 'none') windowManager.restoreWindow(existingWindow);
        else existingWindow.style.zIndex = state.zIndex++;
        return;
    }
    let template;
    switch (appName) {
        case 'projects':
            template = document.getElementById('fileExplorerTemplate');
            const w1 = windowManager.createWindow(template);
            if (!w1) return;
            initFileExplorer(w1);
            break;
        case 'about':
            template = document.getElementById('settingsTemplate');
            const w2 = windowManager.createWindow(template);
            if (!w2) return;
            initSettings(w2);
            break;
        case 'skills':
            template = document.getElementById('taskManagerTemplate');
            const w3 = windowManager.createWindow(template);
            if (!w3) return;
            initTaskManager(w3);
            break;
        case 'terminal':
            template = document.getElementById('terminalTemplate');
            const wTerm = windowManager.createWindow(template);
            if (!wTerm) return;
            initTerminal(wTerm);
            break;
        case 'contact':
            template = document.getElementById('mailTemplate');
            const w4 = windowManager.createWindow(template);
            if (!w4) return;
            initMail(w4);
            break;
        case 'resume':
            template = document.getElementById('notepadTemplate');
            const w5 = windowManager.createWindow(template);
            if (!w5) return;
            initNotepad(w5);
            break;
        case 'gallery':
            template = document.getElementById('photosTemplate');
            const w6 = windowManager.createWindow(template);
            if (!w6) return;
            initPhotos(w6);
            break;
        case 'admin':
            template = document.getElementById('adminLoginTemplate');
            const w7 = windowManager.createWindow(template);
            if (!w7) return;
            initAdmin(w7);
            break;
        default:
            console.error(`Unknown app requested: ${appName}`);
            showToast('App Error', `Unknown app: ${appName}`, '!');
    }
}

const pinnedApps = [
    { name: 'about', icon: '⚙️', label: 'Settings' },
    { name: 'projects', icon: '📁', label: 'File Explorer' },
    { name: 'skills', icon: '📊', label: 'Task Manager' },
    { name: 'terminal', icon: '💻', label: 'Terminal' },
    { name: 'contact', icon: '📧', label: 'Mail' },
    { name: 'github', icon: '🐙', label: 'GitHub', isUrl: true, url: portfolioData.social.github },
    { name: 'linkedin', icon: '💼', label: 'LinkedIn', isUrl: true, url: portfolioData.social.linkedin }
];

function renderTaskbar() {
    const list = document.getElementById('taskbarAppsList');
    if (!list) return;
    list.innerHTML = '';

    const allApps = [...pinnedApps];
    state.openWindows.forEach((winEl, appName) => {
        if (!allApps.some(app => app.name === appName)) {
            const iconMap = { 'resume': '📄', 'gallery': '🖼️', 'admin': '🔐' };
            const labelMap = { 'resume': 'Notepad', 'gallery': 'Photos', 'admin': 'Admin' };
            allApps.push({ name: appName, icon: iconMap[appName] || '🗔', label: labelMap[appName] || appName });
        }
    });

    allApps.forEach(app => {
        const btn = document.createElement('button');
        btn.className = 'taskbar-app-icon';
        btn.dataset.app = app.name;
        btn.title = app.label;
        btn.innerHTML = app.icon;

        const isRunning = state.openWindows.has(app.name);
        if (isRunning) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', (e) => {
            if (e.target.closest('.taskbar-preview-card')) return;
            if (app.isUrl) {
                window.open(app.url, '_blank');
            } else {
                const win = state.openWindows.get(app.name);
                if (win) {
                    if (win.style.display === 'none') windowManager.restoreWindow(win);
                    else windowManager.minimizeWindow(win);
                } else {
                    openApp(app.name);
                }
            }
        });

        if (isRunning && !app.isUrl) {
            const previewCard = document.createElement('div');
            previewCard.className = 'taskbar-preview-card';
            previewCard.innerHTML = `
                <div class="taskbar-preview-header">
                    <span>${app.icon} ${app.label}</span>
                    <span class="taskbar-preview-close" style="cursor:pointer;">✕</span>
                </div>
                <div class="taskbar-preview-body">
                    ${app.icon}
                </div>
            `;
            previewCard.querySelector('.taskbar-preview-body').addEventListener('click', (e) => {
                e.stopPropagation();
                const win = state.openWindows.get(app.name);
                if (win) {
                    if (win.style.display === 'none') windowManager.restoreWindow(win);
                    else win.style.zIndex = state.zIndex++;
                }
            });
            previewCard.querySelector('.taskbar-preview-close').addEventListener('click', (e) => {
                e.stopPropagation();
                const win = state.openWindows.get(app.name);
                if (win) windowManager.closeWindow(win);
            });
            btn.appendChild(previewCard);
        }
        list.appendChild(btn);
    });
}

// ---------- File Explorer ----------
function initFileExplorer(windowEl) {
    const grid = windowEl.querySelector('#projectsGrid');
    const viewToggle = windowEl.querySelector('#explorerViewToggle');
    const sortSelect = windowEl.querySelector('#explorerSort');
    const searchInput = windowEl.querySelector('.toolbar-search');
    const categoryItems = windowEl.querySelectorAll('.sidebar-item');
    let currentCategory = 'all';
    let currentView = 'grid';

    if (grid) renderProjects(grid, state.projects, 'all', currentView);

    if (viewToggle) viewToggle.addEventListener('change', (e) => {
        currentView = e.target.value;
        if (grid) grid.className = `projects-grid ${currentView}-view`;
        renderProjects(grid, state.projects, currentCategory, currentView);
    });

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentCategory = item.dataset.category;
            renderProjects(grid, state.projects, currentCategory, currentView);
        });
    });

    if (searchInput) searchInput.addEventListener('input', (e) => {
        const v = e.target.value.toLowerCase();
        const filtered = state.projects.filter(p =>
            (p.title || '').toLowerCase().includes(v) ||
            (p.description || '').toLowerCase().includes(v) ||
            (p.techStack || p.tech || []).some(t => t.toLowerCase().includes(v))
        );
        renderProjects(grid, filtered, currentCategory, currentView);
    });

    if (sortSelect) sortSelect.addEventListener('change', (e) => {
        const sorted = [...state.projects];
        const getDateValue = (dateObj) => {
            if (!dateObj) return new Date(0);
            if (typeof dateObj.toDate === 'function') return dateObj.toDate();
            return new Date(dateObj);
        };

        if (e.target.value === 'name') sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        else if (e.target.value === 'date') sorted.sort((a, b) => getDateValue(b.dateAdded) - getDateValue(a.dateAdded));
        else if (e.target.value === 'category') sorted.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
        renderProjects(grid, sorted, currentCategory, currentView);
    });
}

function renderProjects(container, projects, category, view) {
    if (!container) return;
    container.innerHTML = '';
    let filtered = projects;

    if (category !== 'all') {
        filtered = projects.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="explorer-empty">No projects found in this folder.</div>';
        return;
    }

    filtered.forEach(project => {
        const card = document.createElement('div');
        card.className = `project-card ${view}-view-card`;
        const thumb = project.thumbnail || 'https://via.placeholder.com/300x180?text=Project+Thumbnail';
        const techStack = project.techStack || project.tech || [];
        const techBadges = techStack.map(t => `<span class="tech-badge">${t}</span>`).join('');
        const catLabel = project.category ? project.category.toUpperCase() : 'WEB';

        card.innerHTML = `
            <div class="project-card-thumb" style="background-image: url('${thumb}');">
                <span class="project-category-badge">${catLabel}</span>
            </div>
            <div class="project-card-content">
                <h4 class="project-card-title">${project.title || ''}</h4>
                <p class="project-card-desc">${project.description || ''}</p>
                <div class="project-card-tech">${techBadges}</div>
                <div class="project-card-links">
                    ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="explorer-card-btn gh-btn">🐙 GitHub</a>` : ''}
                    ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" class="explorer-card-btn live-btn">🌐 Live</a>` : ''}
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.closest('.explorer-card-btn')) return;
            if (project.liveUrl) window.open(project.liveUrl, '_blank');
            else if (project.githubUrl) window.open(project.githubUrl, '_blank');
            else showProjectDetail(project);
        });
        container.appendChild(card);
    });
}

function showProjectDetail(project) {
    alert(`${project.title || ''}\n\n${project.description || ''}\n\nTech: ${(project.techStack || project.tech || []).join(', ')}\n\n${project.liveUrl ? `Live: ${project.liveUrl}` : ''}\n${project.githubUrl ? `GitHub: ${project.githubUrl}` : ''}`);
}

// ---------- Settings (About Me) ----------
function initSettings(windowEl) {
    const navItems = windowEl.querySelectorAll('.settings-nav-item');
    const contentArea = windowEl.querySelector('#settingsContent');

    function showSection(section) {
        navItems.forEach(item => item.classList.remove('active'));
        const activeItem = Array.from(navItems).find(i => i.dataset.section === section);
        if (activeItem) activeItem.classList.add('active');

        let html = '';
        switch (section) {
            case 'general':
                html = `
                    <div class="about-profile-header">
                        <div class="about-profile-img" style="display: flex; align-items: center; justify-content: center; background: var(--win11-blue); color: white; font-size: 32px;">👨‍💻</div>
                        <div class="about-profile-info">
                            <h3>${portfolioData.name}</h3>
                            <p class="text-muted" style="margin: 0;">${portfolioData.title}</p>
                        </div>
                    </div>
                    <div class="settings-section-title">About Me</div>
                    <p style="font-size: 14px; line-height: 1.6; color: var(--text-color); opacity: 0.85;">${portfolioData.bio}</p>
                    <div class="settings-section-title" style="margin-top: 24px;">System Information</div>
                    <div style="background: var(--win11-darkgray); border-radius: 6px; border: 1px solid var(--border-color); padding: 12px; font-size: 13px; display: flex; flex-direction: column; gap: 8px;">
                        <div style="display:flex; justify-content:space-between;"><span style="opacity:0.6;">OS Name:</span><span>PortfolioOS (Windows 11 Edition)</span></div>
                        <div style="display:flex; justify-content:space-between;"><span style="opacity:0.6;">Version:</span><span>2026.3.1</span></div>
                        <div style="display:flex; justify-content:space-between;"><span style="opacity:0.6;">Kernel:</span><span>JavaScript ES6 Monolithic</span></div>
                    </div>
                `;
                break;
            case 'education':
                html = `<div class="settings-section-title">Education & Certifications</div>`;
                portfolioData.education.forEach(edu => {
                    html += `
                        <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
                            <h5 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${edu.degree}</h5>
                            <div style="font-size: 13px; opacity: 0.7; display: flex; justify-content: space-between;">
                                <span>${edu.school}</span>
                                <span>${edu.year}</span>
                            </div>
                        </div>
                    `;
                });
                break;
            case 'experience':
                html = `<div class="settings-section-title">Work Experience</div>`;
                portfolioData.experience.forEach(exp => {
                    html += `
                        <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
                            <h5 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${exp.title}</h5>
                            <div style="font-size: 13px; opacity: 0.7; display: flex; justify-content: space-between;">
                                <span>${exp.company}</span>
                                <span>${exp.duration}</span>
                            </div>
                        </div>
                    `;
                });
                break;
        }
        if (contentArea) contentArea.innerHTML = html;
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => showSection(item.dataset.section));
    });

    showSection('general');
}

// ---------- Task Manager (Skills) ----------
function initTaskManager(windowEl) {
    const list = windowEl.querySelector('#taskManagerList');
    if (!list) return;
    list.innerHTML = '';

    portfolioData.skills.forEach(skill => {
        const row = document.createElement('div');
        row.className = 'task-manager-row';
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '2fr 1fr 1fr';
        row.style.padding = '8px 16px';
        row.style.fontSize = '13px';
        row.style.borderBottom = '1px solid var(--border-color)';
        row.style.color = 'var(--text-color)';

        // Simulate usage metrics
        const cpu = Math.floor(Math.random() * 25) + 5;
        const ram = (Math.random() * 120 + 40).toFixed(1);

        row.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px;"><span>📊</span> <strong>${skill}</strong></div>
            <div style="color: var(--win11-light-blue);">${cpu}%</div>
            <div>${ram} MB</div>
        `;
        list.appendChild(row);
    });
}

// ---------- Notepad (Resume) ----------
function initNotepad(windowEl) {
    const area = windowEl.querySelector('#notepadArea');
    if (area) {
        area.value = portfolioData.resume;
    }
}

// ---------- Mail (Contact) ----------
function initMail(windowEl) {
    // Left empty for system compliance hooks
}

function handleMailSubmit(e, container) {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }

    // Guard container lookup
    const targetContainer = container || document;
    const nameInput = targetContainer.querySelector('#contactName');
    const emailInput = targetContainer.querySelector('#contactEmail');
    const msgInput = targetContainer.querySelector('#contactMessage');

    if (!nameInput || !emailInput || !msgInput) {
        showToast('Form Error', 'Contact fields could not be resolved in window layout.', '⚠️');
        return;
    }

    const n = nameInput.value.trim();
    const em = emailInput.value.trim();
    const msg = msgInput.value.trim();

    if (!n || !em || !msg) {
        showToast('Form Error', 'Please verify your contact fields.', '⚠️');
        return;
    }

    if (window.db) {
        addDoc(collection(window.db, "messages"), {
            name: n,
            email: em,
            message: msg,
            timestamp: serverTimestamp()
        }).then(() => {
            showToast('Message Sent', 'Thank you! Your message was submitted successfully.', '📧');
            nameInput.value = '';
            emailInput.value = '';
            msgInput.value = '';
        }).catch(err => {
            console.error("Error saving message: ", err);
            showToast('Submission Failure', 'Database write error.', '❌');
        });
    } else {
        showToast('Database Error', 'Firebase database connection drop.', '⚠️');
    }
}

// ---------- Photos (Gallery) ----------
function initPhotos(windowEl) {
    // Left template ready for asset hooks
}

// ---------- Terminal app ----------
function initTerminal(windowEl) {
    const body = windowEl.querySelector('.terminal-body');
    const input = windowEl.querySelector('.terminal-input');
    if (!body || !input) return;

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim();
            input.value = '';
            if (cmd === '') return;

            state.commandHistory.push(cmd);
            state.historyIndex = state.commandHistory.length;

            const cmdRow = document.createElement('div');
            cmdRow.style.color = '#ffffff';
            cmdRow.textContent = `C:\\Users\\Guest> ${cmd}`;
            body.appendChild(cmdRow);

            const outRow = document.createElement('div');
            outRow.style.marginBottom = '8px';

            const parts = cmd.toLowerCase().split(' ');
            const baseCmd = parts[0];

            switch (baseCmd) {
                case 'help':
                    outRow.style.color = '#888888';
                    outRow.innerHTML = `Available Commands:<br>
                    - <strong>help</strong>: Show command configurations<br>
                    - <strong>cls</strong> / <strong>clear</strong>: Clean console buffer<br>
                    - <strong>about</strong> / <strong>skills</strong> / <strong>projects</strong>: Launch applications<br>
                    - <strong>theme</strong>: Toggle light/dark settings<br>
                    - <strong>neofetch</strong>: Print portfolio device parameters`;
                    break;
                case 'cls':
                case 'clear':
                    body.innerHTML = '';
                    return;
                case 'about':
                case 'projects':
                case 'skills':
                    openApp(baseCmd);
                    outRow.style.color = '#55ff55';
                    outRow.textContent = `Launching window execution context: ${baseCmd}`;
                    break;
                case 'theme':
                    const themeBtn = document.getElementById('themeToggle');
                    if (themeBtn) themeBtn.click();
                    outRow.style.color = '#55ff55';
                    outRow.textContent = 'System environment theme changed.';
                    break;
                case 'neofetch':
                    outRow.style.color = '#4facfe';
                    outRow.style.whiteSpace = 'pre';
                    outRow.textContent = `   🪟   User: ${portfolioData.name}
  ████  Title: ${portfolioData.title}
  ████  OS: PortfolioOS v2026.3.1
        Shell: Javascript-Terminal
        Resolution: ${window.innerWidth}x${window.innerHeight}
        Engine: Chrome V8 Engine Match`;
                    break;
                default:
                    outRow.style.color = '#ff5555';
                    outRow.textContent = `'${baseCmd}' is not recognized as an internal or external command loop.`;
            }

            body.appendChild(outRow);
            body.scrollTop = body.scrollHeight;
        }
    });
}

// ---------- Admin Dashboard Panel Management ----------
function initAdmin(windowEl) {
    const authBox = windowEl.querySelector('#adminAuthBox');
    const adminPanel = windowEl.querySelector('#adminPanel');
    if (!authBox || !adminPanel) return;

    if (state.currentUser && state.currentUser.email === 'jossypremium.2016@gmail.com') {
        authBox.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        loadAdminPanelData(adminPanel);
    } else {
        authBox.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        authBox.innerHTML = `
            <div style="text-align: center; padding: 24px; color: var(--text-color);">
                <span style="font-size: 32px;">🔐</span>
                <h4 style="margin: 12px 0 6px 0;">Administrative Check</h4>
                <p style="font-size: 13px; opacity: 0.7; margin-bottom: 16px;">This window is restricted. Please login using your master profile credentials from the Windows Lock screen.</p>
            </div>
        `;
    }
}

function loadAdminPanelData(container) {
    const msgList = container.querySelector('#adminMessagesList');
    if (!msgList) return;
    msgList.innerHTML = '<div style="font-style:italic; opacity:0.5; font-size:13px; padding:10px;">Loading mailbox streams...</div>';

    if (window.db) {
        try {
            const q = query(collection(window.db, "messages"), orderBy("timestamp", "desc"));
            onSnapshot(q, (snapshot) => {
                msgList.innerHTML = '';
                if (snapshot.empty) {
                    msgList.innerHTML = '<div style="font-style:italic; opacity:0.5; font-size:13px; padding:10px;">No message entries found inside cloud collections.</div>';
                    return;
                }
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const item = document.createElement('div');
                    item.className = 'admin-message-card';
                    item.style.padding = '10px';
                    item.style.borderBottom = '1px solid var(--border-color)';
                    item.style.fontSize = '13px';
                    item.style.color = 'var(--text-color)';

                    const timeStr = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : 'Recent';

                    item.innerHTML = `
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <strong>${data.name || 'Anonymous'}</strong>
                            <span style="font-size:11px; opacity:0.6;">${timeStr}</span>
                        </div>
                        <div style="font-size:12px; color:var(--win11-light-blue); margin-bottom:6px;">${data.email || ''}</div>
                        <p style="margin:0; opacity:0.85; line-height:1.4;">${data.message || ''}</p>
                    `;
                    msgList.appendChild(item);
                });
            }, (error) => {
                console.error("Snapshot error: ", error);
                msgList.innerHTML = '<div style="color:var(--win11-blue); font-size:13px; padding:10px;">Access Refused: Firestore Rules are active.</div>';
            });
        } catch (e) {
            msgList.innerHTML = '<div style="color:var(--win11-blue); padding:10px;">Initialisation tracking bug.</div>';
        }
    }
}

// ---------- Cloud Data Pull Real-time Sync ----------
function loadProjects() {
    if (!window.db) {
        console.warn('Database object instance not bound yet.');
        return;
    }
    try {
        const q = query(collection(window.db, "projects"), orderBy("dateAdded", "desc"));
        onSnapshot(q, (snapshot) => {
            state.projects = [];
            snapshot.forEach((doc) => {
                state.projects.push({ id: doc.id, ...doc.data() });
            });

            if (state.openWindows.has('projects')) {
                const win = state.openWindows.get('projects');
                const grid = win.querySelector('#projectsGrid');
                if (grid) {
                    const activeSidebar = win.querySelector('.sidebar-item.active');
                    const currentCategory = activeSidebar ? activeSidebar.dataset.category : 'all';
                    const viewToggle = win.querySelector('#explorerViewToggle');
                    const currentView = viewToggle ? viewToggle.value : 'grid';
                    renderProjects(grid, state.projects, currentCategory, currentView);
                }
            }
        }, (err) => {
            console.error("Firestore read fault: ", err);
            state.projects = [];
            if (state.openWindows.has('projects')) {
                const win = state.openWindows.get('projects');
                const grid = win.querySelector('#projectsGrid');
                if (grid) {
                    renderProjects(grid, [], 'all', 'grid');
                }
            }
            addNotification('Projects database sync skipped. Check rules configuration.');
        });
    } catch (err) {
        console.warn('loadProjects skipped - db execution context dropped', err);
    }
}

// ---------- Utilities ----------
function changeWallpaper() { 
    state.wallpaperIndex = (state.wallpaperIndex + 1) % wallpapers.length; 
    const wp = document.querySelector('.desktop-wallpaper'); 
    if (wp) wp.style.background = wallpapers[state.wallpaperIndex]; 
}

function shutdown() { 
    if (confirm('Are you sure you want to shut down?')) location.reload(); 
}

function handleFormSubmit(e) { 
    if (e.target && e.target.id === 'contactFormElement') {
        e.preventDefault(); // <-- Catch it immediately here!
        const contactWin = state.openWindows.get('contact') || document;
        handleMailSubmit(e, contactWin);
    } 
}
// ---------- Initialize Systems ----------
initBoot();

// End of file
