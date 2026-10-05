// Role-aware application shell. Server-side APIs still enforce permissions.
const ROLE_HOME = { admin:'dashboard.html', faculty:'dashboard.html', student:'dashboard.html' };

function navGroupsForRole(role) {
  const common = [{key:'dashboard',href:'dashboard.html',label:'Dashboard',icon:'⌂'}];
  if (role === 'admin') return [
    {label:'Administration',items:[...common,{key:'users',href:'users.html',label:'User & Access',icon:'👥'},{key:'admissions',href:'admissions.html',label:'Admissions',icon:'🎓'},{key:'notices',href:'notices.html',label:'Notices',icon:'📢'},{key:'events',href:'events.html',label:'Events',icon:'📅'}]},
    {label:'Academic Management',items:[{key:'departments',href:'departments.html',label:'Departments',icon:'🏛'},{key:'programs',href:'programs.html',label:'Programs',icon:'▦'},{key:'courses',href:'courses.html',label:'Course Catalog',icon:'📚'},{key:'semesters',href:'semesters.html',label:'Semesters',icon:'◷'},{key:'sections',href:'sections.html',label:'Sections',icon:'▤'},{key:'timetable',href:'timetable.html',label:'Timetable',icon:'🗓'},{key:'enrollments',href:'enrollments.html',label:'Registration',icon:'✓'}]},
    {label:'People & Student Life',items:[{key:'faculty',href:'faculty.html',label:'Faculty & HR',icon:'👨‍🏫'},{key:'students',href:'students.html',label:'Students',icon:'🎓'},{key:'attendance',href:'attendance.html',label:'Attendance',icon:'◉'},{key:'exams',href:'exams.html',label:'Exams & Grades',icon:'A+'},{key:'requests',href:'requests.html',label:'Student Requests',icon:'✉'}]},
    {label:'Finance & Services',items:[{key:'fee-structures',href:'fee-structures.html',label:'Fee Structure',icon:'৳'},{key:'invoices',href:'invoices.html',label:'Accounting & Payments',icon:'▣'},{key:'library',href:'library.html',label:'Library',icon:'📖'},{key:'hostel',href:'hostel.html',label:'Hostel',icon:'🏠'},{key:'transport',href:'transport.html',label:'Transport',icon:'🚌'}]},
    {label:'Governance',items:[{key:'calendar',href:'calendar.html',label:'Academic Calendar',icon:'◫'},{key:'audit',href:'audit.html',label:'Audit & Activity',icon:'⌁'}]}
  ];
  if (role === 'faculty') return [
    {items:common},
    {label:'Teaching',items:[{key:'my-sections',href:'my-sections.html',label:'My Classes',icon:'▤'},{key:'timetable',href:'timetable.html',label:'Teaching Schedule',icon:'🗓'},{key:'attendance',href:'attendance.html',label:'Attendance',icon:'◉'},{key:'exams',href:'exams.html',label:'Assessments & Grades',icon:'A+'},{key:'materials',href:'materials.html',label:'Course Materials',icon:'📎'}]},
    {label:'Communication',items:[{key:'notices',href:'notices.html',label:'University Notices',icon:'📢'},{key:'events',href:'events.html',label:'Events',icon:'📅'}]},
    {label:'Account',items:[{key:'profile',href:'profile.html',label:'My Profile',icon:'●'}]}
  ];
  return [
    {items:common},
    {label:'My Academic Life',items:[{key:'registration',href:'registration.html',label:'Course Registration',icon:'✓'},{key:'timetable',href:'timetable.html',label:'My Timetable',icon:'🗓'},{key:'attendance',href:'student-attendance.html',label:'My Attendance',icon:'◉'},{key:'results',href:'results.html',label:'Results & Transcript',icon:'A+'}]},
    {label:'Campus Services',items:[{key:'fees',href:'fees.html',label:'Fees & Payments',icon:'৳'},{key:'library',href:'library.html',label:'Library',icon:'📖'},{key:'materials',href:'materials.html',label:'Course Materials',icon:'📎'},{key:'requests',href:'requests.html',label:'Service Requests',icon:'✉'},{key:'hostel',href:'hostel.html',label:'Hostel',icon:'🏠'},{key:'transport',href:'transport.html',label:'Transport',icon:'🚌'}]},
    {label:'University',items:[{key:'notices',href:'notices.html',label:'Notices',icon:'📢'},{key:'events',href:'events.html',label:'Events',icon:'📅'},{key:'calendar',href:'calendar.html',label:'Academic Calendar',icon:'◫'}]},
    {label:'Account',items:[{key:'profile',href:'profile.html',label:'My Profile',icon:'●'}]}
  ];
}

function renderShell({active,title,subtitle=''}) {
  const token=localStorage.getItem('token');
  if(!token){window.location.href='login.html';return false;}
  const user=JSON.parse(localStorage.getItem('user')||'{}');
  const role=user.role||'student';
  const groups=navGroupsForRole(role);
  const groupsHtml=groups.map(g=>`${g.label?`<div class="sidebar-group">${g.label}</div>`:''}<div class="sidebar-nav">${g.items.map(i=>`<a href="${i.href}" class="${i.key===active?'active':''}"><span class="nav-icon">${i.icon||'•'}</span><span>${i.label}</span></a>`).join('')}</div>`).join('');
  const bodyContent=document.body.innerHTML;
  document.body.innerHTML=`
    <div class="app-shell">
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
      <aside class="sidebar" id="sidebar">
        <div class="brand"><div class="brand-mark">U</div><div><strong>UniversityOS</strong><span>Management Suite</span></div></div>
        <div class="role-pill">${role.toUpperCase()} PORTAL</div>
        <nav>${groupsHtml}</nav>
        <div class="sidebar-user"><div class="avatar">${(user.name||'U').charAt(0).toUpperCase()}</div><div><b>${user.name||'User'}</b><small>${user.email||''}</small></div></div>
      </aside>
      <main class="main-area">
        <header class="topbar">
          <button class="icon-button mobile-menu" id="sidebarToggle">☰</button>
          <div class="topbar-title"><h1>${title}</h1><p>${subtitle}</p></div>
          <div class="topbar-actions"><span class="status-dot"></span><span class="role-label">${role}</span><button class="profile-button" id="profileMenu">${(user.name||'U').charAt(0).toUpperCase()}</button><button class="icon-button" id="logoutBtn" title="Log out">↪</button></div>
        </header>
        <section class="page-content" id="shellContent">${bodyContent}</section>
      </main>
    </div>`;
  const close=()=>document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarToggle').onclick=()=>document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').onclick=close;
  document.getElementById('logoutBtn').onclick=()=>{localStorage.removeItem('token');localStorage.removeItem('user');location.href='login.html';};
  document.getElementById('profileMenu').onclick=()=>location.href='profile.html';
  return true;
}
