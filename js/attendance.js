const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const tableBody = document.getElementById('rosterTableBody');
const filterForm = document.getElementById('filterForm');
const sectionSelect = document.getElementById('sectionSelect');
const dateInput = document.getElementById('dateInput');

if (!localStorage.getItem('token')) {
  window.location.href = 'login.html';
}

function showError(message) {
  successMsg.style.display = 'none';
  errorMsg.textContent = message;
  errorMsg.style.display = 'block';
}

function showSuccess(message) {
  errorMsg.style.display = 'none';
  successMsg.textContent = message;
  successMsg.style.display = 'block';
}

async function loadSectionOptions() {
  const result = await getSections();
  sectionSelect.innerHTML = result.data
    .map((s) => `<option value="${s.id}">${s.course_code} - Sec ${s.section_name} (${s.semester_name})</option>`)
    .join('');
}

function renderRow(entry, date) {
  const tr = document.createElement('tr');
  tr.dataset.enrollmentId = entry.enrollment_id;

  const statuses = ['present', 'absent', 'late'];
  const buttons = statuses
    .map((st) => {
      const active = entry.status === st;
      return `<button class="btn-small" style="background:${active ? '#2563eb' : '#e5e7eb'}; color:${active ? '#fff' : '#333'};" onclick="handleMark(${entry.enrollment_id}, '${st}')">${st}</button>`;
    })
    .join(' ');

  tr.innerHTML = `
    <td>${entry.student_name}</td>
    <td class="view-status">${entry.status || '<em style="color:#999;">not marked</em>'}</td>
    <td>${buttons}</td>
  `;
  return tr;
}

async function loadRoster() {
  const sectionId = sectionSelect.value;
  const date = dateInput.value;
  if (!sectionId || !date) return;

  try {
    const result = await getAttendanceRoster(sectionId, date);
    tableBody.innerHTML = '';
    result.data.forEach((entry) => tableBody.appendChild(renderRow(entry, date)));
  } catch (err) {
    showError(err.message);
  }
}

filterForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await loadRoster();
});

async function handleMark(enrollmentId, status) {
  const date = dateInput.value;
  if (!date) {
    showError('Pick a date first.');
    return;
  }

  try {
    await markAttendanceRequest({ enrollmentId, date, status });
    showSuccess(`Marked as ${status}.`);
    loadRoster();
  } catch (err) {
    showError(err.message);
  }
}

(async function init() {
  try {
    // Default to today so the form is usable without extra clicks.
    dateInput.value = new Date().toISOString().split('T')[0];
    await loadSectionOptions();
  } catch (err) {
    showError(err.message);
  }
})();
