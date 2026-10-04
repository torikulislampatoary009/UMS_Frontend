// renderShell() rebuilds document.body via innerHTML, so it must run
// before any getElementById calls below.
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

renderShell({
  active: 'dashboard',
  title: 'Dashboard',
  subtitle: currentUser.role === 'student'
    ? 'Your enrollments, attendance, grades, and dues'
    : currentUser.role === 'faculty'
      ? 'Your sections at a glance'
      : 'Overview of academic records'
});

const errorMsg = document.getElementById('errorMsg');
const body = document.getElementById('dashboardBody');

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.display = 'block';
}

function statBlock(label, count, href) {
  return `
    <div class="stat-block">
      <a href="${href}">
        <div class="stat-number">${count}</div>
        <div class="stat-label">${label}</div>
      </a>
    </div>
  `;
}

function statusBadge(status) {
  const colors = { paid: 'var(--success)', partial: 'var(--gold)', unpaid: 'var(--danger)' };
  return `<span style="color:${colors[status] || 'var(--text)'}; font-weight:600;">${status}</span>`;
}

// ---------------------------------------------------------------
// Admin: system-wide record counts + quick links into every module.
// ---------------------------------------------------------------
async function renderAdminDashboard() {
  const [departments, programs, courses, faculty, students, sections, enrollments] = await Promise.all([
    getDepartments(), getPrograms(), getCourses(), getFaculty(), getStudents(), getSections(), getEnrollments()
  ]);

  const statRow = [
    statBlock('Departments', departments.data.length, 'departments.html'),
    statBlock('Programs', programs.data.length, 'programs.html'),
    statBlock('Courses', courses.data.length, 'courses.html'),
    statBlock('Faculty', faculty.data.length, 'faculty.html'),
    statBlock('Students', students.data.length, 'students.html'),
    statBlock('Sections', sections.data.length, 'sections.html'),
    statBlock('Enrollments', enrollments.data.length, 'enrollments.html')
  ].join('');

  body.innerHTML = `
    <div class="stat-row">${statRow}</div>
    <h2 style="font-size: 1rem; color: var(--text-muted); font-family: var(--font-body); font-weight: 500; margin-bottom: 0.6rem;">Quick links</h2>
    <table>
      <tbody>
        <tr><td><a href="sections.html">Manage course sections</a></td><td style="color:var(--text-muted);">Assign faculty, rooms, and capacity for a term</td></tr>
        <tr><td><a href="enrollments.html">Enroll a student</a></td><td style="color:var(--text-muted);">Register a student into a section</td></tr>
        <tr><td><a href="attendance.html">Take attendance</a></td><td style="color:var(--text-muted);">Mark a section's roster for today</td></tr>
        <tr><td><a href="exams.html">Enter exam marks</a></td><td style="color:var(--text-muted);">Record grades for a section's exams</td></tr>
        <tr><td><a href="invoices.html">Generate an invoice</a></td><td style="color:var(--text-muted);">Bill a student for a semester's fees</td></tr>
      </tbody>
    </table>
  `;
}

// ---------------------------------------------------------------
// Faculty: their own sections, with enrollment counts and shortcuts
// straight into attendance/exams for the term.
// ---------------------------------------------------------------
async function renderFacultyDashboard() {
  const result = await getMySections();
  const sections = result.data;

  const totalStudents = sections.reduce((sum, s) => sum + s.enrolled_count, 0);
  const statRow = [
    statBlock('Sections this term', sections.length, 'my-sections.html'),
    statBlock('Total students taught', totalStudents, 'my-sections.html')
  ].join('');

  const rows = sections.length === 0
    ? '<tr><td colspan="4" style="color:var(--text-muted);">No sections assigned yet.</td></tr>'
    : sections.map((s) => `
        <tr>
          <td>${s.course_code} - ${s.course_title}</td>
          <td>Sec ${s.section_name} · ${s.semester_name}</td>
          <td>${s.enrolled_count} / ${s.capacity}</td>
          <td>
            <a href="attendance.html" class="btn-small btn-edit" style="text-decoration:none; display:inline-block;">Attendance</a>
            <a href="exams.html" class="btn-small btn-edit" style="text-decoration:none; display:inline-block;">Exams</a>
          </td>
        </tr>
      `).join('');

  body.innerHTML = `
    <div class="stat-row">${statRow}</div>
    <h2 style="font-size: 1rem; color: var(--text-muted); font-family: var(--font-body); font-weight: 500; margin-bottom: 0.6rem;">Your sections</h2>
    <table>
      <thead><tr><th>Course</th><th>Section / Term</th><th>Enrolled</th><th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// ---------------------------------------------------------------
// Student: their own enrollments (with live attendance % and grade %
// computed from raw attendance/marks records), plus outstanding dues.
// This IS their portal — no CRUD screens, just their own academic record.
// ---------------------------------------------------------------
async function renderStudentDashboard() {
  const [enrollmentsResult, invoicesResult] = await Promise.all([getMyEnrollments(), getMyInvoices()]);
  const enrollments = enrollmentsResult.data;
  const invoices = invoicesResult.data;

  const totalDue = invoices.reduce((sum, inv) => sum + Number(inv.balance), 0);
  const statRow = [
    statBlock('Active Enrollments', enrollments.filter((e) => e.status === 'enrolled').length, '#'),
    statBlock('Outstanding Balance', totalDue.toFixed(2), 'invoices.html')
  ].join('');

  const enrollmentRows = enrollments.length === 0
    ? '<tr><td colspan="5" style="color:var(--text-muted);">No course enrollments yet.</td></tr>'
    : enrollments.map((e) => {
        const attendancePct = e.attendance_total > 0
          ? `${Math.round((e.attendance_present / e.attendance_total) * 100)}%`
          : '—';
        const gradePct = e.marks_possible > 0
          ? `${Math.round((e.marks_obtained / e.marks_possible) * 100)}%`
          : '—';
        return `
          <tr>
            <td>${e.course_code} - ${e.course_title}</td>
            <td>Sec ${e.section_name} · ${e.semester_name}</td>
            <td>${e.status}</td>
            <td>${attendancePct}</td>
            <td>${gradePct}</td>
          </tr>
        `;
      }).join('');

  const invoiceRows = invoices.length === 0
    ? '<tr><td colspan="4" style="color:var(--text-muted);">No invoices issued yet.</td></tr>'
    : invoices.map((inv) => `
        <tr>
          <td>${inv.semester_name}</td>
          <td>${Number(inv.total_amount).toFixed(2)}</td>
          <td>${Number(inv.balance).toFixed(2)}</td>
          <td>${statusBadge(inv.status)}</td>
        </tr>
      `).join('');

  body.innerHTML = `
    <div class="stat-row">${statRow}</div>

    <h2 style="font-size: 1rem; color: var(--text-muted); font-family: var(--font-body); font-weight: 500; margin-bottom: 0.6rem;">My courses</h2>
    <table>
      <thead><tr><th>Course</th><th>Section / Term</th><th>Status</th><th>Attendance</th><th>Grade</th></tr></thead>
      <tbody>${enrollmentRows}</tbody>
    </table>

    <h2 style="font-size: 1rem; color: var(--text-muted); font-family: var(--font-body); font-weight: 500; margin: 1.6rem 0 0.6rem;">My invoices</h2>
    <table>
      <thead><tr><th>Semester</th><th>Total</th><th>Balance</th><th>Status</th></tr></thead>
      <tbody>${invoiceRows}</tbody>
    </table>
  `;
}

(async function init() {
  try {
    if (currentUser.role === 'admin') await renderAdminDashboard();
    else if (currentUser.role === 'faculty') await renderFacultyDashboard();
    else if (currentUser.role === 'student') await renderStudentDashboard();
    else showError('Unknown role — cannot load dashboard.');
  } catch (err) {
    showError(err.message);
  }
})();
