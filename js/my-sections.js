renderShell({ active: 'my-sections', title: 'My Sections', subtitle: 'Sections you are assigned to teach' });

const errorMsg = document.getElementById('errorMsg');
const tableBody = document.getElementById('sectionsTableBody');

function showError(m) { errorMsg.textContent = m; errorMsg.style.display = 'block'; }

function renderRow(sec) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${sec.course_code} - ${sec.course_title}</td>
    <td>${sec.section_name}</td>
    <td>${sec.semester_name}${sec.is_current ? ' <span style="color:var(--gold);">●</span>' : ''}</td>
    <td>${sec.room || '—'}</td>
    <td>${sec.enrolled_count} / ${sec.capacity}</td>
    <td>
      <a href="attendance.html" class="btn-small btn-edit" style="text-decoration:none; display:inline-block;">Attendance</a>
      <a href="exams.html" class="btn-small btn-edit" style="text-decoration:none; display:inline-block;">Exams</a>
    </td>
  `;
  return tr;
}

async function loadSections() {
  try {
    const result = await getMySections();
    tableBody.innerHTML = '';
    if (result.data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="color:var(--text-muted);">No sections assigned yet.</td></tr>';
      return;
    }
    result.data.forEach((sec) => tableBody.appendChild(renderRow(sec)));
  } catch (err) {
    showError(err.message);
  }
}

loadSections();
