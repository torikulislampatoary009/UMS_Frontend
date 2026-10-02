// renderShell() rebuilds document.body via innerHTML, so any element
// references must be grabbed AFTER it runs, not before.
renderShell({
  active: 'dashboard',
  title: 'Dashboard',
  subtitle: 'Overview of academic records'
});

const errorMsg = document.getElementById('errorMsg');
const statRow = document.getElementById('statRow');

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

async function loadCounts() {
  try {
    const [departments, programs, courses, faculty, students, sections, enrollments] = await Promise.all([
      getDepartments(), getPrograms(), getCourses(), getFaculty(), getStudents(), getSections(), getEnrollments()
    ]);

    statRow.innerHTML = [
      statBlock('Departments', departments.data.length, 'departments.html'),
      statBlock('Programs', programs.data.length, 'programs.html'),
      statBlock('Courses', courses.data.length, 'courses.html'),
      statBlock('Faculty', faculty.data.length, 'faculty.html'),
      statBlock('Students', students.data.length, 'students.html'),
      statBlock('Sections', sections.data.length, 'sections.html'),
      statBlock('Enrollments', enrollments.data.length, 'enrollments.html')
    ].join('');
  } catch (err) {
    showError(err.message);
  }
}

loadCounts();
