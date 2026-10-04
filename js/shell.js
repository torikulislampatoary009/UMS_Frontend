// Reusable sidebar + topbar shell for every authenticated page.
// A page adopts it by calling renderShell({ active, title, subtitle })
// once on load; the function injects the sidebar/topbar markup and
// moves whatever was already in <body> into the shell's .content area.
//
// The sidebar's contents depend on the logged-in user's role: admins
// see the full academic-records CRUD menu, faculty see only their own
// teaching tools, and students see just their personal dashboard. This
// is what makes the app behave like three different portals sharing one
// shell, rather than exposing the same admin screens to everyone.

function navGroupsForRole(role) {
  const dashboard = { items: [{ key: 'dashboard', href: 'dashboard.html', label: 'Dashboard' }] };

  if (role === 'admin') {
    return [
      dashboard,
      {
        label: 'Academic Structure',
        items: [
          { key: 'departments', href: 'departments.html', label: 'Departments' },
          { key: 'programs', href: 'programs.html', label: 'Programs' },
          { key: 'courses', href: 'courses.html', label: 'Courses' },
          { key: 'semesters', href: 'semesters.html', label: 'Semesters' }
        ]
      },
      {
        label: 'People',
        items: [
          { key: 'faculty', href: 'faculty.html', label: 'Faculty' },
          { key: 'students', href: 'students.html', label: 'Students' }
        ]
      },
      {
        label: 'Operations',
        items: [
          { key: 'sections', href: 'sections.html', label: 'Course Sections' },
          { key: 'enrollments', href: 'enrollments.html', label: 'Enrollments' },
          { key: 'attendance', href: 'attendance.html', label: 'Attendance' },
          { key: 'exams', href: 'exams.html', label: 'Exams & Grades' }
        ]
      },
      {
        label: 'Accounts',
        items: [
          { key: 'fee-structures', href: 'fee-structures.html', label: 'Fee Structure' },
          { key: 'invoices', href: 'invoices.html', label: 'Invoices & Payments' }
        ]
      }
    ];
  }

  if (role === 'faculty') {
    return [
      dashboard,
      {
        label: 'Teaching',
        items: [
          { key: 'my-sections', href: 'my-sections.html', label: 'My Sections' },
          { key: 'attendance', href: 'attendance.html', label: 'Attendance' },
          { key: 'exams', href: 'exams.html', label: 'Exams & Grades' }
        ]
      }
    ];
  }

  // Students get only the dashboard — it IS their portal (enrollments,
  // attendance %, grades, dues all live there), not a menu of CRUD pages.
  return [dashboard];
}

function renderShell({ active, title, subtitle }) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  const navGroups = navGroupsForRole(user.role);

  const groupsHtml = navGroups.map((group) => {
    const itemsHtml = group.items
      .map((item) => `<a href="${item.href}" class="${item.key === active ? 'active' : ''}">${item.label}</a>`)
      .join('');
    const labelHtml = group.label ? `<div class="sidebar-group">${group.label}</div>` : '';
    return `${labelHtml}<div class="sidebar-nav">${itemsHtml}</div>`;
  }).join('');

  const adminLink = isAdmin
    ? `<div class="sidebar-group">Admin</div><div class="sidebar-nav"><a href="register.html" class="${active === 'register' ? 'active' : ''}">Create User</a></div>`
    : '';

  const existingBody = document.body.innerHTML;

  document.body.innerHTML = `
    <div class="shell">
      <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle menu">☰</button>
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">University MS<span>Registrar's Office</span></div>
        ${groupsHtml}
        ${adminLink}
        <div class="sidebar-footer">
          <div class="sidebar-user">${user.name || 'Unknown user'}</div>
          <div class="sidebar-role">${user.role || ''}</div>
          <button id="shellLogoutBtn">Log Out</button>
        </div>
      </aside>
      <div class="main">
        <div class="topbar">
          <div>
            <h1>${title}</h1>
            ${subtitle ? `<div class="topbar-sub">${subtitle}</div>` : ''}
          </div>
        </div>
        <div class="content" id="shellContent"></div>
      </div>
    </div>
  `;

  document.getElementById('shellContent').innerHTML = existingBody;

  document.getElementById('shellLogoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  });

  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
}
