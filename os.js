// ============================================
// WINDOWS 11 PORTFOLIO OS - MAIN APPLICATION
// ============================================

import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const state = {
    bootComplete: false,
    desktopActive: false,
    startMenuOpen: false,
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
        github:   'https://github.com/jossypremium2016-lab',
        linkedin: 'https://linkedin.com/in/Joseph-Lamide-Ogungbe',
        twitter:  'https://twitter.com/jossypremium'
    },
    experience: [
        { title: 'Financial Systems Engineer', company: 'Premium Solutions', duration: '2023 - Present' },
        { title: 'Software Developer',        company: 'TechFin Services',   duration: '2021 - 2023' }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Firebase', 'CSS3', 'Web Design', 'UI/UX', 'Git', 'SQL', 'Accounting', 'Python', 'Docker'],
    education: [
        { school: 'University of Lagos', degree: 'BS Accounting', year: '2020' },
        { school: 'ALX Software Engineering Program', degree: 'Software Engineering Diploma', year: '2022' }
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

Software Developer — TechFin Services (2021 - 2023)
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

// BOOT & LOCK SCREEN
function initBoot() {
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
    setInterval(updateLockScreenTime, 1000);
    document.addEventListener('keydown', unlockScreen);
    lockScreen.addEventListener('click', unlockScreen);
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
        document.removeEventListener('keydown', unlockScreen);
        const lockScreen = document.getElementById('lockScreen');
        if (lockScreen) lockScreen.classList.add('hidden');
        state.bootComplete = true;
        initDesktop();
    }
}

// DESKTOP INITIALIZATION
function initDesktop() {
    const desktop = document.getElementById('desktopEnvironment');
    if (desktop) desktop.classList.remove('hidden');
    const wpEl = document.querySelector('.desktop-wallpaper');
    if (wpEl) wpEl.style.background = wallpapers[state.wallpaperIndex];
    state.desktopActive = true;
    setInterval(updateTaskbarClock, 1000);
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

// EVENT LISTENERS
function initializeEventListeners() {
    const startBtn = document.getElementById('startButton');
    if (startBtn) startBtn.addEventListener('click', toggleStartMenu);

    document.querySelectorAll('.desktop-icon').forEach(icon => {
        // Single click → select (visual highlight)
        icon.addEventListener('click', (e) => {
            document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
        });
        // Double click → open app
        icon.addEventListener('dblclick', (e) => {
            const app = e.currentTarget.dataset.app;
            openApp(app);
        });
        // Touch tap → open immediately (mobile/tablet)
        let touchTimeout;
        icon.addEventListener('touchstart', (e) => {
            touchTimeout = setTimeout(() => { openApp(icon.dataset.app); }, 300);
        }, { passive: true });
        icon.addEventListener('touchend', () => clearTimeout(touchTimeout), { passive: true });
    });

    // Click on desktop background → deselect icons
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
    
    // Bind search event listeners
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

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
            e.preventDefault();
            openApp('admin');
        }
        if (e.key === 'Escape' && state.startMenuOpen) toggleStartMenu();
    });
}

// START MENU
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
} // ← FIX Bug 1: closing brace that was missing, breaking ALL subsequent code

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
    

// Context actions
document.addEventListener('click', (e) => {
    const item = e.target.closest('.context-menu-item');
    if (item) {
        const action = item.dataset.action;
        switch(action) {
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
function addNotification(message) { const list = document.getElementById('notificationsList'); if (!list) return; const item = document.createElement('div'); item.className='notification-item'; item.textContent=message; list.appendChild(item); setTimeout(()=>item.remove(),5000); }

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
    
    // Trigger slide-in
    setTimeout(() => toast.classList.add('show'), 50);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}

// ---------- Window Manager ----------
class WindowManager {
    constructor(){
        this.draggingWindow = null;
        this.dragOffset = { x: 0, y: 0 };
        this.onDrag = this.onDrag.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
    }
    createWindow(template){ 
        const clone=document.importNode(template.content,true); 
        const windowEl=clone.querySelector('.win11-window'); 
        document.getElementById('windowsContainer').appendChild(windowEl); 
        windowEl.style.zIndex=state.zIndex++; 
        this.setupWindowControls(windowEl); 
        this.setupResizing(windowEl);
        const appName=windowEl.dataset.window; 
        state.openWindows.set(appName,windowEl); 
        renderTaskbar(); 
        return windowEl; 
    }
    setupWindowControls(windowEl){ 
        const header=windowEl.querySelector('.window-header'); 
        const minimizeBtn=windowEl.querySelector('.window-minimize'); 
        const maximizeBtn=windowEl.querySelector('.window-maximize'); 
        const closeBtn=windowEl.querySelector('.window-close'); 
        if(header) header.addEventListener('mousedown', (e)=>{ 
            if(e.target.closest('.window-controls')) return; 
            this.startDrag(e,windowEl); 
        }); 
        if(header) header.addEventListener('dblclick', ()=>this.toggleMaximize(windowEl)); 
        if(minimizeBtn) minimizeBtn.addEventListener('click', ()=>this.minimizeWindow(windowEl)); 
        if(maximizeBtn) maximizeBtn.addEventListener('click', ()=>this.toggleMaximize(windowEl)); 
        if(closeBtn) closeBtn.addEventListener('click', ()=>this.closeWindow(windowEl)); 
        windowEl.addEventListener('mousedown', ()=>{ 
            windowEl.style.zIndex=state.zIndex++; 
        }); 
        
        // Setup Snap Layout Picker
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
    startDrag(e,windowEl){ this.draggingWindow=windowEl; const rect=windowEl.getBoundingClientRect(); this.dragOffset.x=e.clientX-rect.left; this.dragOffset.y=e.clientY-rect.top; document.addEventListener('mousemove', this.onDrag); document.addEventListener('mouseup', this.stopDrag); }
    onDrag(e){
        if(!this.draggingWindow) return;
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        this.draggingWindow.style.left = x + 'px';
        this.draggingWindow.style.top = y + 'px';
    }
    stopDrag(){
        this.draggingWindow = null;
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.stopDrag);
    }
    toggleMaximize(windowEl){ 
        windowEl.classList.remove('minimizing');
        if(windowEl.style.width==='calc(100% - 20px)'){ 
            windowEl.style.width='800px'; 
            windowEl.style.height='600px'; 
            windowEl.style.left='50px'; 
            windowEl.style.top='50px'; 
        } else { 
            windowEl.style.width='calc(100% - 20px)'; 
            windowEl.style.height='calc(100% - 78px)'; 
            windowEl.style.left='10px'; 
            windowEl.style.top='10px'; 
        } 
    }
    minimizeWindow(windowEl){ windowEl.classList.add('minimizing'); setTimeout(()=>{ windowEl.style.display='none'; },300); }
    restoreWindow(windowEl){ windowEl.classList.remove('minimizing'); windowEl.style.display='flex'; windowEl.style.zIndex=state.zIndex++; }
    closeWindow(windowEl){ 
        const appName=windowEl.dataset.window; 
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
function openApp(appName){ 
    if(state.openWindows.has(appName)){ 
        const existingWindow=state.openWindows.get(appName); 
        if(existingWindow.style.display==='none') windowManager.restoreWindow(existingWindow); 
        else existingWindow.style.zIndex=state.zIndex++; 
        return; 
    } 
    let template; 
    switch(appName){ 
        case 'projects': 
            template=document.getElementById('fileExplorerTemplate'); 
            const w1=windowManager.createWindow(template); 
            initFileExplorer(w1); 
            break; 
        case 'about': 
            template=document.getElementById('settingsTemplate'); 
            const w2=windowManager.createWindow(template); 
            initSettings(w2); 
            break; 
        case 'skills': 
            template=document.getElementById('taskManagerTemplate'); 
            const w3=windowManager.createWindow(template); 
            initTaskManager(w3); 
            break; 
        case 'terminal': 
            template=document.getElementById('terminalTemplate'); 
            const wTerm=windowManager.createWindow(template); 
            initTerminal(wTerm); 
            break; 
        case 'contact': 
            template=document.getElementById('mailTemplate'); 
            const w4=windowManager.createWindow(template); 
            initMail(w4); 
            break; 
        case 'resume': 
            template=document.getElementById('notepadTemplate'); 
            const w5=windowManager.createWindow(template); 
            initNotepad(w5); 
            break; 
        case 'gallery': 
            template=document.getElementById('photosTemplate'); 
            const w6=windowManager.createWindow(template); 
            initPhotos(w6); 
            break; 
        case 'admin': 
            template=document.getElementById('adminLoginTemplate'); 
            const w7=windowManager.createWindow(template); 
            initAdmin(w7); 
            break; 
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
            allApps.push({
                name: appName,
                icon: iconMap[appName] || '🗔',
                label: labelMap[appName] || appName
            });
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
        
        // Hover Previews
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
function initFileExplorer(windowEl){ 
    const grid=windowEl.querySelector('#projectsGrid'); 
    const viewToggle=windowEl.querySelector('#explorerViewToggle'); 
    const sortSelect=windowEl.querySelector('#explorerSort'); 
    const searchInput=windowEl.querySelector('.toolbar-search'); 
    const categoryItems=windowEl.querySelectorAll('.sidebar-item'); 
    let currentCategory='all'; 
    let currentView='grid'; 
    
    if(grid) renderProjects(grid,state.projects,'all',currentView); 
    
    if(viewToggle) viewToggle.addEventListener('change',(e)=>{ 
        currentView=e.target.value; 
        if(grid) grid.className=`projects-grid ${currentView}-view`; 
        renderProjects(grid,state.projects,currentCategory,currentView); 
    }); 
    
    categoryItems.forEach(item=>{ 
        item.addEventListener('click',()=>{ 
            categoryItems.forEach(i=>i.classList.remove('active')); 
            item.classList.add('active'); 
            currentCategory=item.dataset.category; 
            renderProjects(grid,state.projects,currentCategory,currentView); 
        }); 
    }); 
    
    if(searchInput) searchInput.addEventListener('input',(e)=>{ 
        const v=e.target.value.toLowerCase(); 
        const filtered=state.projects.filter(p=> 
            (p.title||'').toLowerCase().includes(v) || 
            (p.description||'').toLowerCase().includes(v) ||
            (p.techStack || p.tech || []).some(t => t.toLowerCase().includes(v))
        ); 
        renderProjects(grid,filtered,currentCategory,currentView); 
    }); 
    
    if(sortSelect) sortSelect.addEventListener('change',(e)=>{ 
        const sorted=[...state.projects]; 
        const getDateValue = (dateObj) => {
            if (!dateObj) return new Date(0);
            if (typeof dateObj.toDate === 'function') return dateObj.toDate();
            return new Date(dateObj);
        };
        if(e.target.value==='name') sorted.sort((a,b)=> (a.title||'').localeCompare(b.title||'')); 
        else if(e.target.value==='date') sorted.sort((a,b)=> getDateValue(b.dateAdded) - getDateValue(a.dateAdded)); 
        else if(e.target.value==='category') sorted.sort((a,b)=> (a.category||'').localeCompare(b.category||'')); 
        renderProjects(grid,sorted,currentCategory,currentView); 
    }); 
}

function renderProjects(container,projects,category,view){ 
    if(!container) return; 
    container.innerHTML=''; 
    
    let filtered=projects; 
    if(category!=='all') {
        filtered=projects.filter(p=>(p.category||'').toLowerCase()===category.toLowerCase());
    }
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="explorer-empty">No projects found in this folder.</div>';
        return;
    }
    
    filtered.forEach(project=>{ 
        const card=document.createElement('div'); 
        card.className=`project-card ${view}-view-card`; 
        
        const thumb = project.thumbnail || 'https://via.placeholder.com/300x180?text=Project+Thumbnail';
        const techStack = project.techStack || project.tech || [];
        const techBadges = techStack.map(t => `<span class="tech-badge">${t}</span>`).join('');
        const catLabel = project.category ? project.category.toUpperCase() : 'WEB';
        
        card.innerHTML=`
            <div class="project-card-thumb" style="background-image: url('${thumb}');">
                <span class="project-category-badge">${catLabel}</span>
            </div>
            <div class="project-card-content">
                <h4 class="project-card-title">${project.title||''}</h4>
                <p class="project-card-desc">${project.description||''}</p>
                <div class="project-card-tech">${techBadges}</div>
                <div class="project-card-links">
                    ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="explorer-card-btn gh-btn">🐙 GitHub</a>` : ''}
                    ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" class="explorer-card-btn live-btn">🌐 Live</a>` : ''}
                </div>
            </div>
        `;
        
        card.addEventListener('click', (e)=>{
            if (e.target.closest('.explorer-card-btn')) return;
            if (project.liveUrl) window.open(project.liveUrl, '_blank');
            else if (project.githubUrl) window.open(project.githubUrl, '_blank');
            else showProjectDetail(project);
        });
        container.appendChild(card); 
    }); 
}

function showProjectDetail(project){ 
    alert(`${project.title||''}\n\n${project.description||''}\n\nTech: ${(project.techStack||project.tech||[]).join(', ')}\n\n${project.liveUrl?`Live: ${project.liveUrl}`:''}\n${project.githubUrl?`GitHub: ${project.githubUrl}`:''}`); 
}

// ---------- Settings (About Me) ----------
function initSettings(windowEl){ 
    const navItems=windowEl.querySelectorAll('.settings-nav-item'); 
    const contentArea=windowEl.querySelector('#settingsContent'); 
    
    function showSection(section){ 
        navItems.forEach(item=>item.classList.remove('active')); 
        const activeItem=Array.from(navItems).find(i=>i.dataset.section===section); 
        if(activeItem) activeItem.classList.add('active'); 
        
        let html=''; 
        switch(section){ 
            case 'general': 
                html=`
                    <div class="about-profile-header">
                        <img class="about-profile-img" src="./joseph_headshot.png" alt="${portfolioData.name}">
                        <div class="about-profile-info">
                            <h2 class="about-profile-name">${portfolioData.name}</h2>
                            <p class="about-profile-title">${portfolioData.title}</p>
                            <div class="about-social-links">
                                <a href="${portfolioData.social.github}" target="_blank" class="about-social-link">GitHub</a>
                                <a href="${portfolioData.social.linkedin}" target="_blank" class="about-social-link">LinkedIn</a>
                            </div>
                        </div>
                    </div>
                    <h3>About Me</h3>
                    <div class="settings-item">
                        <div class="settings-item-label">Bio</div>
                        <div class="settings-item-value" style="line-height:1.6;font-size:13px;">${portfolioData.bio}</div>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-label">Email</div>
                        <div class="settings-item-value">${portfolioData.email}</div>
                    </div>
                `; 
                break; 
            case 'experience': 
                html='<h3>Experience</h3>'; 
                portfolioData.experience.forEach(exp=>{ 
                    html+=`<div class="settings-item"><div class="settings-item-label" style="font-weight:600;font-size:14px;color:var(--win11-light-blue);">${exp.title}</div><div class="settings-item-value" style="font-size:12px;margin-top:4px;"><strong>${exp.company}</strong> (${exp.duration})</div></div>`; 
                }); 
                break; 
            case 'education': 
                html='<h3>Education</h3>'; 
                portfolioData.education.forEach(edu=>{ 
                    html+=`<div class="settings-item"><div class="settings-item-label" style="font-weight:600;font-size:14px;color:var(--win11-light-blue);">${edu.school}</div><div class="settings-item-value" style="font-size:12px;margin-top:4px;"><strong>${edu.degree}</strong> - ${edu.year}</div></div>`; 
                }); 
                break; 
            case 'skills': 
                html='<h3>Skills Overview</h3><div class="settings-item" style="display:flex;flex-wrap:wrap;gap:8px;">'; 
                portfolioData.skills.forEach(skill=>{ 
                    html+=`<span style="padding:6px 12px;background:var(--input-bg);border:1px solid var(--border-color);border-radius:20px;color:var(--text-color);font-size:12px;">✓ ${skill}</span>`; 
                }); 
                html+='</div>'; 
                break; 
            case 'achievements': 
                html=`<h3>Achievements</h3><div class="settings-item"><div class="settings-item-label">Projects Completed</div><div class="settings-item-value">${state.projects.length}+</div></div>`; 
                break; 
        } 
        if(contentArea) contentArea.innerHTML=html; 
    } 
    navItems.forEach(item=>{ 
        item.addEventListener('click', ()=>showSection(item.dataset.section)); 
    }); 
    showSection('general'); 
}

// ---------- Task Manager (Skills) ----------
function initTaskManager(windowEl) {
    const tabs = windowEl.querySelectorAll('.tm-tab');
    const skillsList = windowEl.querySelector('#tmSkillsList');
    const perfSpec = windowEl.querySelector('#tmPerfSpec');
    
    const skillsData = {
        languages: [
            { name: 'JavaScript', val: 95 },
            { name: 'Python', val: 85 },
            { name: 'SQL', val: 80 },
            { name: 'HTML & CSS', val: 90 }
        ],
        frameworks: [
            { name: 'React', val: 90 },
            { name: 'Node.js', val: 85 },
            { name: 'Express.js', val: 80 },
            { name: 'Bootstrap', val: 90 }
        ],
        databases: [
            { name: 'Firebase Firestore', val: 90 },
            { name: 'PostgreSQL', val: 80 },
            { name: 'MongoDB', val: 75 }
        ],
        tools: [
            { name: 'Git', val: 85 },
            { name: 'Docker', val: 70 },
            { name: 'Vite / Webpack', val: 80 },
            { name: 'Vercel / Firebase Hosting', val: 85 }
        ]
    };
    
    const loadTab = (tabName) => {
        tabs.forEach(t => t.classList.remove('active'));
        const activeTab = windowEl.querySelector(`.tm-tab[data-tab="${tabName}"]`);
        if (activeTab) activeTab.classList.add('active');
        
        const labels = { 
            languages: 'CPU - Languages', 
            frameworks: 'Memory - Frameworks', 
            databases: 'Disk - Databases', 
            tools: 'Network - Tools' 
        };
        if (perfSpec) perfSpec.textContent = labels[tabName];
        
        if (!skillsList) return;
        skillsList.innerHTML = '';
        
        const skills = skillsData[tabName] || [];
        skills.forEach(skill => {
            const item = document.createElement('div');
            item.className = 'tm-skill-item';
            item.innerHTML = `
                <div class="tm-skill-header">
                    <span class="tm-skill-name">${skill.name}</span>
                    <span class="tm-skill-pct">${skill.val}%</span>
                </div>
                <div class="tm-skill-bar-container">
                    <div class="tm-skill-bar" style="width: 0%;"></div>
                </div>
            `;
            skillsList.appendChild(item);
            
            setTimeout(() => {
                const bar = item.querySelector('.tm-skill-bar');
                if (bar) bar.style.width = `${skill.val}%`;
            }, 50);
        });
    };
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            loadTab(tab.dataset.tab);
        });
    });
    
    loadTab('languages');
}

// ---------- Terminal ----------
function initTerminal(windowEl){ 
    const output=windowEl.querySelector('#terminalOutput'); 
    const input=windowEl.querySelector('#terminalInput'); 
    if(!output||!input) return; 
    
    output.innerHTML=`<div class="terminal-line">C:\\Users\\Developer> whoami</div><div class="terminal-line">${portfolioData.name} - ${portfolioData.title}</div><div class="terminal-line"></div><div class="terminal-line" style="color:#0DFFFF;font-size:11px;opacity:0.7;">Type \"help\" for available commands</div><div class="terminal-line"></div>`; 
    
    input.addEventListener('keydown',(e)=>{ 
        if(e.key==='Enter'){ 
            const command=input.value.trim(); 
            state.commandHistory.push(command); 
            state.historyIndex=state.commandHistory.length; 
            executeTerminalCommand(command,output); 
            input.value=''; 
        } else if(e.key==='ArrowUp' && state.historyIndex>0){ 
            state.historyIndex--; 
            input.value=state.commandHistory[state.historyIndex]; 
        } else if(e.key==='ArrowDown' && state.historyIndex<state.commandHistory.length-1){ 
            state.historyIndex++; 
            input.value=state.commandHistory[state.historyIndex]; 
        } 
    }); 
    input.focus(); 
}

function executeTerminalCommand(command,outputEl){ 
    const line=document.createElement('div'); 
    line.className='terminal-line'; 
    line.innerHTML=`C:\\Users\\Developer> ${command}`; 
    outputEl.appendChild(line); 
    
    const resultLine=document.createElement('div'); 
    resultLine.className='terminal-line'; 
    
    const cmd = command.trim().toLowerCase();
    switch(cmd){ 
        case 'help': 
            resultLine.innerHTML=`Available commands:\nwhoami   - Display bio and user info\nskills   - List all developer skills\nprojects - List projects from Firestore\ncontact  - Show contact email\nsocials  - Display social URL links (clickable)\nclear    - Clear terminal`; 
            break; 
        case 'whoami': 
            resultLine.innerHTML=`<strong>Name:</strong> ${portfolioData.name}\n<strong>Title:</strong> ${portfolioData.title}\n<strong>Bio:</strong> ${portfolioData.bio}`; 
            break; 
        case 'skills': 
            resultLine.innerHTML=portfolioData.skills.join(', '); 
            break; 
        case 'projects': 
            resultLine.innerHTML=state.projects.map(p=>`- <strong>${p.title}</strong>: ${p.description.substring(0,80)}...`).join('\n'); 
            break; 
        case 'contact': 
            resultLine.innerHTML=`<strong>Email:</strong> <a href="mailto:${portfolioData.email}" style="color:#0DFFFF;" target="_blank">${portfolioData.email}</a>`; 
            break; 
        case 'socials': 
            resultLine.innerHTML=`<strong>GitHub:</strong> <a href="${portfolioData.social.github}" target="_blank" style="color:#0DFFFF;">${portfolioData.social.github}</a>\n<strong>LinkedIn:</strong> <a href="${portfolioData.social.linkedin}" target="_blank" style="color:#0DFFFF;">${portfolioData.social.linkedin}</a>`; 
            break; 
        case 'clear': 
            outputEl.innerHTML=''; 
            return; 
        default: 
            resultLine.innerHTML=`Command not found: "${command}". Type "help" for available commands.`; 
    } 
    outputEl.appendChild(resultLine); 
    outputEl.scrollTop=outputEl.scrollHeight; 
}

// ---------- Mail App (Contact) ----------
function initMail(windowEl) {
    const folders = windowEl.querySelectorAll('.mail-folder');
    const mailList = windowEl.querySelector('#mailList');
    const mailWelcomeView = windowEl.querySelector('#mailWelcomeView');
    const mailComposeView = windowEl.querySelector('#mailComposeView');
    const newMailBtn = windowEl.querySelector('#mailNewBtn');
    const mailForm = windowEl.querySelector('#mailFormElement');
    const mailListItems = windowEl.querySelectorAll('.mail-list-item');
    
    folders.forEach(folder => {
        folder.addEventListener('click', () => {
            folders.forEach(f => f.classList.remove('active'));
            folder.classList.add('active');
            const fName = folder.dataset.folder;
            
            if (fName === 'inbox') {
                mailList.style.display = '';
                if (mailWelcomeView) mailWelcomeView.classList.remove('hidden');
                if (mailComposeView) mailComposeView.classList.add('hidden');
            } else {
                mailList.style.display = 'none';
                if (mailWelcomeView) mailWelcomeView.classList.add('hidden');
                if (mailComposeView) mailComposeView.classList.remove('hidden');
            }
        });
    });
    
    mailListItems.forEach(item => {
        item.addEventListener('click', () => {
            mailListItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const mailId = item.dataset.mail;
            if (mailId === 'welcome') {
                if (mailWelcomeView) {
                    mailWelcomeView.querySelector('h3').textContent = 'Welcome to my Portfolio Mail!';
                    mailWelcomeView.querySelector('.mail-view-body').innerHTML = `
                        <p>Hi there,</p>
                        <p>Thanks for visiting my Windows 11 portfolio! You can use this Mail application to send me a message directly. Just click the "New mail" button in the sidebar or fill out the compose form.</p>
                        <p>Looking forward to connecting with you!</p>
                        <p>Best regards,<br>Joseph</p>
                    `;
                    mailWelcomeView.classList.remove('hidden');
                }
                if (mailComposeView) mailComposeView.classList.add('hidden');
            } else if (mailId === 'google') {
                if (mailWelcomeView) {
                    mailWelcomeView.querySelector('h3').textContent = 'Software Engineer Opportunity';
                    mailWelcomeView.querySelector('.mail-view-body').innerHTML = `
                        <p>Hi Joseph,</p>
                        <p>We reviewed your impressive software engineering and accounting portfolio. We would love to schedule a preliminary screening call to discuss our engineering open roles.</p>
                        <p>Please send us your resume or coordinate a time with us.</p>
                        <p>Best regards,<br>Google Recruiting Team</p>
                    `;
                    mailWelcomeView.classList.remove('hidden');
                }
                if (mailComposeView) mailComposeView.classList.add('hidden');
            }
        });
    });
    
    if (newMailBtn) {
        newMailBtn.addEventListener('click', () => {
            folders.forEach(f => f.classList.remove('active'));
            const sentFolder = Array.from(folders).find(f => f.dataset.folder === 'sent');
            if (sentFolder) sentFolder.classList.add('active');
            
            mailList.style.display = 'none';
            if (mailWelcomeView) mailWelcomeView.classList.add('hidden');
            if (mailComposeView) mailComposeView.classList.remove('hidden');
            if (mailForm) mailForm.reset();
        });
    }
    
    if (mailForm) {
        mailForm.addEventListener('submit', (e) => {
            handleMailSubmit(e, windowEl);
        });
    }
}

function handleMailSubmit(e, windowEl) {
    e.preventDefault();
    const form = e.target;
    const nameEl = form.querySelector('#mailFromName');
    const emailEl = form.querySelector('#mailFromEmail');
    const subjectEl = form.querySelector('#mailSubject');
    const messageEl = form.querySelector('#mailMessage');
    const statusEl = windowEl.querySelector('#mailStatus');
    
    if (!nameEl || !emailEl || !subjectEl || !messageEl || !statusEl) return;
    
    const name = nameEl.value;
    const email = emailEl.value;
    const subject = subjectEl.value;
    const message = messageEl.value;
    
    statusEl.className = 'alert alert-info';
    statusEl.textContent = 'Sending message...';
    statusEl.classList.remove('hidden');
    
    const msgData = {
        name,
        email,
        subject,
        message,
        timestamp: serverTimestamp()
    };
    
    try {
        addDoc(collection(window.db, 'messages'), msgData)
            .then(() => {
                statusEl.className = 'alert alert-success';
                statusEl.textContent = '✅ Message sent successfully! Thank you.';
                form.reset();
                addNotification(`Message from ${name} sent!`);
                showToast('Mail', `Message from ${name} successfully sent!`, '📧');
                
                setTimeout(() => {
                    statusEl.classList.add('hidden');
                }, 5000);
            })
            .catch((error) => {
                console.error('Error writing document: ', error);
                statusEl.className = 'alert alert-danger';
                statusEl.textContent = `❌ Error sending message: ${error.message}`;
            });
    } catch (err) {
        console.error('Firestore not initialized: ', err);
        statusEl.className = 'alert alert-danger';
        statusEl.textContent = '❌ Error: Firebase database is not available.';
    }
}

// ---------- Photos ----------
function initPhotos(windowEl){ 
    const grid = windowEl.querySelector('#galleryGrid'); 
    if(!grid) return; 
    const makesvg = (color, label) => `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='${encodeURIComponent(color)}'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='white'>${encodeURIComponent(label)}</text></svg>`;
    const galleryItems = [ 
        {src: makesvg('#0078D4','Project 1'), alt:'Project 1'}, 
        {src: makesvg('#107C10','Project 2'), alt:'Project 2'}, 
        {src: makesvg('#E81123','Screenshot'), alt:'Screenshot'}, 
        {src: makesvg('#5C2D91','Certificate'), alt:'Certificate'},
        {src: makesvg('#FF8C00','Design'), alt:'Design'},
        {src: makesvg('#00B4D8','Prototype'), alt:'Prototype'}
    ]; 
    galleryItems.forEach((item,i)=>{ 
        const gi=document.createElement('div'); 
        gi.className='gallery-item'; 
        gi.innerHTML=`<img src="${item.src}" alt="${item.alt}">`; 
        gi.addEventListener('click',()=>openLightbox(i,galleryItems)); 
        grid.appendChild(gi); 
    }); 
}
function openLightbox(index,items){ const lightbox=document.getElementById('lightbox'); const image=document.getElementById('lightboxImage'); if(!lightbox||!image) return; let currentIndex=index; function updateImage(){ image.src=items[currentIndex].src; } updateImage(); lightbox.classList.remove('hidden'); const close=document.querySelector('.lightbox-close'); const prev=document.querySelector('.lightbox-prev'); const next=document.querySelector('.lightbox-next'); if(close) close.onclick=()=>lightbox.classList.add('hidden'); if(prev) prev.onclick=()=>{ currentIndex=(currentIndex-1+items.length)%items.length; updateImage(); }; if(next) next.onclick=()=>{ currentIndex=(currentIndex+1)%items.length; updateImage(); }; }

// ---------- Notepad ----------
function initNotepad(windowEl){ const content=windowEl.querySelector('#resumeContent'); const printBtn=windowEl.querySelector('#printResume'); if(content) content.textContent=portfolioData.resume; if(printBtn) printBtn.addEventListener('click',()=>window.print()); }

// ---------- Admin ----------
function initAdmin(windowEl){ const loginForm=windowEl.querySelector('#adminLoginForm'); const loginBtn=windowEl.querySelector('#adminLoginBtn'); const adminPanel=windowEl.querySelector('#adminPanel'); const logoutBtn=windowEl.querySelector('#adminLogout'); const addProjectBtn=windowEl.querySelector('#addProjectBtn'); const projectForm=windowEl.querySelector('#adminProjectForm'); const projectFormElement=windowEl.querySelector('#projectFormElement'); const cancelBtn=windowEl.querySelector('#cancelProjectForm'); if(loginBtn) loginBtn.addEventListener('click',(e)=>{ e.preventDefault(); adminLogin(windowEl); }); if(logoutBtn) logoutBtn.addEventListener('click',()=>{ try{ signOut(window.auth); }catch(e){} if(loginForm) loginForm.classList.remove('hidden'); if(adminPanel) adminPanel.classList.add('hidden'); if(projectForm) projectForm.classList.add('hidden'); }); if(addProjectBtn) addProjectBtn.addEventListener('click',()=>{ if(projectForm) projectForm.classList.remove('hidden'); if(projectFormElement) projectFormElement.reset(); const pid=windowEl.querySelector('#projectId'); if(pid) pid.value=''; }); if(cancelBtn) cancelBtn.addEventListener('click',()=>{ if(projectForm) projectForm.classList.add('hidden'); }); if(projectFormElement) projectFormElement.addEventListener('submit',(e)=>{ e.preventDefault(); saveProject(windowEl); }); }

function adminLogin(windowEl){
    const emailEl    = windowEl.querySelector('#adminEmail');
    const passwordEl = windowEl.querySelector('#adminPassword');
    const errorDiv   = windowEl.querySelector('#adminError');
    const email    = emailEl    ? emailEl.value    : '';
    const password = passwordEl ? passwordEl.value : '';
    try{
        signInWithEmailAndPassword(window.auth, email, password).then(()=>{
            const lf = windowEl.querySelector('#adminLoginForm');
            const ap = windowEl.querySelector('#adminPanel');
            if(lf) lf.classList.add('hidden');
            if(ap) ap.classList.remove('hidden');
            loadAdminProjects(windowEl);
        }).catch(error=>{
            if(errorDiv){ errorDiv.textContent=error.message; errorDiv.classList.remove('hidden'); }
        });
    }catch(e){
        if(errorDiv) errorDiv.textContent='Auth not available';
    }
}

function loadAdminProjects(windowEl){ const list=windowEl.querySelector('#projectsList'); if(!list) return; list.innerHTML=''; state.projects.forEach(project=>{ const item=document.createElement('div'); item.className='project-item'; item.innerHTML=`<div class="project-item-name">${project.title||''}</div><div class="project-item-actions"><button class="btn btn-sm btn-primary" onclick="editProject('${project.id}')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteProject('${project.id}')">Delete</button></div>`; list.appendChild(item); }); }

function saveProject(windowEl){
    const q = (sel) => { const el = windowEl.querySelector(sel); return el ? el.value : ''; };
    const id = q('#projectId');
    const project = {
        title:       q('#projectTitle'),
        description: q('#projectDescription'),
        category:    q('#projectCategory') || 'Web',
        techStack:   q('#projectTech').split(',').map(t=>t.trim()).filter(Boolean),
        thumbnail:   q('#projectThumbnail'),
        liveUrl:     q('#projectLiveUrl'),
        githubUrl:   q('#projectGithubUrl'),
        featured:    !!(windowEl.querySelector('#projectFeatured') && windowEl.querySelector('#projectFeatured').checked),
        dateAdded:   id ? (state.projects.find(p => p.id === id)?.dateAdded || serverTimestamp()) : serverTimestamp()
    };
    try{
        if(id) updateDoc(doc(window.db,'projects',id), project);
        else   addDoc(collection(window.db,'projects'), project);
    }catch(e){ console.warn('Firestore write skipped', e); }
    const pf = windowEl.querySelector('#adminProjectForm');
    if(pf) pf.classList.add('hidden');
    loadProjects();
}

window.editProject=function(id){ 
    const project=state.projects.find(p=>p.id===id); 
    if(project){ 
        const form=document.querySelector('#adminProjectForm'); 
        if(!form) return;
        const pid=form.querySelector('#projectId'); 
        if(pid) pid.value=id; 
        const title=form.querySelector('#projectTitle'); 
        if(title) title.value=project.title||''; 
        const desc=form.querySelector('#projectDescription'); 
        if(desc) desc.value=project.description||''; 
        const cat=form.querySelector('#projectCategory'); 
        if(cat) cat.value=project.category||''; 
        const tech=form.querySelector('#projectTech'); 
        if(tech) tech.value=(project.techStack||project.tech||[]).join(', '); 
        const thumb=form.querySelector('#projectThumbnail'); 
        if(thumb) thumb.value=project.thumbnail||''; 
        const live=form.querySelector('#projectLiveUrl'); 
        if(live) live.value=project.liveUrl||''; 
        const gh=form.querySelector('#projectGithubUrl'); 
        if(gh) gh.value=project.githubUrl||''; 
        const feat=form.querySelector('#projectFeatured'); 
        if(feat) feat.checked=project.featured||false; 
        form.classList.remove('hidden'); 
    } 
};

window.deleteProject=function(id){ if(confirm('Are you sure?')){ try{ deleteDoc(doc(window.db,'projects',id)); }catch(e){ console.warn('Delete skipped',e); } loadProjects(); } };

// ---------- Firebase integration ----------
function loadProjects(){ 
    try{ 
        const q=query(collection(window.db,'projects'), orderBy('dateAdded','desc')); 
        onSnapshot(q, (snapshot)=>{ 
            state.projects=[]; 
            snapshot.forEach(d=>{
                const data = d.data();
                state.projects.push({ 
                    id: d.id, 
                    ...data,
                    techStack: data.techStack || data.tech || []
                });
            }); 
            if(state.openWindows.has('projects')){ 
                const win=state.openWindows.get('projects'); 
                const grid=win.querySelector('#projectsGrid'); 
                if (grid) {
                    const viewToggle = win.querySelector('#explorerViewToggle');
                    const currentView = viewToggle ? viewToggle.value : 'grid';
                    const activeSidebar = win.querySelector('.sidebar-item.active');
                    const currentCategory = activeSidebar ? activeSidebar.dataset.category : 'all';
                    renderProjects(grid,state.projects,currentCategory,currentView); 
                }
            } 
            loadRecommendedProjects(); 
            const adminWin = state.openWindows.get('admin');
            if(adminWin) loadAdminProjects(adminWin);
        }, (error)=>{ 
            console.error('Error loading projects:',error); 
            addNotification('Error loading projects'); 
        }); 
    }catch(err){ 
        console.warn('loadProjects skipped - db not ready',err); 
    } 
}

function checkAuthStatus(){ try{ onAuthStateChanged(window.auth,(user)=>{ state.currentUser=user; if(user){ const adminIcon=document.getElementById('adminIcon'); if(adminIcon) adminIcon.classList.remove('admin-hidden'); } }); }catch(e){ console.warn('Auth not initialized yet'); } }

// ---------- Utilities ----------
function changeWallpaper(){ state.wallpaperIndex=(state.wallpaperIndex+1)%wallpapers.length; const wp=document.querySelector('.desktop-wallpaper'); if(wp) wp.style.background=wallpapers[state.wallpaperIndex]; }
function shutdown(){ if(confirm('Are you sure you want to shut down?')) location.reload(); }
function handleFormSubmit(e){ if(e.target && e.target.id==='contactFormElement') handleMailSubmit(e, state.openWindows.get('contact') || document); }

// ---------- Initialize ----------
initBoot();

// End of file
