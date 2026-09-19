const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const tableBody = document.getElementById('progTableBody');
const addForm = document.getElementById('addForm');
const deptSelect = document.getElementById('newDept');

if (!localStorage.getItem('token')) {
  window.location.href = 'login.html';
}

let departmentCache = [];

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

async function loadDepartmentOptions(selectedId = null) {
  const result = await getDepartments();
  departmentCache = result.data;
  deptSelect.innerHTML = departmentCache
    .map((d) => `<option value="${d.id}" ${selectedId === d.id ? 'selected' : ''}>${d.name}</option>`)
    .join('');
}

function renderRow(program) {
  const tr = document.createElement('tr');
  tr.dataset.id = program.id;
  tr.innerHTML = `
    <td>${program.id}</td>
    <td class="view-name">${program.name}</td>
    <td class="view-degree">${program.degree_level}</td>
    <td class="view-duration">${program.duration_years}</td>
    <td class="view-dept" data-dept-id="${program.department_id}">${program.department_name}</td>
    <td>
      <button class="btn-small btn-edit" onclick="startEdit(${program.id})">Edit</button>
      <button class="btn-small btn-delete" onclick="handleDelete(${program.id})">Delete</button>
    </td>
  `;
  return tr;
}

async function loadPrograms() {
  try {
    const result = await getPrograms();
    tableBody.innerHTML = '';
    result.data.forEach((p) => tableBody.appendChild(renderRow(p)));
  } catch (err) {
    showError(err.message);
  }
}

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('newName').value.trim();
  const degreeLevel = document.getElementById('newDegree').value;
  const durationYears = document.getElementById('newDuration').value;
  const departmentId = deptSelect.value;

  try {
    await createProgramRequest({ name, degreeLevel, durationYears, departmentId });
    showSuccess(`Program "${name}" added.`);
    addForm.reset();
    loadPrograms();
  } catch (err) {
    showError(err.message);
  }
});

function startEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const currentName = row.querySelector('.view-name').textContent;
  const currentDegree = row.querySelector('.view-degree').textContent;
  const currentDuration = row.querySelector('.view-duration').textContent;
  const currentDeptId = Number(row.querySelector('.view-dept').dataset.deptId);

  const degreeOptions = ['undergraduate', 'graduate', 'doctorate']
    .map((lvl) => `<option value="${lvl}" ${lvl === currentDegree ? 'selected' : ''}>${lvl}</option>`)
    .join('');

  const deptOptions = departmentCache
    .map((d) => `<option value="${d.id}" ${d.id === currentDeptId ? 'selected' : ''}>${d.name}</option>`)
    .join('');

  row.querySelector('.view-name').innerHTML = `<input type="text" class="edit-name" value="${currentName}" />`;
  row.querySelector('.view-degree').innerHTML = `<select class="edit-degree">${degreeOptions}</select>`;
  row.querySelector('.view-duration').innerHTML = `<input type="number" class="edit-duration" min="1" max="10" value="${currentDuration}" />`;
  row.querySelector('.view-dept').innerHTML = `<select class="edit-dept">${deptOptions}</select>`;

  const actionsCell = row.children[5];
  actionsCell.innerHTML = `
    <button class="btn-small btn-save" onclick="saveEdit(${id})">Save</button>
    <button class="btn-small" onclick="loadPrograms()">Cancel</button>
  `;
}

async function saveEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const name = row.querySelector('.edit-name').value.trim();
  const degreeLevel = row.querySelector('.edit-degree').value;
  const durationYears = row.querySelector('.edit-duration').value;
  const departmentId = row.querySelector('.edit-dept').value;

  try {
    await updateProgramRequest(id, { name, degreeLevel, durationYears, departmentId });
    showSuccess('Program updated.');
    loadPrograms();
  } catch (err) {
    showError(err.message);
  }
}

async function handleDelete(id) {
  if (!confirm('Delete this program?')) return;
  try {
    await deleteProgramRequest(id);
    showSuccess('Program deleted.');
    loadPrograms();
  } catch (err) {
    showError(err.message);
  }
}

(async function init() {
  try {
    await loadDepartmentOptions();
    await loadPrograms();
  } catch (err) {
    showError(err.message);
  }
})();
