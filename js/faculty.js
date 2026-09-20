const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const tableBody = document.getElementById('facultyTableBody');
const addForm = document.getElementById('addForm');
const userSelect = document.getElementById('newUser');
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

async function loadDepartmentOptions() {
  const result = await getDepartments();
  departmentCache = result.data;
  deptSelect.innerHTML = departmentCache.map((d) => `<option value="${d.id}">${d.name}</option>`).join('');
}

async function loadEligibleUsers() {
  const result = await getEligibleFacultyUsers();
  if (result.data.length === 0) {
    userSelect.innerHTML = `<option value="">No eligible faculty users</option>`;
  } else {
    userSelect.innerHTML = result.data.map((u) => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('');
  }
}

function renderRow(f) {
  const tr = document.createElement('tr');
  tr.dataset.id = f.id;
  tr.innerHTML = `
    <td>${f.id}</td>
    <td>${f.faculty_name}</td>
    <td>${f.email}</td>
    <td class="view-designation">${f.designation}</td>
    <td class="view-dept" data-dept-id="${f.department_id}">${f.department_name}</td>
    <td>
      <button class="btn-small btn-edit" onclick="startEdit(${f.id})">Edit</button>
      <button class="btn-small btn-delete" onclick="handleDelete(${f.id})">Delete</button>
    </td>
  `;
  return tr;
}

async function loadFaculty() {
  try {
    const result = await getFaculty();
    tableBody.innerHTML = '';
    result.data.forEach((f) => tableBody.appendChild(renderRow(f)));
  } catch (err) {
    showError(err.message);
  }
}

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userId = userSelect.value;
  const designation = document.getElementById('newDesignation').value.trim();
  const departmentId = deptSelect.value;

  if (!userId) {
    showError('No eligible faculty user selected.');
    return;
  }

  try {
    await createFacultyRequest({ userId, departmentId, designation });
    showSuccess('Faculty profile created.');
    addForm.reset();
    await loadEligibleUsers();
    await loadFaculty();
  } catch (err) {
    showError(err.message);
  }
});

function startEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const currentDesignation = row.querySelector('.view-designation').textContent;
  const currentDeptId = Number(row.querySelector('.view-dept').dataset.deptId);

  const deptOptions = departmentCache
    .map((d) => `<option value="${d.id}" ${d.id === currentDeptId ? 'selected' : ''}>${d.name}</option>`)
    .join('');

  row.querySelector('.view-designation').innerHTML = `<input type="text" class="edit-designation" value="${currentDesignation}" />`;
  row.querySelector('.view-dept').innerHTML = `<select class="edit-dept">${deptOptions}</select>`;

  const actionsCell = row.children[5];
  actionsCell.innerHTML = `
    <button class="btn-small btn-save" onclick="saveEdit(${id})">Save</button>
    <button class="btn-small" onclick="loadFaculty()">Cancel</button>
  `;
}

async function saveEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const designation = row.querySelector('.edit-designation').value.trim();
  const departmentId = row.querySelector('.edit-dept').value;

  try {
    await updateFacultyRequest(id, { designation, departmentId });
    showSuccess('Faculty profile updated.');
    loadFaculty();
  } catch (err) {
    showError(err.message);
  }
}

async function handleDelete(id) {
  if (!confirm('Delete this faculty profile? The underlying user account will remain.')) return;
  try {
    await deleteFacultyRequest(id);
    showSuccess('Faculty profile deleted.');
    await loadEligibleUsers();
    await loadFaculty();
  } catch (err) {
    showError(err.message);
  }
}

(async function init() {
  try {
    await loadDepartmentOptions();
    await loadEligibleUsers();
    await loadFaculty();
  } catch (err) {
    showError(err.message);
  }
})();
