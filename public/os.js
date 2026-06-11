// ============================================
// WINDOWS 11 PORTFOLIO OS - MAIN APPLICATION
// ============================================

import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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
    name: 'Your Full Name',          // ← change this
    title: 'Full Stack Developer',   // ← change this
    bio: "I am a skilled Accountant and Software Engineer who combines financial expertise with technology solutions. I help businesses improve financial reporting, automate processes, analyze data, and build software that drives efficiency and growth. If you need someone who understands both numbers and technology, let's connect.",
    email: 'jossypremium.2016@gmail.com',         // ← change this
    social: {
        github:   'https://github.com/jossypremium2016-lab',    // ← change this
        linkedin: 'https://linkedin.com/in/Joseph (Lamide) Ogungbe', // ← change this
        twitter:  'https://twitter.com/yourusername'    // ← change this
    },
    experience: [
        { title: 'Senior Developer', company: 'Tech Corp',   duration: '2021 - Present' },
        { title: 'Developer',        company: 'StartUp Inc', duration: '2019 - 2021'    }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Firebase', 'CSS3', 'Web Design', 'UI/UX', 'Git'],
    education: [
        { school: 'Your University', degree: 'BS Computer Science', year: '2019' }
    ],
    resume: `YOUR FULL NAME
Full Stack Developer | your@email.com

EXPERIENCE
Senior Developer — Tech Corp (2021 - Present)
• Built responsive web applications
• Led technical team meetings
• Improved performance by 40%

Developer — StartUp Inc (2019 - 2021)
• Developed full-stack applications
• Worked with Firebase and React
• Collaborated with design team

SKILLS
Frontend: React, Vue, Angular, CSS3
Backend:  Node.js, Firebase, PostgreSQL
Tools:    Git, Docker, Webpack

EDUCATION
BS Computer Science — Your University (2019)`
};
// ═══════════════════════════════════════════════

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
    initializeEventListeners();
    loadProjects();
    checkAuthStatus();
    setupKeyboardShortcuts();
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

// ---------- Window Manager ----------
class WindowManager {
    constructor(){
        this.draggingWindow = null;
        this.dragOffset = { x: 0, y: 0 };
        this.onDrag = this.onDrag.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
    }
    createWindow(template){ const clone=document.importNode(template.content,true); const windowEl=clone.querySelector('.win11-window'); document.getElementById('windowsContainer').appendChild(windowEl); windowEl.style.zIndex=state.zIndex++; this.setupWindowControls(windowEl); const appName=windowEl.dataset.window; state.openWindows.set(appName,windowEl); updateTaskbar(appName,true); return windowEl; }
    setupWindowControls(windowEl){ const header=windowEl.querySelector('.window-header'); const minimizeBtn=windowEl.querySelector('.window-minimize'); const maximizeBtn=windowEl.querySelector('.window-maximize'); const closeBtn=windowEl.querySelector('.window-close'); if(header) header.addEventListener('mousedown', (e)=>{ if(e.target.closest('.window-controls')) return; this.startDrag(e,windowEl); }); if(header) header.addEventListener('dblclick', ()=>this.toggleMaximize(windowEl)); if(minimizeBtn) minimizeBtn.addEventListener('click', ()=>this.minimizeWindow(windowEl)); if(maximizeBtn) maximizeBtn.addEventListener('click', ()=>this.toggleMaximize(windowEl)); if(closeBtn) closeBtn.addEventListener('click', ()=>this.closeWindow(windowEl)); windowEl.addEventListener('mousedown', ()=>{ windowEl.style.zIndex=state.zIndex++; }); }
    startDrag(e,windowEl){ this.draggingWindow=windowEl; const rect=windowEl.getBoundingClientRect(); this.dragOffset.x=e.clientX-rect.left; this.dragOffset.y=e.clientY-rect.top; document.addEventListener('mousemove', this.onDrag); document.addEventListener('mouseup', this.stopDrag); }
    onDrag(e){
        if(!this.draggingWindow) return;
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        this.draggingWindow.style.left = x + 'px';
        this.draggingWindow.style.top = y + 'px';
        // FIX Bug 2: removed width/height = 'auto' that was collapsing windows on drag
    }

    stopDrag(){
        this.draggingWindow = null;
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.stopDrag);
    }
    toggleMaximize(windowEl){ if(windowEl.style.width==='calc(100% - 20px)'){ windowEl.style.width='800px'; windowEl.style.height='600px'; windowEl.style.left='50px'; windowEl.style.top='50px'; } else { windowEl.style.width='calc(100% - 20px)'; windowEl.style.height='calc(100% - 78px)'; windowEl.style.left='10px'; windowEl.style.top='10px'; } }
    minimizeWindow(windowEl){ windowEl.classList.add('minimizing'); setTimeout(()=>{ windowEl.style.display='none'; },300); }
    restoreWindow(windowEl){ windowEl.classList.remove('minimizing'); windowEl.style.display='flex'; windowEl.style.zIndex=state.zIndex++; }
    closeWindow(windowEl){ const appName=windowEl.dataset.window; windowEl.remove(); state.openWindows.delete(appName); updateTaskbar(appName,false); }
}
const windowManager = new WindowManager();

// ---------- App Management ----------
function openApp(appName){ if(state.openWindows.has(appName)){ const existingWindow=state.openWindows.get(appName); if(existingWindow.style.display==='none') windowManager.restoreWindow(existingWindow); else existingWindow.style.zIndex=state.zIndex++; return; } let template; switch(appName){ case 'projects': template=document.getElementById('fileExplorerTemplate'); const w1=windowManager.createWindow(template); initFileExplorer(w1); break; case 'about': template=document.getElementById('settingsTemplate'); const w2=windowManager.createWindow(template); initSettings(w2); break; case 'skills': template=document.getElementById('terminalTemplate'); const w3=windowManager.createWindow(template); initTerminal(w3); break; case 'contact': template=document.getElementById('edgeTemplate'); const w4=windowManager.createWindow(template); initEdge(w4); break; case 'resume': template=document.getElementById('notepadTemplate'); const w5=windowManager.createWindow(template); initNotepad(w5); break; case 'gallery': template=document.getElementById('photosTemplate'); const w6=windowManager.createWindow(template); initPhotos(w6); break; case 'admin': template=document.getElementById('adminLoginTemplate'); const w7=windowManager.createWindow(template); initAdmin(w7); break; } }

function updateTaskbar(appName,isOpen){ const list=document.getElementById('taskbarAppsList'); if(!list) return; const appIcons={'projects':'📁','about':'⚙️','skills':'💻','contact':'🌐','resume':'📄','gallery':'🖼️','admin':'🔐'}; const appNames={'projects':'Explorer','about':'Settings','skills':'Terminal','contact':'Edge','resume':'Notepad','gallery':'Photos','admin':'Admin'}; let btn=list.querySelector(`[data-app="${appName}"]`); if(isOpen){ if(!btn){ btn=document.createElement('button'); btn.className='taskbar-app-icon active'; btn.dataset.app=appName; btn.title=appNames[appName]; btn.innerHTML=appIcons[appName]; btn.addEventListener('click', ()=>{ const win=state.openWindows.get(appName); if(win && win.style.display==='none') windowManager.restoreWindow(win); else if(win) windowManager.minimizeWindow(win); }); list.appendChild(btn); } btn.classList.add('active'); } else { if(btn) btn.remove(); } }

// ---------- File Explorer ----------
function initFileExplorer(windowEl){ const grid=windowEl.querySelector('#projectsGrid'); const viewToggle=windowEl.querySelector('#explorerViewToggle'); const sortSelect=windowEl.querySelector('#explorerSort'); const searchInput=windowEl.querySelector('.toolbar-search'); const categoryItems=windowEl.querySelectorAll('.sidebar-item'); let currentCategory='all'; let currentView='grid'; if(grid) renderProjects(grid,state.projects,'all',currentView); if(viewToggle) viewToggle.addEventListener('change',(e)=>{ currentView=e.target.value; if(grid) grid.className=`projects-grid ${currentView}-view`; renderProjects(grid,state.projects,currentCategory,currentView); }); categoryItems.forEach(item=>{ item.addEventListener('click',()=>{ categoryItems.forEach(i=>i.classList.remove('active')); item.classList.add('active'); currentCategory=item.dataset.category; renderProjects(grid,state.projects,currentCategory,currentView); }); }); if(searchInput) searchInput.addEventListener('input',(e)=>{ const v=e.target.value.toLowerCase(); const filtered=state.projects.filter(p=> (p.title||'').toLowerCase().includes(v) || (p.description||'').toLowerCase().includes(v)); renderProjects(grid,filtered,currentCategory,currentView); }); if(sortSelect) sortSelect.addEventListener('change',(e)=>{ const sorted=[...state.projects]; if(e.target.value==='name') sorted.sort((a,b)=> (a.title||'').localeCompare(b.title||'')); else if(e.target.value==='date') sorted.sort((a,b)=> new Date(b.dateAdded)-new Date(a.dateAdded)); else if(e.target.value==='category') sorted.sort((a,b)=> (a.category||'').localeCompare(b.category||'')); renderProjects(grid,sorted,currentCategory,currentView); }); }

function renderProjects(container,projects,category,view){ if(!container) return; container.innerHTML=''; let filtered=projects; if(category!=='all') filtered=projects.filter(p=>p.category===category); filtered.forEach(project=>{ const card=document.createElement('div'); card.className='project-card'; card.innerHTML=`<div class="project-icon">📦</div><div class="project-name">${project.title||''}</div>`; card.addEventListener('click', ()=>showProjectDetail(project)); container.appendChild(card); }); }

function showProjectDetail(project){ alert(`${project.title||''}\n\n${project.description||''}\n\nTech: ${(project.tech||[]).join(', ')}\n\n${project.liveUrl?`Live: ${project.liveUrl}`:''}\n${project.githubUrl?`GitHub: ${project.githubUrl}`:''}`); }

// ---------- Settings ----------
function initSettings(windowEl){ const navItems=windowEl.querySelectorAll('.settings-nav-item'); const contentArea=windowEl.querySelector('#settingsContent'); function showSection(section){ navItems.forEach(item=>item.classList.remove('active')); const activeItem=Array.from(navItems).find(i=>i.dataset.section===section); if(activeItem) activeItem.classList.add('active'); let html=''; switch(section){ case 'general': html=`<h3>${portfolioData.name}</h3><div class="settings-item"><div class="settings-item-label">Title</div><div class="settings-item-value">${portfolioData.title}</div></div><div class="settings-item"><div class="settings-item-label">Bio</div><div class="settings-item-value">${portfolioData.bio}</div></div><div class="settings-item"><div class="settings-item-label">Email</div><div class="settings-item-value">${portfolioData.email}</div></div>`; break; case 'experience': html='<h3>Experience</h3>'; portfolioData.experience.forEach(exp=>{ html+=`<div class="settings-item"><div class="settings-item-label">${exp.title}</div><div class="settings-item-value">${exp.company} (${exp.duration})</div></div>`; }); break; case 'education': html='<h3>Education</h3>'; portfolioData.education.forEach(edu=>{ html+=`<div class="settings-item"><div class="settings-item-label">${edu.degree}</div><div class="settings-item-value">${edu.school} - ${edu.year}</div></div>`; }); break; case 'skills': html='<h3>Skills</h3><div class="settings-item">'; portfolioData.skills.forEach(skill=>{ html+=`<div style="padding:4px 0;color:rgba(255,255,255,0.8);font-size:12px;">✓ ${skill}</div>`; }); html+='</div>'; break; case 'achievements': html=`<h3>Achievements</h3><div class="settings-item"><div class="settings-item-label">Projects Completed</div><div class="settings-item-value">${state.projects.length}+</div></div>`; break; } if(contentArea) contentArea.innerHTML=html; } navItems.forEach(item=>{ item.addEventListener('click', ()=>showSection(item.dataset.section)); }); showSection('general'); }

// ---------- Terminal ----------
function initTerminal(windowEl){ const output=windowEl.querySelector('#terminalOutput'); const input=windowEl.querySelector('#terminalInput'); if(!output||!input) return; output.innerHTML=`<div class="terminal-line">C:\\Users\\Developer> whoami</div><div class="terminal-line">${portfolioData.name}</div><div class="terminal-line"></div><div class="terminal-line" style="color:#0DFFFF;font-size:11px;opacity:0.7;">Type \"help\" for available commands</div><div class="terminal-line"></div>`; input.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ const command=input.value.trim(); state.commandHistory.push(command); state.historyIndex=state.commandHistory.length; executeTerminalCommand(command,output); input.value=''; } else if(e.key==='ArrowUp' && state.historyIndex>0){ state.historyIndex--; input.value=state.commandHistory[state.historyIndex]; } else if(e.key==='ArrowDown' && state.historyIndex<state.commandHistory.length-1){ state.historyIndex++; input.value=state.commandHistory[state.historyIndex]; } }); input.focus(); }

function executeTerminalCommand(command,outputEl){ const line=document.createElement('div'); line.className='terminal-line'; line.innerHTML=`C:\\Users\\Developer> ${command}`; outputEl.appendChild(line); const resultLine=document.createElement('div'); resultLine.className='terminal-line'; switch(command.toLowerCase()){ case 'help': resultLine.innerHTML=`Available commands:\nwhoami - Display user information\nskills - List all skills\nprojects - List projects\ncontact - Show contact information\nclear - Clear terminal`; break; case 'skills': resultLine.innerHTML=portfolioData.skills.join(', '); break; case 'projects': resultLine.innerHTML=state.projects.map(p=>`- ${p.title}`).join('\n'); break; case 'contact': resultLine.innerHTML=`Email: ${portfolioData.email}\nGitHub: ${portfolioData.social.github}\nLinkedIn: ${portfolioData.social.linkedin}`; break; case 'clear': outputEl.innerHTML=''; return; default: resultLine.innerHTML=`Command not found: "${command}". Type "help" for available commands.`; } outputEl.appendChild(resultLine); outputEl.scrollTop=outputEl.scrollHeight; }

// ---------- Edge (Browser) ----------
function initEdge(windowEl){
    const contactForm = windowEl.querySelector('#contactFormElement');
    const tabs = windowEl.querySelectorAll('.browser-tab');
    if(contactForm) contactForm.addEventListener('submit', (e) => handleContactSubmit(e, windowEl));
    tabs.forEach(tab=>{ if(tab.dataset.link) tab.addEventListener('click', ()=>window.open(tab.dataset.link,'_blank')); });
}
function handleContactSubmit(e, windowEl){
    e.preventDefault();
    const form = e.target;
    const nameEl   = form.querySelector('#contactName')   || document.getElementById('contactName');
    const emailEl  = form.querySelector('#contactEmail')  || document.getElementById('contactEmail');
    const msgEl    = form.querySelector('#contactMessage') || document.getElementById('contactMessage');
    const name    = nameEl  ? nameEl.value  : '';
    const email   = emailEl ? emailEl.value : '';
    const message = msgEl   ? msgEl.value   : '';
    // Show success banner inside the form container
    const container = form.closest('.contact-form-container') || form.parentElement;
    const existing = container.querySelector('.contact-success');
    if(existing) existing.remove();
    const banner = document.createElement('div');
    banner.className = 'contact-success';
    banner.style.cssText = 'background:rgba(16,124,16,0.2);border:1px solid rgba(16,124,16,0.5);border-radius:6px;padding:14px 16px;margin-bottom:12px;color:#90EE90;font-size:13px;';
    banner.innerHTML = `✅ <strong>Message received!</strong><br><small>Thanks ${name}, I'll get back to you at ${email} soon.</small>`;
    container.insertBefore(banner, form);
    form.reset();
    addNotification(`Message from ${name} received!`);
    setTimeout(()=>banner.remove(), 6000);
}

// ---------- Photos ----------
function initPhotos(windowEl){ 
    const grid = windowEl.querySelector('#galleryGrid'); 
    if(!grid) return; 
    // FIX Bug 5: replaced dead via.placeholder.com URLs with inline SVG data URIs
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
function initAdmin(windowEl){ const loginForm=windowEl.querySelector('#adminLoginForm'); const loginBtn=windowEl.querySelector('#adminLoginBtn'); const adminPanel=windowEl.querySelector('#adminPanel'); const logoutBtn=windowEl.querySelector('#adminLogout'); const addProjectBtn=windowEl.querySelector('#addProjectBtn'); const projectForm=windowEl.querySelector('#adminProjectForm'); const projectFormElement=windowEl.querySelector('#projectFormElement'); const cancelBtn=windowEl.querySelector('#cancelProjectForm'); if(loginBtn) loginBtn.addEventListener('click',(e)=>{ e.preventDefault(); adminLogin(windowEl); }); if(logoutBtn) logoutBtn.addEventListener('click',()=>{ try{ signOut(window.auth); }catch(e){} if(loginForm) loginForm.classList.remove('hidden'); if(adminPanel) adminPanel.classList.add('hidden'); if(projectForm) projectForm.classList.add('hidden'); }); if(addProjectBtn) addProjectBtn.addEventListener('click',()=>{ if(projectForm) projectForm.classList.remove('hidden'); if(projectFormElement) projectFormElement.reset(); const pid=document.getElementById('projectId'); if(pid) pid.value=''; }); if(cancelBtn) cancelBtn.addEventListener('click',()=>{ if(projectForm) projectForm.classList.add('hidden'); }); if(projectFormElement) projectFormElement.addEventListener('submit',(e)=>{ e.preventDefault(); saveProject(windowEl); }); }

function adminLogin(windowEl){
    // FIX Bug 8: all fields scoped to windowEl, not document
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
    // FIX Bug 8: all form fields scoped to windowEl
    const q = (sel) => { const el = windowEl.querySelector(sel); return el ? el.value : ''; };
    const id = q('#projectId');
    const project = {
        title:       q('#projectTitle'),
        description: q('#projectDescription'),
        category:    q('#projectCategory') || 'web',
        tech:        q('#projectTech').split(',').map(t=>t.trim()).filter(Boolean),
        thumbnail:   q('#projectThumbnail'),
        liveUrl:     q('#projectLiveUrl'),
        githubUrl:   q('#projectGithubUrl'),
        featured:    !!(windowEl.querySelector('#projectFeatured') && windowEl.querySelector('#projectFeatured').checked),
        dateAdded:   new Date().toISOString()
    };
    try{
        if(id) updateDoc(doc(window.db,'projects',id), project);
        else   addDoc(collection(window.db,'projects'), project);
    }catch(e){ console.warn('Firestore write skipped', e); }
    const pf = windowEl.querySelector('#adminProjectForm');
    if(pf) pf.classList.add('hidden');
    loadProjects();
}

window.editProject=function(id){ const project=state.projects.find(p=>p.id===id); if(project){ const pid=document.getElementById('projectId'); if(pid) pid.value=id; const title=document.getElementById('projectTitle'); if(title) title.value=project.title||''; const desc=document.getElementById('projectDescription'); if(desc) desc.value=project.description||''; const cat=document.getElementById('projectCategory'); if(cat) cat.value=project.category||''; const tech=document.getElementById('projectTech'); if(tech) tech.value=(project.tech||[]).join(', '); const thumb=document.getElementById('projectThumbnail'); if(thumb) thumb.value=project.thumbnail||''; const live=document.getElementById('projectLiveUrl'); if(live) live.value=project.liveUrl||''; const gh=document.getElementById('projectGithubUrl'); if(gh) gh.value=project.githubUrl||''; const feat=document.getElementById('projectFeatured'); if(feat) feat.checked=project.featured||false; const form=document.querySelector('#adminProjectForm'); if(form) form.classList.remove('hidden'); } };

window.deleteProject=function(id){ if(confirm('Are you sure?')){ try{ deleteDoc(doc(window.db,'projects',id)); }catch(e){ console.warn('Delete skipped',e); } loadProjects(); } };

// ---------- Firebase integration ----------
function loadProjects(){ try{ const q=query(collection(window.db,'projects'), orderBy('dateAdded','desc')); getDocs(q).then(snapshot=>{ state.projects=[]; snapshot.forEach(d=>state.projects.push({ id:d.id, ...d.data() })); if(state.openWindows.has('projects')){ const win=state.openWindows.get('projects'); const grid=win.querySelector('#projectsGrid'); renderProjects(grid,state.projects,'all','grid'); } loadRecommendedProjects(); }).catch(error=>{ console.error('Error loading projects:',error); addNotification('Error loading projects'); }); }catch(err){ console.warn('loadProjects skipped - db not ready',err); } }

function checkAuthStatus(){ try{ onAuthStateChanged(window.auth,(user)=>{ state.currentUser=user; if(user){ const adminIcon=document.getElementById('adminIcon'); if(adminIcon) adminIcon.classList.remove('admin-hidden'); } }); }catch(e){ console.warn('Auth not initialized yet'); } }

// ---------- Utilities ----------
function changeWallpaper(){ state.wallpaperIndex=(state.wallpaperIndex+1)%wallpapers.length; const wp=document.querySelector('.desktop-wallpaper'); if(wp) wp.style.background=wallpapers[state.wallpaperIndex]; }
function shutdown(){ if(confirm('Are you sure you want to shut down?')) location.reload(); }
function handleFormSubmit(e){ if(e.target && e.target.id==='contactFormElement') handleContactSubmit(e); }

// ---------- Initialize ----------
initBoot();

// End of file
