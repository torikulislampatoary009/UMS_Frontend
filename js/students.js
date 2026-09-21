const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const tableBody = document.getElementById('studentTableBody');
const addForm = document.getElementById('addForm');
const userSelect = document.getElementById('newUser');
const programSelect = document.getElementById('newProgram');

if (!localStorage.getItem('token')) {
  window.location.href = 'login.html';
}

let programCache = [];

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

async function loadProgramOptions() {
  const result = await getPrograms();
  programCache = result.data;
  programSelect.innerHTML = programCache.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
}

async function loadEligibleUsers() {
  const result = await getEligibleStudentUsers();
  if (result.data.length === 0) {
    userSelect.innerHTML = `<option value="">No eligible student users</option>`;
  } else {
    userSelect.innerHTML = result.data.map((u) => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('');
  }
}

function renderRow(s) {
  const tr = document.createElement('tr');
  tr.dataset.id = s.id;
  tr.innerHTML = `
    <td>${s.id}</td>
    <td>${s.student_name}</td>
    <td>${s.email}</td>
    <td class="view-program" data-program-id="${s.program_id}">${s.program_name}</td>
    <td class="view-batch">${s.batch_year}</td>
    <td class="view-semester">${s.current_semester}</td>
    <td>
      <button class="btn-small btn-edit" onclick="startEdit(${s.id})">Edit</button>
      <button class="btn-small btn-delete" onclick="handleDelete(${s.id})">Delete</button>
    </td>
  `;
  return tr;
}

async function loadStudents() {
  try {
    const result = await getStudents();
    tableBody.innerHTML = '';
    result.data.forEach((s) => tableBody.appendChild(renderRow(s)));
  } catch (err) {
    showError(err.message);
  }
}

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userId = userSelect.value;
  const programId = programSelect.value;
  const batchYear = document.getElementById('newBatch').value;
  const currentSemester = document.getElementById('newSemester').value;

  if (!userId) {
    showError('No eligible student user selected.');
    return;
  }

  try {
    await createStudentRequest({ userId, programId, batchYear, currentSemester });
    showSuccess('Student profile created.');
    addForm.reset();
    await loadEligibleUsers();
    await loadStudents();
  } catch (err) {
    showError(err.message);
  }
});

function startEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const currentProgramId = Number(row.querySelector('.view-program').dataset.programId);
  const currentBatch = row.querySelector('.view-batch').textContent;
  const currentSemester = row.querySelector('.view-semester').textContent;

  const programOptions = programCache
    .map((p) => `<option value="${p.id}" ${p.id === currentProgramId ? 'selected' : ''}>${p.name}</option>`)
    .join('');

  row.querySelector('.view-program').innerHTML = `<select class="edit-program">${programOptions}</select>`;
  row.querySelector('.view-batch').innerHTML = `<input type="number" class="edit-batch" value="${currentBatch}" min="2000" max="2100" />`;
  row.querySelector('.view-semester').innerHTML = `<input type="number" class="edit-semester" value="${currentSemester}" min="1" max="20" />`;

  const actionsCell = row.children[6];
  actionsCell.innerHTML = `
    <button class="btn-small btn-save" onclick="saveEdit(${id})">Save</button>
    <button class="btn-small" onclick="loadStudents()">Cancel</button>
  `;
}

async function saveEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const programId = row.querySelector('.edit-program').value;
  const batchYear = row.querySelector('.edit-batch').value;
  const currentSemester = row.querySelector('.edit-semester').value;

  try {
    await updateStudentRequest(id, { programId, batchYear, currentSemester });
    showSuccess('Student profile updated.');
    loadStudents();
  } catch (err) {
    showError(err.message);
  }
}

async function handleDelete(id) {
  if (!confirm('Delete this student profile? The underlying user account will remain.')) return;
  try {
    await deleteStudentRequest(id);
    showSuccess('Student profile deleted.');
    await loadEligibleUsers();
    await loadStudents();
  } catch (err) {
    showError(err.message);
  }
}

(async function init() {
  try {
    await loadProgramOptions();
    await loadEligibleUsers();
    await loadStudents();
  } catch (err) {
    showError(err.message);
  }
})();
