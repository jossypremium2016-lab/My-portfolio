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
    "url('https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80') center/cover no-repeat",
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
];

const portfolioData = {
    name: 'joseph Lamide Ogungbe (ACA)',
    title: 'Associate chartered Accountant and Full Stack Developer',
    bio: 'Passionate about building beautiful and functional web applications.',
    email: 'jossypremium.2016@gmail.com',
    social: {
        github: 'https://github.com/jossyremium2016-lab',
        linkedin: 'https://linkedin/Joseph (lamide) Ogungbe',
        twitter: 'https://twitter.com/Joseph Ogungbe'
    },
    experience: [
        { title: 'Intern Developer', company: 'Tech Corp', duration: '2026 - Present' },
        { title: 'Accountant/Developer', company: 'LAUTECH TEACHING HOSPITAL,OGBOOMOSO,OYO STATE', duration: '2014 - Present' }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Firebase', 'CSS3', 'Web Design', 'UI/UX', 'Git'],
    education: [
        { school: 'University', degree: 'B.sc Accounting', year: '2018',professional: 'Associate Accountant',year: '2025' }
    ],
    resume: `JOSEPH DEVELOPER
Full Stack Developer

EXPERIENCE
Intern Developer - Tech Corp (2026 - Present)
- Built responsive web applications
- Led technical team meetings
- Improved performance by 40%

Developer - StartUp Inc (2019 - 2021)
- Developed full-stack applications
- Worked with Firebase and React
- Collaborated with design team

SKILLS
Frontend: React, Vue, Angular, CSS3
Backend: Node.js, Firebase, PostgreSQL
Tools: Git, Docker, Webpack

EDUCATION
B.sc Accounting - University (2018)`
};

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
        icon.addEventListener('dblclick', (e) => {
            const app = e.currentTarget.dataset.app;
            openApp(app);
        });
    });

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
    state.projects.slice(-3).reverse().forEach(project => {
        const item = document.createElement('div');
        item.className = 'start-menu-project';
        item.innerHTML = `📦 ${project.title || ''}`;
        item.addEventListener('click', () => { openApp('projects'); toggleStartMenu(); });
        recommended.appendChild(item);
    });
}

// Context Menu
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

// Notifications
function toggleNotifications() { const panel = document.getElementById('notificationsPanel'); if (panel) panel.classList.toggle('hidden'); }
function addNotification(message) { const list = document.getElementById('notificationsList'); if (!list) return; const item = document.createElement('div'); item.className='notification-item'; item.textContent=message; list.appendChild(item); setTimeout(()=>item.remove(),5000); }

// Window Manager
class WindowManager{
    constructor(){ this.draggingWindow=null; this.dragOffset={x:0,y:0}; this.onDrag=this.onDrag.bind(this); this.stopDrag=this.stopDrag.bind(this); }
    createWindow(template){ const clone=document.importNode(template.content,true); const windowEl=clone.querySelector('.win11-window'); const container=document.getElementById('windowsContainer'); if(container && windowEl) container.appendChild(windowEl); if(windowEl) windowEl.style.zIndex=state.zIndex++; this.setupWindowControls(windowEl); const appName=windowEl?windowEl.dataset.window:null; if(appName) state.openWindows.set(appName,windowEl); if(appName) updateTaskbar(appName,true); return windowEl; }
    setupWindowControls(windowEl){ if(!windowEl) return; const header=windowEl.querySelector('.window-header'); const minimizeBtn=windowEl.querySelector('.window-minimize'); const maximizeBtn=windowEl.querySelector('.window-maximize'); const closeBtn=windowEl.querySelector('.window-close'); if(header) header.addEventListener('mousedown',(e)=>{ if(e.target.closest('.window-controls')) return; this.startDrag(e,windowEl); }); if(header) header.addEventListener('dblclick', ()=>this.toggleMaximize(windowEl)); if(minimizeBtn) minimizeBtn.addEventListener('click', ()=>this.minimizeWindow(windowEl)); if(maximizeBtn) maximizeBtn.addEventListener('click', ()=>this.toggleMaximize(windowEl)); if(closeBtn) closeBtn.addEventListener('click', ()=>this.closeWindow(windowEl)); windowEl.addEventListener('mousedown', ()=>{ windowEl.style.zIndex=state.zIndex++; }); }
    startDrag(e,windowEl){ this.draggingWindow=windowEl; const rect=windowEl.getBoundingClientRect(); this.dragOffset.x=e.clientX-rect.left; this.dragOffset.y=e.clientY-rect.top; document.addEventListener('mousemove', this.onDrag); document.addEventListener('mouseup', this.stopDrag); }
    onDrag(e){ if(!this.draggingWindow) return; const x=e.clientX-this.dragOffset.x; const y=e.clientY-this.dragOffset.y; this.draggingWindow.style.left=x+'px'; this.draggingWindow.style.top=y+'px'; this.draggingWindow.style.width='auto'; this.draggingWindow.style.height='auto'; }
    stopDrag(){ this.draggingWindow=null; document.removeEventListener('mousemove', this.onDrag); document.removeEventListener('mouseup', this.stopDrag); }
    toggleMaximize(windowEl){ if(!windowEl) return; if(windowEl.style.width==='calc(100% - 20px)'){ windowEl.style.width='800px'; windowEl.style.height='600px'; windowEl.style.left='50px'; windowEl.style.top='50px'; } else { windowEl.style.width='calc(100% - 20px)'; windowEl.style.height='calc(100% - 78px)'; windowEl.style.left='10px'; windowEl.style.top='10px'; } }
    minimizeWindow(windowEl){ if(!windowEl) return; windowEl.classList.add('minimizing'); setTimeout(()=>{ windowEl.style.display='none'; },300); }
    restoreWindow(windowEl){ if(!windowEl) return; windowEl.classList.remove('minimizing'); windowEl.style.display='flex'; windowEl.style.zIndex=state.zIndex++; }
    closeWindow(windowEl){ if(!windowEl) return; const appName=windowEl.dataset.window; windowEl.remove(); if(appName) state.openWindows.delete(appName); if(appName) updateTaskbar(appName,false); }
}

const windowManager=new WindowManager();

// App management and other helpers
function openApp(appName){ if(state.openWindows.has(appName)){ const existingWindow=state.openWindows.get(appName); if(existingWindow.style.display==='none') windowManager.restoreWindow(existingWindow); else existingWindow.style.zIndex=state.zIndex++; return; } let template; switch(appName){ case 'projects': template=document.getElementById('fileExplorerTemplate'); const w1=windowManager.createWindow(template); initFileExplorer(w1); break; case 'about': template=document.getElementById('settingsTemplate'); const w2=windowManager.createWindow(template); initSettings(w2); break; case 'skills': template=document.getElementById('terminalTemplate'); const w3=windowManager.createWindow(template); initTerminal(w3); break; case 'contact': template=document.getElementById('edgeTemplate'); const w4=windowManager.createWindow(template); initEdge(w4); break; case 'resume': template=document.getElementById('notepadTemplate'); const w5=windowManager.createWindow(template); initNotepad(w5); break; case 'gallery': template=document.getElementById('photosTemplate'); const w6=windowManager.createWindow(template); initPhotos(w6); break; case 'admin': template=document.getElementById('adminLoginTemplate'); const w7=windowManager.createWindow(template); initAdmin(w7); break; } }

function updateTaskbar(appName,isOpen){ const list=document.getElementById('taskbarAppsList'); if(!list) return; const appIcons={'projects':'📁','about':'⚙️','skills':'💻','contact':'🌐','resume':'📄','gallery':'🖼️','admin':'🔐'}; const appNames={'projects':'Explorer','about':'Settings','skills':'Terminal','contact':'Edge','resume':'Notepad','gallery':'Photos','admin':'Admin'}; let btn=list.querySelector(`[data-app="${appName}"]`); if(isOpen){ if(!btn){ btn=document.createElement('button'); btn.className='taskbar-app-icon active'; btn.dataset.app=appName; btn.title=appNames[appName]; btn.innerHTML=appIcons[appName]; btn.addEventListener('click', ()=>{ const win=state.openWindows.get(appName); if(win && win.style.display==='none') windowManager.restoreWindow(win); else if(win) windowManager.minimizeWindow(win); }); list.appendChild(btn); } btn.classList.add('active'); } else { if(btn) btn.remove(); } }

// File explorer, rendering, settings, terminal, edge, photos, notepad, admin and firebase functions
function initFileExplorer(windowEl){ const grid=windowEl.querySelector('#projectsGrid'); const viewToggle=windowEl.querySelector('#explorerViewToggle'); const sortSelect=windowEl.querySelector('#explorerSort'); const searchInput=windowEl.querySelector('.toolbar-search'); const categoryItems=windowEl.querySelectorAll('.sidebar-item'); let currentCategory='all'; let currentView='grid'; if(grid) renderProjects(grid,state.projects,'all',currentView); if(viewToggle) viewToggle.addEventListener('change',(e)=>{ currentView=e.target.value; if(grid) grid.className=`projects-grid ${currentView}-view`; renderProjects(grid,state.projects,currentCategory,currentView); }); categoryItems.forEach(item=>{ item.addEventListener('click',()=>{ categoryItems.forEach(i=>i.classList.remove('active')); item.classList.add('active'); currentCategory=item.dataset.category; renderProjects(grid,state.projects,currentCategory,currentView); }); }); if(searchInput) searchInput.addEventListener('input',(e)=>{ const v=e.target.value.toLowerCase(); const filtered=state.projects.filter(p=> (p.title||'').toLowerCase().includes(v) || (p.description||'').toLowerCase().includes(v)); renderProjects(grid,filtered,currentCategory,currentView); }); if(sortSelect) sortSelect.addEventListener('change',(e)=>{ const sorted=[...state.projects]; if(e.target.value==='name') sorted.sort((a,b)=> (a.title||'').localeCompare(b.title||'')); else if(e.target.value==='date') sorted.sort((a,b)=> new Date(b.dateAdded)-new Date(a.dateAdded)); else if(e.target.value==='category') sorted.sort((a,b)=> (a.category||'').localeCompare(b.category||'')); renderProjects(grid,sorted,currentCategory,currentView); }); }

function renderProjects(container,projects,category,view){ if(!container) return; container.innerHTML=''; let filtered=projects; if(category!=='all') filtered=projects.filter(p=>p.category===category); filtered.forEach(project=>{ const card=document.createElement('div'); card.className='project-card'; card.innerHTML=`<div class="project-icon">📦</div><div class="project-name">${project.title||''}</div>`; card.addEventListener('click', ()=>showProjectDetail(project)); container.appendChild(card); }); }

function showProjectDetail(project){ alert(`${project.title||''}

${project.description||''}

Tech: ${(project.tech||[]).join(', ')}

${project.liveUrl?`Live: ${project.liveUrl}`:''}
${project.githubUrl?`GitHub: ${project.githubUrl}`:''}`); }

function initSettings(windowEl){ const navItems=windowEl.querySelectorAll('.settings-nav-item'); const contentArea=windowEl.querySelector('#settingsContent'); function showSection(section){ navItems.forEach(item=>item.classList.remove('active')); const activeItem=Array.from(navItems).find(i=>i.dataset.section===section); if(activeItem) activeItem.classList.add('active'); let html=''; switch(section){ case 'general': html=`<h3>${portfolioData.name}</h3><div class="settings-item"><div class="settings-item-label">Title</div><div class="settings-item-value">${portfolioData.title}</div></div><div class="settings-item"><div class="settings-item-label">Bio</div><div class="settings-item-value">${portfolioData.bio}</div></div><div class="settings-item"><div class="settings-item-label">Email</div><div class="settings-item-value">${portfolioData.email}</div></div>`; break; case 'experience': html='<h3>Experience</h3>'; portfolioData.experience.forEach(exp=>{ html+=`<div class="settings-item"><div class="settings-item-label">${exp.title}</div><div class="settings-item-value">${exp.company} (${exp.duration})</div></div>`; }); break; case 'education': html='<h3>Education</h3>'; portfolioData.education.forEach(edu=>{ html+=`<div class="settings-item"><div class="settings-item-label">${edu.degree}</div><div class="settings-item-value">${edu.school} - ${edu.year}</div></div>`; }); break; case 'skills': html='<h3>Skills</h3><div class="settings-item">'; portfolioData.skills.forEach(skill=>{ html+=`<div style="padding:4px 0;color:rgba(255,255,255,0.8);font-size:12px;">✓ ${skill}</div>`; }); html+='</div>'; break; case 'achievements': html=`<h3>Achievements</h3><div class="settings-item"><div class="settings-item-label">Projects Completed</div><div class="settings-item-value">${state.projects.length}+</div></div>`; break; } if(contentArea) contentArea.innerHTML=html; } navItems.forEach(item=>{ item.addEventListener('click', ()=>showSection(item.dataset.section)); }); showSection('general'); }

function initTerminal(windowEl){ const output=windowEl.querySelector('#terminalOutput'); const input=windowEl.querySelector('#terminalInput'); if(!output||!input) return; output.innerHTML=`<div class="terminal-line">C:\\Users\\Developer> whoami</div><div class="terminal-line">${portfolioData.name}</div><div class="terminal-line"></div><div class="terminal-line" style="color:#0DFFFF;font-size:11px;opacity:0.7;">Type \"help\" for available commands</div><div class="terminal-line"></div>`; input.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ const command=input.value.trim(); state.commandHistory.push(command); state.historyIndex=state.commandHistory.length; executeTerminalCommand(command,output); input.value=''; } else if(e.key==='ArrowUp' && state.historyIndex>0){ state.historyIndex--; input.value=state.commandHistory[state.historyIndex]; } else if(e.key==='ArrowDown' && state.historyIndex<state.commandHistory.length-1){ state.historyIndex++; input.value=state.commandHistory[state.historyIndex]; } }); input.focus(); }

function executeTerminalCommand(command,outputEl){ const line=document.createElement('div'); line.className='terminal-line'; line.innerHTML=`C:\\Users\\Developer> ${command}`; outputEl.appendChild(line); const resultLine=document.createElement('div'); resultLine.className='terminal-line'; switch(command.toLowerCase()){ case 'help': resultLine.innerHTML=`Available commands:
whoami - Display user information
skills - List all skills
projects - List projects
contact - Show contact information
clear - Clear terminal`; break; case 'skills': resultLine.innerHTML=portfolioData.skills.join(', '); break; case 'projects': resultLine.innerHTML=state.projects.map(p=>`- ${p.title}`).join('\n'); break; case 'contact': resultLine.innerHTML=`Email: ${portfolioData.email}
GitHub: ${portfolioData.social.github}
LinkedIn: ${portfolioData.social.linkedin}`; break; case 'clear': outputEl.innerHTML=''; return; default: resultLine.innerHTML=`Command not found: "${command}". Type "help" for available commands.`; } outputEl.appendChild(resultLine); outputEl.scrollTop=outputEl.scrollHeight; }

function initEdge(windowEl){ const contactForm=windowEl.querySelector('#contactFormElement'); const tabs=windowEl.querySelectorAll('.browser-tab'); if(contactForm) contactForm.addEventListener('submit', handleContactSubmit); tabs.forEach(tab=>{ if(tab.dataset.link) tab.addEventListener('click', ()=>window.open(tab.dataset.link,'_blank')); }); }

function handleContactSubmit(e){ e.preventDefault(); const name=document.getElementById('contactName')?document.getElementById('contactName').value:''; const email=document.getElementById('contactEmail')?document.getElementById('contactEmail').value:''; const message=document.getElementById('contactMessage')?document.getElementById('contactMessage').value:''; console.log('Contact submission:',{name,email,message}); addNotification('Message sent successfully!'); if(e.target && e.target.reset) e.target.reset(); }

function initPhotos(windowEl){ const grid=windowEl.querySelector('#galleryGrid'); if(!grid) return; const galleryItems=[ {src:'https://via.placeholder.com/200?text=Project+1',alt:'Project 1'}, {src:'https://via.placeholder.com/200?text=Project+2',alt:'Project 2'}, {src:'https://via.placeholder.com/200?text=Screenshot+1',alt:'Screenshot 1'}, {src:'https://via.placeholder.com/200?text=Certificate',alt:'Certificate'} ]; galleryItems.forEach((item,i)=>{ const gi=document.createElement('div'); gi.className='gallery-item'; gi.innerHTML=`<img src="${item.src}" alt="${item.alt}">`; gi.addEventListener('click',()=>openLightbox(i,galleryItems)); grid.appendChild(gi); }); }

function openLightbox(index,items){ const lightbox=document.getElementById('lightbox'); const image=document.getElementById('lightboxImage'); if(!lightbox||!image) return; let currentIndex=index; function updateImage(){ image.src=items[currentIndex].src; } updateImage(); lightbox.classList.remove('hidden'); const close=document.querySelector('.lightbox-close'); const prev=document.querySelector('.lightbox-prev'); const next=document.querySelector('.lightbox-next'); if(close) close.onclick=()=>lightbox.classList.add('hidden'); if(prev) prev.onclick=()=>{ currentIndex=(currentIndex-1+items.length)%items.length; updateImage(); }; if(next) next.onclick=()=>{ currentIndex=(currentIndex+1)%items.length; updateImage(); }; }

function initNotepad(windowEl){ const content=windowEl.querySelector('#resumeContent'); const printBtn=windowEl.querySelector('#printResume'); if(content) content.textContent=portfolioData.resume; if(printBtn) printBtn.addEventListener('click',()=>window.print()); }

function initAdmin(windowEl){ const loginForm=windowEl.querySelector('#adminLoginForm'); const loginBtn=windowEl.querySelector('#adminLoginBtn'); const adminPanel=windowEl.querySelector('#adminPanel'); const logoutBtn=windowEl.querySelector('#adminLogout'); const addProjectBtn=windowEl.querySelector('#addProjectBtn'); const projectForm=windowEl.querySelector('#adminProjectForm'); const projectFormElement=windowEl.querySelector('#projectFormElement'); const cancelBtn=windowEl.querySelector('#cancelProjectForm'); if(loginBtn) loginBtn.addEventListener('click',(e)=>{ e.preventDefault(); adminLogin(windowEl); }); if(logoutBtn) logoutBtn.addEventListener('click',()=>{ try{ signOut(window.auth); }catch(e){} if(loginForm) loginForm.classList.remove('hidden'); if(adminPanel) adminPanel.classList.add('hidden'); if(projectForm) projectForm.classList.add('hidden'); }); if(addProjectBtn) addProjectBtn.addEventListener('click',()=>{ if(projectForm) projectForm.classList.remove('hidden'); if(projectFormElement) projectFormElement.reset(); const pid=document.getElementById('projectId'); if(pid) pid.value=''; }); if(cancelBtn) cancelBtn.addEventListener('click',()=>{ if(projectForm) projectForm.classList.add('hidden'); }); if(projectFormElement) projectFormElement.addEventListener('submit',(e)=>{ e.preventDefault(); saveProject(windowEl); }); }

function adminLogin(windowEl){ const email=document.getElementById('adminEmail')?document.getElementById('adminEmail').value:''; const password=document.getElementById('adminPassword')?document.getElementById('adminPassword').value:''; const errorDiv=document.getElementById('adminError'); try{ signInWithEmailAndPassword(window.auth,email,password).then(()=>{ if(windowEl.querySelector('#adminLoginForm')) windowEl.querySelector('#adminLoginForm').classList.add('hidden'); if(windowEl.querySelector('#adminPanel')) windowEl.querySelector('#adminPanel').classList.remove('hidden'); loadAdminProjects(windowEl); }).catch(error=>{ if(errorDiv){ errorDiv.textContent=error.message; errorDiv.classList.remove('hidden'); } }); }catch(e){ if(errorDiv) errorDiv.textContent='Auth not available'; }

function loadAdminProjects(windowEl){ const list=windowEl.querySelector('#projectsList'); if(!list) return; list.innerHTML=''; state.projects.forEach(project=>{ const item=document.createElement('div'); item.className='project-item'; item.innerHTML=`<div class="project-item-name">${project.title||''}</div><div class="project-item-actions"><button class="btn btn-sm btn-primary" onclick="editProject('${project.id}')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteProject('${project.id}')">Delete</button></div>`; list.appendChild(item); }); }

function saveProject(windowEl){ const id=document.getElementById('projectId')?document.getElementById('projectId').value:''; const project={ title: (document.getElementById('projectTitle')?document.getElementById('projectTitle').value:''), description: (document.getElementById('projectDescription')?document.getElementById('projectDescription').value:''), category: (document.getElementById('projectCategory')?document.getElementById('projectCategory').value:'web'), tech: ((document.getElementById('projectTech')?document.getElementById('projectTech').value:'')).split(',').map(t=>t.trim()).filter(Boolean), thumbnail: (document.getElementById('projectThumbnail')?document.getElementById('projectThumbnail').value:''), liveUrl: (document.getElementById('projectLiveUrl')?document.getElementById('projectLiveUrl').value:''), githubUrl: (document.getElementById('projectGithubUrl')?document.getElementById('projectGithubUrl').value:''), featured: (document.getElementById('projectFeatured')?document.getElementById('projectFeatured').checked:false), dateAdded: new Date().toISOString() }; try{ if(id) updateDoc(doc(window.db,'projects',id),project); else addDoc(collection(window.db,'projects'),project); }catch(e){ console.warn('Firestore write skipped',e); } if(windowEl.querySelector('#adminProjectForm')) windowEl.querySelector('#adminProjectForm').classList.add('hidden'); loadProjects(); }

window.editProject=function(id){ const project=state.projects.find(p=>p.id===id); if(project){ const pid=document.getElementById('projectId'); if(pid) pid.value=id; const title=document.getElementById('projectTitle'); if(title) title.value=project.title||''; const desc=document.getElementById('projectDescription'); if(desc) desc.value=project.description||''; const cat=document.getElementById('projectCategory'); if(cat) cat.value=project.category||''; const tech=document.getElementById('projectTech'); if(tech) tech.value=(project.tech||[]).join(', '); const thumb=document.getElementById('projectThumbnail'); if(thumb) thumb.value=project.thumbnail||''; const live=document.getElementById('projectLiveUrl'); if(live) live.value=project.liveUrl||''; const gh=document.getElementById('projectGithubUrl'); if(gh) gh.value=project.githubUrl||''; const feat=document.getElementById('projectFeatured'); if(feat) feat.checked=project.featured||false; const form=document.querySelector('#adminProjectForm'); if(form) form.classList.remove('hidden'); } };

window.deleteProject=function(id){ if(confirm('Are you sure?')){ try{ deleteDoc(doc(window.db,'projects',id)); }catch(e){ console.warn('Delete skipped',e); } loadProjects(); } };

function loadProjects(){ try{ const q=query(collection(window.db,'projects'), orderBy('dateAdded','desc')); getDocs(q).then(snapshot=>{ state.projects=[]; snapshot.forEach(d=>state.projects.push({ id:d.id, ...d.data() })); if(state.openWindows.has('projects')){ const win=state.openWindows.get('projects'); const grid=win.querySelector('#projectsGrid'); renderProjects(grid,state.projects,'all','grid'); } loadRecommendedProjects(); }).catch(error=>{ console.error('Error loading projects:',error); addNotification('Error loading projects'); }); }catch(err){ console.warn('loadProjects skipped - db not ready',err); } }

function checkAuthStatus(){ try{ onAuthStateChanged(window.auth,(user)=>{ state.currentUser=user; if(user){ const adminIcon=document.getElementById('adminIcon'); if(adminIcon) adminIcon.classList.remove('admin-hidden'); } }); }catch(e){ console.warn('Auth not initialized yet'); } }}

function changeWallpaper(){ state.wallpaperIndex=(state.wallpaperIndex+1)%wallpapers.length; const wp=document.querySelector('.desktop-wallpaper'); if(wp) wp.style.background=wallpapers[state.wallpaperIndex]; }
function shutdown(){ if(confirm('Are you sure you want to shut down?')) location.reload(); }
function handleFormSubmit(e){ if(e.target && e.target.id==='contactFormElement') handleContactSubmit(e); }

initBoot();

// End of file
