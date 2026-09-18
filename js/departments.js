const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const tableBody = document.getElementById('deptTableBody');
const addForm = document.getElementById('addForm');

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

function renderRow(dept) {
  const tr = document.createElement('tr');
  tr.dataset.id = dept.id;
  tr.innerHTML = `
    <td>${dept.id}</td>
    <td class="view-name">${dept.name}</td>
    <td class="view-code">${dept.code}</td>
    <td>
      <button class="btn-small btn-edit" onclick="startEdit(${dept.id})">Edit</button>
      <button class="btn-small btn-delete" onclick="handleDelete(${dept.id})">Delete</button>
    </td>
  `;
  return tr;
}

async function loadDepartments() {
  try {
    const result = await getDepartments();
    tableBody.innerHTML = '';
    result.data.forEach((dept) => tableBody.appendChild(renderRow(dept)));
  } catch (err) {
    showError(err.message);
  }
}

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('newName').value.trim();
  const code = document.getElementById('newCode').value.trim();

  try {
    await createDepartmentRequest({ name, code });
    showSuccess(`Department "${name}" added.`);
    addForm.reset();
    loadDepartments();
  } catch (err) {
    showError(err.message);
  }
});

function startEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const currentName = row.querySelector('.view-name').textContent;
  const currentCode = row.querySelector('.view-code').textContent;

  row.querySelector('.view-name').innerHTML = `<input type="text" class="edit-name" value="${currentName}" />`;
  row.querySelector('.view-code').innerHTML = `<input type="text" class="edit-code" value="${currentCode}" />`;

  const actionsCell = row.children[3];
  actionsCell.innerHTML = `
    <button class="btn-small btn-save" onclick="saveEdit(${id})">Save</button>
    <button class="btn-small" onclick="loadDepartments()">Cancel</button>
  `;
}

async function saveEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const name = row.querySelector('.edit-name').value.trim();
  const code = row.querySelector('.edit-code').value.trim();

  try {
    await updateDepartmentRequest(id, { name, code });
    showSuccess(`Department updated.`);
    loadDepartments();
  } catch (err) {
    showError(err.message);
  }
}

async function handleDelete(id) {
  if (!confirm('Delete this department?')) return;

  try {
    await deleteDepartmentRequest(id);
    showSuccess('Department deleted.');
    loadDepartments();
  } catch (err) {
    showError(err.message);
  }
}

loadDepartments();
