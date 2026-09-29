const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const tableBody = document.getElementById('enrollmentTableBody');
const addForm = document.getElementById('addForm');
const studentSelect = document.getElementById('newStudent');
const sectionSelect = document.getElementById('newSection');

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

async function loadDropdownData() {
  const [studentResult, sectionResult] = await Promise.all([getStudents(), getSections()]);

  studentSelect.innerHTML = studentResult.data
    .map((s) => `<option value="${s.id}">${s.student_name}</option>`)
    .join('');

  sectionSelect.innerHTML = sectionResult.data
    .map((sec) => `<option value="${sec.id}">${sec.course_code} - Sec ${sec.section_name} (${sec.semester_name})</option>`)
    .join('');
}

function statusBadge(status) {
  const colors = { enrolled: '#16a34a', dropped: '#dc2626', completed: '#2563eb' };
  return `<span style="color:${colors[status]}; font-weight:600;">${status}</span>`;
}

function renderRow(e) {
  const tr = document.createElement('tr');
  tr.dataset.id = e.id;
  tr.innerHTML = `
    <td>${e.id}</td>
    <td>${e.student_name}</td>
    <td>${e.course_code} - ${e.course_title}</td>
    <td>${e.section_name}</td>
    <td>${e.semester_name}</td>
    <td class="view-status">${statusBadge(e.status)}</td>
    <td>
      ${e.status !== 'dropped' ? `<button class="btn-small btn-delete" onclick="handleStatusChange(${e.id}, 'dropped')">Drop</button>` : ''}
      ${e.status === 'enrolled' ? `<button class="btn-small btn-save" onclick="handleStatusChange(${e.id}, 'completed')">Complete</button>` : ''}
      <button class="btn-small btn-delete" onclick="handleDelete(${e.id})">Delete</button>
    </td>
  `;
  return tr;
}

async function loadEnrollments() {
  try {
    const result = await getEnrollments();
    tableBody.innerHTML = '';
    result.data.forEach((e) => tableBody.appendChild(renderRow(e)));
  } catch (err) {
    showError(err.message);
  }
}

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const studentId = studentSelect.value;
  const sectionId = sectionSelect.value;

  try {
    await createEnrollmentRequest({ studentId, sectionId });
    showSuccess('Student enrolled.');
    loadEnrollments();
  } catch (err) {
    showError(err.message);
  }
});

async function handleStatusChange(id, status) {
  try {
    await updateEnrollmentStatusRequest(id, status);
    showSuccess(`Enrollment marked as ${status}.`);
    loadEnrollments();
  } catch (err) {
    showError(err.message);
  }
}

async function handleDelete(id) {
  if (!confirm('Permanently delete this enrollment record?')) return;
  try {
    await deleteEnrollmentRequest(id);
    showSuccess('Enrollment record deleted.');
    loadEnrollments();
  } catch (err) {
    showError(err.message);
  }
}

(async function init() {
  try {
    await loadDropdownData();
    await loadEnrollments();
  } catch (err) {
    showError(err.message);
  }
})();
